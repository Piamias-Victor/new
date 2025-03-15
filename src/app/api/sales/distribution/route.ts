// src/app/api/sales/distribution/route.ts
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
      let params;
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies - Version corrigée
        query = `
          WITH product_data AS (
            SELECT 
              p.id, 
              s.quantity,
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA",
              CASE WHEN g.code_13_ref LIKE '34009%' THEN 'Médicaments' ELSE 'Parapharmacie' END AS product_category
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            LEFT JOIN
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            WHERE 
              s.date BETWEEN $1 AND $2
          ),
          sales_distribution AS (
            SELECT 
              product_category AS category,
              SUM(quantity * price_with_tax) AS total_revenue,
              SUM(quantity * (price_with_tax - (weighted_average_price * (1 + "TVA"/100)))) AS total_margin,
              SUM(quantity) AS total_quantity
            FROM 
              product_data
            GROUP BY 
              product_category
          )
          SELECT 
            category,
            total_revenue,
            total_margin,
            CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage,
            total_quantity,
            ROUND((total_revenue / SUM(total_revenue) OVER() * 100)::numeric, 2) AS revenue_percentage
          FROM 
            sales_distribution
          ORDER BY 
            total_revenue DESC
        `;
        params = [startDate, endDate];
      } else {
        // Requête pour pharmacies spécifiques - Version corrigée
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        query = `
          WITH filtered_products AS (
            SELECT 
              id, 
              code_13_ref_id
            FROM 
              data_internalproduct 
            WHERE 
              pharmacy_id IN (${pharmacyPlaceholders})
          ),
          product_data AS (
            SELECT 
              p.id, 
              s.quantity,
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA",
              CASE WHEN g.code_13_ref LIKE '34009%' THEN 'Médicaments' ELSE 'Parapharmacie' END AS product_category
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            LEFT JOIN
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            WHERE 
              s.date BETWEEN $1 AND $2
              AND p.id IN (SELECT id FROM filtered_products)
          ),
          sales_distribution AS (
            SELECT 
              product_category AS category,
              SUM(quantity * price_with_tax) AS total_revenue,
              SUM(quantity * (price_with_tax - (weighted_average_price * (1 + "TVA"/100)))) AS total_margin,
              SUM(quantity) AS total_quantity
            FROM 
              product_data
            GROUP BY 
              product_category
          )
          SELECT 
            category,
            total_revenue,
            total_margin,
            CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage,
            total_quantity,
            ROUND((total_revenue / SUM(total_revenue) OVER() * 100)::numeric, 2) AS revenue_percentage
          FROM 
            sales_distribution
          ORDER BY 
            total_revenue DESC
        `;
        params = [startDate, endDate, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        startDate,
        endDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        distributions: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la répartition des ventes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la répartition des ventes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}