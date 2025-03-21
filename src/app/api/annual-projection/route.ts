// src/app/api/annual-projection/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { currentYear, pharmacyIds = [], code13refs = [] } = body;
    
    // Validation des paramètres
    if (!currentYear) {
      return NextResponse.json(
        { error: 'L\'année en cours est requise' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const now = new Date();
      const startOfYear = `${currentYear}-01-01`;
      const currentDate = now.toISOString().split('T')[0];
      
      // Même période l'année dernière
      const previousYear = currentYear - 1;
      const previousYearStart = `${previousYear}-01-01`;
      const previousYearCurrentDate = `${previousYear}${currentDate.substring(4)}`;
      
      // Requête pour les données sell-out de l'année en cours
      const currentYearSellOutQuery = buildSellOutQuery(startOfYear, currentDate, pharmacyIds, code13refs);
      
      // Requête pour les données sell-in de l'année en cours
      const currentYearSellInQuery = buildSellInQuery(startOfYear, currentDate, pharmacyIds, code13refs);
      
      // Requête pour les données sell-out de la même période l'année dernière
      const previousYearSellOutQuery = buildSellOutQuery(previousYearStart, previousYearCurrentDate, pharmacyIds, code13refs);
      
      // Requête pour les données sell-in de la même période l'année dernière
      const previousYearSellInQuery = buildSellInQuery(previousYearStart, previousYearCurrentDate, pharmacyIds, code13refs);
      
      // Requête pour les données sell-out de toute l'année dernière
      const previousYearTotalSellOutQuery = buildSellOutQuery(previousYearStart, `${previousYear}-12-31`, pharmacyIds, code13refs);
      
      // Requête pour les données sell-in de toute l'année dernière
      const previousYearTotalSellInQuery = buildSellInQuery(previousYearStart, `${previousYear}-12-31`, pharmacyIds, code13refs);
      
      // Exécuter toutes les requêtes en parallèle
      const [
        currentYearSellOut,
        currentYearSellIn,
        previousYearSellOut,
        previousYearSellIn,
        previousYearTotalSellOut,
        previousYearTotalSellIn
      ] = await Promise.all([
        client.query(currentYearSellOutQuery.query, currentYearSellOutQuery.params),
        client.query(currentYearSellInQuery.query, currentYearSellInQuery.params),
        client.query(previousYearSellOutQuery.query, previousYearSellOutQuery.params),
        client.query(previousYearSellInQuery.query, previousYearSellInQuery.params),
        client.query(previousYearTotalSellOutQuery.query, previousYearTotalSellOutQuery.params),
        client.query(previousYearTotalSellInQuery.query, previousYearTotalSellInQuery.params)
      ]);
      
      const response = {
        currentYear: {
          sellOut: parseFloat(currentYearSellOut.rows[0]?.total_revenue || '0'),
          sellIn: parseFloat(currentYearSellIn.rows[0]?.total_amount || '0')
        },
        previousYearSameTime: {
          sellOut: parseFloat(previousYearSellOut.rows[0]?.total_revenue || '0'),
          sellIn: parseFloat(previousYearSellIn.rows[0]?.total_amount || '0')
        },
        previousYearTotal: {
          sellOut: parseFloat(previousYearTotalSellOut.rows[0]?.total_revenue || '0'),
          sellIn: parseFloat(previousYearTotalSellIn.rows[0]?.total_amount || '0')
        }
      };
      
      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données annuelles:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

function buildSellOutQuery(startDate: string, endDate: string, pharmacyIds: string[], code13refs: string[]) {
  let query = '';
  let params = [startDate, endDate];
  let paramIndex = 3;
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
    SELECT 
      COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue
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
  `;
  
  return { query, params };
}

function buildSellInQuery(startDate: string, endDate: string, pharmacyIds: string[], code13refs: string[]) {
  let query = '';
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
    SELECT 
      COALESCE(SUM(
        po.qte * (
          SELECT COALESCE(weighted_average_price, 0)
          FROM data_inventorysnapshot
          WHERE product_id = po.product_id
          ORDER BY date DESC
          LIMIT 1
        )
      ), 0) AS total_amount
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
  `;
  
  return { query, params };
}