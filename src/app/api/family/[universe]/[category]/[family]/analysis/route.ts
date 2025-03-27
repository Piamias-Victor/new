// src/app/api/family/[universe]/[category]/[family]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { universe: string; category: string; family: string } }
) {
  try {
    const universe = decodeURIComponent(params.universe);
    const category = decodeURIComponent(params.category);
    const family = decodeURIComponent(params.family);
    
    console.log("\n\n================ DÉBUT ANALYSE FAMILLE ================");
    console.log(`Univers: "${universe}", Catégorie: "${category}", Famille: "${family}"`);
    
    // Récupérer et logger le corps de la requête
    const body = await request.json();
    console.log("Corps de la requête complet:", JSON.stringify(body));
    
    const { 
      startDate, 
      endDate, 
      laboratoryId, 
      pharmacyIds = [], 
      limit = 10
    } = body;

    // Validation des entrées
    if (!universe || !category || !family || !startDate || !endDate || !laboratoryId) {
      console.log("ERREUR: Paramètres manquants");
      return NextResponse.json(
        { error: 'Paramètres univers, catégorie, famille, startDate, endDate et laboratoryId requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construction des paramètres pour la requête principale
      const baseParams = [startDate, endDate, universe, category, family];
      
      // Construire la condition pour les pharmacies
      let pharmacyCondition = '';
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, i) => `$${i + 6}`).join(',');
        pharmacyCondition = ` AND p.pharmacy_id IN (${placeholders})`;
      }

      // Requête pour obtenir le chiffre d'affaires total de la famille
      const revenueQuery = `
        SELECT COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue
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
          AND gp.universe = $3
          AND gp.category = $4
          AND gp.family = $5
          ${pharmacyCondition}
      `;
      
      // Paramètres complets pour la requête revenue (avec les pharmacy IDs)
      const revenueParams = [...baseParams];
      if (pharmacyIds.length > 0) {
        revenueParams.push(...pharmacyIds);
      }
      
      console.log(`Exécution requête chiffre d'affaires famille: ${revenueQuery.replace(/\s+/g, ' ')}`);
      console.log("Paramètres revenue:", JSON.stringify(revenueParams));
      
      const revenueResult = await client.query(revenueQuery, revenueParams);
      const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
      
      console.log(`Chiffre d'affaires total de la famille: ${totalRevenue}`);
      
      // Création de l'objet d'information du segment de famille
      const segmentInfo = {
        id: `${universe}_${category}_${family}`,
        name: family,
        universe: universe,
        category: category,
        family: family,
        total_revenue: totalRevenue
      };
      
      console.log("CRÉATION SEGMENTINFO POUR FAMILLE:", JSON.stringify(segmentInfo));
      
      // Paramètres pour les requêtes suivantes qui incluent le laboratoryId
      const labParams = [...baseParams, laboratoryId];
      
      // Condition pharmacies pour les requêtes suivantes
      let pharmacyConditionNextQueries = '';
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, i) => `$${i + 7}`).join(',');
        pharmacyConditionNextQueries = ` AND p.pharmacy_id IN (${placeholders})`;
      }
      
      // Paramètres complets pour les requêtes suivantes
      const nextQueriesParams = [...labParams];
      if (pharmacyIds.length > 0) {
        nextQueriesParams.push(...pharmacyIds);
      }
      
      // Obtenir les parts de marché des laboratoires pour cette famille
      // Modifier la requête marketShareQuery dans src/app/api/family/[universe]/[category]/[family]/analysis/route.ts
// Voici la nouvelle version avec l'ajout de la PDM en volume

const marketShareQuery = `
WITH family_lab_sales AS (
  SELECT 
    gp.brand_lab,
    SUM(s.quantity * i.price_with_tax) as total_revenue,
    SUM(s.quantity) as total_quantity,
    SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as total_margin,
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
    AND gp.universe = $3
    AND gp.category = $4
    AND gp.family = $5
    ${pharmacyCondition}
  GROUP BY 
    gp.brand_lab
),
family_total_sales AS (
  SELECT 
    SUM(total_revenue) as total_family_revenue,
    SUM(total_quantity) as total_family_quantity,
    SUM(total_margin) as total_family_margin
  FROM 
    family_lab_sales
),
lab_ranking AS (
  SELECT 
    brand_lab,
    total_revenue,
    total_quantity,
    total_margin,
    product_count,
    ROW_NUMBER() OVER (ORDER BY total_revenue DESC) as lab_rank
  FROM 
    family_lab_sales
)
SELECT 
  lr.brand_lab as id,
  lr.brand_lab as name,
  lr.total_revenue,
  lr.total_quantity,
  lr.total_margin,
  lr.product_count,
  lr.lab_rank as rank,
  CASE 
    WHEN fts.total_family_revenue > 0 
    THEN ROUND((lr.total_revenue / fts.total_family_revenue * 100)::numeric, 2)
    ELSE 0
  END as market_share,
  CASE 
    WHEN fts.total_family_quantity > 0 
    THEN ROUND((lr.total_quantity / fts.total_family_quantity * 100)::numeric, 2)
    ELSE 0
  END as volume_share,
  CASE 
    WHEN lr.total_revenue > 0 
    THEN ROUND((lr.total_margin / lr.total_revenue * 100)::numeric, 2)
    ELSE 0
  END as margin_percentage
FROM 
  lab_ranking lr
CROSS JOIN 
  family_total_sales fts
ORDER BY 
  lr.lab_rank ASC
`;
      
      console.log("Exécution requête parts de marché famille avec paramètres:", JSON.stringify(revenueParams));
      const marketShareResult = await client.query(marketShareQuery, revenueParams);
      const marketShareData = marketShareResult.rows || [];
      
      console.log(`Parts de marché trouvées pour la famille: ${marketShareData.length}`);
      
      // Obtenir les top produits du laboratoire sélectionné pour cette famille
      const labProductsQuery = `
        SELECT 
          p.id,
          p.id as product_id,
          p.name,
          COALESCE(gp.name, p.name) as display_name,
          p.code_13_ref_id as code_13_ref,
          gp.brand_lab,
          SUM(s.quantity) as total_quantity,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as total_margin,
          CASE 
            WHEN SUM(s.quantity * i.price_with_tax) > 0 
            THEN ROUND((SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) / 
                       SUM(s.quantity * i.price_with_tax) * 100)::numeric, 2)
            ELSE 0
          END as margin_percentage,
          MAX(CASE WHEN i.date = (SELECT MAX(date) FROM data_inventorysnapshot) THEN i.stock ELSE NULL END) as current_stock
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
          AND gp.universe = $3
          AND gp.category = $4
          AND gp.family = $5
          AND gp.brand_lab = $6
          ${pharmacyConditionNextQueries}
        GROUP BY 
          p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      console.log("Exécution requête produits du laboratoire pour la famille");
      console.log("Paramètres produits lab:", JSON.stringify(nextQueriesParams));
      const labProductsResult = await client.query(labProductsQuery, nextQueriesParams);
      const selectedLabProducts = labProductsResult.rows || [];
      
      console.log(`Produits du laboratoire trouvés pour la famille: ${selectedLabProducts.length}`);
      
      // Obtenir les top produits des autres laboratoires pour cette famille
      const otherLabsProductsQuery = `
        SELECT 
          p.id,
          p.id as product_id,
          p.name,
          COALESCE(gp.name, p.name) as display_name,
          p.code_13_ref_id as code_13_ref,
          gp.brand_lab,
          SUM(s.quantity) as total_quantity,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) as total_margin,
          CASE 
            WHEN SUM(s.quantity * i.price_with_tax) > 0 
            THEN ROUND((SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) / 
                       SUM(s.quantity * i.price_with_tax) * 100)::numeric, 2)
            ELSE 0
          END as margin_percentage,
          MAX(CASE WHEN i.date = (SELECT MAX(date) FROM data_inventorysnapshot) THEN i.stock ELSE NULL END) as current_stock
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
          AND gp.universe = $3
          AND gp.category = $4
          AND gp.family = $5
          AND gp.brand_lab != $6
          ${pharmacyConditionNextQueries}
        GROUP BY 
          p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      console.log("Exécution requête produits des autres laboratoires pour la famille");
      const otherLabsProductsResult = await client.query(otherLabsProductsQuery, nextQueriesParams);
      const otherLabProducts = otherLabsProductsResult.rows || [];
      
      console.log(`Produits des autres laboratoires trouvés pour la famille: ${otherLabProducts.length}`);
      
      // Retourner les données
      const finalResponse = {
        segmentInfo,
        marketShareByLab: marketShareData,
        selectedLabProductsTop: selectedLabProducts,
        otherLabsProductsTop: otherLabProducts
      };
      
      console.log("RÉPONSE FINALE - segmentInfo famille:", JSON.stringify(finalResponse.segmentInfo));
      console.log("================ FIN ANALYSE FAMILLE ================\n\n");
      
      return NextResponse.json(finalResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la famille:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Méthode GET pour compatibilité
export async function GET(
  request: NextRequest,
  { params }: { params: { universe: string; category: string; family: string } }
) {
  try {
    const universe = decodeURIComponent(params.universe);
    const category = decodeURIComponent(params.category);
    const family = decodeURIComponent(params.family);
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de recherche
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const laboratoryId = searchParams.get('laboratoryId');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = searchParams.get('limit') || '10';
    
    if (!startDate || !endDate || !laboratoryId) {
      return NextResponse.json(
        { error: 'Paramètres requis manquants' },
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
    console.error('Erreur lors de l\'analyse de la famille (GET):', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}