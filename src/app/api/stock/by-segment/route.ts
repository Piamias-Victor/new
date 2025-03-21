// src/app/api/stock/by-segment/route.ts
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
    
    // Validation des paramètres - pour le stock, on utilise principalement endDate
    if (!endDate) {
      return NextResponse.json(
        { error: 'La date de fin est requise pour analyser le stock à cette date' },
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
      let params = [endDate]; // On prend le stock à la date de fin
      let paramIndex = 2;
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
        WITH stock_snapshot AS (
          -- Pour chaque produit, obtenir le snapshot de stock le plus récent jusqu'à la date de fin
          SELECT DISTINCT ON (i.product_id)
            i.product_id,
            i.stock,
            i.weighted_average_price,
            COALESCE(g.${segmentType}, 'Non catégorisé') AS segment_value
          FROM 
            data_inventorysnapshot i
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          LEFT JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            i.date <= $1
            ${whereClause}
          ORDER BY 
            i.product_id, i.date DESC
        ),
        segment_aggregation AS (
          SELECT 
            segment_value AS segment,
            SUM(stock * weighted_average_price) AS total_value,
            SUM(stock) AS total_units,
            COUNT(DISTINCT product_id) AS product_count
          FROM 
            stock_snapshot
          WHERE
            stock > 0 -- Ignorer les produits sans stock
          GROUP BY 
            segment_value
        )
        SELECT 
          segment,
          ROUND(total_value::numeric, 2) AS total_value,
          ROUND(total_units::numeric) AS total_units,
          product_count
        FROM 
          segment_aggregation
        ORDER BY 
          total_value DESC
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
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
    console.error('Erreur lors de la récupération de la distribution du stock par segment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}