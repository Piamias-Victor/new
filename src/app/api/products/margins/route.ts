// src/app/api/products/margins/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    const client = await pool.connect();
    
    try {
      let query = '';
      let params: any[] = [];
      let pharmacyCondition = '';
      
      // Construire la condition pour les pharmacies si spécifié
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 1}`).join(',');
        pharmacyCondition = `WHERE p.pharmacy_id IN (${pharmacyPlaceholders})`;
        params = [...pharmacyIds];
      }

      // Requête pour obtenir les données de produits avec leurs marges
      query = `
        WITH latest_snapshot AS (
          SELECT DISTINCT ON (product_id) 
            product_id,
            stock as current_stock,
            price_with_tax,
            weighted_average_price
          FROM data_inventorysnapshot
          ORDER BY product_id, date DESC
        ),
        product_sales AS (
          SELECT 
            i.product_id,
            COALESCE(SUM(s.quantity), 0) as total_sales
          FROM 
            data_internalproduct p
          JOIN 
            latest_snapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = (
              SELECT id FROM data_inventorysnapshot 
              WHERE product_id = p.id 
              ORDER BY date DESC LIMIT 1
            )
          ${pharmacyCondition}
          GROUP BY 
            i.product_id
        )
        SELECT
          p.id,
          p.name as product_name,
          g.name as global_name,
          CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END as display_name,
          g.category,
          g.brand_lab,
          p.code_13_ref_id as code_13_ref,
          ls.current_stock,
          ls.price_with_tax,
          ls.weighted_average_price,
          CASE 
            WHEN ls.weighted_average_price > 0 THEN
              ROUND(((ls.price_with_tax / (1 + p."TVA"/100)) - ls.weighted_average_price) / ls.weighted_average_price * 100, 2)
            ELSE 0
          END as margin_percentage,
          CASE 
            WHEN ls.weighted_average_price > 0 THEN
              ROUND((ls.price_with_tax / (1 + p."TVA"/100)) - ls.weighted_average_price, 2)
            ELSE 0
          END as margin_amount,
          COALESCE(ps.total_sales, 0) as total_sales
        FROM
          data_internalproduct p
        JOIN
          latest_snapshot ls ON p.id = ls.product_id
        LEFT JOIN
          product_sales ps ON p.id = ps.product_id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        ${pharmacyCondition ? pharmacyCondition : ''}
        WHERE ls.current_stock > 0
        ORDER BY 
          margin_percentage ASC
      `;
      
      const result = await client.query(query, params);
      
      // Classifier les produits par catégorie de marge
      const negativeMargin = result.rows.filter(p => parseFloat(p.margin_percentage) < 0);
      const lowMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 0 && parseFloat(p.margin_percentage) < 10);
      const mediumMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 10 && parseFloat(p.margin_percentage) < 20);
      const goodMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 20 && parseFloat(p.margin_percentage) <= 35);
      const excellentMargin = result.rows.filter(p => parseFloat(p.margin_percentage) > 35);
      
      return NextResponse.json({
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        negativeMargin,
        lowMargin,
        mediumMargin,
        goodMargin,
        excellentMargin,
        totalProducts: result.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de marges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}