// src/app/api/segments/[id]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segmentId = decodeURIComponent(params.id);
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
      // 1. Obtenir les informations du segment
      const segmentInfoParams = [universe, category, startDate, endDate];
      let pharmacyCondition = '';
      
      // Ajouter les conditions de filtrage par pharmacie
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, idx) => `$${segmentInfoParams.length + idx + 1}`).join(',');
        pharmacyCondition = ` AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        segmentInfoParams.push(...pharmacyIds);
      }
      
      const segmentInfoQuery = `
        SELECT 
          '${segmentId}' as id,
          '${category}' as name,
          '${universe}' as universe,
          '${category}' as category,
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue
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
      `;
      
      const segmentInfoResult = await client.query(segmentInfoQuery, segmentInfoParams);
      
      // 2. Obtenir les top produits du laboratoire dans ce segment
      const labProductsParams = [universe, category, startDate, endDate, laboratoryId];
      let labProductsCondition = '';
      
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, idx) => `$${labProductsParams.length + idx + 1}`).join(',');
        labProductsCondition = ` AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        labProductsParams.push(...pharmacyIds);
      }
      
      const labProductsQuery = `
        SELECT 
          p.id,
          p.id as product_id,
          g.name,
          COALESCE(g.name, p.name) as display_name,
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
          (
            SELECT COALESCE(stock, 0) FROM data_inventorysnapshot 
            WHERE product_id = p.id 
            ORDER BY date DESC LIMIT 1
          ) as current_stock
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
          AND g.brand_lab = $5
          ${labProductsCondition}
        GROUP BY 
          p.id, g.name, g.code_13_ref, g.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      const labProductsResult = await client.query(labProductsQuery, labProductsParams);
      
      // 3. Obtenir les top produits des autres laboratoires dans ce segment
      const otherLabsParams = [universe, category, startDate, endDate, laboratoryId];
      let otherLabsCondition = '';
      
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, idx) => `$${otherLabsParams.length + idx + 1}`).join(',');
        otherLabsCondition = ` AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        otherLabsParams.push(...pharmacyIds);
      }
      
      const otherLabsQuery = `
        SELECT 
          p.id,
          p.id as product_id,
          g.name,
          COALESCE(g.name, p.name) as display_name,
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
          (
            SELECT COALESCE(stock, 0) FROM data_inventorysnapshot 
            WHERE product_id = p.id 
            ORDER BY date DESC LIMIT 1
          ) as current_stock
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
          AND g.brand_lab != $5
          ${otherLabsCondition}
        GROUP BY 
          p.id, g.name, g.code_13_ref, g.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      const otherLabsResult = await client.query(otherLabsQuery, otherLabsParams);
      
      // 4. Obtenir les parts de marché par laboratoire
      const marketShareParams = [universe, category, startDate, endDate];
      let marketShareCondition = '';
      
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, idx) => `$${marketShareParams.length + idx + 1}`).join(',');
        marketShareCondition = ` AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        marketShareParams.push(...pharmacyIds);
      }
      
      const marketShareQuery = `
        WITH lab_sales AS (
          SELECT 
            g.brand_lab as lab_name,
            SUM(s.quantity * i.price_with_tax) as total_revenue,
            COUNT(DISTINCT g.code_13_ref) as product_count
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
            ${marketShareCondition}
          GROUP BY 
            g.brand_lab
        ),
        total_revenue AS (
          SELECT SUM(total_revenue) as segment_total FROM lab_sales
        )
        SELECT 
          lab_name as name,
          lab_name as id,
          total_revenue,
          product_count,
          CASE 
            WHEN (SELECT segment_total FROM total_revenue) > 0 
            THEN ROUND((total_revenue / (SELECT segment_total FROM total_revenue) * 100)::numeric, 2)
            ELSE 0
          END as market_share,
          ROW_NUMBER() OVER (ORDER BY total_revenue DESC) as rank
        FROM 
          lab_sales
        ORDER BY 
          rank
        LIMIT 10
      `;
      
      const marketShareResult = await client.query(marketShareQuery, marketShareParams);
      
      // Récupérer le segmentInfo ou créer un objet vide
      const segmentInfo = segmentInfoResult.rows[0] || {
        id: segmentId,
        name: category || '',
        universe: universe || '',
        category: category || '',
        total_revenue: 0
      };
      
      // Construire la réponse
      const response = {
        segmentInfo,
        selectedLabProductsTop: labProductsResult.rows || [],
        otherLabsProductsTop: otherLabsResult.rows || [],
        marketShareByLab: marketShareResult.rows || []
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
    const segmentId = decodeURIComponent(params.id);
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de la requête
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const laboratoryId = searchParams.get('laboratoryId');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = searchParams.get('limit') || '10';
    
    if (!startDate || !endDate || !laboratoryId) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }
    
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