// src/app/api/laboratories/[id]/segments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Le paramètre ID est maintenant le nom du laboratoire (depuis ProductFilterContext)
    const labName = params.id;
    const body = await request.json();
    
    // Récupérer les paramètres du corps de la requête
    const { startDate, endDate, pharmacyIds = [] } = body;
    
    if (!labName || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Nom du laboratoire, date de début et date de fin sont requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête pour obtenir les informations du laboratoire
      let labQuery = `
        SELECT 
          brand_lab as name,
          COUNT(DISTINCT code_13_ref) as product_count,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) as total_margin
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.brand_lab = $1
          AND s.date BETWEEN $2 AND $3
      `;
      
      // Ajout des conditions de filtrage par pharmacie
      if (pharmacyIds.length > 0) {
        labQuery += ` AND p.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${idx + 4}`).join(',')})`;
      }
      
      labQuery += ` GROUP BY g.brand_lab`;
      
      // Paramètres pour la requête laboratoire
      const labParams = [labName, startDate, endDate];
      if (pharmacyIds.length > 0) {
        labParams.push(...pharmacyIds);
      }
      
      const labResult = await client.query(labQuery, labParams);
      
      // Requête pour obtenir les segments du laboratoire
      let segmentsQuery = `
        SELECT 
          CONCAT(g.universe, '_', g.category) as id,
          COALESCE(g.category, 'Non catégorisé') as name,
          COALESCE(g.universe, 'Non catégorisé') as universe,
          COALESCE(g.category, 'Non catégorisé') as category,
          COUNT(DISTINCT g.code_13_ref) as product_count,
          SUM(s.quantity * i.price_with_tax) as total_revenue,
          SUM(s.quantity * (i.price_with_tax - i.weighted_average_price)) as total_margin,
          (
            SUM(s.quantity * i.price_with_tax) / NULLIF(
              (
                SELECT SUM(s2.quantity * i2.price_with_tax)
                FROM data_sales s2
                JOIN data_inventorysnapshot i2 ON s2.product_id = i2.id
                JOIN data_internalproduct p2 ON i2.product_id = p2.id
                JOIN data_globalproduct g2 ON p2.code_13_ref_id = g2.code_13_ref
                WHERE g2.universe = g.universe AND g2.category = g.category
                AND s2.date BETWEEN $2 AND $3
                ${pharmacyIds.length > 0 ? ` AND p2.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${idx + 4}`).join(',')})` : ''}
              ), 0
            ) * 100
          ) as market_share
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        JOIN 
          data_internalproduct p ON i.product_id = p.id
        JOIN 
          data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
        WHERE 
          g.brand_lab = $1
          AND s.date BETWEEN $2 AND $3
      `;
      
      // Ajout des conditions de filtrage par pharmacie
      if (pharmacyIds.length > 0) {
        segmentsQuery += ` AND p.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${idx + 4}`).join(',')})`;
      }
      
      segmentsQuery += ` 
        GROUP BY g.universe, g.category
        ORDER BY total_revenue DESC
      `;
      
      // Paramètres pour la requête segments
      const segmentsParams = [labName, startDate, endDate];
      if (pharmacyIds.length > 0) {
        segmentsParams.push(...pharmacyIds);
      }
      
      const segmentsResult = await client.query(segmentsQuery, segmentsParams);
      
      // Si aucun laboratoire trouvé
      if (labResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Laboratoire non trouvé ou aucune donnée disponible' },
          { status: 404 }
        );
      }
      
      // Construire la réponse
      const response = {
        laboratory: {
          id: labName,
          ...labResult.rows[0]
        },
        segments: segmentsResult.rows
      };
      
      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des segments du laboratoire:', error);
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
    const labName = params.id;
    const searchParams = request.nextUrl.searchParams;
    
    // Récupérer les paramètres de la requête
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
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
    console.error('Erreur lors de la récupération des segments du laboratoire (GET):', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}