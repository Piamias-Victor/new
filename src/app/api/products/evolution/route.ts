// src/app/api/products/evolution/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }
    
    const result = await fetchProductEvolution(
      startDate, 
      endDate, 
      comparisonStartDate, 
      comparisonEndDate, 
      pharmacyIds, 
      code13refs
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }
    
    const result = await fetchProductEvolution(
      startDate,
      endDate,
      comparisonStartDate,
      comparisonEndDate,
      pharmacyIds,
      code13refs
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'évolution:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function fetchProductEvolution(
  startDate: string,
  endDate: string,
  comparisonStartDate: string,
  comparisonEndDate: string,
  pharmacyIds: string[],
  code13refs: string[]
) {
  const client = await pool.connect();
  
  try {
    // Exécuter une requête simple pour obtenir tous les produits et leurs évolutions
    const firstQuery = `
      WITH 
      filtered_products AS (
        SELECT 
          p.id,
          p.name,
          p.code_13_ref_id,
          p.pharmacy_id
        FROM data_internalproduct p
        WHERE 1=1
        ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id = ANY($5::uuid[])' : ''}
      ),
      current_sales AS (
        SELECT 
          i.product_id,
          SUM(s.quantity * i.price_with_tax) AS revenue
        FROM data_sales s
        JOIN data_inventorysnapshot i ON s.product_id = i.id
        JOIN filtered_products fp ON i.product_id = fp.id
        WHERE s.date BETWEEN $1 AND $2
        GROUP BY i.product_id
      ),
      comparison_sales AS (
        SELECT
          i.product_id,
          SUM(s.quantity * i.price_with_tax) AS revenue
        FROM data_sales s
        JOIN data_inventorysnapshot i ON s.product_id = i.id
        JOIN filtered_products fp ON i.product_id = fp.id
        WHERE s.date BETWEEN $3 AND $4
        GROUP BY i.product_id
      ),
      product_data AS (
        SELECT
          fp.id AS product_id,
          fp.name AS internal_name,
          g.name AS global_name,
          COALESCE(g.name, fp.name) AS display_name,
          g.code_13_ref,
          g.category,
          g.brand_lab,
          COALESCE((
            SELECT stock 
            FROM data_inventorysnapshot 
            WHERE product_id = fp.id 
            ORDER BY date DESC 
            LIMIT 1
          ), 0) AS current_stock,
          COALESCE(cs.revenue, 0) AS current_revenue,
          COALESCE(ps.revenue, 0) AS previous_revenue,
          CASE 
            WHEN COALESCE(ps.revenue, 0) > 0 THEN 
              ROUND(((COALESCE(cs.revenue, 0) - COALESCE(ps.revenue, 0)) / COALESCE(ps.revenue, 0) * 100), 2)
            ELSE 0
          END AS evolution_percentage
        FROM filtered_products fp
        LEFT JOIN data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
        LEFT JOIN current_sales cs ON fp.id = cs.product_id
        LEFT JOIN comparison_sales ps ON fp.id = ps.product_id
        WHERE 
          (COALESCE(cs.revenue, 0) > 0 OR COALESCE(ps.revenue, 0) > 0)
          ${code13refs.length > 0 ? 'AND g.code_13_ref = ANY($6::text[])' : ''}
      )
      SELECT
        product_id,
        display_name,
        code_13_ref,
        category,
        brand_lab,
        current_stock,
        current_revenue,
        previous_revenue,
        evolution_percentage,
        CASE
          WHEN evolution_percentage < -15 THEN 'strongDecrease'
          WHEN evolution_percentage >= -15 AND evolution_percentage < -5 THEN 'slightDecrease'
          WHEN evolution_percentage >= -5 AND evolution_percentage <= 5 THEN 'stable'
          WHEN evolution_percentage > 5 AND evolution_percentage <= 15 THEN 'slightIncrease'
          WHEN evolution_percentage > 15 THEN 'strongIncrease'
          ELSE 'stable'
        END AS category
      FROM product_data
      ORDER BY 
        CASE
          WHEN evolution_percentage < -15 THEN evolution_percentage
          WHEN evolution_percentage >= -15 AND evolution_percentage < -5 THEN evolution_percentage
          WHEN evolution_percentage >= -5 AND evolution_percentage <= 5 THEN ABS(evolution_percentage)
          WHEN evolution_percentage > 5 AND evolution_percentage <= 15 THEN -evolution_percentage
          WHEN evolution_percentage > 15 THEN -evolution_percentage
        END
    `;
    
    // Préparer les paramètres
    const params: any[] = [startDate, endDate, comparisonStartDate, comparisonEndDate];
    
    // Ajouter les paramètres conditionnels
    if (pharmacyIds.length > 0) {
      params.push(pharmacyIds);
    }
    
    if (code13refs.length > 0) {
      params.push(code13refs);
    }
    
    // Exécuter la requête
    const { rows } = await client.query(firstQuery, params);
    
    // Regrouper les produits par catégorie d'évolution
    const strongDecrease: any[] = [];
    const slightDecrease: any[] = [];
    const stable: any[] = [];
    const slightIncrease: any[] = [];
    const strongIncrease: any[] = [];
    
    // Transformer les données pour le format de réponse
    rows.forEach(row => {
      const product = {
        id: row.product_id,
        display_name: row.display_name,
        code_13_ref: row.code_13_ref,
        category: row.category,
        brand_lab: row.brand_lab,
        current_stock: row.current_stock,
        current_revenue: row.current_revenue,
        previous_revenue: row.previous_revenue,
        evolution_percentage: row.evolution_percentage
      };
      
      // Ajouter à la catégorie appropriée
      switch (row.category) {
        case 'strongDecrease':
          strongDecrease.push(product);
          break;
        case 'slightDecrease':
          slightDecrease.push(product);
          break;
        case 'stable':
          stable.push(product);
          break;
        case 'slightIncrease':
          slightIncrease.push(product);
          break;
        case 'strongIncrease':
          strongIncrease.push(product);
          break;
      }
    });
    
    return {
      strongDecrease,
      slightDecrease,
      stable,
      slightIncrease,
      strongIncrease,
      startDate,
      endDate,
      comparisonStartDate,
      comparisonEndDate,
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
      code13refs: code13refs.length > 0 ? code13refs : 'all'
    };
  } catch (error) {
    console.error('Erreur SQL dans fetchProductEvolution:', error);
    throw error;
  } finally {
    client.release();
  }
}