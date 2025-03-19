// src/app/api/sellin/evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const interval = searchParams.get('interval') || 'day'; // 'day', 'week', 'month'
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Configurer l'intervalle PostgreSQL selon le paramètre
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

      let query;
      const params: any[] = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Pour toutes les pharmacies
        query = `
          WITH sellin_data AS (
            SELECT 
              date_trunc('${timeInterval}', o.sent_date) AS period,
              SUM(po.qte_r) AS total_quantity,
              SUM(
                po.qte_r * (
                  SELECT COALESCE(weighted_average_price, 0)
                  FROM data_inventorysnapshot
                  WHERE product_id = po.product_id
                  ORDER BY date DESC
                  LIMIT 1
                )
              ) AS total_amount
            FROM 
              data_order o
            JOIN 
              data_productorder po ON o.id = po.order_id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
            GROUP BY 
              period
            ORDER BY 
              period
          )
          SELECT 
            TO_CHAR(period, '${dateFormat}') AS period,
            ROUND(total_quantity::numeric) AS quantity,
            ROUND(total_amount::numeric, 2) AS amount
          FROM 
            sellin_data
        `;
      } else {
        // Pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        query = `
          WITH sellin_data AS (
            SELECT 
              date_trunc('${timeInterval}', o.sent_date) AS period,
              SUM(po.qte_r) AS total_quantity,
              SUM(
                po.qte_r * (
                  SELECT COALESCE(weighted_average_price, 0)
                  FROM data_inventorysnapshot
                  WHERE product_id = po.product_id
                  ORDER BY date DESC
                  LIMIT 1
                )
              ) AS total_amount
            FROM 
              data_order o
            JOIN 
              data_productorder po ON o.id = po.order_id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
              AND o.pharmacy_id IN (${pharmacyPlaceholders})
            GROUP BY 
              period
            ORDER BY 
              period
          )
          SELECT 
            TO_CHAR(period, '${dateFormat}') AS period,
            ROUND(total_quantity::numeric) AS quantity,
            ROUND(total_amount::numeric, 2) AS amount
          FROM 
            sellin_data
        `;
        params.push(...pharmacyIds);
      }
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        startDate,
        endDate,
        interval,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des achats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'évolution des achats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}