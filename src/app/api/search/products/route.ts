// src/app/api/search/products/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

/**
 * API de recherche de produits
 * Supporte la recherche par nom, code, laboratoire, ou catégorie
 */
export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const code = searchParams.get('code');
    const lab = searchParams.get('lab');
    const category = searchParams.get('category');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Vérifier qu'au moins un paramètre de recherche est présent
    if (!name && !code && !lab && !category) {
      return NextResponse.json(
        { error: 'Au moins un critère de recherche est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query = '';
      const params: any[] = [];
      let paramIndex = 1;
      
      // Base de la requête avec jointures
      const baseQuery = `
        SELECT DISTINCT
          p.id,
          p.internal_id,
          p.name,
          gp.name AS global_name,
          CASE 
            WHEN gp.name IS NULL OR gp.name = '' THEN p.name
            ELSE gp.name
          END AS display_name,
          p.code_13_ref_id AS code_13_ref,
          gp.category,
          gp.brand_lab,
          p."TVA" AS tva_rate,
          COALESCE(
            (
              SELECT s.stock
              FROM data_inventorysnapshot s
              WHERE s.product_id = p.id
              ORDER BY s.date DESC
              LIMIT 1
            ), 0
          ) AS current_stock,
          COALESCE(
            (
              SELECT s.price_with_tax
              FROM data_inventorysnapshot s
              WHERE s.product_id = p.id
              ORDER BY s.date DESC
              LIMIT 1
            ), 0
          ) AS price_with_tax
        FROM 
          data_internalproduct p
        LEFT JOIN 
          data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
      `;
      
      // Construction de la clause WHERE selon les critères
      const whereConditions = [];
      
      // Recherche par nom
      if (name) {
        whereConditions.push(`(p.name ILIKE $${paramIndex} OR gp.name ILIKE $${paramIndex})`);
        params.push(`%${name}%`);
        paramIndex++;
      }
      
      // Recherche par code
      if (code) {
        whereConditions.push(`p.code_13_ref_id LIKE $${paramIndex}`);
        params.push(`%${code}%`);
        paramIndex++;
      }
      
      // Recherche par laboratoire
      if (lab) {
        whereConditions.push(`gp.brand_lab ILIKE $${paramIndex}`);
        params.push(`%${lab}%`);
        paramIndex++;
      }
      
      // Recherche par catégorie
      if (category) {
        whereConditions.push(`gp.category ILIKE $${paramIndex}`);
        params.push(`%${category}%`);
        paramIndex++;
      }
      
      // Filtrage par pharmacies
      if (pharmacyIds.length > 0) {
        const pIds = pharmacyIds.map((_, idx) => `$${paramIndex + idx}`).join(',');
        whereConditions.push(`p.pharmacy_id IN (${pIds})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      // Construire la requête complète
      query = `
        ${baseQuery}
        WHERE ${whereConditions.join(' AND ')}
        ORDER BY 
          CASE WHEN p.name ILIKE $${paramIndex} THEN 0
               WHEN gp.name ILIKE $${paramIndex} THEN 1
               ELSE 2
          END,
          current_stock DESC
        LIMIT $${paramIndex + 1}
      `;
      
      // Paramètre pour le tri prioritaire (correspondance exacte)
      const searchTerm = name || code || lab || category || '';
      params.push(`%${searchTerm}%`);
      params.push(limit);
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        products: result.rows,
        count: result.rows.length,
        limit
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de produits:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de produits', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}