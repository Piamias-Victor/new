// src/app/api/sales/segment-evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      comparisonStartDate,
      comparisonEndDate,
      segmentType = 'universe', 
      pharmacyIds = [], 
      code13refs = [] 
    } = body;
    
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query;
      let params = [startDate, endDate, comparisonStartDate, comparisonEndDate];
      let paramIndex = 5;
      let conditions = [];
      
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, i) => `$${paramIndex + i}`).join(',');
        conditions.push(`p.pharmacy_id IN (${pharmacyPlaceholders})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      if (code13refs.length > 0) {
        const codePlaceholders = code13refs.map((_, i) => `$${paramIndex + i}`).join(',');
        conditions.push(`g.code_13_ref IN (${codePlaceholders})`);
        params.push(...code13refs);
      }
      
      const whereClause = conditions.length > 0 
        ? `AND ${conditions.join(' AND ')}` 
        : '';
      
      query = `
        WITH current_period AS (
          SELECT 
            COALESCE(g.${segmentType}, 'Non catégorisé') AS segment,
            SUM(s.quantity * i.price_with_tax) AS current_revenue
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
          GROUP BY 
            g.${segmentType}
        ),
        comparison_period AS (
          SELECT 
            COALESCE(g.${segmentType}, 'Non catégorisé') AS segment,
            SUM(s.quantity * i.price_with_tax) AS previous_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            s.date BETWEEN $3 AND $4
            ${whereClause}
          GROUP BY 
            g.${segmentType}
        )
        SELECT 
          cp.segment,
          cp.current_revenue,
          COALESCE(pp.previous_revenue, 0) AS previous_revenue,
          CASE 
            WHEN COALESCE(pp.previous_revenue, 0) > 0 
            THEN ROUND(((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue * 100)::numeric, 1)
            ELSE 0
          END AS evolution_percentage
        FROM 
          current_period cp
        LEFT JOIN 
          comparison_period pp ON cp.segment = pp.segment
        ORDER BY 
          cp.current_revenue DESC
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'évolution par segment:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}