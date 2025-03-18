// src/app/api/sales/evolution-comparison/route.ts
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
    
    // Validation des paramètres requis
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates de début, de fin et de comparaison sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construire les conditions pour les pharmacies si spécifiées
      let pharmacyCondition = '';
      let params: any[] = [startDate, endDate, comparisonStartDate, comparisonEndDate];
      
      if (pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, index) => `$${index + 5}`).join(',');
        pharmacyCondition = `AND ip.pharmacy_id IN (${placeholders})`;
        params = [...params, ...pharmacyIds];
      }

      // Requête principale
      const query = `
        WITH current_period AS (
          -- Données de la période actuelle
          SELECT 
            ip.id AS product_id,
            ip.name AS product_name,
            gp.name AS global_name,
            CASE WHEN gp.name IS NULL OR gp.name = 'Default Name' THEN ip.name ELSE gp.name END AS display_name,
            ip.code_13_ref_id AS code_13_ref,
            gp.category,
            gp.brand_lab,
            COALESCE((SELECT stock FROM data_inventorysnapshot 
                      WHERE product_id = ip.id 
                      AND date <= $2
                      ORDER BY date DESC LIMIT 1), 0) AS current_stock,
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
            ip.id, ip.name, gp.name, ip.code_13_ref_id, gp.category, gp.brand_lab
        ),
        comparison_period AS (
          -- Données de la période de comparaison
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
          -- Calcul de l'évolution
          SELECT 
            cp.product_id,
            cp.product_name,
            cp.display_name,
            cp.code_13_ref,
            cp.category,
            cp.brand_lab,
            cp.current_stock,
            cp.current_revenue,
            comp.previous_revenue,
            cp.current_margin,
            comp.previous_margin,
            CASE 
              WHEN comp.previous_revenue > 0 THEN 
                ROUND(((cp.current_revenue - comp.previous_revenue) / comp.previous_revenue * 100)::numeric, 2)
              ELSE 0
            END AS evolution_percentage,
            CASE 
              WHEN comp.previous_margin > 0 THEN 
                ROUND(((cp.current_margin - comp.previous_margin) / comp.previous_margin * 100)::numeric, 2)
              ELSE 0
            END AS margin_evolution_percentage
          FROM 
            current_period cp
          LEFT JOIN 
            comparison_period comp ON cp.product_id = comp.product_id
          WHERE 
            cp.current_revenue > 0 OR comp.previous_revenue > 0
        ),
        category_data AS (
          -- Classification par tranches d'évolution
          SELECT
            product_id,
            display_name,
            code_13_ref,
            category,
            brand_lab,
            current_stock,
            current_revenue,
            previous_revenue,
            evolution_percentage,
            CASE
              WHEN evolution_percentage < -15 THEN 'strongDecrease'
              WHEN evolution_percentage >= -15 AND evolution_percentage < -5 THEN 'slightDecrease'
              WHEN evolution_percentage >= -5 AND evolution_percentage <= 5 THEN 'stable'
              WHEN evolution_percentage > 5 AND evolution_percentage <= 15 THEN 'slightIncrease'
              WHEN evolution_percentage > 15 THEN 'strongIncrease'
              ELSE 'stable'
            END AS category
          FROM
            evolution_data
        ),
        global_comparison AS (
          -- Synthèse globale
          SELECT
            SUM(current_revenue) AS current_period_revenue,
            SUM(previous_revenue) AS previous_period_revenue,
            CASE 
              WHEN SUM(previous_revenue) > 0 THEN 
                ROUND(((SUM(current_revenue) - SUM(previous_revenue)) / SUM(previous_revenue) * 100)::numeric, 2)
              ELSE 0
            END AS evolution_percentage,
            SUM(current_margin) AS current_period_margin,
            SUM(previous_margin) AS previous_period_margin,
            CASE 
              WHEN SUM(previous_margin) > 0 THEN 
                ROUND(((SUM(current_margin) - SUM(previous_margin)) / SUM(previous_margin) * 100)::numeric, 2)
              ELSE 0
            END AS margin_evolution_percentage
          FROM
            evolution_data
        )
        -- Retour des données finales
        SELECT 
          jsonb_build_object(
            'categories', jsonb_build_object(
              'strongDecrease', (SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM category_data WHERE category = 'strongDecrease' ORDER BY evolution_percentage) t),
              'slightDecrease', (SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM category_data WHERE category = 'slightDecrease' ORDER BY evolution_percentage) t),
              'stable', (SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM category_data WHERE category = 'stable' ORDER BY evolution_percentage) t),
              'slightIncrease', (SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM category_data WHERE category = 'slightIncrease' ORDER BY evolution_percentage DESC) t),
              'strongIncrease', (SELECT jsonb_agg(to_jsonb(t)) FROM (SELECT * FROM category_data WHERE category = 'strongIncrease' ORDER BY evolution_percentage DESC) t)
            ),
            'globalComparison', (SELECT to_jsonb(gc) FROM (
              SELECT 
                current_period_revenue AS "currentPeriodRevenue",
                previous_period_revenue AS "previousPeriodRevenue",
                evolution_percentage AS "evolutionPercentage",
                current_period_margin AS "currentPeriodMargin",
                previous_period_margin AS "previousPeriodMargin",
                margin_evolution_percentage AS "marginEvolutionPercentage"
              FROM global_comparison
            ) gc)
          ) AS result
      `;
      
      const result = await client.query(query, params);
      
      // Gestion des résultats null (pour les tableaux vides notamment)
      const categoriesResult = result.rows[0]?.result.categories || {};
      
      // S'assurer que chaque catégorie a au moins un tableau vide si null
      const categories = {
        strongDecrease: categoriesResult.strongDecrease || [],
        slightDecrease: categoriesResult.slightDecrease || [],
        stable: categoriesResult.stable || [],
        slightIncrease: categoriesResult.slightIncrease || [],
        strongIncrease: categoriesResult.strongIncrease || []
      };
      
      // Formater la réponse finale
      return NextResponse.json({
        startDate,
        endDate,
        comparisonStartDate,
        comparisonEndDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        categories,
        globalComparison: result.rows[0]?.result.globalComparison || {
          currentPeriodRevenue: 0,
          previousPeriodRevenue: 0,
          evolutionPercentage: 0,
          currentPeriodMargin: 0,
          previousPeriodMargin: 0,
          marginEvolutionPercentage: 0
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution comparative:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}