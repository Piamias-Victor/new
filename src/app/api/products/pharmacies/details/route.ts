// src/app/api/pharmacies/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      comparisonStartDate, 
      comparisonEndDate,
      code13refs = []
    } = body;
    
    // Validation des dates
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      let codeFilter = '';
      let params = [startDate, endDate, comparisonStartDate, comparisonEndDate];
      
      // Ajouter le filtre des codes si présent
      if (code13refs.length > 0) {
        const placeholders = code13refs.map((_, index) => 
          `$${index + 5}`
        ).join(',');
        codeFilter = `AND g.code_13_ref IN (${placeholders})`;
        params = [...params, ...code13refs];
      }
      
      // Requête pour obtenir les détails des pharmacies
      // Requête corrigée
const query = `
WITH pharmacy_sales AS (
  SELECT 
    p.id AS pharmacy_id,
    SUM(s.quantity) AS total_quantity,
    SUM(s.quantity * i.price_with_tax) AS total_sell_out,
    SUM(s.quantity * i.weighted_average_price) AS total_sell_in,
    SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) AS total_margin,
    COUNT(DISTINCT ip.id) FILTER (WHERE ${codeFilter.length > 0 ? codeFilter.substring(4) : 'TRUE'}) AS product_count
  FROM 
    data_pharmacy p
  JOIN 
    data_internalproduct ip ON p.id = ip.pharmacy_id
  JOIN 
    data_inventorysnapshot i ON ip.id = i.product_id
  JOIN 
    data_sales s ON i.id = s.product_id
  LEFT JOIN
    data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
  WHERE 
    s.date BETWEEN $1 AND $2
    ${codeFilter}
  GROUP BY 
    p.id
),
pharmacy_comparison_sales AS (
  SELECT 
    p.id AS pharmacy_id,
    SUM(s.quantity) AS previous_quantity
  FROM 
    data_pharmacy p
  JOIN 
    data_internalproduct ip ON p.id = ip.pharmacy_id
  JOIN 
    data_inventorysnapshot i ON ip.id = i.product_id
  JOIN 
    data_sales s ON i.id = s.product_id
  LEFT JOIN
    data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
  WHERE 
    s.date BETWEEN $3 AND $4
    ${codeFilter}
  GROUP BY 
    p.id
),
pharmacy_stock AS (
  SELECT 
    p.id AS pharmacy_id,
    SUM(i.stock) AS stock_quantity,
    SUM(i.stock * i.weighted_average_price) AS stock_value_ht
  FROM 
    data_pharmacy p
  JOIN 
    data_internalproduct ip ON p.id = ip.pharmacy_id
  JOIN 
    data_inventorysnapshot i ON ip.id = i.product_id
  LEFT JOIN
    data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
  WHERE 
    i.date = (SELECT MAX(date) FROM data_inventorysnapshot)
    ${codeFilter}
  GROUP BY 
    p.id
),
-- Calcul des ventes totales pour chaque pharmacie (défini une seule fois)
pharmacy_total_sales AS (
  SELECT 
    p.id AS pharmacy_id,
    SUM(s.quantity * i.price_with_tax) AS total_global_sell_out
  FROM 
    data_pharmacy p
  JOIN 
    data_internalproduct ip ON p.id = ip.pharmacy_id
  JOIN 
    data_inventorysnapshot i ON ip.id = i.product_id
  JOIN 
    data_sales s ON i.id = s.product_id
  WHERE 
    s.date BETWEEN $1 AND $2
  GROUP BY 
    p.id
)
SELECT 
  p.id,
  p.name,
  p.area,
  COALESCE(ps.total_sell_out, 0) AS sell_out_price_ttc,
  COALESCE(ps.total_sell_in, 0) AS sell_in_price_ht,
  CASE 
    WHEN COALESCE(ps.total_sell_out, 0) > 0 THEN
      (COALESCE(ps.total_margin, 0) / COALESCE(ps.total_sell_out, 0)) * 100
    ELSE 0
  END AS margin_percentage,
  COALESCE(ps.total_margin, 0) AS margin_amount,
  COALESCE(pst.stock_value_ht, 0) AS stock_value_ht,
  COALESCE(pst.stock_quantity, 0) AS stock_quantity,
  COALESCE(ps.total_quantity, 0) AS sales_quantity,
  COALESCE(pcs.previous_quantity, 0) AS previous_sales_quantity,
  CASE
    WHEN COALESCE(pcs.previous_quantity, 0) > 0 THEN
      ((COALESCE(ps.total_quantity, 0) - COALESCE(pcs.previous_quantity, 0)) / COALESCE(pcs.previous_quantity, 0)) * 100
    ELSE 0
  END AS sales_evolution_percentage,
  COALESCE(ps.product_count, 0) AS product_count,
  CASE
    WHEN COALESCE(pts.total_global_sell_out, 0) > 0 THEN
      COALESCE(ps.total_sell_out, 0) / COALESCE(pts.total_global_sell_out, 0)
    ELSE 0
  END AS selection_weight
FROM 
  data_pharmacy p
LEFT JOIN 
  pharmacy_sales ps ON p.id = ps.pharmacy_id
LEFT JOIN 
  pharmacy_comparison_sales pcs ON p.id = pcs.pharmacy_id
LEFT JOIN 
  pharmacy_stock pst ON p.id = pst.pharmacy_id
LEFT JOIN
  pharmacy_total_sales pts ON p.id = pts.pharmacy_id
ORDER BY 
  p.name
`;
      
      const result = await client.query(query, params);
      
      // Formater les résultats
      const pharmacies = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        area: row.area,
        sell_out_price_ttc: Number(row.sell_out_price_ttc),
        sell_in_price_ht: Number(row.sell_in_price_ht),
        margin_percentage: Number(row.margin_percentage),
        margin_amount: Number(row.margin_amount),
        stock_value_ht: Number(row.stock_value_ht),
        stock_quantity: Number(row.stock_quantity),
        sales_quantity: Number(row.sales_quantity),
        previous_sales_quantity: Number(row.previous_sales_quantity),
        sales_evolution_percentage: Number(row.sales_evolution_percentage),
        total_sell_out: Number(row.sell_out_price_ttc),
        total_sell_in: Number(row.sell_in_price_ht),
        product_count: Number(row.product_count),
        selection_weight: Number(row.selection_weight)
      }));
      
      return NextResponse.json({ pharmacies });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données des pharmacies:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}