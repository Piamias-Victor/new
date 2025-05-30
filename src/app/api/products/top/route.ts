// src/app/api/products/top/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fonction de gestion pour la méthode GET
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de recherche
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const code13refs = searchParams.getAll('code13refs');
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    return await processTopProducts(startDate, endDate, limit, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des meilleurs produits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction de gestion pour la méthode POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      startDate, 
      endDate, 
      limit = 100, 
      pharmacyIds = [], 
      code13refs = [] 
    } = body;
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    return await processTopProducts(startDate, endDate, limit, pharmacyIds, code13refs);
  } catch (error) {
    console.error('Erreur lors de la récupération des meilleurs produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des meilleurs produits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Fonction commune pour traiter les données de top produits
async function processTopProducts(
  startDate: string,
  endDate: string,
  limit: number,
  pharmacyIds: string[],
  code13refs: string[]
) {
  const client = await pool.connect();
  
  try {
    // Construire la condition WHERE pour les pharmacies et les codes EAN
    let whereConditions = [];
    
    // Paramètres de base et paramètres additionnels
    const params = [startDate, endDate];
    let paramIndex = 3;
    
    // CORRECTION : Filtrer les pharmacyIds pour éliminer les valeurs problématiques
    const validPharmacyIds = pharmacyIds.filter(id => 
      id && typeof id === 'string' && id !== 'NaN' && id !== 'undefined' && id !== 'null'
    );
    
    if (validPharmacyIds.length > 0) {
      whereConditions.push(`p.pharmacy_id IN (${validPharmacyIds.map((_, idx) => `$${paramIndex++}`).join(',')})`);
      params.push(...validPharmacyIds);
    }
    
    // CORRECTION : Filtrer les code13refs pour éliminer les valeurs problématiques
    const validCode13refs = code13refs.filter(code => 
      code && typeof code === 'string' && code !== 'NaN' && code !== 'undefined' && code !== 'null'
    );
    
    // Ajouter la condition pour les codes EAN si spécifiés
    if (validCode13refs.length > 0) {
      whereConditions.push(`p.code_13_ref_id IN (${validCode13refs.map((_, idx) => `$${paramIndex++}`).join(',')})`);
      params.push(...validCode13refs);
    }
    
    // Ajouter la limite comme un nombre valide
    const safeLimit = !isNaN(limit) && isFinite(limit) ? limit : 100;
    
    // Ajout de logs pour le débogage
    console.log("Paramètres filtrés pour SQL:", {
      startDate,
      endDate,
      validPharmacyIds,
      validCode13refs,
      safeLimit
    });
    console.log("Params array pour PostgreSQL:", params);
    
    // Assembler la clause WHERE complète
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Requête commune pour calculer les métriques de produits
    const productMetricsQuery = `
      WITH product_metrics AS (
        SELECT 
          p.id AS product_id,
          p.name AS product_name,
          p.name AS display_name,
          g.category,
          g.brand_lab,
          COALESCE(g.tva_percentage, p."TVA") AS tva_rate,
          p.code_13_ref_id AS code_13_ref,
          COALESCE((
            SELECT stock
            FROM data_inventorysnapshot
            WHERE product_id = p.id
            ORDER BY date DESC
            LIMIT 1
          ), 0) AS current_stock,
          COALESCE(SUM(s.quantity), 0) AS total_quantity,
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) AS total_revenue,
          COALESCE(SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA")/100)))), 0) AS total_margin,
          CASE
            WHEN SUM(s.quantity * i.price_with_tax) > 0
            THEN ROUND((SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + COALESCE(g.tva_percentage, p."TVA")/100)))) / SUM(s.quantity * i.price_with_tax) * 100)::numeric, 1)
            ELSE 0
          END AS margin_percentage
        FROM 
          data_internalproduct p
        LEFT JOIN 
          data_inventorysnapshot i ON p.id = i.product_id
        LEFT JOIN 
          data_sales s ON i.id = s.product_id AND s.date BETWEEN $1 AND $2
        LEFT JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        ${whereClause}
        GROUP BY 
          p.id, p.name, g.category, g.brand_lab, g.tva_percentage, p."TVA", p.code_13_ref_id
      )
    `;

    // Ajouter le paramètre limit
    params.push(safeLimit);
    const limitParam = `$${params.length}`;

    // Requête pour les produits triés par chiffre d'affaires
    const byRevenueQuery = `
      ${productMetricsQuery}
      SELECT *
      FROM product_metrics
      WHERE total_revenue > 0
      ORDER BY total_revenue DESC
      LIMIT ${limitParam}
    `;

    // Requête pour les produits triés par quantité
    const byQuantityQuery = `
      ${productMetricsQuery}
      SELECT *
      FROM product_metrics
      WHERE total_quantity > 0
      ORDER BY total_quantity DESC
      LIMIT ${limitParam}
    `;

    // Requête pour les produits triés par marge
    const byMarginQuery = `
      ${productMetricsQuery}
      SELECT *
      FROM product_metrics
      WHERE total_margin > 0
      ORDER BY total_margin DESC
      LIMIT ${limitParam}
    `;

    // Exécuter les requêtes
    const byRevenueResult = await client.query(byRevenueQuery, params);
    const byQuantityResult = await client.query(byQuantityQuery, params);
    const byMarginResult = await client.query(byMarginQuery, params);

    // Préparer la réponse
    return NextResponse.json({
      byRevenue: byRevenueResult.rows,
      byQuantity: byQuantityResult.rows,
      byMargin: byMarginResult.rows
    });
  } catch (error) {
    console.error('Erreur détaillée dans processTopProducts:', error);
    throw error;
  } finally {
    client.release();
  }
}