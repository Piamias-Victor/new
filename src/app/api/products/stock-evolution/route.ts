// src/app/api/products/stock-evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Récupérer les données du corps de la requête
    const body = await request.json();
    const { 
      code13ref, 
      startDate, 
      endDate, 
      interval = 'day', // 'day', 'week', 'month'
      pharmacyIds = []
    } = body;
    
    // Validation des paramètres
    if (!code13ref || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Code produit et dates sont requis' },
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

      // Construire la condition pour les pharmacies si spécifiées
      let pharmacyCondition = '';
      let params = [code13ref, startDate, endDate];
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, index) => `$${index + 4}`).join(',');
        pharmacyCondition = `AND p.pharmacy_id IN (${placeholders})`;
        params = [...params, ...pharmacyIds];
      }
      
      // Requête pour obtenir l'évolution du stock et les ruptures réelles
      const query = `
        WITH stock_evolution AS (
          SELECT 
            date_trunc('${timeInterval}', i.date) AS period,
            AVG(i.stock) AS avg_stock,
            AVG(i.stock * i.weighted_average_price) AS avg_value
          FROM 
            data_inventorysnapshot i
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            g.code_13_ref = $1
            AND i.date BETWEEN $2 AND $3
            ${pharmacyCondition}
          GROUP BY 
            period
        ),
        order_ruptures AS (
          SELECT 
            date_trunc('${timeInterval}', dor.sent_date) AS period,
            SUM(
              CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) ELSE 0 END
            ) AS rupture_quantity
          FROM 
            data_order dor
          JOIN 
            data_productorder dpo ON dor.id = dpo.order_id
          JOIN 
            data_internalproduct p ON dpo.product_id = p.id
          JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            g.code_13_ref = $1
            AND dor.sent_date BETWEEN $2 AND $3
            ${pharmacyCondition}
          GROUP BY 
            period
        )
        SELECT
          TO_CHAR(se.period, '${dateFormat}') AS period,
          ROUND(se.avg_stock) AS stock,
          ROUND(se.avg_value) AS value,
          COALESCE(o_ruptures.rupture_quantity, 0) AS rupture_quantity,
          CASE WHEN COALESCE(o_ruptures.rupture_quantity, 0) > 0 THEN true ELSE false END AS is_rupture
        FROM
          stock_evolution se
        LEFT JOIN
          order_ruptures o_ruptures ON se.period = o_ruptures.period
        ORDER BY
          se.period
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        code13ref,
        startDate,
        endDate,
        interval,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}