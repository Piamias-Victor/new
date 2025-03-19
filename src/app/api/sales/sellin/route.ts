// src/app/api/sales/sellin/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête pour la période principale
      let mainQuery = '';
      let mainParams = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        mainQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
            COALESCE(SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            COUNT(DISTINCT o.id) as total_orders,
            TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT o.sent_date) as days_count
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
        `;
      } else {
        // Requête pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        mainQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
            COALESCE(SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            COUNT(DISTINCT o.id) as total_orders,
            TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT o.sent_date) as days_count
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            AND o.pharmacy_id IN (${pharmacyPlaceholders})
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
        days_count: 0
      };
      
      // Extraire les valeurs numériques
      const totalPurchaseQuantity = parseInt(mainRow.total_purchase_quantity) || 0;
      const totalPurchaseAmount = parseFloat(mainRow.total_purchase_amount) || 0;
      const totalOrders = parseInt(mainRow.total_orders) || 0;
      
      // Préparer la réponse
      const response = {
        startDate,
        endDate,
        actualDateRange: {
          min: mainRow.min_date,
          max: mainRow.max_date,
          days: parseInt(mainRow.days_count) || 0
        },
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalPurchaseQuantity,
        totalPurchaseAmount,
        totalOrders,
        averagePurchasePrice: totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0
      };
      
      // Ajouter la comparaison si demandée
      if (comparisonStartDate && comparisonEndDate) {
        let comparisonQuery = '';
        let comparisonParams = [comparisonStartDate, comparisonEndDate];
        
        if (pharmacyIds.length === 0) {
          // Requête de comparaison pour toutes les pharmacies
          comparisonQuery = `
            SELECT 
              COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
              COALESCE(SUM(po.qte_r * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = po.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              COUNT(DISTINCT o.id) as total_orders,
              TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT o.sent_date) as days_count
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
          `;
        } else {
          // Requête de comparaison pour pharmacies spécifiques
          const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
          
          comparisonQuery = `
            SELECT 
              COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
              COALESCE(SUM(po.qte_r * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = po.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              COUNT(DISTINCT o.id) as total_orders,
              TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT o.sent_date) as days_count
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
              AND o.pharmacy_id IN (${pharmacyPlaceholders})
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
          days_count: 0
        };
        
        // Extraire les valeurs numériques pour la comparaison
        const comparisonPurchaseQuantity = parseInt(comparisonRow.total_purchase_quantity) || 0;
        const comparisonPurchaseAmount = parseFloat(comparisonRow.total_purchase_amount) || 0;
        const comparisonOrders = parseInt(comparisonRow.total_orders) || 0;
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

// Version POST pour permettre les requêtes avec un corps plus complexe
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
      // Requête pour la période principale
      let mainQuery = '';
      let mainParams = [startDate, endDate];
      
      if (!pharmacyIds || pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        mainQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
            COALESCE(SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            COUNT(DISTINCT o.id) as total_orders,
            TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT o.sent_date) as days_count
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
        `;
      } else {
        // Requête pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        mainQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
            COALESCE(SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )), 0) as total_purchase_amount,
            COUNT(DISTINCT o.id) as total_orders,
            TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT o.sent_date) as days_count
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            AND o.pharmacy_id IN (${pharmacyPlaceholders})
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
        days_count: 0
      };
      
      // Extraire les valeurs numériques
      const totalPurchaseQuantity = parseInt(mainRow.total_purchase_quantity) || 0;
      const totalPurchaseAmount = parseFloat(mainRow.total_purchase_amount) || 0;
      const totalOrders = parseInt(mainRow.total_orders) || 0;
      
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
        averagePurchasePrice: totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0
      };
      
      // Ajouter la comparaison si demandée
      if (comparisonStartDate && comparisonEndDate) {
        let comparisonQuery = '';
        let comparisonParams = [comparisonStartDate, comparisonEndDate];
        
        if (!pharmacyIds || pharmacyIds.length === 0) {
          // Requête de comparaison pour toutes les pharmacies
          comparisonQuery = `
            SELECT 
              COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
              COALESCE(SUM(po.qte_r * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = po.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              COUNT(DISTINCT o.id) as total_orders,
              TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT o.sent_date) as days_count
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
          `;
        } else {
          // Requête de comparaison pour pharmacies spécifiques
          const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
          
          comparisonQuery = `
            SELECT 
              COALESCE(SUM(po.qte_r), 0) as total_purchase_quantity,
              COALESCE(SUM(po.qte_r * (
                SELECT COALESCE(weighted_average_price, 0)
                FROM data_inventorysnapshot
                WHERE product_id = po.product_id
                ORDER BY date DESC
                LIMIT 1
              )), 0) as total_purchase_amount,
              COUNT(DISTINCT o.id) as total_orders,
              TO_CHAR(MIN(o.sent_date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(o.sent_date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT o.sent_date) as days_count
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            JOIN
              data_internalproduct p ON po.product_id = p.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
              AND o.pharmacy_id IN (${pharmacyPlaceholders})
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
          days_count: 0
        };
        
        // Extraire les valeurs numériques pour la comparaison
        const comparisonPurchaseQuantity = parseInt(comparisonRow.total_purchase_quantity) || 0;
        const comparisonPurchaseAmount = parseFloat(comparisonRow.total_purchase_amount) || 0;
        const comparisonOrders = parseInt(comparisonRow.total_orders) || 0;
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