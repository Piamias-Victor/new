// src/app/api/sell-in-stockouts/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fonction utilitaire pour convertir de manière sécurisée en nombre
function safeParseNumber(value: any, defaultValue: number = 0): number {
  const parsed = Number(value);
  return isNaN(parsed) ? defaultValue : parsed;
}

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if (!startDateStr || !endDateStr) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Convertir les dates en objets Date
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);

      // Préparer les paramètres pour les requêtes
      const baseParams: any[] = [
        startDate.toISOString().split('T')[0], 
        endDate.toISOString().split('T')[0]
      ];

      // Ajouter les IDs de pharmacie si présents
      const queryParams = pharmacyIds.length > 0 
        ? [...baseParams, ...pharmacyIds] 
        : baseParams;

      // Générer les placeholders dynamiquement
      const generatePlaceholders = (baseCount: number) => 
        pharmacyIds.length > 0 
          ? pharmacyIds.map((_, i) => `$${baseCount + i + 1}`).join(',')
          : '';

      // Requête pour calculer le sell-out (ventes)
      const sellOutQuery = `
        WITH sales_data AS (
          SELECT 
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_sell_out,
            COALESCE(SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + ip."TVA"/100)))), 0) as total_margin,
            COUNT(DISTINCT i.product_id) as references_vendues,
            CASE 
              WHEN SUM(s.quantity * i.price_with_tax) > 0 
              THEN (SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + ip."TVA"/100)))) / SUM(s.quantity * i.price_with_tax)) * 100 
              ELSE 0 
            END as margin_percentage
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct ip ON i.product_id = ip.id
          JOIN 
            data_pharmacy pha ON ip.pharmacy_id = pha.id
          WHERE 
            s.date BETWEEN $1 AND $2
            ${pharmacyIds.length > 0 
              ? `AND pha.id IN (${generatePlaceholders(2)})` 
              : ''}
        )
        SELECT * FROM sales_data
      `;

      // Requête pour le sell-in (achats)
      const sellInQuery = `
        WITH purchase_data AS (
          SELECT 
            COALESCE(SUM(po.qte_r * COALESCE(
              (SELECT weighted_average_price 
               FROM data_inventorysnapshot 
               WHERE product_id = po.product_id 
               ORDER BY date DESC LIMIT 1), 0)), 0) AS total_purchase_amount,
            COALESCE(SUM(po.qte_r), 0) AS total_purchase_quantity,
            COUNT(DISTINCT o.id) AS total_orders
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN 
            data_pharmacy pha ON o.pharmacy_id = pha.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            ${pharmacyIds.length > 0 
              ? `AND pha.id IN (${generatePlaceholders(2)})` 
              : ''}
        )
        SELECT * FROM purchase_data
      `;

      // Requête pour les ruptures (produits commandés mais partiellement/non reçus)
      const stockoutsQuery = `
        WITH stockout_data AS (
          SELECT 
            COALESCE(SUM(
              CASE 
                WHEN po.qte > po.qte_r AND po.qte_r > 0
                THEN (po.qte - po.qte_r) * COALESCE(
                  (SELECT price_with_tax 
                   FROM data_inventorysnapshot 
                   WHERE product_id = po.product_id 
                   ORDER BY date DESC LIMIT 1), 0)
                ELSE 0 
              END
            ), 0) AS total_stockouts_value,
            COALESCE(SUM(
              CASE 
                WHEN po.qte > po.qte_r AND po.qte_r > 0
                THEN (po.qte - po.qte_r)
                ELSE 0 
              END
            ), 0) AS total_stockouts_quantity
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN 
            data_pharmacy pha ON o.pharmacy_id = pha.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            AND po.qte > po.qte_r 
            AND po.qte_r > 0
            ${pharmacyIds.length > 0 
              ? `AND pha.id IN (${generatePlaceholders(2)})` 
              : ''}
        )
        SELECT * FROM stockout_data
      `;

      // Requête pour le stock
      const stockQuery = `
        WITH latest_stock AS (
          SELECT 
            COALESCE(SUM(i.stock * i.weighted_average_price), 0) as total_stock_value
          FROM 
            data_inventorysnapshot i
          JOIN 
            data_internalproduct ip ON i.product_id = ip.id
          JOIN 
            data_pharmacy pha ON ip.pharmacy_id = pha.id
          WHERE 
            i.date = (
              SELECT MAX(date) 
              FROM data_inventorysnapshot 
              WHERE product_id = i.product_id
            )
            ${pharmacyIds.length > 0 
              ? `AND pha.id IN (${generatePlaceholders(2)})` 
              : ''}
        )
        SELECT * FROM latest_stock
      `;

      // Exécuter les requêtes
      const sellOutResult = await client.query(sellOutQuery, queryParams);
      const sellInResult = await client.query(sellInQuery, queryParams);
      const stockoutsResult = await client.query(stockoutsQuery, queryParams);
      const stockResult = await client.query(stockQuery, queryParams);
      
      // Extraire et sécuriser les données
      const sellOutData = sellOutResult.rows[0] || {
        total_sell_out: 0,
        total_margin: 0,
        references_vendues: 0,
        margin_percentage: 0
      };
      
      const sellInData = sellInResult.rows[0] || {
        total_purchase_amount: 0,
        total_purchase_quantity: 0,
        total_orders: 0
      };
      
      const stockoutsData = stockoutsResult.rows[0] || {
        total_stockouts_value: 0,
        total_stockouts_quantity: 0
      };
      
      const stockData = stockResult.rows[0] || {
        total_stock_value: 0
      };
      
      // Préparer la réponse avec des conversions sécurisées
      return NextResponse.json({
        startDate: startDateStr,
        endDate: endDateStr,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        sellOut: {
          totalSellOut: safeParseNumber(sellOutData.total_sell_out),
          totalMargin: safeParseNumber(sellOutData.total_margin),
          referencesVendues: safeParseNumber(sellOutData.references_vendues),
          marginPercentage: safeParseNumber(sellOutData.margin_percentage)
        },
        sellIn: {
          totalPurchaseAmount: safeParseNumber(sellInData.total_purchase_amount),
          totalPurchaseQuantity: safeParseNumber(sellInData.total_purchase_quantity),
          totalOrders: safeParseNumber(sellInData.total_orders)
        },
        stockouts: {
          totalStockoutsValue: safeParseNumber(stockoutsData.total_stockouts_value),
          totalStockoutsQuantity: safeParseNumber(stockoutsData.total_stockouts_quantity)
        },
        stock: {
          totalStockValue: safeParseNumber(stockData.total_stock_value)
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}