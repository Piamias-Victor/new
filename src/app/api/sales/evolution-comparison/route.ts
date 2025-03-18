// src/app/api/sales/evolution-comparison/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation basique
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Dates requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Condition pharmacies
      let pharmacyCondition = '';
      const params: any[] = [startDate, endDate, comparisonStartDate, comparisonEndDate];
      
      if (pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, i) => `$${i + 5}`).join(',');
        pharmacyCondition = `AND ip.pharmacy_id IN (${placeholders})`;
        params.push(...pharmacyIds);
      }

      // Requête SQL pour calculer l'évolution des ventes
      const query = `
        WITH current_period AS (
          SELECT 
            ip.id AS product_id,
            ip.name AS display_name,
            gp.name AS global_name,
            CASE WHEN gp.name IS NULL OR gp.name = 'Default Name' THEN ip.name ELSE gp.name END AS product_label,
            gp.category,
            gp.brand_lab,
            COALESCE((
              SELECT stock 
              FROM data_inventorysnapshot 
              WHERE product_id = ip.id 
              ORDER BY date DESC 
              LIMIT 1
            ), 0) AS current_stock,
            COALESCE(SUM(s.quantity * is.price_with_tax), 0) AS current_revenue,
            COALESCE(SUM(s.quantity * (is.price_with_tax - (is.weighted_average_price * (1 + ip."TVA"/100)))), 0) AS current_margin
          FROM 
            data_internalproduct ip
          LEFT JOIN 
            data_inventorysnapshot is ON ip.id = is.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = is.id AND s.date BETWEEN $1 AND $2
          LEFT JOIN
            data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
          WHERE 
            is.id IS NOT NULL
            ${pharmacyCondition}
          GROUP BY 
            ip.id, ip.name, gp.name, gp.category, gp.brand_lab
        ),
        comparison_period AS (
          SELECT 
            ip.id AS product_id,
            COALESCE(SUM(s.quantity * is.price_with_tax), 0) AS previous_revenue,
            COALESCE(SUM(s.quantity * (is.price_with_tax - (is.weighted_average_price * (1 + ip."TVA"/100)))), 0) AS previous_margin
          FROM 
            data_internalproduct ip
          LEFT JOIN 
            data_inventorysnapshot is ON ip.id = is.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = is.id AND s.date BETWEEN $3 AND $4
          WHERE 
            is.id IS NOT NULL
            ${pharmacyCondition}
          GROUP BY 
            ip.id
        ),
        evolution_data AS (
          SELECT 
            cp.product_id,
            cp.display_name,
            cp.product_label,
            cp.category,
            cp.brand_lab,
            cp.current_stock,
            cp.current_revenue,
            COALESCE(comp.previous_revenue, 0) AS previous_revenue,
            cp.current_margin,
            COALESCE(comp.previous_margin, 0) AS previous_margin,
            CASE 
              WHEN COALESCE(comp.previous_revenue, 0) > 0 THEN 
                ROUND(((cp.current_revenue - comp.previous_revenue) / comp.previous_revenue * 100), 2)
              ELSE 0
            END AS evolution_percentage,
            CASE 
              WHEN COALESCE(comp.previous_margin, 0) > 0 THEN 
                ROUND(((cp.current_margin - comp.previous_margin) / comp.previous_margin * 100), 2)
              ELSE 0
            END AS margin_evolution_percentage
          FROM 
            current_period cp
          LEFT JOIN 
            comparison_period comp ON cp.product_id = comp.product_id
          WHERE 
            cp.current_revenue > 0 OR comp.previous_revenue > 0
        ),
        global_comparison AS (
          SELECT
            SUM(current_revenue) AS current_period_revenue,
            SUM(previous_revenue) AS previous_period_revenue,
            CASE 
              WHEN SUM(previous_revenue) > 0 THEN 
                ROUND(((SUM(current_revenue) - SUM(previous_revenue)) / SUM(previous_revenue) * 100), 2)
              ELSE 0
            END AS revenue_evolution_percentage,
            SUM(current_margin) AS current_period_margin,
            SUM(previous_margin) AS previous_period_margin,
            CASE 
              WHEN SUM(previous_margin) > 0 THEN 
                ROUND(((SUM(current_margin) - SUM(previous_margin)) / SUM(previous_margin) * 100), 2)
              ELSE 0
            END AS margin_evolution_percentage
          FROM
            evolution_data
        ),
        categorized_products AS (
          SELECT 
            *,
            CASE
              WHEN evolution_percentage < -15 THEN 'strongDecrease'
              WHEN evolution_percentage >= -15 AND evolution_percentage < -5 THEN 'slightDecrease'
              WHEN evolution_percentage >= -5 AND evolution_percentage <= 5 THEN 'stable'
              WHEN evolution_percentage > 5 AND evolution_percentage <= 15 THEN 'slightIncrease'
              WHEN evolution_percentage > 15 THEN 'strongIncrease'
              ELSE 'stable'
            END AS category_type
          FROM 
            evolution_data
        )
        SELECT 
          json_build_object(
            'globalComparison', (
              SELECT json_build_object(
                'currentPeriodRevenue', current_period_revenue,
                'previousPeriodRevenue', previous_period_revenue,
                'evolutionPercentage', revenue_evolution_percentage,
                'currentPeriodMargin', current_period_margin,
                'previousPeriodMargin', previous_period_margin,
                'marginEvolutionPercentage', margin_evolution_percentage
              )
              FROM global_comparison
            ),
            'categories', json_build_object(
              'strongDecrease', (
                SELECT json_agg(json_build_object(
                  'product_id', product_id,
                  'display_name', product_label,
                  'code_13_ref', product_id,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                ))
                FROM categorized_products 
                WHERE category_type = 'strongDecrease'
                ORDER BY evolution_percentage ASC
              ),
              'slightDecrease', (
                SELECT json_agg(json_build_object(
                  'product_id', product_id,
                  'display_name', product_label,
                  'code_13_ref', product_id,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                ))
                FROM categorized_products 
                WHERE category_type = 'slightDecrease'
                ORDER BY evolution_percentage ASC
              ),
              'stable', (
                SELECT json_agg(json_build_object(
                  'product_id', product_id,
                  'display_name', product_label,
                  'code_13_ref', product_id,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                ))
                FROM categorized_products 
                WHERE category_type = 'stable'
                ORDER BY ABS(evolution_percentage)
              ),
              'slightIncrease', (
                SELECT json_agg(json_build_object(
                  'product_id', product_id,
                  'display_name', product_label,
                  'code_13_ref', product_id,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                ))
                FROM categorized_products 
                WHERE category_type = 'slightIncrease'
                ORDER BY evolution_percentage DESC
              ),
              'strongIncrease', (
                SELECT json_agg(json_build_object(
                  'product_id', product_id,
                  'display_name', product_label,
                  'code_13_ref', product_id,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                ))
                FROM categorized_products 
                WHERE category_type = 'strongIncrease'
                ORDER BY evolution_percentage DESC
              )
            )
          ) AS result
      `;
      
      const result = await client.query(query, params);
      
      // Extraction des données
      const resultData = result.rows[0]?.result || {};
      
      return NextResponse.json({
        startDate,
        endDate,
        comparisonStartDate,
        comparisonEndDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        ...resultData
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}