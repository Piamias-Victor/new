// src/app/api/sales/universe/route.ts - version corrigée
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
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
      let query;
      let params = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Pour toutes les pharmacies - CORRECTION: Déplacé la condition CASE... WHEN en sous-requête
        query = `
          WITH product_sales AS (
            SELECT 
              CASE 
                WHEN gp.universe IS NOT NULL AND gp.universe != '' THEN gp.universe
                WHEN gp.code_13_ref LIKE '34009%' THEN 'Médicaments'
                ELSE 'Autre'
              END AS universe,
              s.quantity,
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA"
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN 
              data_internalproduct p ON i.product_id = p.id
            LEFT JOIN
              data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
            WHERE 
              s.date BETWEEN $1 AND $2
          ),
          universe_sales AS (
            SELECT 
              universe,
              SUM(quantity * price_with_tax) AS revenue,
              SUM(quantity * (price_with_tax - (weighted_average_price * (1 + "TVA"/100)))) AS margin,
              SUM(quantity) AS quantity
            FROM 
              product_sales
            GROUP BY 
              universe
            ORDER BY 
              revenue DESC
          )
          SELECT 
            universe,
            revenue,
            margin,
            quantity,
            ROUND((revenue / SUM(revenue) OVER()) * 100, 2) AS revenue_percentage,
            CASE WHEN revenue > 0 THEN ROUND((margin / revenue) * 100, 2) ELSE 0 END AS margin_percentage
          FROM 
            universe_sales
        `;
      } else {
        // Pour pharmacies spécifiques - CORRECTION: Même structure que ci-dessus
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        query = `
          WITH product_sales AS (
            SELECT 
              CASE 
                WHEN gp.universe IS NOT NULL AND gp.universe != '' THEN gp.universe
                WHEN gp.code_13_ref LIKE '34009%' THEN 'Médicaments'
                ELSE 'Autre'
              END AS universe,
              s.quantity,
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA"
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN 
              data_internalproduct p ON i.product_id = p.id
            LEFT JOIN
              data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
            WHERE 
              s.date BETWEEN $1 AND $2
              AND p.pharmacy_id IN (${pharmacyPlaceholders})
          ),
          universe_sales AS (
            SELECT 
              universe,
              SUM(quantity * price_with_tax) AS revenue,
              SUM(quantity * (price_with_tax - (weighted_average_price * (1 + "TVA"/100)))) AS margin,
              SUM(quantity) AS quantity
            FROM 
              product_sales
            GROUP BY 
              universe
            ORDER BY 
              revenue DESC
          )
          SELECT 
            universe,
            revenue,
            margin,
            quantity,
            ROUND((revenue / SUM(revenue) OVER()) * 100, 2) AS revenue_percentage,
            CASE WHEN revenue > 0 THEN ROUND((margin / revenue) * 100, 2) ELSE 0 END AS margin_percentage
          FROM 
            universe_sales
        `;
        params = [...params, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        startDate,
        endDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des ventes par univers:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des ventes par univers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}