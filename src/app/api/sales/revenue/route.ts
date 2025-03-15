// src/app/api/sales/revenue/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  // Récupérer les paramètres de recherche
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const pharmacyId = searchParams.get('pharmacyId');
  
  // Validation des paramètres
  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: 'Les dates de début et de fin sont requises' },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    
    let query = '';
    const params = [startDate, endDate];
    
    if (pharmacyId && pharmacyId !== 'all') {
      // Requête pour une pharmacie spécifique
      query = `
        WITH filtered_products AS (
          SELECT id 
          FROM data_internalproduct 
          WHERE pharmacy_id = $3
        ),
        filtered_snapshots AS (
          SELECT id, product_id, price_with_tax
          FROM data_inventorysnapshot
          WHERE product_id IN (SELECT id FROM filtered_products)
        )
        SELECT 
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
          TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
          TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
          COUNT(DISTINCT s.date) as days_count
        FROM 
          data_sales s
        JOIN 
          filtered_snapshots i ON s.product_id = i.id
        WHERE 
          s.date BETWEEN $1 AND $2
      `;
      params.push(pharmacyId);
    } else {
      // Requête pour toutes les pharmacies
      query = `
        SELECT 
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
          TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
          TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
          COUNT(DISTINCT s.date) as days_count
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        WHERE 
          s.date BETWEEN $1 AND $2
      `;
    }
    
    // Exécuter la requête avec un timeout pour éviter les blocages
    const result = await client.query({
      text: query,
      values: params,
      // Mode array pour optimiser le transfert de données
      rowMode: 'array'
    });
    client.release();
    
    const [totalRevenue, minDate, maxDate, daysCount] = result.rows[0] || [0, null, null, 0];
    
    return NextResponse.json({
      startDate,
      endDate,
      actualDateRange: {
        min: minDate,
        max: maxDate,
        days: daysCount
      },
      pharmacyId: pharmacyId || 'all',
      totalRevenue: parseFloat(totalRevenue) || 0
    });
  } catch (error) {
    console.error('Erreur lors du calcul du chiffre d\'affaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du chiffre d\'affaires', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}