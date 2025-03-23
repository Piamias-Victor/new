// src/app/api/segments/[id]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const segmentId = decodeURIComponent(params.id);
    console.log("\n\n================ DÉBUT ANALYSE SEGMENT ================");
    console.log(`ID du segment: "${segmentId}"`);
    
    // Récupérer et logger le corps de la requête
    const body = await request.json();
    console.log("Corps de la requête complet:", JSON.stringify(body));
    
    const { 
      startDate, 
      endDate, 
      laboratoryId, 
      pharmacyIds = [], 
      limit = 10,
      segmentType = 'category', 
      segmentValue = '' 
    } = body;

    console.log(`Type de segment: "${segmentType}"`);
    console.log(`Valeur du segment: "${segmentValue}"`);

    // Validation des entrées
    if (!segmentId || !startDate || !endDate || !laboratoryId || !segmentValue) {
      console.log("ERREUR: Paramètres manquants");
      return NextResponse.json(
        { error: 'Paramètres requis manquants' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Préparer les paramètres de base
      let baseParams = [startDate, endDate];
      let filterCondition = '';
      
      // Construire la condition SQL selon le type de segment
      if (segmentType === 'universe') {
        filterCondition = `AND gp.universe = $3`;
        baseParams.push(segmentValue);
        console.log(`SQL pour univers: "${filterCondition}", Paramètres: ${JSON.stringify(baseParams)}`);
      } else {
        const parts = segmentId.split('_');
        if (parts.length >= 2) {
          const universe = parts[0];
          filterCondition = `AND gp.universe = $3 AND gp.category = $4`;
          baseParams.push(universe, segmentValue);
          console.log(`SQL pour catégorie: "${filterCondition}", Univers: "${universe}", Catégorie: "${segmentValue}"`);
        } else {
          console.log("ERREUR: Format de segmentId invalide pour une catégorie");
          return NextResponse.json(
            { error: 'Format de segmentId invalide pour une catégorie' },
            { status: 400 }
          );
        }
      }
      
      // Index du prochain paramètre
      let paramIndex = baseParams.length + 1;
      
      // Ajouter laboratoryId aux paramètres
      const labParamIndex = paramIndex;
      baseParams.push(laboratoryId);
      paramIndex++;
      console.log(`Ajout laboratoryId: "${laboratoryId}" à l'index ${labParamIndex}`);
      
      // Construire la condition pour les pharmacies
      let pharmacyCondition = '';
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        const placeholders = pharmacyIds.map((_, i) => `$${paramIndex + i}`).join(',');
        pharmacyCondition = ` AND p.pharmacy_id IN (${placeholders})`;
        baseParams.push(...pharmacyIds);
        console.log(`Condition pharmacies: "${pharmacyCondition}"`);
      }

      // Requête pour obtenir le chiffre d'affaires total du segment
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
          ${filterCondition}
          ${pharmacyCondition}
      `;
      
      console.log(`Exécution requête chiffre d'affaires: ${revenueQuery.replace(/\\s+/g, ' ')}`);
      const revenueResult = await client.query(revenueQuery, baseParams);
      const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
      
      console.log(`Chiffre d'affaires total: ${totalRevenue}`);
      
      // Création de l'objet d'information du segment
      let segmentInfo;
      if (segmentType === 'universe') {
        segmentInfo = {
          id: segmentId,
          name: segmentValue,
          universe: segmentValue,  
          category: '',           
          total_revenue: totalRevenue
        };
        console.log("CRÉATION SEGMENTINFO POUR UNIVERS:", JSON.stringify(segmentInfo));
      } else {
        const parts = segmentId.split('_');
        segmentInfo = {
          id: segmentId,
          name: segmentValue,
          universe: parts[0],     
          category: segmentValue,  
          total_revenue: totalRevenue
        };
        console.log("CRÉATION SEGMENTINFO POUR CATÉGORIE:", JSON.stringify(segmentInfo));
      }
      
      // VÉRIFICATION DES VALEURS
      console.log("VÉRIFICATION type:", typeof segmentInfo);
      console.log("VÉRIFICATION univers:", segmentInfo.universe);
      console.log("VÉRIFICATION catégorie:", segmentInfo.category);
      
      // Obtenir les parts de marché des laboratoires pour ce segment
      const marketShareQuery = `
        WITH segment_lab_sales AS (
          SELECT 
            gp.brand_lab,
            SUM(s.quantity * i.price_with_tax) as total_revenue,
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
            ${filterCondition}
            ${pharmacyCondition}
          GROUP BY 
            gp.brand_lab
        ),
        segment_total_sales AS (
          SELECT 
            SUM(total_revenue) as total_segment_revenue
          FROM 
            segment_lab_sales
        ),
        lab_ranking AS (
          SELECT 
            brand_lab,
            total_revenue,
            product_count,
            ROW_NUMBER() OVER (ORDER BY total_revenue DESC) as lab_rank
          FROM 
            segment_lab_sales
        )
        SELECT 
          lr.brand_lab as id,
          lr.brand_lab as name,
          lr.total_revenue,
          lr.product_count,
          lr.lab_rank as rank,
          CASE 
            WHEN sts.total_segment_revenue > 0 
            THEN ROUND((lr.total_revenue / sts.total_segment_revenue * 100)::numeric, 2)
            ELSE 0
          END as market_share
        FROM 
          lab_ranking lr
        CROSS JOIN 
          segment_total_sales sts
        ORDER BY 
          lr.lab_rank ASC
      `;
      
      console.log("Exécution requête parts de marché");
      const marketShareResult = await client.query(marketShareQuery, baseParams);
      const marketShareData = marketShareResult.rows || [];
      
      console.log(`Parts de marché trouvées: ${marketShareData.length}`);
      
      // Obtenir les top produits du laboratoire sélectionné
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
          ${filterCondition}
          AND gp.brand_lab = $${labParamIndex}
          ${pharmacyCondition}
        GROUP BY 
          p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      console.log("Exécution requête produits du laboratoire");
      const labProductsResult = await client.query(labProductsQuery, baseParams);
      const selectedLabProducts = labProductsResult.rows || [];
      
      console.log(`Produits du laboratoire trouvés: ${selectedLabProducts.length}`);
      
      // Obtenir les top produits des autres laboratoires
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
          ${filterCondition}
          AND gp.brand_lab != $${labParamIndex}
          ${pharmacyCondition}
        GROUP BY 
          p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
        ORDER BY 
          total_revenue DESC
        LIMIT ${limit}
      `;
      
      console.log("Exécution requête produits des autres laboratoires");
      const otherLabsProductsResult = await client.query(otherLabsProductsQuery, baseParams);
      const otherLabProducts = otherLabsProductsResult.rows || [];
      
      console.log(`Produits des autres laboratoires trouvés: ${otherLabProducts.length}`);
      
      // Retourner les données
      const finalResponse = {
        segmentInfo,
        marketShareByLab: marketShareData,
        selectedLabProductsTop: selectedLabProducts,
        otherLabsProductsTop: otherLabProducts
      };
      
      console.log("RÉPONSE FINALE - segmentInfo:", JSON.stringify(finalResponse.segmentInfo));
      console.log(`VÉRIFICATION FINALE - universe: "${finalResponse.segmentInfo.universe}", category: "${finalResponse.segmentInfo.category}"`);
      console.log("================ FIN ANALYSE SEGMENT ================\n\n");
      
      return NextResponse.json(finalResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse du segment:', error);
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
    const segmentId = decodeURIComponent(params.id);
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de recherche
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const laboratoryId = searchParams.get('laboratoryId');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = searchParams.get('limit') || '10';
    const segmentType = searchParams.get('segmentType') || 'category';
    const segmentValue = searchParams.get('segmentValue') || '';
    
    if (!startDate || !endDate || !laboratoryId || !segmentValue) {
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
      limit: parseInt(limit),
      segmentType,
      segmentValue
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
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}