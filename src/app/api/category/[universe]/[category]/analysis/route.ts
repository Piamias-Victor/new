// src/app/api/category/[universe]/[category]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { universe: string; category: string } }
) {
  try {
    // Corriger la récupération des paramètres
    const universePath = params.universe;
    const categoryPath = params.category;
    
    const universe = decodeURIComponent(universePath);
    const category = decodeURIComponent(categoryPath);
    
    
    // Récupérer et logger le corps de la requête
    const body = await request.json();
    
    const { 
      startDate, 
      endDate, 
      laboratoryId = '', 
      pharmacyIds = [], 
      limit = 10
    } = body;

    // Validation des entrées
    if (!universe || !category || !startDate || !endDate) {
      console.log("ERREUR: Paramètres manquants");
      return NextResponse.json(
        { error: 'Paramètres univers, catégorie, startDate et endDate requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Première requête pour vérifier si la catégorie existe et dans quel univers
      const checkCategoryQuery = `
        SELECT DISTINCT universe 
        FROM data_globalproduct 
        WHERE category = $1 
        LIMIT 1
      `;
      
      console.log("Vérification de l'univers pour cette catégorie...");
      const checkResult = await client.query(checkCategoryQuery, [category]);
      
      // Si on trouve la catégorie, utiliser son univers correct, sinon garder celui fourni
      let correctedUniverse = universe;
      if (checkResult.rows.length > 0) {
        correctedUniverse = checkResult.rows[0].universe;
        console.log(`Univers corrigé à partir de la BD: "${correctedUniverse}"`);
      }

      // Requête pour obtenir le chiffre d'affaires - IMPORTANT: ne pas utiliser $3 si on ne s'en sert pas
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
          AND gp.category = $3
          ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (' + pharmacyIds.map((_, i) => `$${i + 4}`).join(',') + ')' : ''}
      `;
      
      // Paramètres pour la requête - AJUSTER POUR ENLEVER L'UNIVERS NON UTILISÉ
      let revenueParams = [startDate, endDate, category];
      
      // Ajouter les pharmacy IDs le cas échéant
      if (pharmacyIds.length > 0) {
        revenueParams = [...revenueParams, ...pharmacyIds];
      }
      
      console.log(`Exécution requête chiffre d'affaires catégorie: ${revenueQuery.replace(/\s+/g, ' ')}`);
      console.log("Paramètres revenue:", JSON.stringify(revenueParams));
      
      const revenueResult = await client.query(revenueQuery, revenueParams);
      const totalRevenue = parseFloat(revenueResult.rows[0]?.total_revenue || '0');
      
      console.log(`Chiffre d'affaires total de la catégorie: ${totalRevenue}`);
      
      // Création de l'objet d'information du segment de catégorie
      const segmentInfo = {
        id: `${correctedUniverse}_${category}`,
        name: category,
        universe: correctedUniverse,
        category: category,
        total_revenue: totalRevenue
      };
      
      console.log("CRÉATION SEGMENTINFO POUR CATÉGORIE:", JSON.stringify(segmentInfo));

      // Obtenir les parts de marché des laboratoires pour cette catégorie
      // IMPORTANT: Ajuster les numéros des paramètres
      const marketShareQuery = `
        WITH category_lab_sales AS (
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
            AND gp.category = $3
            ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (' + pharmacyIds.map((_, i) => `$${i + 4}`).join(',') + ')' : ''}
          GROUP BY 
            gp.brand_lab
        ),
        category_total_sales AS (
          SELECT 
            SUM(total_revenue) as total_category_revenue,
            SUM(total_quantity) as total_category_quantity,
            SUM(total_margin) as total_category_margin
          FROM 
            category_lab_sales
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
            category_lab_sales
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
            WHEN cts.total_category_revenue > 0 
            THEN ROUND((lr.total_revenue / cts.total_category_revenue * 100)::numeric, 2)
            ELSE 0
          END as market_share,
          CASE 
            WHEN cts.total_category_quantity > 0 
            THEN ROUND((lr.total_quantity / cts.total_category_quantity * 100)::numeric, 2)
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
          category_total_sales cts
        ORDER BY 
          lr.lab_rank ASC
      `;
      
      console.log("Exécution requête parts de marché catégorie avec paramètres:", JSON.stringify(revenueParams));
      const marketShareResult = await client.query(marketShareQuery, revenueParams);
      const marketShareData = marketShareResult.rows || [];
      
      console.log(`Parts de marché trouvées pour la catégorie: ${marketShareData.length}`);
      
      // Variables pour les top produits
      let selectedLabProductsTop = [];
      let otherLabProductsTop = [];

      // Si un laboratoryId est fourni, utiliser les requêtes spécifiques au laboratoire
      if (laboratoryId) {
        // IMPORTANT: Ajuster les numéros des paramètres pour les requêtes du laboratoire
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
            AND gp.category = $3
            AND gp.brand_lab = $4
            ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (' + pharmacyIds.map((_, i) => `$${i + 5}`).join(',') + ')' : ''}
          GROUP BY 
            p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
          ORDER BY 
            total_revenue DESC
          LIMIT ${limit}
        `;
        
        let labParams = [startDate, endDate, category, laboratoryId];
        if (pharmacyIds.length > 0) {
          labParams = [...labParams, ...pharmacyIds];
        }
        
        console.log("Exécution requête produits du laboratoire pour la catégorie");
        console.log("Paramètres produits lab:", JSON.stringify(labParams));
        const labProductsResult = await client.query(labProductsQuery, labParams);
        selectedLabProductsTop = labProductsResult.rows || [];
        
        console.log(`Produits du laboratoire trouvés pour la catégorie: ${selectedLabProductsTop.length}`);
        
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
            AND gp.category = $3
            AND gp.brand_lab != $4
            ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (' + pharmacyIds.map((_, i) => `$${i + 5}`).join(',') + ')' : ''}
          GROUP BY 
            p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
          ORDER BY 
            total_revenue DESC
          LIMIT ${limit}
        `;
        
        console.log("Exécution requête produits des autres laboratoires pour la catégorie");
        const otherLabsProductsResult = await client.query(otherLabsProductsQuery, labParams);
        otherLabProductsTop = otherLabsProductsResult.rows || [];
        
        console.log(`Produits des autres laboratoires trouvés pour la catégorie: ${otherLabProductsTop.length}`);
      } else {
        // Pas de laboratoire spécifique - récupérer les top produits globaux
        const topProductsQuery = `
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
            AND gp.category = $3
            ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (' + pharmacyIds.map((_, i) => `$${i + 4}`).join(',') + ')' : ''}
          GROUP BY 
            p.id, p.name, gp.name, p.code_13_ref_id, gp.brand_lab
          ORDER BY 
            total_revenue DESC
          LIMIT ${limit * 2}
        `;
        
        console.log("Exécution requête produits globaux pour la catégorie");
        const topProductsResult = await client.query(topProductsQuery, revenueParams);
        selectedLabProductsTop = topProductsResult.rows || [];
        // otherLabProductsTop reste un tableau vide
        
        console.log(`Produits globaux trouvés pour la catégorie: ${selectedLabProductsTop.length}`);
      }
      
      // Retourner les données
      const finalResponse = {
        segmentInfo,
        marketShareByLab: marketShareData,
        selectedLabProductsTop,
        otherLabProductsTop
      };
      
      console.log("RÉPONSE FINALE - segmentInfo catégorie:", JSON.stringify(finalResponse.segmentInfo));
      console.log("================ FIN ANALYSE CATÉGORIE ================\n\n");
      
      return NextResponse.json(finalResponse);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse de la catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// La méthode GET reste similaire, mais il faut également ajuster les paramètres
export async function GET(
  request: NextRequest,
  { params }: { params: { universe: string; category: string } }
) {
  // Code similaire...
}