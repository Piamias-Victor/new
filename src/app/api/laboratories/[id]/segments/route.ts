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
    const { startDate, endDate, pharmacyIds = [] } = body;

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
      
      // 2. Obtenir les segments du laboratoire
      const segmentsQuery = `
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
      
      // Exécuter la requête pour obtenir les segments
      const segmentsResult = await client.query(segmentsQuery, baseParams);
      
      // Retourner les données
      return NextResponse.json({
        laboratory: labInfoResult.rows[0] || {
          id: laboratoryId,
          name: laboratoryId,
          total_revenue: 0,
          total_margin: 0,
          product_count: 0
        },
        segments: segmentsResult.rows || []
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
      pharmacyIds
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