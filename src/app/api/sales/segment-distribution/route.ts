// src/app/api/sales/segment-distribution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const segmentType = searchParams.get('segmentType') || 'universe'; // Par défaut: universe
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    // Vérifier que le type de segment est valide
    const validSegments = [
      'universe', 
      'category', 
      'sub_category', 
      'brand_lab', 
      'lab_distributor', 
      'family', 
      'sub_family', 
      'range_name', 
      'specificity'
  ];
      if (!validSegments.includes(segmentType)) {
      return NextResponse.json(
        { error: 'Type de segment invalide' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query;
      let params = [startDate, endDate];
      let paramIndex = 3;
      let conditions = [];
      
      // Conditions pour les pharmacies
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, i) => `$${paramIndex + i}`).join(',');
        conditions.push(`p.pharmacy_id IN (${pharmacyPlaceholders})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      // Conditions pour les codes EAN13
      if (code13refs.length > 0) {
        const codePlaceholders = code13refs.map((_, i) => `$${paramIndex + i}`).join(',');
        conditions.push(`g.code_13_ref IN (${codePlaceholders})`);
        params.push(...code13refs);
      }
      
      const whereClause = conditions.length > 0 
        ? `AND ${conditions.join(' AND ')}` 
        : '';
      
      query = `
        WITH product_data AS (
          SELECT 
            p.id, 
            s.quantity,
            i.price_with_tax,
            i.weighted_average_price,
            p."TVA",
            COALESCE(g.${segmentType}, 'Non catégorisé') AS segment_value
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
            ${whereClause}
        ),
        segment_distribution AS (
          SELECT 
            segment_value AS segment,
            SUM(quantity * price_with_tax) AS total_revenue,
            SUM(quantity * (price_with_tax - (weighted_average_price * (1 + "TVA"/100)))) AS total_margin,
            SUM(quantity) AS total_quantity,
            COUNT(DISTINCT id) AS product_count
          FROM 
            product_data
          GROUP BY 
            segment_value
        )
        SELECT 
          segment,
          total_revenue,
          total_margin,
          CASE WHEN total_revenue > 0 THEN ROUND((total_margin / total_revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage,
          total_quantity,
          product_count,
          ROUND((total_revenue / SUM(total_revenue) OVER() * 100)::numeric, 2) AS revenue_percentage
        FROM 
          segment_distribution
        ORDER BY 
          total_revenue DESC
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        startDate,
        endDate,
        segmentType,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        code13refs: code13refs.length > 0 ? code13refs : 'all',
        distributions: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de la distribution par segment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}