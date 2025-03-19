// src/app/api/sales/sellin/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();
    const { startDate, endDate, comparisonStartDate, comparisonEndDate, pharmacyIds } = body;
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête pour la période principale avec calcul des ruptures
      let mainQuery = '';
      let mainParams = [startDate, endDate];
      
      if (!pharmacyIds || pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        mainQuery = `
          WITH order_data AS (
            SELECT 
              po.product_id,
              SUM(po.qte + po.qte_ug) AS total_ordered,
              SUM(po.qte_r) AS total_received,
              SUM(CASE WHEN (po.qte + po.qte_ug) > po.qte_r THEN ((po.qte + po.qte_ug) - po.qte_r) ELSE 0 END) AS stock_break_quantity,
              COALESCE(SUM(
                CASE 
                  WHEN (po.qte + po.qte_ug) > po.qte_r THEN 
                    ((po.qte + po.qte_ug) - po.qte_r) * (
                      SELECT COALESCE(price_with_tax, 0)
                      FROM data_inventorysnapshot
                      WHERE product_id = po.product_id
                      ORDER BY date DESC
                      LIMIT 1
                    )
                  ELSE 0 
                END
              ), 0) AS stock_break_amount
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
            GROUP BY
              po.product_id
          )
          SELECT 
            COALESCE(SUM(od.total_received), 0) as total_purchase_quantity,
            COALESCE(SUM(od.total_received * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = od.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            (SELECT COUNT(DISTINCT id) FROM data_order WHERE sent_date BETWEEN $1 AND $2) as total_orders,
            TO_CHAR((SELECT MIN(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2), 'YYYY-MM-DD') as min_date,
            TO_CHAR((SELECT MAX(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2), 'YYYY-MM-DD') as max_date,
            (SELECT COUNT(DISTINCT date_trunc('day', sent_date)) FROM data_order WHERE sent_date BETWEEN $1 AND $2) as days_count,
            SUM(od.total_ordered) as total_ordered_quantity,
            SUM(od.stock_break_quantity) as total_stock_break_quantity,
            SUM(od.stock_break_amount) as total_stock_break_amount,
            CASE 
              WHEN SUM(od.total_ordered) > 0
              THEN ROUND((SUM(od.stock_break_quantity)::DECIMAL / SUM(od.total_ordered)) * 100, 2)
              ELSE 0
            END as stock_break_rate
          FROM 
            order_data od
        `;
      } else {
        // Requête pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        mainQuery = `
          WITH order_data AS (
            SELECT 
              po.product_id,
              SUM(po.qte + po.qte_ug) AS total_ordered,
              SUM(po.qte_r) AS total_received,
              SUM(CASE WHEN (po.qte + po.qte_ug) > po.qte_r THEN ((po.qte + po.qte_ug) - po.qte_r) ELSE 0 END) AS stock_break_quantity,
              COALESCE(SUM(
                CASE 
                  WHEN (po.qte + po.qte_ug) > po.qte_r THEN 
                    ((po.qte + po.qte_ug) - po.qte_r) * (
                      SELECT COALESCE(price_with_tax, 0)
                      FROM data_inventorysnapshot
                      WHERE product_id = po.product_id
                      ORDER BY date DESC
                      LIMIT 1
                    )
                  ELSE 0 
                END
              ), 0) AS stock_break_amount
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
              AND o.pharmacy_id IN (${pharmacyPlaceholders})
            GROUP BY
              po.product_id
          )
          SELECT 
            COALESCE(SUM(od.total_received), 0) as total_purchase_quantity,
            COALESCE(SUM(od.total_received * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = od.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            (SELECT COUNT(DISTINCT id) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})) as total_orders,
            TO_CHAR((SELECT MIN(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})), 'YYYY-MM-DD') as min_date,
            TO_CHAR((SELECT MAX(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})), 'YYYY-MM-DD') as max_date,
            (SELECT COUNT(DISTINCT date_trunc('day', sent_date)) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})) as days_count,
            SUM(od.total_ordered) as total_ordered_quantity,
            SUM(od.stock_break_quantity) as total_stock_break_quantity,
            SUM(od.stock_break_amount) as total_stock_break_amount,
            CASE 
              WHEN SUM(od.total_ordered) > 0
              THEN ROUND((SUM(od.stock_break_quantity)::DECIMAL / SUM(od.total_ordered)) * 100, 2)
              ELSE 0
            END as stock_break_rate
          FROM 
            order_data od
        `;
        mainParams = [...mainParams, ...pharmacyIds];
      }
      
      // Exécuter la requête principale
      const mainResult = await client.query(mainQuery, mainParams);
      
      // Extraire les résultats
      const mainRow = mainResult.rows[0] || {
        total_purchase_quantity: 0,
        total_purchase_amount: 0,
        total_orders: 0,
        min_date: null,
        max_date: null,
        days_count: 0,
        total_ordered_quantity: 0,
        total_stock_break_quantity: 0,
        total_stock_break_amount: 0,
        stock_break_rate: 0
      };
      
      // Extraire les valeurs numériques
      const totalPurchaseQuantity = parseInt(mainRow.total_purchase_quantity) || 0;
      const totalPurchaseAmount = parseFloat(mainRow.total_purchase_amount) || 0;
      const totalOrders = parseInt(mainRow.total_orders) || 0;
      const totalOrderedQuantity = parseInt(mainRow.total_ordered_quantity) || 0;
      const totalStockBreakQuantity = parseInt(mainRow.total_stock_break_quantity) || 0;
      const totalStockBreakAmount = parseFloat(mainRow.total_stock_break_amount) || 0;
      const stockBreakRate = parseFloat(mainRow.stock_break_rate) || 0;
      
      // Préparer la réponse
      const response = {
        startDate,
        endDate,
        actualDateRange: {
          min: mainRow.min_date,
          max: mainRow.max_date,
          days: parseInt(mainRow.days_count) || 0
        },
        pharmacyIds: pharmacyIds && pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalPurchaseQuantity,
        totalPurchaseAmount,
        totalOrders,
        averagePurchasePrice: totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0,
        // Données de rupture
        totalOrderedQuantity,
        totalStockBreakQuantity,
        totalStockBreakAmount,
        stockBreakRate
      };
      
      // Ajouter la comparaison si demandée
      if (comparisonStartDate && comparisonEndDate) {
        let comparisonQuery = '';
        let comparisonParams = [comparisonStartDate, comparisonEndDate];
        
        if (!pharmacyIds || pharmacyIds.length === 0) {
          // Requête de comparaison pour toutes les pharmacies
          comparisonQuery = `
            WITH order_data AS (
              SELECT 
                po.product_id,
                SUM(po.qte + po.qte_ug) AS total_ordered,
                SUM(po.qte_r) AS total_received,
                SUM(CASE WHEN (po.qte + po.qte_ug) > po.qte_r THEN ((po.qte + po.qte_ug) - po.qte_r) ELSE 0 END) AS stock_break_quantity,
                COALESCE(SUM(
                  CASE 
                    WHEN (po.qte + po.qte_ug) > po.qte_r THEN 
                      ((po.qte + po.qte_ug) - po.qte_r) * (
                        SELECT COALESCE(price_with_tax, 0)
                        FROM data_inventorysnapshot
                        WHERE product_id = po.product_id
                        ORDER BY date DESC
                        LIMIT 1
                      )
                    ELSE 0 
                  END
                ), 0) AS stock_break_amount
              FROM 
                data_productorder po
              JOIN 
                data_order o ON po.order_id = o.id
              JOIN
                data_internalproduct p ON po.product_id = p.id
              WHERE 
                o.sent_date BETWEEN $1 AND $2
              GROUP BY
                po.product_id
            )
            SELECT 
              COALESCE(SUM(od.total_received), 0) as total_purchase_quantity,
              COALESCE(SUM(od.total_received * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = od.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              (SELECT COUNT(DISTINCT id) FROM data_order WHERE sent_date BETWEEN $1 AND $2) as total_orders,
              TO_CHAR((SELECT MIN(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2), 'YYYY-MM-DD') as min_date,
              TO_CHAR((SELECT MAX(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2), 'YYYY-MM-DD') as max_date,
              (SELECT COUNT(DISTINCT date_trunc('day', sent_date)) FROM data_order WHERE sent_date BETWEEN $1 AND $2) as days_count,
              SUM(od.total_ordered) as total_ordered_quantity,
              SUM(od.stock_break_quantity) as total_stock_break_quantity,
              SUM(od.stock_break_amount) as total_stock_break_amount,
              CASE 
                WHEN SUM(od.total_ordered) > 0
                THEN ROUND((SUM(od.stock_break_quantity)::DECIMAL / SUM(od.total_ordered)) * 100, 2)
                ELSE 0
              END as stock_break_rate
            FROM 
              order_data od
          `;
        } else {
          // Requête de comparaison pour pharmacies spécifiques
          const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
          
          comparisonQuery = `
            WITH order_data AS (
              SELECT 
                po.product_id,
                SUM(po.qte + po.qte_ug) AS total_ordered,
                SUM(po.qte_r) AS total_received,
                SUM(CASE WHEN (po.qte + po.qte_ug) > po.qte_r THEN ((po.qte + po.qte_ug) - po.qte_r) ELSE 0 END) AS stock_break_quantity,
                COALESCE(SUM(
                  CASE 
                    WHEN (po.qte + po.qte_ug) > po.qte_r THEN 
                      ((po.qte + po.qte_ug) - po.qte_r) * (
                        SELECT COALESCE(price_with_tax, 0)
                        FROM data_inventorysnapshot
                        WHERE product_id = po.product_id
                        ORDER BY date DESC
                        LIMIT 1
                      )
                    ELSE 0 
                  END
                ), 0) AS stock_break_amount
              FROM 
                data_productorder po
              JOIN 
                data_order o ON po.order_id = o.id
              JOIN
                data_internalproduct p ON po.product_id = p.id
              WHERE 
                o.sent_date BETWEEN $1 AND $2
                AND o.pharmacy_id IN (${pharmacyPlaceholders})
              GROUP BY
                po.product_id
            )
            SELECT 
              COALESCE(SUM(od.total_received), 0) as total_purchase_quantity,
              COALESCE(SUM(od.total_received * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = od.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              (SELECT COUNT(DISTINCT id) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})) as total_orders,
              TO_CHAR((SELECT MIN(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})), 'YYYY-MM-DD') as min_date,
              TO_CHAR((SELECT MAX(sent_date) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})), 'YYYY-MM-DD') as max_date,
              (SELECT COUNT(DISTINCT date_trunc('day', sent_date)) FROM data_order WHERE sent_date BETWEEN $1 AND $2 AND pharmacy_id IN (${pharmacyPlaceholders})) as days_count,
              SUM(od.total_ordered) as total_ordered_quantity,
              SUM(od.stock_break_quantity) as total_stock_break_quantity,
              SUM(od.stock_break_amount) as total_stock_break_amount,
              CASE 
                WHEN SUM(od.total_ordered) > 0
                THEN ROUND((SUM(od.stock_break_quantity)::DECIMAL / SUM(od.total_ordered)) * 100, 2)
                ELSE 0
              END as stock_break_rate
            FROM 
              order_data od
          `;
          comparisonParams = [...comparisonParams, ...pharmacyIds];
        }
        
        // Exécuter la requête de comparaison
        const comparisonResult = await client.query(comparisonQuery, comparisonParams);
        
        // Extraire les résultats
        const comparisonRow = comparisonResult.rows[0] || {
          total_purchase_quantity: 0,
          total_purchase_amount: 0,
          total_orders: 0,
          min_date: null,
          max_date: null,
          days_count: 0,
          total_ordered_quantity: 0,
          total_stock_break_quantity: 0,
          total_stock_break_amount: 0,
          stock_break_rate: 0
        };
        
        // Extraire les valeurs numériques pour la comparaison
        const comparisonPurchaseQuantity = parseInt(comparisonRow.total_purchase_quantity) || 0;
        const comparisonPurchaseAmount = parseFloat(comparisonRow.total_purchase_amount) || 0;
        const comparisonOrders = parseInt(comparisonRow.total_orders) || 0;
        const comparisonOrderedQuantity = parseInt(comparisonRow.total_ordered_quantity) || 0;
        const comparisonStockBreakQuantity = parseInt(comparisonRow.total_stock_break_quantity) || 0;
        const comparisonStockBreakAmount = parseFloat(comparisonRow.total_stock_break_amount) || 0;
        const comparisonStockBreakRate = parseFloat(comparisonRow.stock_break_rate) || 0;
        const comparisonAveragePurchasePrice = comparisonPurchaseQuantity > 0 ? 
          comparisonPurchaseAmount / comparisonPurchaseQuantity : 0;
        
        // Calculer les évolutions
        const quantityEvolution = comparisonPurchaseQuantity > 0 
          ? (totalPurchaseQuantity - comparisonPurchaseQuantity) / comparisonPurchaseQuantity 
          : 0;
        
        const amountEvolution = comparisonPurchaseAmount > 0 
          ? (totalPurchaseAmount - comparisonPurchaseAmount) / comparisonPurchaseAmount 
          : 0;
        
        const ordersEvolution = comparisonOrders > 0 
          ? (totalOrders - comparisonOrders) / comparisonOrders 
          : 0;
        
        const avgPriceEvolution = comparisonAveragePurchasePrice > 0 
          ? ((totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0) - comparisonAveragePurchasePrice) / comparisonAveragePurchasePrice 
          : 0;
          
        // Nouvelles évolutions pour les ruptures
        const stockBreakQuantityEvolution = comparisonStockBreakQuantity > 0
          ? (totalStockBreakQuantity - comparisonStockBreakQuantity) / comparisonStockBreakQuantity
          : 0;
          
        const stockBreakAmountEvolution = comparisonStockBreakAmount > 0
          ? (totalStockBreakAmount - comparisonStockBreakAmount) / comparisonStockBreakAmount
          : 0;
          
        const stockBreakRateEvolution = comparisonStockBreakRate > 0
          ? (stockBreakRate - comparisonStockBreakRate) / comparisonStockBreakRate
          : 0;
        
        // Ajouter à la réponse
        response.comparison = {
          startDate: comparisonStartDate,
          endDate: comparisonEndDate,
          actualDateRange: {
            min: comparisonRow.min_date,
            max: comparisonRow.max_date,
            days: parseInt(comparisonRow.days_count) || 0
          },
          totalPurchaseQuantity: comparisonPurchaseQuantity,
          totalPurchaseAmount: comparisonPurchaseAmount,
          totalOrders: comparisonOrders,
          averagePurchasePrice: comparisonAveragePurchasePrice,
          // Données de comparaison pour les ruptures
          totalOrderedQuantity: comparisonOrderedQuantity,
          totalStockBreakQuantity: comparisonStockBreakQuantity,
          totalStockBreakAmount: comparisonStockBreakAmount,
          stockBreakRate: comparisonStockBreakRate,
          evolution: {
            purchaseQuantity: {
              absolute: totalPurchaseQuantity - comparisonPurchaseQuantity,
              percentage: parseFloat((quantityEvolution * 100).toFixed(2)),
              isPositive: quantityEvolution >= 0
            },
            purchaseAmount: {
              absolute: totalPurchaseAmount - comparisonPurchaseAmount,
              percentage: parseFloat((amountEvolution * 100).toFixed(2)),
              isPositive: amountEvolution >= 0
            },
            orders: {
              absolute: totalOrders - comparisonOrders,
              percentage: parseFloat((ordersEvolution * 100).toFixed(2)),
              isPositive: ordersEvolution >= 0
            },
            averagePurchasePrice: {
              absolute: (totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0) - comparisonAveragePurchasePrice,
              percentage: parseFloat((avgPriceEvolution * 100).toFixed(2)),
              isPositive: avgPriceEvolution >= 0
            },
            // Évolutions des ruptures
            stockBreakQuantity: {
              absolute: totalStockBreakQuantity - comparisonStockBreakQuantity,
              percentage: parseFloat((stockBreakQuantityEvolution * 100).toFixed(2)),
              isPositive: stockBreakQuantityEvolution >= 0
            },
            stockBreakAmount: {
              absolute: totalStockBreakAmount - comparisonStockBreakAmount,
              percentage: parseFloat((stockBreakAmountEvolution * 100).toFixed(2)),
              isPositive: stockBreakAmountEvolution >= 0
            },
            stockBreakRate: {
              absolute: stockBreakRate - comparisonStockBreakRate,
              percentage: parseFloat((stockBreakRateEvolution * 100).toFixed(2)),
              isPositive: stockBreakRateEvolution >= 0
            }
          }
        };
      }
      
      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors du calcul des données sell-in:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul des données sell-in', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}