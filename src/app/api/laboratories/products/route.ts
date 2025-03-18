// src/app/api/laboratories/products/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const labName = searchParams.get('name');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres requis
    if (!labName) {
      return NextResponse.json(
        { error: 'Le nom du laboratoire est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construire la condition des pharmacies si spécifiées
      let pharmacyCondition = '';
      let params: any[] = [labName];
      
      if (pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, index) => `$${index + 2}`).join(',');
        pharmacyCondition = `AND p.pharmacy_id IN (${placeholders})`;
        params = [...params, ...pharmacyIds];
      }

      // Requête pour obtenir tous les produits du laboratoire
      const query = `
        WITH latest_snapshot AS (
          SELECT DISTINCT ON (product_id) 
            id,
            product_id,
            stock as current_stock,
            price_with_tax,
            weighted_average_price,
            date
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
            data_sales s ON s.product_id = i.id AND s.date >= (CURRENT_DATE - INTERVAL '30 days')
          ${pharmacyCondition ? 'WHERE ' + pharmacyCondition.substring(4) : ''}
          GROUP BY 
            i.product_id
        )
        SELECT 
          p.id,
          p.name,
          g.name as global_name,
          CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END as display_name,
          g.category,
          g.brand_lab,
          p.code_13_ref_id as code_13_ref,
          ls.current_stock,
          ls.price_with_tax,
          ls.weighted_average_price,
          p."TVA" as tva_rate,
          COALESCE(ps.total_sales, 0) as total_sales,
          CASE 
            WHEN ls.weighted_average_price > 0 THEN
              ROUND(((ls.price_with_tax / (1 + p."TVA"/100)) - ls.weighted_average_price) / ls.weighted_average_price * 100, 2)
            ELSE 0
          END as margin_percentage
        FROM 
          data_internalproduct p
        JOIN 
          latest_snapshot ls ON p.id = ls.product_id
        LEFT JOIN 
          product_sales ps ON p.id = ps.product_id
        LEFT JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.brand_lab = $1
          ${pharmacyCondition}
        ORDER BY
          display_name ASC
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        name: labName,
        count: result.rows.length,
        products: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des produits du laboratoire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits du laboratoire', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}