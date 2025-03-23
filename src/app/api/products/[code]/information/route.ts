// src/app/api/products/[code]/stock-analysis/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const code13ref = params.code;
    
    if (!code13ref) {
      return NextResponse.json(
        { error: 'Code EAN13 requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête adaptée pour utiliser code13ref au lieu de product_id
      const stockQuery = `
        WITH latest_snapshots AS (
          SELECT is.* 
          FROM data_inventorysnapshot is
          JOIN data_internalproduct ip ON is.product_id = ip.id
          WHERE ip.code_13_ref_id = $1
          ORDER BY is.date DESC
          LIMIT 10 -- Prendre les 10 derniers snapshots pour agréger
        ),
        
        aggregated_snapshots AS (
          SELECT 
            SUM(ls.stock) as total_stock,
            SUM(ls.stock * ls.weighted_average_price) as total_value,
            CASE 
              WHEN SUM(ls.stock) > 0 
              THEN SUM(ls.stock * ls.weighted_average_price) / SUM(ls.stock)
              ELSE 0
            END as avg_price
          FROM latest_snapshots ls
        ),
        
        -- Ventes récentes pour calculer la rotation
        recent_sales AS (
          SELECT 
            SUM(s.quantity) as total_sales,
            COUNT(DISTINCT s.date) as days_count
          FROM data_sales s
          JOIN data_inventorysnapshot is ON s.product_id = is.id
          JOIN data_internalproduct ip ON is.product_id = ip.id
          WHERE ip.code_13_ref_id = $1
          AND s.date >= CURRENT_DATE - INTERVAL '90 days'
        ),
        
        -- Dernières commandes
        recent_orders AS (
          SELECT 
            o.id as order_id,
            o.sent_date as date,
            po.qte as quantity,
            po.qte_r as received_quantity,
            CASE 
              WHEN o.step = 0 THEN 'En cours'
              WHEN o.step = 1 THEN 'Envoyée'
              WHEN o.step = 2 THEN 'Reçue'
              ELSE 'Inconnue'
            END as status
          FROM data_productorder po
          JOIN data_order o ON po.order_id = o.id
          JOIN data_internalproduct ip ON po.product_id = ip.id
          WHERE ip.code_13_ref_id = $1
          ORDER BY o.sent_date DESC
          LIMIT 5
        )
        
        SELECT 
          $1 as "code13ref",
          ag.total_stock as "currentStock",
          ag.total_value as "stockValue",
          ag.avg_price as "avgCostPrice",
          
          -- Calculer les jours et mois de stock
          CASE 
            WHEN rs.total_sales > 0 AND rs.days_count > 0 
            THEN ROUND((ag.total_stock / (rs.total_sales / rs.days_count))::numeric, 0)
            ELSE 0
          END as "daysOfStock",
          
          CASE 
            WHEN rs.total_sales > 0 AND rs.days_count > 0 
            THEN ROUND((ag.total_stock / (rs.total_sales / rs.days_count) / 30)::numeric, 1)
            ELSE 0
          END as "monthsOfStock",
          
          -- Rotation
          CASE 
            WHEN ag.total_stock > 0 THEN rs.total_sales / ag.total_stock
            ELSE 0
          END as "rotationRate",
          
          -- Seuil de rupture (exemple: 15 jours)
          CASE 
            WHEN rs.total_sales > 0 AND rs.days_count > 0 
            THEN ROUND(((rs.total_sales / rs.days_count) * 15)::numeric, 0)
            ELSE 0
          END as "ruptureTreshold",
          
          -- Date prévue de rupture
          TO_CHAR(
            CASE 
              WHEN rs.total_sales > 0 AND rs.days_count > 0 AND ag.total_stock > 0
              THEN CURRENT_DATE + ((ag.total_stock / (rs.total_sales / rs.days_count))::integer)
              ELSE NULL
            END,
            'YYYY-MM-DD'
          ) as "forecastedStockDate",
          
          -- Risque de rupture
          CASE
            WHEN ag.total_stock = 0 THEN 'critical'
            WHEN rs.total_sales > 0 AND rs.days_count > 0 AND (ag.total_stock / (rs.total_sales / rs.days_count)) < 15 THEN 'high'
            WHEN rs.total_sales > 0 AND rs.days_count > 0 AND (ag.total_stock / (rs.total_sales / rs.days_count)) < 30 THEN 'medium'
            ELSE 'low'
          END as "stockoutRisk",
          
          -- Date estimée de rupture
          CASE
            WHEN rs.total_sales > 0 AND rs.days_count > 0 AND ag.total_stock > 0
            THEN TO_CHAR(CURRENT_DATE + ((ag.total_stock / (rs.total_sales / rs.days_count))::integer), 'YYYY-MM-DD')
            ELSE NULL
          END as "stockoutRiskDate",
          
          -- Stock optimal (exemple: 2 mois de ventes)
          CASE 
            WHEN rs.total_sales > 0 AND rs.days_count > 0 
            THEN ROUND(((rs.total_sales / rs.days_count) * 60)::numeric, 0)
            ELSE 0
          END as "optimalStock",
          
          -- Quantité suggérée à commander
          GREATEST(
            0,
            CASE 
              WHEN rs.total_sales > 0 AND rs.days_count > 0 
              THEN ROUND(((rs.total_sales / rs.days_count) * 60 - ag.total_stock)::numeric, 0)
              ELSE 0
            END
          ) as "suggestedOrderQuantity",
          
          -- Sérialiser les dernières commandes en JSON
          (SELECT json_agg(ro.*) FROM recent_orders ro) as "lastOrders"
          
        FROM aggregated_snapshots ag
        CROSS JOIN recent_sales rs
      `;
      
      const result = await client.query(stockQuery, [code13ref]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Produit non trouvé ou aucune donnée de stock disponible' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de stock:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}