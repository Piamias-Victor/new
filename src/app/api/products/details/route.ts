// src/app/api/products/details/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      code13refs, 
      pharmacyIds, 
      startDate, 
      endDate, 
      comparisonStartDate, 
      comparisonEndDate 
    } = body;
    
    // Vérification des paramètres
    if (!code13refs || !Array.isArray(code13refs) || code13refs.length === 0) {
      return NextResponse.json(
        { error: 'Liste de codes EAN13 requise' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construction de la requête
      const codeParams = code13refs.map((_, idx) => `$${idx + 1}`).join(',');
      let pharmacyCondition = '';
      let params = [...code13refs];
      
      // Paramètres additionnels
      const dateOffset = code13refs.length + 1;
      params.push(startDate, endDate, comparisonStartDate, comparisonEndDate);
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const pharmacyOffset = code13refs.length + 5; // +5 pour les 4 dates
        const pharmacyParams = pharmacyIds.map((_, idx) => `$${idx + pharmacyOffset}`).join(',');
        pharmacyCondition = `AND p.pharmacy_id IN (${pharmacyParams})`;
        params = [...params, ...pharmacyIds];
      }
      
      const query = `
        WITH product_data AS (
          SELECT 
            p.id,
            p.name AS display_name,
            p.code_13_ref_id AS code_13_ref,
            g.brand_lab,
            i.price_with_tax AS sell_out_price_ttc,
            i.weighted_average_price AS sell_in_price_ht,
            CASE 
              WHEN i.price_with_tax > 0 THEN ((i.price_with_tax - i.weighted_average_price * (1 + p."TVA"/100)) / i.price_with_tax * 100)
              ELSE 0
            END AS margin_percentage,
            (i.price_with_tax - i.weighted_average_price * (1 + p."TVA"/100)) AS margin_amount,
            i.stock * i.weighted_average_price AS stock_value_ht,
            i.stock AS stock_quantity,
            -- Ventes pour la période actuelle
            COALESCE((
              SELECT SUM(s.quantity)
              FROM data_sales s
              JOIN data_inventorysnapshot si ON s.product_id = si.id
              WHERE si.product_id = p.id AND s.date BETWEEN $${dateOffset} AND $${dateOffset + 1}
            ), 0) AS sales_quantity,
            -- Ventes pour la période de comparaison
            COALESCE((
              SELECT SUM(s.quantity)
              FROM data_sales s
              JOIN data_inventorysnapshot si ON s.product_id = si.id
              WHERE si.product_id = p.id AND s.date BETWEEN $${dateOffset + 2} AND $${dateOffset + 3}
            ), 0) AS previous_sales_quantity,
            -- Totaux de vente
            COALESCE((
              SELECT SUM(s.quantity * si.price_with_tax)
              FROM data_sales s
              JOIN data_inventorysnapshot si ON s.product_id = si.id
              WHERE si.product_id = p.id AND s.date BETWEEN $${dateOffset} AND $${dateOffset + 1}
            ), 0) AS total_sell_out,
            COALESCE((
              SELECT SUM(s.quantity * si.weighted_average_price)
              FROM data_sales s
              JOIN data_inventorysnapshot si ON s.product_id = si.id
              WHERE si.product_id = p.id AND s.date BETWEEN $${dateOffset} AND $${dateOffset + 1}
            ), 0) AS total_sell_in
          FROM 
            data_internalproduct p
          JOIN 
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref

          WHERE 
            p.code_13_ref_id IN (${codeParams})
            ${pharmacyCondition}
          ORDER BY 
            p.code_13_ref_id ASC,
            i.date DESC
        ),
        final_data AS (
          SELECT DISTINCT ON (code_13_ref) *,
            CASE 
              WHEN previous_sales_quantity > 0 THEN 
                ((sales_quantity - previous_sales_quantity) / previous_sales_quantity * 100)
              ELSE 0
            END AS sales_evolution_percentage
          FROM product_data
        )
        SELECT * FROM final_data
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        products: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails des produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}