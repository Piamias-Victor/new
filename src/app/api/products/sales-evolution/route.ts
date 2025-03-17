// src/app/api/products/sales-evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const interval = searchParams.get('interval') || 'day'; // 'day', 'week', 'month'
    const productCodes = searchParams.getAll('productCodes');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    if (!productCodes || productCodes.length === 0) {
      return NextResponse.json(
        { error: 'Au moins un code produit est requis' },
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

      // Construction des paramètres
      const params: any[] = [startDate, endDate];
      let productCodesCondition = '';
      let pharmacyCondition = '';
      
      // Construction de la condition pour les codes produits
      if (productCodes.length > 0) {
        productCodesCondition = `AND ip.code_13_ref_id IN (${
          productCodes.map((_, idx) => `$${params.length + idx + 1}`).join(',')
        })`;
        params.push(...productCodes);
      }
      
      // Construction de la condition pour les pharmacies
      if (pharmacyIds.length > 0) {
        pharmacyCondition = `AND ip.pharmacy_id IN (${
          pharmacyIds.map((_, idx) => `$${params.length + idx + 1}`).join(',')
        })`;
        params.push(...pharmacyIds);
      }

      // Requête SQL avec les conditions
      const query = `
        WITH sales_data AS (
          SELECT 
            date_trunc('${timeInterval}', s.date) AS period,
            SUM(s.quantity * i.price_with_tax) AS revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + ip."TVA"/100)))) AS margin
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct ip ON i.product_id = ip.id
          WHERE 
            s.date BETWEEN $1 AND $2
            ${productCodesCondition}
            ${pharmacyCondition}
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
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        startDate,
        endDate,
        interval,
        productCodes,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des ventes par produit:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des données d\'évolution des ventes par produit', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}