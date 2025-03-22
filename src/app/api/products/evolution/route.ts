// src/app/api/products/evolution/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      comparisonStartDate, 
      comparisonEndDate, 
      pharmacyIds = [], 
      code13refs = [] 
    } = body;
    
    // Validation des paramètres
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query;
      let params = [startDate, endDate, comparisonStartDate, comparisonEndDate];
      let paramIndex = 5;
      let conditions = [];
      
      // Condition pour les pharmacies
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${paramIndex + index}`).join(',');
        conditions.push(`p.pharmacy_id IN (${pharmacyPlaceholders})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      // Condition pour les codes EAN13
      if (code13refs.length > 0) {
        const codePlaceholders = code13refs.map((_, index) => `$${paramIndex + index}`).join(',');
        conditions.push(`g.code_13_ref IN (${codePlaceholders})`);
        params.push(...code13refs);
      }
      
      // Construire la clause WHERE additionnelle
      const whereClause = conditions.length > 0 
        ? `AND ${conditions.join(' AND ')}` 
        : '';
      
      query = `
        WITH current_period AS (
          SELECT 
            p.id AS product_id,
            p.name AS display_name,
            g.name AS global_name,
            CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END AS product_label,
            g.code_13_ref,
            g.category,
            g.brand_lab,
            COALESCE((
              SELECT stock 
              FROM data_inventorysnapshot 
              WHERE product_id = p.id 
              ORDER BY date DESC 
              LIMIT 1
            ), 0) AS current_stock,
            COALESCE(SUM(s.quantity * is.price_with_tax), 0) AS current_revenue,
            COALESCE(SUM(s.quantity * (is.price_with_tax - (is.weighted_average_price * (1 + p."TVA"/100)))), 0) AS current_margin
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot is ON p.id = is.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = is.id AND s.date BETWEEN $1 AND $2
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            is.id IS NOT NULL
            ${whereClause}
          GROUP BY 
            p.id, p.name, g.name, g.code_13_ref, g.category, g.brand_lab
        ),
        comparison_period AS (
          SELECT 
            p.id AS product_id,
            COALESCE(SUM(s.quantity * is.price_with_tax), 0) AS previous_revenue,
            COALESCE(SUM(s.quantity * (is.price_with_tax - (is.weighted_average_price * (1 + p."TVA"/100)))), 0) AS previous_margin
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_inventorysnapshot is ON p.id = is.product_id
          LEFT JOIN 
            data_sales s ON s.product_id = is.id AND s.date BETWEEN $3 AND $4
          WHERE 
            is.id IS NOT NULL
            ${whereClause}
          GROUP BY 
            p.id
        ),
        evolution_data AS (
          SELECT 
            cp.product_id,
            cp.display_name,
            cp.product_label,
            cp.code_13_ref,
            cp.category,
            cp.brand_lab,
            cp.current_stock,
            cp.current_revenue,
            COALESCE(comp.previous_revenue, 0) AS previous_revenue,
            cp.current_margin,
            COALESCE(comp.previous_margin, 0) AS previous_margin,
            CASE 
              WHEN COALESCE(comp.previous_revenue, 0) > 0 THEN 
                ROUND(((cp.current_revenue - comp.previous_revenue) / comp.previous_revenue * 100), 2)
              ELSE 0
            END AS evolution_percentage,
            CASE 
              WHEN COALESCE(comp.previous_margin, 0) > 0 THEN 
                ROUND(((cp.current_margin - comp.previous_margin) / comp.previous_margin * 100), 2)
              ELSE 0
            END AS margin_evolution_percentage
          FROM 
            current_period cp
          LEFT JOIN 
            comparison_period comp ON cp.product_id = comp.product_id
          WHERE 
            cp.current_revenue > 0 OR comp.previous_revenue > 0
        )
        SELECT 
          json_build_object(
            'strongDecrease', (
              SELECT json_agg(
                json_build_object(
                  'id', product_id,
                  'display_name', product_label,
                  'code_13_ref', code_13_ref,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                )
              )
              FROM evolution_data
              WHERE evolution_percentage < -15
              ORDER BY evolution_percentage ASC
            ),
            'slightDecrease', (
              SELECT json_agg(
                json_build_object(
                  'id', product_id,
                  'display_name', product_label,
                  'code_13_ref', code_13_ref,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                )
              )
              FROM evolution_data
              WHERE evolution_percentage >= -15 AND evolution_percentage < -5
              ORDER BY evolution_percentage ASC
            ),
            'stable', (
              SELECT json_agg(
                json_build_object(
                  'id', product_id,
                  'display_name', product_label,
                  'code_13_ref', code_13_ref,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                )
              )
              FROM evolution_data
              WHERE evolution_percentage >= -5 AND evolution_percentage <= 5
              ORDER BY evolution_percentage DESC
            ),
            'slightIncrease', (
              SELECT json_agg(
                json_build_object(
                  'id', product_id,
                  'display_name', product_label,
                  'code_13_ref', code_13_ref,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                )
              )
              FROM evolution_data
              WHERE evolution_percentage > 5 AND evolution_percentage <= 15
              ORDER BY evolution_percentage DESC
            ),
            'strongIncrease', (
              SELECT json_agg(
                json_build_object(
                  'id', product_id,
                  'display_name', product_label,
                  'code_13_ref', code_13_ref,
                  'category', category,
                  'brand_lab', brand_lab,
                  'current_stock', current_stock,
                  'current_revenue', current_revenue,
                  'previous_revenue', previous_revenue,
                  'evolution_percentage', evolution_percentage
                )
              )
              FROM evolution_data
              WHERE evolution_percentage > 15
              ORDER BY evolution_percentage DESC
            )
          ) AS result
      `;
      
      const result = await client.query(query, params);
      
      // Extraire les données et gérer les valeurs NULL pour chaque catégorie
      const resultData = result.rows[0]?.result || {};
      
      return NextResponse.json({
        strongDecrease: resultData.strongDecrease || [],
        slightDecrease: resultData.slightDecrease || [],
        stable: resultData.stable || [],
        slightIncrease: resultData.slightIncrease || [],
        strongIncrease: resultData.strongIncrease || [],
        startDate,
        endDate,
        comparisonStartDate,
        comparisonEndDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        code13refs: code13refs.length > 0 ? code13refs : null
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    
    // Validation des paramètres
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    // Construire l'objet body pour réutiliser la fonction POST
    const body = {
      startDate,
      endDate,
      comparisonStartDate,
      comparisonEndDate,
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : [],
      code13refs: code13refs.length > 0 ? code13refs : []
    };

    // Créer une nouvelle requête avec le body
    const newRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    // Appeler la méthode POST
    return POST(newRequest);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}