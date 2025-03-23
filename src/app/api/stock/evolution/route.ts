// src/app/api/stock/evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    const interval = searchParams.get('interval') || 'day';
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    return await processStockEvolution(startDate, endDate, interval, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      interval = 'day', 
      pharmacyIds = [], 
      code13refs = [] 
    } = body;
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    return await processStockEvolution(startDate, endDate, interval, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function processStockEvolution(
  startDate: string,
  endDate: string,
  interval: string,
  pharmacyIds: string[],
  code13refs: string[]
) {
  const client = await pool.connect();
  
  try {
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

    let conditions = [];
    let queryParams = [startDate, endDate];
    let paramIndex = 3;
    
    if (pharmacyIds.length > 0) {
      const pharmacyPlaceholders = pharmacyIds.map((_, i) => `$${paramIndex + i}`).join(',');
      conditions.push(`p.pharmacy_id IN (${pharmacyPlaceholders})`);
      queryParams.push(...pharmacyIds);
      paramIndex += pharmacyIds.length;
    }
    
    if (code13refs.length > 0) {
      const codePlaceholders = code13refs.map((_, i) => `$${paramIndex + i}`).join(',');
      conditions.push(`g.code_13_ref IN (${codePlaceholders})`);
      queryParams.push(...code13refs);
    }
    
    const whereClause = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
    
    const query = `
      WITH date_series AS (
        SELECT generate_series(
          date_trunc('${timeInterval}', $1::date),
          date_trunc('${timeInterval}', $2::date),
          '1 ${timeInterval}'::interval
        )::date AS period_date
      ),
      stock_data AS (
        SELECT 
          date_trunc('${timeInterval}', i.date) AS period,
          SUM(i.stock) AS stock_quantity,
          SUM(i.stock * COALESCE(i.weighted_average_price, 0)) AS stock_value
        FROM 
          data_inventorysnapshot i
        JOIN
          data_internalproduct p ON i.product_id = p.id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          i.date BETWEEN $1 AND $2
          ${whereClause}
        GROUP BY 
          period
      ),
      rupture_data AS (
        SELECT 
          date_trunc('${timeInterval}', o.sent_date) AS period,
          SUM(
            CASE WHEN po.qte_r > 0 THEN GREATEST(0, po.qte - po.qte_r) ELSE 0 END
          ) AS rupture_quantity,
          COUNT(DISTINCT CASE WHEN po.qte_r > 0 AND po.qte_r < po.qte THEN po.product_id ELSE NULL END) > 0 AS is_rupture
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
        GROUP BY 
          period
      ),
      results AS (
        SELECT
          ds.period_date,
          COALESCE(sd.stock_quantity, 0) AS stock_quantity,
          COALESCE(sd.stock_value, 0) AS stock_value,
          COALESCE(rd.rupture_quantity, 0) AS rupture_quantity,
          COALESCE(rd.is_rupture, false) AS is_rupture
        FROM
          date_series ds
        LEFT JOIN
          stock_data sd ON ds.period_date = sd.period::date
        LEFT JOIN
          rupture_data rd ON ds.period_date = rd.period::date
        WHERE
          -- Exclure les jours où tout est à zéro
          COALESCE(sd.stock_quantity, 0) > 0 OR
          COALESCE(sd.stock_value, 0) > 0 OR
          COALESCE(rd.rupture_quantity, 0) > 0 OR
          COALESCE(rd.is_rupture, false) = true
        ORDER BY
          period_date
      )
      SELECT
        TO_CHAR(period_date, '${dateFormat}') AS period,
        stock_quantity AS "stockQuantity",
        stock_value AS "stockValue",
        rupture_quantity AS "ruptureQuantity",
        is_rupture AS "isRupture"
      FROM
        results
    `;
    
    const result = await client.query(query, queryParams);
    
    return NextResponse.json({
      startDate,
      endDate,
      interval,
      data: result.rows
    });
  } finally {
    client.release();
  }
}