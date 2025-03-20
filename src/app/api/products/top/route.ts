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
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête commune pour calculer les métriques de produits
      const productMetricsQuery = `
        WITH product_metrics AS (
          SELECT 
            p.id AS product_id,
            p.name AS product_name,
            p.name AS display_name,
            g.category,
            g.brand_lab,
            COALESCE(g.tva_percentage, p."TVA") AS tva_rate,
            p.code_13_ref_id AS code_13_ref,
            COALESCE((
              SELECT stock
              FROM data_inventorysnapshot
              WHERE product_id = p.id
              ORDER BY date DESC
              LIMIT 1
            ), 0) AS current_stock,
            COALESCE(SUM(s.quantity), 0) AS total_quantity,
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) AS total_revenue,
            COALESCE(SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA")/100)))), 0) AS total_margin,
            CASE
              WHEN SUM(s.quantity * i.price_with_tax) > 0
              THEN ROUND((SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA")/100)))) / SUM(s.quantity * i.price_with_tax) * 100)::numeric, 1)
              ELSE 0
            END AS margin_percentage
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON i.id = s.product_id AND s.date BETWEEN $1 AND $2
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          ${pharmacyIds.length > 0 ? `WHERE p.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${idx + 3}`).join(',')})` : ''}
          GROUP BY 
            p.id, p.name, g.category, g.brand_lab, g.tva_percentage, p."TVA", p.code_13_ref_id
        )
      `;

      // Paramètres de base
      const params = [startDate, endDate];
      if (pharmacyIds.length > 0) {
        params.push(...pharmacyIds);
      }

      // Requête pour les produits triés par chiffre d'affaires
      const byRevenueQuery = `
        ${productMetricsQuery}
        SELECT *
        FROM product_metrics
        WHERE total_revenue > 0
        ORDER BY total_revenue DESC
        LIMIT $${params.length + 1}
      `;

      // Requête pour les produits triés par quantité
      const byQuantityQuery = `
        ${productMetricsQuery}
        SELECT *
        FROM product_metrics
        WHERE total_quantity > 0
        ORDER BY total_quantity DESC
        LIMIT $${params.length + 1}
      `;

      // Requête pour les produits triés par marge
      const byMarginQuery = `
        ${productMetricsQuery}
        SELECT *
        FROM product_metrics
        WHERE total_margin > 0
        ORDER BY total_margin DESC
        LIMIT $${params.length + 1}
      `;

      // Exécuter les requêtes
      const byRevenueResult = await client.query(byRevenueQuery, [...params, limit]);
      const byQuantityResult = await client.query(byQuantityQuery, [...params, limit]);
      const byMarginResult = await client.query(byMarginQuery, [...params, limit]);

      // Préparer la réponse
      return NextResponse.json({
        byRevenue: byRevenueResult.rows,
        byQuantity: byQuantityResult.rows,
        byMargin: byMarginResult.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des meilleurs produits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}