// src/app/api/search/segments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  console.log('Route de recherche de segments appelée');

  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('name');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    console.log('Terme de recherche:', searchTerm);
    console.log('IDs de pharmacies:', pharmacyIds);

    // Validation des paramètres
    if (!searchTerm) {
      console.warn('Aucun terme de recherche fourni');
      return NextResponse.json(
        { error: 'Le terme de recherche est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query: string;
      let params: any[];
      
      // Requête pour rechercher des segments avec filtrage par pharmacie
      if (pharmacyIds.length === 0) {
        // Requête sans filtre de pharmacie
        query = `
          WITH segment_stats AS (
            SELECT 
              sub_category AS name,
              category AS parent_category,
              COUNT(DISTINCT code_13_ref) AS product_count
            FROM 
              data_globalproduct
            WHERE 
              LOWER(sub_category) LIKE LOWER($1)
              OR LOWER(category) LIKE LOWER($1)
            GROUP BY 
              sub_category, category
          )
          SELECT 
            name,
            parent_category,
            product_count
          FROM 
            segment_stats
          WHERE 
            product_count > 0
          ORDER BY 
            product_count DESC
          LIMIT 50
        `;
        params = [`%${searchTerm}%`];
      } else {
        // Requête avec filtre de pharmacie
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 2}`).join(',');
        
        query = `
          WITH segment_stats AS (
            SELECT 
              dg.sub_category AS name,
              dg.category AS parent_category,
              COUNT(DISTINCT dg.code_13_ref) AS product_count
            FROM 
              data_globalproduct dg
            JOIN 
              data_internalproduct dip ON dg.code_13_ref = dip.code_13_ref_id
            WHERE 
              (LOWER(dg.sub_category) LIKE LOWER($1)
              OR LOWER(dg.category) LIKE LOWER($1))
              AND dip.pharmacy_id IN (${pharmacyPlaceholders})
            GROUP BY 
              dg.sub_category, dg.category
          )
          SELECT 
            name,
            parent_category,
            product_count
          FROM 
            segment_stats
          WHERE 
            product_count > 0
          ORDER BY 
            product_count DESC
          LIMIT 50
        `;
        params = [`%${searchTerm}%`, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      
      console.log('Nombre de segments trouvés:', result.rows.length);
      
      // Transformer les résultats avec un id unique
      const segments = result.rows.map((row, index) => ({
        id: `segment_${index}`,
        name: row.name,
        parentCategory: row.parent_category || undefined,
        productCount: parseInt(row.product_count)
      }));
      
      console.log('Segments transformés:', segments);
      
      return NextResponse.json({
        segments,
        total: segments.length,
        searchTerm
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de segments:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la recherche de segments', 
        details: error instanceof Error ? error.message : 'Erreur inconnue' 
      },
      { status: 500 }
    );
  }
}