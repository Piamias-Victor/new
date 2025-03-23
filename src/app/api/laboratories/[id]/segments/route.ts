// src/app/api/laboratories/[id]/segments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laboratoryId = decodeURIComponent(params.id);
    const body = await request.json();
    const { startDate, endDate, pharmacyIds = [], includeAllSegmentTypes = false } = body;

    // Validation des entrées
    if (!laboratoryId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Paramètres laboratoryId, startDate et endDate requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Préparer les paramètres avec des types explicites
      let baseParams = [startDate, endDate, laboratoryId];
      
      // Construire la condition pour les pharmacies
      let pharmacyCondition = '';
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, i) => `$${i + 4}`).join(',');
        pharmacyCondition = ` AND p.pharmacy_id IN (${placeholders})`;
        baseParams.push(...pharmacyIds);
      }

      // 1. Obtenir les informations du laboratoire
      const labInfoQuery = `
        SELECT 
          $3 as id,
          $3 as name,
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
          COALESCE(SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))), 0) as total_margin,
          COUNT(DISTINCT p.code_13_ref_id) as product_count
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
        WHERE 
          s.date BETWEEN $1 AND $2
          AND gp.brand_lab = $3
          ${pharmacyCondition}
      `;
      
      // Exécuter la requête pour obtenir les informations du laboratoire
      const labInfoResult = await client.query(labInfoQuery, baseParams);
      
      // 2. Obtenir les segments du laboratoire (catégories)
      const categoriesQuery = `
        WITH lab_sales AS (
          SELECT 
            gp.universe,
            gp.category,
            SUM(s.quantity * i.price_with_tax) as lab_revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as lab_margin,
            COUNT(DISTINCT p.code_13_ref_id) as product_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            AND gp.brand_lab = $3
            ${pharmacyCondition}
          GROUP BY 
            gp.universe, gp.category
        ),
        total_sales AS (
          SELECT 
            gp.universe,
            gp.category,
            SUM(s.quantity * i.price_with_tax) as total_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            ${pharmacyCondition}
          GROUP BY 
            gp.universe, gp.category
        )
        SELECT 
          CONCAT(ls.universe, '_', ls.category) as id,
          COALESCE(ls.category, 'Non catégorisé') as name,
          COALESCE(ls.universe, 'Non catégorisé') as universe,
          COALESCE(ls.category, 'Non catégorisé') as category,
          'category' as segment_type,
          ls.product_count,
          ls.lab_revenue as total_revenue,
          ls.lab_margin as total_margin,
          CASE 
            WHEN ts.total_revenue > 0 THEN ROUND((ls.lab_revenue / ts.total_revenue * 100)::numeric, 2)
            ELSE 0
          END as market_share
        FROM 
          lab_sales ls
        LEFT JOIN 
          total_sales ts ON ls.universe = ts.universe AND ls.category = ts.category
        ORDER BY 
          ls.lab_revenue DESC
      `;
      
      // Exécuter la requête pour obtenir les segments par catégorie
      const categoriesResult = await client.query(categoriesQuery, baseParams);
      
      // 3. Obtenir les segments du laboratoire par univers
      const universesQuery = `
        WITH lab_sales_by_universe AS (
          SELECT 
            gp.universe,
            SUM(s.quantity * i.price_with_tax) as lab_revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as lab_margin,
            COUNT(DISTINCT p.code_13_ref_id) as product_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            AND gp.brand_lab = $3
            ${pharmacyCondition}
          GROUP BY 
            gp.universe
        ),
        total_sales_by_universe AS (
          SELECT 
            gp.universe,
            SUM(s.quantity * i.price_with_tax) as total_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            ${pharmacyCondition}
          GROUP BY 
            gp.universe
        )
        SELECT 
          CONCAT('universe_', lsu.universe) as id,
          COALESCE(lsu.universe, 'Non catégorisé') as name,
          COALESCE(lsu.universe, 'Non catégorisé') as universe,
          '' as category,
          'universe' as segment_type,
          lsu.product_count,
          lsu.lab_revenue as total_revenue,
          lsu.lab_margin as total_margin,
          CASE 
            WHEN tsu.total_revenue > 0 THEN ROUND((lsu.lab_revenue / tsu.total_revenue * 100)::numeric, 2)
            ELSE 0
          END as market_share
        FROM 
          lab_sales_by_universe lsu
        LEFT JOIN 
          total_sales_by_universe tsu ON lsu.universe = tsu.universe
        ORDER BY 
          lsu.lab_revenue DESC
      `;
      
      // Exécuter la requête pour obtenir les segments par univers
      const universesResult = await client.query(universesQuery, baseParams);

      // 4. Obtenir les segments du laboratoire par famille
      const familiesQuery = `
        WITH lab_sales_by_family AS (
          SELECT 
            gp.universe,
            gp.category,
            gp.family,
            SUM(s.quantity * i.price_with_tax) as lab_revenue,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as lab_margin,
            COUNT(DISTINCT p.code_13_ref_id) as product_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            AND gp.brand_lab = $3
            AND gp.family IS NOT NULL 
            AND gp.family != ''
            ${pharmacyCondition}
          GROUP BY 
            gp.universe, gp.category, gp.family
        ),
        total_sales_by_family AS (
          SELECT 
            gp.universe,
            gp.category,
            gp.family,
            SUM(s.quantity * i.price_with_tax) as total_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            s.date BETWEEN $1 AND $2
            AND gp.family IS NOT NULL 
            AND gp.family != ''
            ${pharmacyCondition}
          GROUP BY 
            gp.universe, gp.category, gp.family
        )
        SELECT 
          CONCAT(lsf.universe, '_', lsf.category, '_', lsf.family) as id,
          COALESCE(lsf.family, 'Non catégorisé') as name,
          COALESCE(lsf.universe, 'Non catégorisé') as universe,
          COALESCE(lsf.category, 'Non catégorisé') as category,
          'family' as segment_type,
          lsf.product_count,
          lsf.lab_revenue as total_revenue,
          lsf.lab_margin as total_margin,
          CASE 
            WHEN tsf.total_revenue > 0 THEN ROUND((lsf.lab_revenue / tsf.total_revenue * 100)::numeric, 2)
            ELSE 0
          END as market_share
        FROM 
          lab_sales_by_family lsf
        LEFT JOIN 
          total_sales_by_family tsf ON lsf.universe = tsf.universe AND lsf.category = tsf.category AND lsf.family = tsf.family
        ORDER BY 
          lsf.lab_revenue DESC
      `;
      
      // Exécuter la requête pour obtenir les segments par famille
      const familiesResult = await client.query(familiesQuery, baseParams);
      
      // Combiner les segments (catégories, univers et familles)
      let combinedSegments = [...categoriesResult.rows];
      
      // Ajouter les univers et les familles si demandés
      if (includeAllSegmentTypes) {
        combinedSegments = [
          ...universesResult.rows, 
          ...combinedSegments, 
          ...familiesResult.rows
        ];
      }
      
      // Retourner les données
      return NextResponse.json({
        laboratory: labInfoResult.rows[0] || {
          id: laboratoryId,
          name: laboratoryId,
          total_revenue: 0,
          total_margin: 0,
          product_count: 0
        },
        segments: combinedSegments || []
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse des segments du laboratoire:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Méthode GET pour compatibilité
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const laboratoryId = decodeURIComponent(params.id);
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de recherche
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const includeAllSegmentTypes = searchParams.get('includeAllSegmentTypes') === 'true';
    
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }
    
    // Construire un objet pour appeler la méthode POST
    const body = {
      startDate,
      endDate, 
      pharmacyIds,
      includeAllSegmentTypes
    };
    
    // Créer une fausse Request pour appeler la méthode POST
    const postRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });
    
    // Appeler la méthode POST
    return POST(postRequest, { params });
  } catch (error) {
    console.error('Erreur lors de l\'analyse des segments du laboratoire (GET):', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}