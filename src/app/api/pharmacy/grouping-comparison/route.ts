// src/app/api/pharmacy/grouping-comparison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Conserver GET pour la compatibilité avec les appels existants
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const code13refs = searchParams.getAll('code13refs');
    
    if (!pharmacyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les paramètres pharmacyId, startDate et endDate sont requis' },
        { status: 400 }
      );
    }
    
    // Utiliser la méthode commune pour traiter la requête
    return await processGroupingComparison(pharmacyId, startDate, endDate, code13refs);
  } catch (error) {
    return handleError(error);
  }
}

// Ajouter POST pour gérer les grosses listes de codes EAN13
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pharmacyId, startDate, endDate, code13refs = [] } = body;
    
    if (!pharmacyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les paramètres pharmacyId, startDate et endDate sont requis' },
        { status: 400 }
      );
    }
    
    // Utiliser la méthode commune pour traiter la requête
    return await processGroupingComparison(pharmacyId, startDate, endDate, code13refs);
  } catch (error) {
    return handleError(error);
  }
}

// Fonction commune pour traiter les requêtes GET et POST
async function processGroupingComparison(
  pharmacyId: string,
  startDate: string,
  endDate: string,
  code13refs: string[]
) {
  const client = await pool.connect();
  
  try {
    // Construction des conditions de filtrage par code EAN13
    let codeFilter = '';
    let codeFilterParams: string[] = [];
    
    if (code13refs.length > 0) {
      const placeholders = code13refs.map((_, index) => `$${index + 4}`).join(',');
      codeFilter = `AND p.code_13_ref_id IN (${placeholders})`;
      codeFilterParams = code13refs;
    }

    // Requête pour obtenir les données de la pharmacie spécifique
    const pharmacyQuery = `
      WITH pharmacy_data AS (
        -- Données de vente (sell-out)
        SELECT 
          SUM(s.quantity * i.price_with_tax) AS total_sellout,
          SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin,
          COUNT(DISTINCT p.code_13_ref_id) AS references_count
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN
          data_internalproduct p ON i.product_id = p.id
        WHERE 
          p.pharmacy_id = $1
          AND s.date BETWEEN $2 AND $3
          ${codeFilter}
      ),
      pharmacy_sellin AS (
        -- Données d'achat (sell-in)
        SELECT 
          SUM(po.qte * (
            SELECT COALESCE(weighted_average_price, 0)
            FROM data_inventorysnapshot
            WHERE product_id = po.product_id
            ORDER BY date DESC
            LIMIT 1
          )) AS total_sellin
        FROM 
          data_order o
        JOIN 
          data_productorder po ON o.id = po.order_id
        JOIN
          data_internalproduct p ON po.product_id = p.id
        WHERE 
          o.pharmacy_id = $1
          AND o.sent_date BETWEEN $2 AND $3
          ${codeFilter}
      ),
      pharmacy_stock AS (
        -- Données de stock
        SELECT 
          SUM(i.stock * i.weighted_average_price) AS total_stock
        FROM 
          data_inventorysnapshot i
        JOIN
          data_internalproduct p ON i.product_id = p.id
        WHERE 
          p.pharmacy_id = $1
          AND i.date = (
            SELECT MAX(date)
            FROM data_inventorysnapshot
            WHERE date <= $3
          )
          ${codeFilter}
      ),
      pharmacy_evolution AS (
        -- Calcul de l'évolution par rapport à la période précédente
        WITH current_period AS (
          SELECT 
            SUM(s.quantity * i.price_with_tax) AS current_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            p.pharmacy_id = $1
            AND s.date BETWEEN $2 AND $3
            ${codeFilter}
        ),
        previous_period AS (
          SELECT 
            SUM(s.quantity * i.price_with_tax) AS previous_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            p.pharmacy_id = $1
            AND s.date BETWEEN 
              ($2::date - ($3::date - $2::date)) AND ($2::date - INTERVAL '1 day')
            ${codeFilter}
        )
        SELECT 
          cp.current_revenue,
          pp.previous_revenue,
          CASE 
            WHEN pp.previous_revenue > 0 
            THEN ((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue * 100)
            ELSE 0
          END AS evolution_percentage
        FROM 
          current_period cp, previous_period pp
      )
      SELECT 
        pd.total_sellout,
        pd.total_margin,
        CASE WHEN pd.total_sellout > 0 THEN (pd.total_margin / pd.total_sellout * 100) ELSE 0 END AS margin_percentage,
        pd.references_count,
        ps.total_sellin,
        pst.total_stock,
        pe.evolution_percentage
      FROM 
        pharmacy_data pd, 
        pharmacy_sellin ps, 
        pharmacy_stock pst, 
        pharmacy_evolution pe
    `;
    
    // Paramètres pour les requêtes GROUP
    const groupParams = [startDate, endDate];
    
    // Condition pour les codes EAN13 dans les requêtes de groupe
    // Condition distincte pour chaque table impliquée
    let codeFilterStr = '';
    if (code13refs.length > 0) {
      // Ajouter les codes aux paramètres
      groupParams.push(...code13refs);
      
      // Créer les placeholders basés sur la nouvelle position dans la liste de paramètres
      const placeholders = code13refs.map((_, idx) => `$${idx + 3}`).join(',');
      codeFilterStr = `IN (${placeholders})`;
    }

    // Requête pour obtenir la moyenne du groupement (toutes les pharmacies)
    const groupQuery = `
      WITH 
      -- Comptage des pharmacies distinctes
      group_pharmacy_count AS (
        SELECT COUNT(DISTINCT p.pharmacy_id) AS pharmacy_count
        FROM data_internalproduct p
        JOIN data_inventorysnapshot i ON i.product_id = p.id
        JOIN data_sales s ON s.product_id = i.id
        WHERE s.date BETWEEN $1 AND $2
        ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
      ),
      
      -- Comptage des références distinctes
      group_references AS (
        SELECT COUNT(DISTINCT ip.code_13_ref_id) AS total_refs
        FROM data_internalproduct ip
        JOIN data_inventorysnapshot ii ON ii.product_id = ip.id
        JOIN data_sales ss ON ss.product_id = ii.id
        WHERE ss.date BETWEEN $1 AND $2
        ${code13refs.length > 0 ? `AND ip.code_13_ref_id ${codeFilterStr}` : ''}
      ),
      
      -- Données de vente (sell-out)
      group_sellout AS (
        SELECT 
          SUM(s.quantity * i.price_with_tax) AS total_sellout,
          SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN
          data_internalproduct p ON i.product_id = p.id
        WHERE 
          s.date BETWEEN $1 AND $2
          ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
      ),
      
      -- Données d'achat (sell-in)
      group_sellin AS (
        SELECT 
          SUM(po.qte * (
            SELECT COALESCE(weighted_average_price, 0)
            FROM data_inventorysnapshot
            WHERE product_id = po.product_id
            ORDER BY date DESC
            LIMIT 1
          )) AS total_sellin
        FROM 
          data_order o
        JOIN 
          data_productorder po ON o.id = po.order_id
        JOIN
          data_internalproduct p ON po.product_id = p.id
        WHERE 
          o.sent_date BETWEEN $1 AND $2
          ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
      ),
      
      -- Données de stock
      group_stock AS (
        SELECT 
          SUM(i.stock * i.weighted_average_price) AS total_stock
        FROM 
          data_inventorysnapshot i
        JOIN
          data_internalproduct p ON i.product_id = p.id
        WHERE 
          i.date = (
            SELECT MAX(date)
            FROM data_inventorysnapshot
            WHERE date <= $2
          )
          ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
      ),
      
      -- Calcul de l'évolution
      group_evolution AS (
        WITH current_period AS (
          SELECT 
            SUM(s.quantity * i.price_with_tax) AS current_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            s.date BETWEEN $1 AND $2
            ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
        ),
        previous_period AS (
          SELECT 
            SUM(s.quantity * i.price_with_tax) AS previous_revenue
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            s.date BETWEEN 
              ($1::date - ($2::date - $1::date)) AND ($1::date - INTERVAL '1 day')
            ${code13refs.length > 0 ? `AND p.code_13_ref_id ${codeFilterStr}` : ''}
        )
        SELECT 
          CASE 
            WHEN pp.previous_revenue > 0 
            THEN ((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue * 100)
            ELSE 0
          END AS evolution_percentage
        FROM 
          current_period cp, previous_period pp
      )
      
      -- Requête finale combinant toutes les données avec moyenne par pharmacie
      SELECT 
        gpc.pharmacy_count,
        gs.total_sellout / NULLIF(gpc.pharmacy_count, 0) AS avg_sellout,
        gs.total_margin / NULLIF(gpc.pharmacy_count, 0) AS avg_margin,
        CASE WHEN gs.total_sellout > 0 THEN (gs.total_margin / gs.total_sellout * 100) ELSE 0 END AS avg_margin_percentage,
        gr.total_refs / NULLIF(gpc.pharmacy_count, 0) AS avg_references_count,
        gsi.total_sellin / NULLIF(gpc.pharmacy_count, 0) AS avg_sellin,
        gst.total_stock / NULLIF(gpc.pharmacy_count, 0) AS avg_stock,
        ge.evolution_percentage AS avg_evolution_percentage
      FROM 
        group_pharmacy_count gpc
      CROSS JOIN group_references gr
      CROSS JOIN group_sellout gs
      CROSS JOIN group_sellin gsi
      CROSS JOIN group_stock gst
      CROSS JOIN group_evolution ge
    `;
    
    // Exécuter les deux requêtes avec les bons paramètres
    const pharmacyParams = [pharmacyId, startDate, endDate, ...codeFilterParams];
    const pharmacyResult = await client.query(pharmacyQuery, pharmacyParams);
    
    const groupResult = await client.query(groupQuery, groupParams);
    
    // Préparer la réponse
    const response = {
      pharmacy: pharmacyResult.rows[0] || {},
      group: groupResult.rows[0] || {},
      filters: {
        pharmacyId,
        startDate,
        endDate,
        code13refsCount: code13refs.length
      }
    };
    
    return NextResponse.json(response);
  } finally {
    client.release();
  }
}

// Fonction utilitaire pour gérer les erreurs
function handleError(error: unknown) {
  console.error('Erreur lors de la récupération des données de comparaison:', error);
  return NextResponse.json(
    { 
      error: 'Erreur lors de la récupération des données', 
      details: error instanceof Error ? error.message : 'Erreur inconnue' 
    },
    { status: 500 }
  );
}