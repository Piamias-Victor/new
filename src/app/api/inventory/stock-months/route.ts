// src/app/api/inventory/stock-months/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    // Si pas de dates spécifiées, utiliser les 30 derniers jours par défaut
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const analysisStartDate = startDate || defaultStartDate.toISOString().split('T')[0];
    const analysisEndDate = endDate || new Date().toISOString().split('T')[0];
    
    // Calculer la durée de la période d'analyse en jours
    const start = new Date(analysisStartDate);
    const end = new Date(analysisEndDate);
    const daysInPeriod = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Facteur de conversion pour extrapoler les ventes mensuelles
    const daysToMonthRatio = 30 / daysInPeriod;
    
    const client = await pool.connect();
    
    try {
      let query = '';
      let params: any[] = [];
      let pharmacyCondition = '';
      
      // Construire la condition pour les pharmacies si spécifié
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 1}`).join(',');
        pharmacyCondition = `WHERE p.pharmacy_id IN (${pharmacyPlaceholders})`;
        params = [...pharmacyIds];
      }

      // Requête pour obtenir les données de stock et de ventes moyennes
      query = `
        WITH latest_snapshot AS (
          SELECT DISTINCT ON (product_id) 
            id,
            product_id,
            stock,
            date
          FROM data_inventorysnapshot
          ORDER BY product_id, date DESC
        ),
        period_sales AS (
          SELECT 
            i.product_id,
            COALESCE(SUM(s.quantity), 0) as period_total_sales
          FROM 
            data_internalproduct p
          JOIN 
            latest_snapshot i ON p.id = i.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = i.id AND s.date BETWEEN '${analysisStartDate}' AND '${analysisEndDate}'
          ${pharmacyCondition}
          GROUP BY 
            i.product_id
        )
        SELECT
          p.id,
          p.name as product_name,
          g.name as global_name,
          CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END as display_name,
          g.category,
          g.brand_lab,
          p.code_13_ref_id as code_13_ref,
          ls.stock as current_stock,
          ps.period_total_sales,
          ps.period_total_sales * ${daysToMonthRatio} as extrapolated_monthly_sales,
          CASE 
            WHEN ps.period_total_sales > 0 THEN 
              LEAST(24, ROUND((ls.stock / (ps.period_total_sales * ${daysToMonthRatio}))::numeric, 1))
            ELSE 12 -- Maximum de 12 mois pour les produits sans vente
          END as stock_months
        FROM
          data_internalproduct p
        JOIN
          latest_snapshot ls ON p.id = ls.product_id
        LEFT JOIN
          monthly_sales ms ON p.id = ms.product_id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        ${pharmacyCondition ? pharmacyCondition : ''}
        ORDER BY 
          stock_months ASC
      `;
      
      const result = await client.query(query, params);
      
      // Classifier les produits par catégorie de mois de stock
      const criticalLow = result.rows.filter(p => parseFloat(p.stock_months) < 1);
      const toWatch = result.rows.filter(p => parseFloat(p.stock_months) >= 1 && parseFloat(p.stock_months) < 3);
      const optimal = result.rows.filter(p => parseFloat(p.stock_months) >= 3 && parseFloat(p.stock_months) <= 6);
      const overStock = result.rows.filter(p => parseFloat(p.stock_months) > 6 && parseFloat(p.stock_months) <= 12);
      const criticalHigh = result.rows.filter(p => parseFloat(p.stock_months) > 12);
      
      return NextResponse.json({
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        criticalLow,
        toWatch,
        optimal,
        overStock,
        criticalHigh,
        totalProducts: result.rows.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de mois de stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}