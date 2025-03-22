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
      )
      SELECT
        p.id,
        p.name as product_name,
        g.name as global_name,
        CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END as display_name,
        g.category,
        g.brand_lab,
        p.code_13_ref_id as code_13_ref,
        ls.current_stock,
        ls.price_with_tax,
        ls.weighted_average_price,
        p."TVA" as tva_rate,
        CASE 
          WHEN ls.weighted_average_price > 0 THEN
            -- Calcul standard de la marge brute: (Prix vente HT - Prix achat HT) / Prix achat HT * 100
            ROUND(((ls.price_with_tax / (1 + COALESCE(p."TVA", 0)/100)) - ls.weighted_average_price) / (ls.price_with_tax / (1 + COALESCE(p."TVA", 0)/100)) * 100, 2)
          ELSE 0
        END as margin_percentage,
        CASE 
          WHEN ls.weighted_average_price > 0 THEN
            -- Calcul de la marge en valeur absolue (Prix de vente HT - Prix d'achat HT)
            ROUND(((ls.price_with_tax / (1 + COALESCE(p."TVA", 0)/100)) - ls.weighted_average_price) / (ls.price_with_tax / (1 + COALESCE(p."TVA", 0)/100)) * 100, 2)
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
      ${whereClause.length > 0 ? whereClause : 'WHERE ls.current_stock > 0'}
      ORDER BY 
        margin_percentage ASC
    `;
    
    const result = await client.query(query, params);
    
    // Classifier les produits par catégorie de marge selon les seuils standards
    // Marge brute standard: (Prix vente HT - Prix achat HT) / Prix achat HT * 100
    const negativeMargin = result.rows.filter(p => parseFloat(p.margin_percentage) < 0);
    const lowMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 0 && parseFloat(p.margin_percentage) < 25);
    const mediumMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 25 && parseFloat(p.margin_percentage) < 30);
    const goodMargin = result.rows.filter(p => parseFloat(p.margin_percentage) >= 30 && parseFloat(p.margin_percentage) <= 35);
    const excellentMargin = result.rows.filter(p => parseFloat(p.margin_percentage) > 35);
    
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