// src/app/api/sellin/evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Conserver GET pour la compatibilité
export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    const interval = searchParams.get('interval') || 'day'; // 'day', 'week', 'month'
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    return await processSellInEvolution(startDate, endDate, interval, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des achats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'évolution des achats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Ajouter une méthode POST pour les grandes listes de codes
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      interval = 'day', 
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

    return await processSellInEvolution(startDate, endDate, interval, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution des achats:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'évolution des achats', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction commune pour traiter les données d'évolution des achats
async function processSellInEvolution(
  startDate: string,
  endDate: string,
  interval: string,
  pharmacyIds: string[],
  code13refs: string[]
) {
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
    
    if (pharmacyIds.length === 0 && code13refs.length === 0) {
      // Pour toutes les pharmacies sans filtre de produit
      query = `
        WITH sellin_data AS (
          SELECT 
            date_trunc('${timeInterval}', o.sent_date) AS period,
            SUM(po.qte) AS total_quantity,
            SUM(
              po.qte * (
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
      // Filtres additionnels
      let conditions = [];
      let paramIndex = 3;
      
      // Condition pour les pharmacies
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${paramIndex + index}`).join(',');
        conditions.push(`o.pharmacy_id IN (${pharmacyPlaceholders})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      // Condition pour les codes EAN13
      if (code13refs.length > 0) {
        const codePlaceholders = code13refs.map((_, index) => `$${paramIndex + index}`).join(',');
        conditions.push(`gp.code_13_ref IN (${codePlaceholders})`);
        params.push(...code13refs);
      }
      
      // Construire la clause WHERE additionnelle
      const additionalWhere = conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';
      
      query = `
        WITH sellin_data AS (
          SELECT 
            date_trunc('${timeInterval}', o.sent_date) AS period,
            SUM(po.qte) AS total_quantity,
            SUM(
              po.qte * (
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
          JOIN 
            data_internalproduct ip ON po.product_id = ip.id
          JOIN 
            data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            ${additionalWhere}
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
    }
    
    const result = await client.query(query, params);
    
    return NextResponse.json({
      startDate,
      endDate,
      interval,
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
      code13refs: code13refs.length > 0 ? code13refs : 'all',
      data: result.rows
    });
  } finally {
    client.release();
  }
}