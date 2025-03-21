// src/app/api/sellin/by-segment/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      segmentType = 'universe', 
      pharmacyIds = [], 
      code13refs = [] 
    } = body;
    
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
        conditions.push(`o.pharmacy_id IN (${pharmacyPlaceholders})`);
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
        WITH sellin_data AS (
          SELECT 
            COALESCE(g.${segmentType}, 'Non catégorisé') AS segment_value,
            po.product_id,
            po.qte AS quantity,
            (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            ) AS unit_cost
          FROM 
            data_order o
          JOIN 
            data_productorder po ON o.id = po.order_id
          JOIN 
            data_internalproduct p ON po.product_id = p.id
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            ${whereClause}
        ),
        segment_aggregation AS (
          SELECT 
            segment_value AS segment,
            SUM(quantity * unit_cost) AS total_amount,
            SUM(quantity) AS total_quantity,
            COUNT(DISTINCT product_id) AS product_count
          FROM 
            sellin_data
          GROUP BY 
            segment_value
        )
        SELECT 
          segment,
          ROUND(total_amount::numeric, 2) AS total_amount,
          ROUND(total_quantity::numeric) AS total_quantity,
          product_count
        FROM 
          segment_aggregation
        ORDER BY 
          total_amount DESC
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
    console.error('Erreur lors de la récupération de la distribution des achats par segment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}