import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Vérifier qu'un paramètre de recherche est présent
    if (!name) {
      return NextResponse.json(
        { error: 'Un nom de laboratoire est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construction de la requête
      let query = `
        WITH lab_data AS (
          SELECT 
            gp.brand_lab AS lab_name,
            gp.code_13_ref,
            COUNT(DISTINCT CASE 
              WHEN ip.id IS NOT NULL THEN gp.code_13_ref 
              ELSE NULL 
            END) AS product_count
          FROM 
            data_globalproduct gp
          LEFT JOIN 
            data_internalproduct ip ON gp.code_13_ref = ip.code_13_ref_id
          WHERE 
            gp.brand_lab ILIKE $1
      `;
      
      const params = [`%${name}%`];
      let paramIndex = 2;
      
      // Optionnel : filtrage par pharmacies si nécessaire
      if (pharmacyIds.length > 0) {
        query += `
          AND (ip.pharmacy_id IS NULL OR ip.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${paramIndex + idx}`).join(',')}))
        `;
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      query += `
          AND gp.brand_lab IS NOT NULL 
          AND gp.brand_lab != ''
          GROUP BY 
            gp.brand_lab, gp.code_13_ref
        ),
        consolidated_labs AS (
          SELECT 
            lab_name,
            STRING_AGG(DISTINCT code_13_ref, ',') AS code_13_refs,
            SUM(product_count) AS product_count
          FROM 
            lab_data
          GROUP BY 
            lab_name
        )
        SELECT 
          lab_name,
          code_13_refs,
          product_count
        FROM 
          consolidated_labs
        WHERE 
          product_count > 0
        ORDER BY 
          product_count DESC
        LIMIT $${paramIndex}
      `;
      
      params.push(limit);
      
      // Exécuter la requête
      const result = await client.query(query, params);
      
      return NextResponse.json({
        labs: result.rows.map(row => ({
          name: row.lab_name,
          code_13_refs: row.code_13_refs.split(','),
          product_count: row.product_count
        })),
        count: result.rows.length,
        limit
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de laboratoires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de laboratoires', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}