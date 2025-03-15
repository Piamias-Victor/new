// src/app/api/sales/evolution/route.ts
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
      const params = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Pour toutes les pharmacies
        query = `
          WITH sales_data AS (
            SELECT 
              date_trunc('${timeInterval}', s.date) AS period,
              SUM(s.quantity * i.price_with_tax) AS revenue,
              SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS margin
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              s.date BETWEEN $1 AND $2
            GROUP BY 
              period
            ORDER BY 
              period
          )
          SELECT 
            TO_CHAR(period, '${dateFormat}') AS period,
            ROUND(revenue::numeric, 2) AS revenue,
            ROUND(margin::numeric, 2) AS margin,
            CASE WHEN revenue > 0 THEN ROUND((margin / revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
          FROM 
            sales_data
        `;
      } else {
        // Pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        query = `
          WITH filtered_products AS (
            SELECT id 
            FROM data_internalproduct 
            WHERE pharmacy_id IN (${pharmacyPlaceholders})
          ),
          filtered_snapshots AS (
            SELECT 
              i.id, 
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA"
            FROM data_inventorysnapshot i
            JOIN data_internalproduct p ON i.product_id = p.id
            WHERE p.id IN (SELECT id FROM filtered_products)
          ),
          sales_data AS (
            SELECT 
              date_trunc('${timeInterval}', s.date) AS period,
              SUM(s.quantity * i.price_with_tax) AS revenue,
              SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + i."TVA"/100)))) AS margin
            FROM 
              data_sales s
            JOIN 
              filtered_snapshots i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN $1 AND $2
            GROUP BY 
              period
            ORDER BY 
              period
          )
          SELECT 
            TO_CHAR(period, '${dateFormat}') AS period,
            ROUND(revenue::numeric, 2) AS revenue,
            ROUND(margin::numeric, 2) AS margin,
            CASE WHEN revenue > 0 THEN ROUND((margin / revenue * 100)::numeric, 2) ELSE 0 END AS margin_percentage
          FROM 
            sales_data
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
    console.error('Erreur lors de la récupération des données d\'évolution des ventes:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'évolution des ventes', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}