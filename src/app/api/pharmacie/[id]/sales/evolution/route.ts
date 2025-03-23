// src/app/api/pharmacies/[id]/sales/evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de la requête
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const interval = searchParams.get('interval') || 'day';
    
    // Récupérer les codes EAN13 sélectionnés s'ils sont fournis
    const code13refs = searchParams.getAll('code13refs');
    
    if (!id || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'ID de pharmacie, date de début et date de fin sont requis' },
        { status: 400 }
      );
    }

    return await processPharmacySalesEvolution(id, startDate, endDate, interval, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des ventes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    
    // Récupérer les paramètres du corps de la requête
    const { startDate, endDate, interval = 'day', code13refs = [] } = body;
    
    if (!id || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'ID de pharmacie, date de début et date de fin sont requis' },
        { status: 400 }
      );
    }

    return await processPharmacySalesEvolution(id, startDate, endDate, interval, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des ventes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction commune pour traiter la logique
async function processPharmacySalesEvolution(
  pharmacyId: string,
  startDate: string,
  endDate: string,
  interval: string,
  code13refs: string[]
) {
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
    
    // Construire les conditions de filtrage
    let filterConditions = '';
    let queryParams = [pharmacyId, startDate, endDate];
    let paramIndex = 4;
    
    // Ajouter le filtrage par code EAN13 si des codes sont fournis
    if (code13refs && code13refs.length > 0) {
      const codeParams = code13refs.map((_, i) => `$${paramIndex + i}`).join(',');
      filterConditions = `AND g.code_13_ref IN (${codeParams})`;
      queryParams.push(...code13refs);
    }
    
    const query = `
      WITH sales_by_period AS (
        SELECT 
          date_trunc('${timeInterval}', s.date) AS period,
          SUM(s.quantity) AS quantity,
          SUM(s.quantity * i.price_with_tax) AS revenue,
          SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS margin
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN
          data_internalproduct p ON i.product_id = p.id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          p.pharmacy_id = $1
          AND s.date BETWEEN $2 AND $3
          ${filterConditions}
        GROUP BY 
          period
        ORDER BY
          period
      )
      SELECT
        TO_CHAR(period, '${dateFormat}') AS period,
        COALESCE(quantity, 0) AS quantity,
        COALESCE(revenue, 0) AS revenue,
        COALESCE(margin, 0) AS margin,
        CASE WHEN revenue > 0 THEN
          ROUND((margin / revenue * 100)::numeric, 2)
        ELSE
          0
        END AS margin_percentage
      FROM
        sales_by_period
      ORDER BY
        period
    `;
    
    const result = await client.query(query, queryParams);
    
    return NextResponse.json({
      pharmacyId,
      startDate,
      endDate,
      interval,
      code13refsFiltered: code13refs.length > 0,
      data: result.rows
    });
  } finally {
    client.release();
  }
}