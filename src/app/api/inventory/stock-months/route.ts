// src/app/api/inventory/stock-months/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de recherche
    const searchParams = request.nextUrl.searchParams;
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    
    return await processStockMonths(pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des mois de stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mois de stock', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacyIds = [], code13refs = [] } = body;
    
    return await processStockMonths(pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des mois de stock:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des mois de stock', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction commune pour traiter la logique
async function processStockMonths(pharmacyIds: string[], code13refs: string[]) {
  const client = await pool.connect();
  
  try {
    // Calculer la date de 3 mois en arrière pour les ventes moyennes
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    
    const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];
    const currentDateStr = now.toISOString().split('T')[0];
    
    // Construire la requête
    let params: any[] = [threeMonthsAgoStr, currentDateStr];
    let paramIndex = 3;
    let conditions = [];
    
    // Condition pour les pharmacies
    if (pharmacyIds.length > 0) {
      const pharmacyPlaceholders = pharmacyIds.map((_, i) => `$${paramIndex + i}`).join(',');
      conditions.push(`p.pharmacy_id IN (${pharmacyPlaceholders})`);
      params.push(...pharmacyIds);
      paramIndex += pharmacyIds.length;
    }
    
    // Condition pour les codes EAN13
    if (code13refs.length > 0) {
      const codePlaceholders = code13refs.map((_, i) => `$${paramIndex + i}`).join(',');
      conditions.push(`g.code_13_ref IN (${codePlaceholders})`);
      params.push(...code13refs);
    }
    
    const whereClause = conditions.length > 0 
      ? `AND ${conditions.join(' AND ')}` 
      : '';
    
    const query = `
      WITH inventory_latest AS (
        -- Dernier snapshot de stock pour chaque produit
        SELECT DISTINCT ON (dis.product_id)
          dis.product_id,
          p.id AS internal_product_id,
          p.name AS product_name,
          g.name AS global_name,
          p.name AS display_name,
          g.category,
          g.brand_lab,
          g.code_13_ref,
          dis.stock AS current_stock,
          dis.date
        FROM 
          data_inventorysnapshot dis
        JOIN 
          data_internalproduct p ON dis.product_id = p.id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 1=1
          ${whereClause}
        ORDER BY
          dis.product_id, dis.date DESC
      ),
      sales_avg AS (
        -- Calcul des ventes moyennes mensuelles sur les 3 derniers mois
        SELECT
          i.product_id,
          COALESCE(SUM(s.quantity), 0) / 3 AS avg_monthly_sales
        FROM
          inventory_latest i
        LEFT JOIN
          data_inventorysnapshot dis ON i.product_id = dis.product_id
        LEFT JOIN
          data_sales s ON dis.id = s.product_id
        WHERE
          s.date BETWEEN $1 AND $2
        GROUP BY
          i.product_id
      ),
      stock_months AS (
        -- Calcul des mois de stock
        SELECT
          i.*,
          COALESCE(s.avg_monthly_sales, 0) AS avg_monthly_sales,
          CASE
            WHEN s.avg_monthly_sales > 0 THEN i.current_stock / s.avg_monthly_sales
            WHEN i.current_stock > 0 THEN 99 -- Si stock mais pas de ventes, considérer comme surstock
            ELSE 0 -- Si pas de stock, 0 mois
          END AS stock_months
        FROM
          inventory_latest i
        LEFT JOIN
          sales_avg s ON i.product_id = s.product_id
        WHERE
          i.current_stock > 0
      ),
      -- Nouvelle CTE pour agréger par code EAN13
      aggregated_ean AS (
        SELECT
          code_13_ref,
          (array_agg(display_name ORDER BY internal_product_id))[1] AS display_name,
          MAX(category) AS category,
          MAX(brand_lab) AS brand_lab,
          SUM(current_stock) AS current_stock,
          SUM(avg_monthly_sales) AS avg_monthly_sales,
          -- Recalculer les mois de stock en fonction des valeurs agrégées
          CASE
            WHEN SUM(avg_monthly_sales) > 0 THEN SUM(current_stock) / SUM(avg_monthly_sales)
            WHEN SUM(current_stock) > 0 THEN 99 -- Si stock mais pas de ventes, considérer comme surstock
            ELSE 0 -- Si pas de stock, 0 mois
          END AS stock_months
        FROM
          stock_months
        WHERE 
          code_13_ref IS NOT NULL
        GROUP BY
          code_13_ref
      )
      -- Utiliser les données agrégées au lieu des données détaillées
      SELECT
        code_13_ref AS id,
        code_13_ref AS internal_product_id,
        display_name AS product_name,
        display_name AS global_name,
        display_name,
        category,
        brand_lab,
        code_13_ref,
        current_stock,
        avg_monthly_sales,
        stock_months
      FROM
        aggregated_ean
      ORDER BY
        stock_months ASC
    `;
    
    const result = await client.query(query, params);
    
    // Classifier les produits par catégorie de stock
    const criticalLow = result.rows.filter(p => p.stock_months < 1);
    const toWatch = result.rows.filter(p => p.stock_months >= 1 && p.stock_months < 3);
    const optimal = result.rows.filter(p => p.stock_months >= 3 && p.stock_months <= 6);
    const overStock = result.rows.filter(p => p.stock_months > 6 && p.stock_months <= 12);
    const criticalHigh = result.rows.filter(p => p.stock_months > 12);
    
    return NextResponse.json({
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
      code13refs: code13refs.length > 0 ? code13refs : 'all',
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
}