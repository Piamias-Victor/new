// src/app/api/segments/[id]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segmentId = params.id;
    const body = await request.json();
    
    // Récupérer les paramètres du corps de la requête
    const { startDate, endDate, laboratoryId, pharmacyIds = [], limit = 10 } = body;
    
    if (!segmentId || !startDate || !endDate || !laboratoryId) {
      return NextResponse.json(
        { error: 'ID de segment, nom de laboratoire, date de début et date de fin sont requis' },
        { status: 400 }
      );
    }
    
    // Extraire l'univers et la catégorie du segmentId (format: universe_category)
    const [universe, category] = segmentId.split('_');
    
    if (!universe || !category) {
      return NextResponse.json(
        { error: 'Format d\'ID de segment invalide, doit être au format universe_category' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Paramètres de base pour toutes les requêtes
      let baseParams = [universe, category, startDate, endDate];
      let pharmacyCondition = '';
      
      // Ajouter les conditions de filtrage par pharmacie
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, idx) => `$${baseParams.length + idx + 1}`).join(',');
        pharmacyCondition = ` AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        baseParams.push(...pharmacyIds);
      }
      
      // 1. Obtenir les informations du segment
      const segmentInfoQuery = `
        SELECT 
          CONCAT($1, '_', $2) as id,
          $2 as name,
          $1 as universe,
          $2 as category,
          SUM(s.quantity * i.price_with_tax) as total_revenue
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.universe = $1
          AND g.category = $2
          AND s.date BETWEEN $3 AND $4
          ${pharmacyCondition}
        GROUP BY 
          g.universe, g.category
      `;
      
      const segmentInfoResult = await client.query(segmentInfoQuery, baseParams);
      
      // 2. Obtenir les top produits du laboratoire dans ce segment
      const labLimit = parseInt(limit.toString());
      const labProductsParams = [...baseParams, laboratoryId, labLimit];
      
      const labProductsQuery = `
        SELECT 
          p.id,
          p.internal_id as product_id,
          g.name,
          COALESCE(g.name, 'Sans nom') as display_name,
          g.code_13_ref,
          g.brand_lab,
          SUM(s.quantity) as total_quantity,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) as total_margin,
          CASE 
            WHEN SUM(s.quantity * i.price_with_tax) > 0 
            THEN ROUND((SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) / SUM(s.quantity * i.price_with_tax)) * 100, 2)
            ELSE 0
          END as margin_percentage,
          MAX(i.stock) as current_stock
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.universe = $1
          AND g.category = $2
          AND g.brand_lab = $${baseParams.length + 1}
          AND s.date BETWEEN $3 AND $4
          ${pharmacyCondition}
        GROUP BY 
          p.id, p.internal_id, g.name, g.code_13_ref, g.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT $${baseParams.length + 2}
      `;
      
      const labProductsResult = await client.query(labProductsQuery, labProductsParams);
      
      // 3. Obtenir les top produits hors laboratoire dans ce segment
      const otherLabsParams = [...baseParams, laboratoryId, labLimit];
      
      const otherLabsQuery = `
        SELECT 
          p.id,
          p.internal_id as product_id,
          g.name,
          COALESCE(g.name, 'Sans nom') as display_name,
          g.code_13_ref,
          g.brand_lab,
          SUM(s.quantity) as total_quantity,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) as total_margin,
          CASE 
            WHEN SUM(s.quantity * i.price_with_tax) > 0 
            THEN ROUND((SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) / SUM(s.quantity * i.price_with_tax)) * 100, 2)
            ELSE 0
          END as margin_percentage,
          MAX(i.stock) as current_stock
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.universe = $1
          AND g.category = $2
          AND g.brand_lab != $${baseParams.length + 1}
          AND s.date BETWEEN $3 AND $4
          ${pharmacyCondition}
        GROUP BY 
          p.id, p.internal_id, g.name, g.code_13_ref, g.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT $${baseParams.length + 2}
      `;
      
      const otherLabsResult = await client.query(otherLabsQuery, otherLabsParams);
      
      // 4. Obtenir le classement des laboratoires par part de marché
      const marketShareParams = [...baseParams];
      
      const marketShareQuery = `
        WITH lab_sales AS (
          SELECT 
            g.brand_lab as name,
            COUNT(DISTINCT g.code_13_ref) as product_count,
            SUM(s.quantity * i.price_with_tax) as total_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN 
            data_internalproduct p ON i.product_id = p.id
          JOIN 
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE 
            g.universe = $1
            AND g.category = $2
            AND s.date BETWEEN $3 AND $4
            ${pharmacyCondition}
          GROUP BY 
            g.brand_lab
        ),
        total_segment_sales AS (
          SELECT 
            SUM(total_revenue) as total
          FROM 
            lab_sales
        ),
        ranked_labs AS (
          SELECT 
            ls.name,
            ls.product_count,
            ls.total_revenue,
            (ls.total_revenue / NULLIF(tss.total, 0)) * 100 as market_share,
            ROW_NUMBER() OVER (ORDER BY ls.total_revenue DESC) as rank
          FROM 
            lab_sales ls
          CROSS JOIN 
            total_segment_sales tss
        )
        SELECT 
          name as name,
          name as id,
          product_count,
          total_revenue,
          ROUND(market_share::numeric, 2) as market_share,
          rank
        FROM 
          ranked_labs
        ORDER BY 
          rank
        LIMIT 10
      `;
      
      const marketShareResult = await client.query(marketShareQuery, marketShareParams);
      
      // Si aucune information de segment trouvée
      if (segmentInfoResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Segment non trouvé ou aucune donnée disponible' },
          { status: 404 }
        );
      }
      
      // Construire la réponse
      const response = {
        segmentInfo: segmentInfoResult.rows[0],
        selectedLabProductsTop: labProductsResult.rows,
        otherLabsProductsTop: otherLabsResult.rows,
        marketShareByLab: marketShareResult.rows
      };
      
      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse du segment:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Conserver également la méthode GET pour la compatibilité
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segmentId = params.id;
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de la requête
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const laboratoryId = searchParams.get('laboratoryId');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = searchParams.get('limit') || '10';
    
    // Construire un objet pour appeler la méthode POST
    const body = {
      startDate,
      endDate,
      laboratoryId,
      pharmacyIds,
      limit: parseInt(limit)
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
    console.error('Erreur lors de l\'analyse du segment (GET):', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}