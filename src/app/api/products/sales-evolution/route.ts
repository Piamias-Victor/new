// src/app/api/products/sales-evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      interval = 'day', // 'day', 'week', 'month'
      productIds,
      pharmacyIds = []
    } = body;
    
    // Validation des paramètres
    if (!startDate || !endDate || !productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Dates et IDs de produits sont requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Configurer l'intervalle PostgreSQL
      let timeInterval;
      let dateFormat;
      
      switch (interval) {
        case 'week':
          timeInterval = 'week';
          dateFormat = 'YYYY-WW';
          break;
        case 'month':
          timeInterval = 'month';
          dateFormat = 'YYYY-MM';
          break;
        default: // day
          timeInterval = 'day';
          dateFormat = 'YYYY-MM-DD';
      }

      // Placeholder pour les IDs de produits
      const productPlaceholders = productIds.map((_, index) => `$${index + 3}`).join(',');
      let params = [startDate, endDate, ...productIds];
      let pharmacyCondition = '';
      
      // Si on a des IDs de pharmacies, les inclure dans la requête
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + productIds.length + 3}`).join(',');
        pharmacyCondition = `AND pha.id IN (${pharmacyPlaceholders})`;
        params = [...params, ...pharmacyIds];
      }
      
      // Requête pour obtenir les données par produit, par pharmacie et le total
      const query = `
        WITH sales_by_product_pharmacy AS (
          SELECT 
            date_trunc('${timeInterval}', s.date) AS period,
            p.id AS product_id,
            p.name AS product_name,
            g.name AS global_name,
            p.name AS display_name,
            g.category,
            g.brand_lab,
            pha.id AS pharmacy_id,
            pha.name AS pharmacy_name,
            SUM(s.quantity) AS quantity,
            SUM(s.quantity * i.price_with_tax) AS revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS margin
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          JOIN
            data_pharmacy pha ON p.pharmacy_id = pha.id
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            AND p.id IN (${productPlaceholders})
            ${pharmacyCondition}
          GROUP BY 
            period, p.id, p.name, g.name, g.category, g.brand_lab, pha.id, pha.name
        ),
        total_data AS (
          SELECT
            TO_CHAR(period, '${dateFormat}') AS period,
            SUM(quantity) AS total_quantity,
            SUM(revenue) AS total_revenue,
            SUM(margin) AS total_margin,
            CASE WHEN SUM(revenue) > 0 
              THEN ROUND((SUM(margin) / SUM(revenue) * 100)::numeric, 2) 
              ELSE 0 
            END AS margin_percentage
          FROM
            sales_by_product_pharmacy
          GROUP BY
            period
          ORDER BY
            period
        ),
        product_data AS (
          SELECT
            TO_CHAR(period, '${dateFormat}') AS period,
            product_id,
            display_name,
            category,
            brand_lab,
            SUM(quantity) AS quantity,
            SUM(revenue) AS revenue,
            SUM(margin) AS margin,
            CASE WHEN SUM(revenue) > 0 
              THEN ROUND((SUM(margin) / SUM(revenue) * 100)::numeric, 2) 
              ELSE 0 
            END AS margin_percentage
          FROM
            sales_by_product_pharmacy
          GROUP BY
            period, product_id, display_name, category, brand_lab
        ),
        pharmacy_data AS (
          SELECT
            TO_CHAR(period, '${dateFormat}') AS period,
            pharmacy_id,
            pharmacy_name,
            SUM(quantity) AS quantity,
            SUM(revenue) AS revenue,
            SUM(margin) AS margin,
            CASE WHEN SUM(revenue) > 0 
              THEN ROUND((SUM(margin) / SUM(revenue) * 100)::numeric, 2) 
              ELSE 0 
            END AS margin_percentage
          FROM
            sales_by_product_pharmacy
          GROUP BY
            period, pharmacy_id, pharmacy_name
        )
        SELECT 
          json_build_object(
            'totalData', (SELECT json_agg(t) FROM total_data t),
            'productData', (
              SELECT json_object_agg(product_id, product_info)
              FROM (
                SELECT 
                  product_id,
                  json_build_object(
                    'name', display_name,
                    'category', category,
                    'brand_lab', brand_lab,
                    'data', (
                      SELECT json_agg(json_build_object(
                        'period', period, 
                        'quantity', quantity, 
                        'revenue', revenue, 
                        'margin', margin, 
                        'margin_percentage', margin_percentage
                      ) ORDER BY period)
                      FROM product_data pd
                      WHERE pd.product_id = p.product_id
                    )
                  ) AS product_info
                FROM (SELECT DISTINCT product_id, display_name, category, brand_lab FROM product_data) p
              ) subq
            ),
            'pharmacyData', (
              SELECT json_object_agg(pharmacy_id, pharmacy_info)
              FROM (
                SELECT 
                  pharmacy_id,
                  json_build_object(
                    'name', pharmacy_name,
                    'data', (
                      SELECT json_agg(json_build_object(
                        'period', period, 
                        'quantity', quantity, 
                        'revenue', revenue, 
                        'margin', margin, 
                        'margin_percentage', margin_percentage
                      ) ORDER BY period)
                      FROM pharmacy_data pd
                      WHERE pd.pharmacy_id = p.pharmacy_id
                    )
                  ) AS pharmacy_info
                FROM (SELECT DISTINCT pharmacy_id, pharmacy_name FROM pharmacy_data) p
              ) subq
            )
          ) as result
        `;
      
      const result = await client.query(query, params);
      const data = result.rows[0]?.result || { totalData: [], productData: {}, pharmacyData: {} };
      
      return NextResponse.json({
        startDate,
        endDate,
        interval,
        productIds,
        pharmacyIds,
        ...data
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}