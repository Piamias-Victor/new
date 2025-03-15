// src/app/api/products/top/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query = '';
      let params: any[] = [startDate, endDate, limit];

      // Construction de la requête en fonction des paramètres
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        query = `
          WITH product_sales AS (
            SELECT 
              i.product_id,
              p.name AS product_name,
              g.name AS global_name,
              g.category,
              g.brand_lab,
              p."TVA" AS tva_rate,
              p.code_13_ref_id AS code_13_ref,
              COALESCE((SELECT stock FROM data_inventorysnapshot 
                WHERE product_id = i.product_id 
                AND date <= $2 
                ORDER BY date DESC LIMIT 1), 0) AS current_stock,
              SUM(s.quantity) AS total_quantity,
              SUM(s.quantity * i.price_with_tax) AS total_revenue,
              SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin
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
            GROUP BY 
              i.product_id, p.name, g.name, g.category, g.brand_lab, p."TVA", p.code_13_ref_id
          )
          SELECT json_build_object(
            'byRevenue', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_revenue DESC
                LIMIT $3
              ) t
            ),
            'byQuantity', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_quantity DESC
                LIMIT $3
              ) t
            ),
            'byMargin', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_margin DESC
                LIMIT $3
              ) t
            )
          ) AS results
        `;
      } else {
        // Requête pour des pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 4}`).join(',');

        query = `
          WITH filtered_products AS (
            SELECT id, name, "TVA", code_13_ref_id
            FROM data_internalproduct 
            WHERE pharmacy_id IN (${pharmacyPlaceholders})
          ),
          product_sales AS (
            SELECT 
              i.product_id,
              p.name AS product_name,
              g.name AS global_name,
              g.category,
              g.brand_lab,
              p."TVA" AS tva_rate,
              p.code_13_ref_id AS code_13_ref,
              COALESCE((SELECT stock FROM data_inventorysnapshot 
                WHERE product_id = i.product_id 
                AND date <= $2 
                ORDER BY date DESC LIMIT 1), 0) AS current_stock,
              SUM(s.quantity) AS total_quantity,
              SUM(s.quantity * i.price_with_tax) AS total_revenue,
              SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              filtered_products p ON i.product_id = p.id
            LEFT JOIN
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            WHERE 
              s.date BETWEEN $1 AND $2
            GROUP BY 
              i.product_id, p.name, g.name, g.category, g.brand_lab, p."TVA", p.code_13_ref_id
          )
          SELECT json_build_object(
            'byRevenue', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_revenue DESC
                LIMIT $3
              ) t
            ),
            'byQuantity', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_quantity DESC
                LIMIT $3
              ) t
            ),
            'byMargin', (
              SELECT json_agg(t) FROM (
                SELECT 
                  product_id,
                  product_name,
                  CASE WHEN global_name IS NULL OR global_name = 'Default Name' THEN product_name ELSE global_name END AS display_name,
                  category,
                  brand_lab,
                  tva_rate,
                  code_13_ref,
                  current_stock,
                  total_quantity,
                  total_revenue,
                  total_margin,
                  CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
                FROM product_sales
                ORDER BY total_margin DESC
                LIMIT $3
              ) t
            )
          ) AS results
        `;
        params = [...params, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      // S'assurer que les données sont structurées correctement
      let productsData = { byRevenue: [], byQuantity: [], byMargin: [] };
      
      if (result.rows && result.rows.length > 0 && result.rows[0].results) {
        const resultData = result.rows[0].results;
        
        // Garantir que chaque tableau existe
        productsData = {
          byRevenue: Array.isArray(resultData.byRevenue) ? resultData.byRevenue : [],
          byQuantity: Array.isArray(resultData.byQuantity) ? resultData.byQuantity : [],
          byMargin: Array.isArray(resultData.byMargin) ? resultData.byMargin : []
        };
      }
      
      return NextResponse.json({
        startDate,
        endDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        ...productsData
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des top produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des top produits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}