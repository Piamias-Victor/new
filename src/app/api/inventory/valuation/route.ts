// src/app/api/inventory/valuation/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]; // Date par défaut = aujourd'hui
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    const client = await pool.connect();
    
    try {
      let query = '';
      let params: any[] = [date];
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        query = `
          WITH latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock,
              weighted_average_price
            FROM data_inventorysnapshot
            WHERE date <= $1
            ORDER BY product_id, date DESC
          )
          SELECT 
            COALESCE(SUM(ls.stock * ls.weighted_average_price), 0) as total_stock_value_ht,
            COALESCE(SUM(ls.stock), 0) as total_units
          FROM latest_snapshot ls
        `;
      } else {
        // Requête pour des pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 2}`).join(',');
        query = `
          WITH filtered_products AS (
            SELECT id 
            FROM data_internalproduct 
            WHERE pharmacy_id IN (${pharmacyPlaceholders})
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock,
              weighted_average_price
            FROM data_inventorysnapshot
            WHERE date <= $1
            AND product_id IN (SELECT id FROM filtered_products)
            ORDER BY product_id, date DESC
          )
          SELECT 
            COALESCE(SUM(ls.stock * ls.weighted_average_price), 0) as total_stock_value_ht,
            COALESCE(SUM(ls.stock), 0) as total_units
          FROM latest_snapshot ls
        `;
        params = [date, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        date,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalStockValueHT: parseFloat(result.rows[0]?.total_stock_value_ht || '0'),
        totalUnits: parseInt(result.rows[0]?.total_units || '0')
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors du calcul de la valeur du stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul de la valeur du stock', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}