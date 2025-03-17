// src/app/api/statistics/global/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres de date
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let params = [startDate, endDate];
      let pharmacyCondition = '';
      
      // Construire la condition pour les pharmacies si spécifié
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        pharmacyCondition = `AND ip.pharmacy_id IN (${pharmacyPlaceholders})`;
        params = [...params, ...pharmacyIds];
      }

      // Requête SQL pour obtenir toutes les statistiques en une seule fois
      const query = `
        WITH sales_data AS (
          SELECT 
            s.id AS sale_id,
            ip.id AS product_id,
            ip.code_13_ref_id,
            gp.brand_lab,
            gp.lab_distributor,
            gp.universe,
            gp.category,
            gp.sub_category,
            gp.family,
            gp.sub_family
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct ip ON i.product_id = ip.id
          LEFT JOIN 
            data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            ${pharmacyCondition}
        )
        SELECT
          COUNT(DISTINCT product_id) AS unique_products,
          COUNT(DISTINCT brand_lab) + COUNT(DISTINCT lab_distributor) - 
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE brand_lab IS NULL OR lab_distributor IS NULL) THEN 1 ELSE 0 END) 
            AS unique_labs,
          COUNT(DISTINCT universe) + 
          COUNT(DISTINCT category) + 
          COUNT(DISTINCT sub_category) + 
          COUNT(DISTINCT family) + 
          COUNT(DISTINCT sub_family) -
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE universe IS NULL) THEN 1 ELSE 0 END) - 
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE category IS NULL) THEN 1 ELSE 0 END) - 
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE sub_category IS NULL) THEN 1 ELSE 0 END) - 
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE family IS NULL) THEN 1 ELSE 0 END) - 
            (CASE WHEN EXISTS (SELECT 1 FROM sales_data WHERE sub_family IS NULL) THEN 1 ELSE 0 END) 
            AS unique_categories,
          COUNT(DISTINCT sale_id) AS total_sales
        FROM 
          sales_data
      `;
      
      const result = await client.query(query, params);
      
      // Formater la réponse
      return NextResponse.json({
        startDate,
        endDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        statistics: {
          uniqueProducts: parseInt(result.rows[0]?.unique_products || '0'),
          uniqueLabs: parseInt(result.rows[0]?.unique_labs || '0'),
          uniqueCategories: parseInt(result.rows[0]?.unique_categories || '0'),
          totalSales: parseInt(result.rows[0]?.total_sales || '0')
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques globales:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des statistiques globales', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}