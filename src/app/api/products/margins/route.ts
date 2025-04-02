// src/app/api/products/margins/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de recherche
    const searchParams = request.nextUrl.searchParams;
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    
    return await processProductMargins(pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de marges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacyIds = [], code13refs = [] } = body;
    
    return await processProductMargins(pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de marges:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction commune pour traiter la logique
async function processProductMargins(pharmacyIds: string[], code13refs: string[]) {
  const client = await pool.connect();
  
  try {
    // Construire la requête
    let params: any[] = [];
    let paramIndex = 1;
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
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    const query = `
      WITH latest_snapshot AS (
        SELECT DISTINCT ON (product_id) 
          product_id,
          stock as current_stock,
          price_with_tax,
          weighted_average_price
        FROM data_inventorysnapshot
        ORDER BY product_id, date DESC
      ),
      product_sales AS (
        SELECT 
          i.product_id,
          COALESCE(SUM(s.quantity), 0) as total_sales
        FROM 
          data_internalproduct p
        JOIN 
          latest_snapshot i ON p.id = i.product_id
        LEFT JOIN 
          data_sales s ON s.product_id = (
            SELECT id FROM data_inventorysnapshot 
            WHERE product_id = p.id 
            ORDER BY date DESC LIMIT 1
          )
        JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        ${whereClause}
        GROUP BY 
          i.product_id
      ),
      product_data AS (
        SELECT
          p.id,
          p.name as product_name,
          g.name as global_name,
          CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END as display_name,
          g.category,
          g.brand_lab,
          g.code_13_ref,
          COALESCE(ls.current_stock, 0) as current_stock,
          COALESCE(ls.price_with_tax, 0) as price_with_tax,
          COALESCE(ls.weighted_average_price, 0) as weighted_average_price,
          COALESCE(p."TVA", 0) as tva_rate,
          CASE 
            WHEN COALESCE(ls.weighted_average_price, 0) > 0 AND (COALESCE(ls.price_with_tax, 0) / (1 + COALESCE(p."TVA", 0)/100)) > 0 THEN
              -- Calcul standard de la marge brute: (Prix vente HT - Prix achat HT) / Prix vente HT * 100
              ROUND(((COALESCE(ls.price_with_tax, 0) / (1 + COALESCE(p."TVA", 0)/100)) - COALESCE(ls.weighted_average_price, 0)) / 
              NULLIF((COALESCE(ls.price_with_tax, 0) / (1 + COALESCE(p."TVA", 0)/100)), 0) * 100, 2)
            ELSE 0
          END as margin_percentage,
          CASE 
            WHEN COALESCE(ls.weighted_average_price, 0) > 0 THEN
              -- Calcul de la marge en valeur absolue (Prix de vente HT - Prix d'achat HT)
              ROUND((COALESCE(ls.price_with_tax, 0) / (1 + COALESCE(p."TVA", 0)/100)) - COALESCE(ls.weighted_average_price, 0), 2)
            ELSE 0
          END as margin_amount,
          COALESCE(ps.total_sales, 0) as total_sales
        FROM
          data_internalproduct p
        JOIN
          latest_snapshot ls ON p.id = ls.product_id
        LEFT JOIN
          product_sales ps ON p.id = ps.product_id
        LEFT JOIN
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        ${whereClause.length > 0 ? whereClause : 'WHERE COALESCE(ls.current_stock, 0) > 0'}
      ),
      -- Agrégation par code EAN13 pour éviter les doublons
      aggregated_ean AS (
        SELECT
          code_13_ref,
          MAX(display_name) AS display_name,
          MAX(category) AS category,
          MAX(brand_lab) AS brand_lab,
          SUM(current_stock) AS current_stock,
          -- Prix moyen pondéré par le stock
          SUM(price_with_tax * NULLIF(current_stock, 0)) / NULLIF(SUM(current_stock), 0) AS price_with_tax,
          -- Prix d'achat moyen pondéré par le stock
          SUM(weighted_average_price * NULLIF(current_stock, 0)) / NULLIF(SUM(current_stock), 0) AS weighted_average_price,
          -- TVA moyenne (pourrait être la même pour tous les produits avec le même EAN)
          AVG(tva_rate) AS tva_rate,
          -- Ventes totales
          SUM(total_sales) AS total_sales,
          -- Marge moyenne pondérée par les ventes
          SUM(margin_percentage * NULLIF(total_sales, 0)) / NULLIF(SUM(total_sales), 0) AS margin_percentage,
          -- Marge unitaire moyenne pondérée par le stock
          SUM(margin_amount * NULLIF(current_stock, 0)) / NULLIF(SUM(current_stock), 0) AS margin_amount
        FROM
          product_data
        WHERE
          code_13_ref IS NOT NULL
        GROUP BY
          code_13_ref
      )
      -- Sélection des données agrégées avec recalcul des marges si nécessaire
      SELECT
        code_13_ref AS id,
        display_name AS product_name,
        display_name AS global_name,
        display_name,
        category,
        brand_lab,
        code_13_ref,
        COALESCE(current_stock, 0) AS current_stock,
        COALESCE(price_with_tax, 0) AS price_with_tax,
        COALESCE(weighted_average_price, 0) AS weighted_average_price,
        COALESCE(tva_rate, 0) AS tva_rate,
        -- Recalculer la marge si nécessaire (si les valeurs agrégées sont significativement différentes)
        CASE
          WHEN COALESCE(weighted_average_price, 0) > 0 AND COALESCE(price_with_tax, 0) > 0 THEN
            ROUND(((COALESCE(price_with_tax, 0) / (1 + NULLIF(COALESCE(tva_rate, 0), 0)/100)) - COALESCE(weighted_average_price, 0)) / 
            NULLIF((COALESCE(price_with_tax, 0) / (1 + NULLIF(COALESCE(tva_rate, 0), 0)/100)), 0) * 100, 2)
          ELSE
            COALESCE(margin_percentage, 0)
        END AS margin_percentage,
        -- Recalculer le montant de la marge si nécessaire
        CASE
          WHEN COALESCE(weighted_average_price, 0) > 0 AND COALESCE(price_with_tax, 0) > 0 THEN
            ROUND((COALESCE(price_with_tax, 0) / (1 + NULLIF(COALESCE(tva_rate, 0), 0)/100)) - COALESCE(weighted_average_price, 0), 2)
          ELSE
            COALESCE(margin_amount, 0)
        END AS margin_amount,
        COALESCE(total_sales, 0) AS total_sales
      FROM
        aggregated_ean
      ORDER BY 
        margin_percentage ASC
    `;
    
    const result = await client.query(query, params);
    
    // Classifier les produits par catégorie de marge selon les seuils standards
    // Marge brute standard: (Prix vente HT - Prix achat HT) / Prix vente HT * 100
    const negativeMargin = result.rows.filter(p => parseFloat(p.margin_percentage || '0') < 0);
    const lowMargin = result.rows.filter(p => parseFloat(p.margin_percentage || '0') >= 0 && parseFloat(p.margin_percentage || '0') < 25);
    const mediumMargin = result.rows.filter(p => parseFloat(p.margin_percentage || '0') >= 25 && parseFloat(p.margin_percentage || '0') < 30);
    const goodMargin = result.rows.filter(p => parseFloat(p.margin_percentage || '0') >= 30 && parseFloat(p.margin_percentage || '0') <= 35);
    const excellentMargin = result.rows.filter(p => parseFloat(p.margin_percentage || '0') > 35);
    
    return NextResponse.json({
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
      code13refs: code13refs.length > 0 ? code13refs : 'all',
      negativeMargin,
      lowMargin,
      mediumMargin,
      goodMargin,
      excellentMargin,
      totalProducts: result.rows.length
    });
  } finally {
    client.release();
  }
}