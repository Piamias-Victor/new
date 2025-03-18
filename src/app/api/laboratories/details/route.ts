// src/app/api/laboratories/details/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de la requête
    const { searchParams } = new URL(request.url);
    const labName = searchParams.get('name');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres requis
    if (!labName) {
      return NextResponse.json(
        { error: 'Le nom du laboratoire est requis' },
        { status: 400 }
      );
    }

    // Établir des dates par défaut si non fournies
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    
    // Par défaut, 30 jours avant la date de fin
    const defaultStart = new Date(today);
    defaultStart.setDate(today.getDate() - 30);
    const defaultStartDate = defaultStart.toISOString().split('T')[0];
    
    // Utiliser les dates fournies ou les dates par défaut
    const analysisStartDate = startDate || defaultStartDate;
    const analysisEndDate = endDate || defaultEndDate;

    const client = await pool.connect();
    
    try {
      // Construire la condition des pharmacies si spécifiées
      let pharmacyCondition = '';
      let params: any[] = [labName, analysisStartDate, analysisEndDate];
      
      if (pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, index) => `$${index + 4}`).join(',');
        pharmacyCondition = `AND p.pharmacy_id IN (${placeholders})`;
        params = [...params, ...pharmacyIds];
      }

      // Requête pour obtenir les détails du laboratoire
      const query = `
        WITH lab_products AS (
          -- Tous les produits de ce laboratoire
          SELECT 
            g.code_13_ref,
            g.name AS product_name,
            g.category,
            g.sub_category,
            g.range_name
          FROM 
            data_globalproduct g
          WHERE 
            g.brand_lab = $1
        ),
        lab_sales AS (
          -- Ventes des produits de ce laboratoire
          SELECT 
            lp.product_name,
            lp.category,
            lp.sub_category,
            lp.range_name,
            SUM(s.quantity) AS total_quantity,
            SUM(s.quantity * i.price_with_tax) AS total_revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            lab_products lp ON p.code_13_ref_id = lp.code_13_ref
          WHERE 
            s.date BETWEEN $2 AND $3
            ${pharmacyCondition}
          GROUP BY 
            lp.product_name, lp.category, lp.sub_category, lp.range_name
        ),
        lab_summary AS (
          -- Résumé des catégories et gammes du laboratoire
          SELECT 
            COUNT(DISTINCT code_13_ref) AS total_products,
            COUNT(DISTINCT category) AS total_categories,
            COUNT(DISTINCT sub_category) AS total_subcategories,
            COUNT(DISTINCT range_name) AS total_ranges,
            array_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL AND category != '') AS categories,
            array_agg(DISTINCT range_name) FILTER (WHERE range_name IS NOT NULL AND range_name != '') AS ranges
          FROM 
            lab_products
        ),
        lab_sales_summary AS (
          -- Résumé des ventes
          SELECT 
            COUNT(product_name) AS products_with_sales,
            SUM(total_quantity) AS total_quantity_sold,
            SUM(total_revenue) AS total_revenue,
            SUM(total_margin) AS total_margin,
            CASE WHEN SUM(total_revenue) > 0 
              THEN (SUM(total_margin) / SUM(total_revenue)) * 100 
              ELSE 0 
            END AS margin_percentage
          FROM 
            lab_sales
        ),
        top_products AS (
          -- Top 10 produits par chiffre d'affaires
          SELECT 
            product_name,
            category,
            total_quantity,
            total_revenue,
            total_margin,
            CASE WHEN total_revenue > 0 
              THEN (total_margin / total_revenue) * 100 
              ELSE 0 
            END AS margin_percentage
          FROM 
            lab_sales
          ORDER BY 
            total_revenue DESC
          LIMIT 10
        ),
        category_breakdown AS (
          -- Répartition par catégorie
          SELECT 
            COALESCE(category, 'Non catégorisé') AS category,
            SUM(total_quantity) AS total_quantity,
            SUM(total_revenue) AS total_revenue,
            SUM(total_margin) AS total_margin,
            CASE WHEN SUM(total_revenue) > 0 
              THEN (SUM(total_margin) / SUM(total_revenue)) * 100 
              ELSE 0 
            END AS margin_percentage
          FROM 
            lab_sales
          GROUP BY 
            category
          ORDER BY 
            total_revenue DESC
        ),
        range_breakdown AS (
          -- Répartition par gamme
          SELECT 
            COALESCE(range_name, 'Non catégorisé') AS range_name,
            SUM(total_quantity) AS total_quantity,
            SUM(total_revenue) AS total_revenue,
            SUM(total_margin) AS total_margin,
            CASE WHEN SUM(total_revenue) > 0 
              THEN (SUM(total_margin) / SUM(total_revenue)) * 100 
              ELSE 0 
            END AS margin_percentage
          FROM 
            lab_sales
          GROUP BY 
            range_name
          ORDER BY 
            total_revenue DESC
        )
        SELECT 
          json_build_object(
            'name', $1,
            'period', json_build_object(
              'startDate', $2,
              'endDate', $3
            ),
            'summary', (SELECT row_to_json(ls) FROM lab_summary ls),
            'sales', (SELECT row_to_json(lss) FROM lab_sales_summary lss),
            'topProducts', (SELECT json_agg(tp) FROM top_products tp),
            'categoryBreakdown', (SELECT json_agg(cb) FROM category_breakdown cb),
            'rangeBreakdown', (SELECT json_agg(rb) FROM range_breakdown rb)
          ) AS laboratory_data
      `;
      
      const result = await client.query(query, params);
      
      // Vérifier si nous avons récupéré des données
      if (!result.rows || result.rows.length === 0 || !result.rows[0].laboratory_data) {
        return NextResponse.json(
          { error: `Aucune donnée trouvée pour le laboratoire "${labName}"` },
          { status: 404 }
        );
      }
      
      // Retourner les données du laboratoire
      return NextResponse.json(result.rows[0].laboratory_data);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails du laboratoire:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails du laboratoire', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}