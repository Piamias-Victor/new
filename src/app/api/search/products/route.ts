// src/app/api/search/products/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const code = searchParams.get('code');
    const suffix = searchParams.get('suffix');
    const lab = searchParams.get('lab');
    const category = searchParams.get('category');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    
    // Vérifier qu'au moins un paramètre de recherche est présent
    if (!name && !code && !suffix && !lab && !category) {
      return NextResponse.json(
        { error: 'Au moins un critère de recherche est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Le terme de recherche
      const searchTerm = name || code || suffix || lab || category || '';
      
      // Construction de la requête
      let query = '';
      let whereConditions = [];
      const params = [];
      let paramIndex = 1;
      
      // Base de la requête avec jointures et cas de tri
      query = `
        WITH filtered_products AS (
          SELECT
            p.id,
            p.internal_id,
            p.name AS internal_name,
            gp.name AS global_name,
            CASE 
              WHEN gp.name IS NULL OR gp.name = '' OR gp.name = 'Default Name' THEN p.name
              ELSE gp.name
            END AS display_name,
            p.code_13_ref_id AS code_13_ref,
            gp.category,
            gp.brand_lab,
            gp.universe,
            CASE
              -- 1. Correspondance exacte
              WHEN LOWER(p.name) = LOWER($${paramIndex}) OR LOWER(gp.name) = LOWER($${paramIndex}) THEN 1
              -- 2. Commence par
              WHEN LOWER(p.name) LIKE LOWER($${paramIndex+1}) OR LOWER(gp.name) LIKE LOWER($${paramIndex+1}) THEN 2
              -- 3. Contient
              WHEN LOWER(p.name) LIKE LOWER($${paramIndex+2}) OR LOWER(gp.name) LIKE LOWER($${paramIndex+2}) THEN 3
              -- 4. Produits reconnus (avec un univers)
              WHEN gp.universe IS NOT NULL AND gp.universe != '' THEN 4
              -- 5. Autres produits
              ELSE 5
            END AS sort_priority,
            ROW_NUMBER() OVER (PARTITION BY p.code_13_ref_id ORDER BY 
              CASE
                WHEN LOWER(p.name) = LOWER($${paramIndex}) OR LOWER(gp.name) = LOWER($${paramIndex}) THEN 1
                WHEN LOWER(p.name) LIKE LOWER($${paramIndex+1}) OR LOWER(gp.name) LIKE LOWER($${paramIndex+1}) THEN 2
                WHEN LOWER(p.name) LIKE LOWER($${paramIndex+2}) OR LOWER(gp.name) LIKE LOWER($${paramIndex+2}) THEN 3
                WHEN gp.universe IS NOT NULL AND gp.universe != '' THEN 4
                ELSE 5
              END
            ) AS row_num
          FROM 
            data_internalproduct p
          LEFT JOIN 
            data_globalproduct gp ON p.code_13_ref_id = gp.code_13_ref
          WHERE 
            p.code_13_ref_id IS NOT NULL
      `;
      
      // Ajouter les paramètres pour les patterns de recherche
      params.push(searchTerm); // Exact match
      params.push(searchTerm + '%'); // Starts with
      params.push('%' + searchTerm + '%'); // Contains
      paramIndex += 3;
      
      // Recherche par nom
      if (name) {
        whereConditions.push(`(p.name ILIKE $${paramIndex} OR gp.name ILIKE $${paramIndex})`);
        params.push('%' + name + '%');
        paramIndex++;
      }
      
      // Recherche par code
      if (code) {
        whereConditions.push(`p.code_13_ref_id LIKE $${paramIndex}`);
        params.push('%' + code + '%');
        paramIndex++;
      }
      
      // Recherche par suffixe (fin de code)
      if (suffix) {
        whereConditions.push(`p.code_13_ref_id LIKE $${paramIndex}`);
        params.push('%' + suffix);
        paramIndex++;
      }
      
      // Recherche par laboratoire
      if (lab) {
        whereConditions.push(`gp.brand_lab ILIKE $${paramIndex}`);
        params.push('%' + lab + '%');
        paramIndex++;
      }
      
      // Recherche par catégorie
      if (category) {
        whereConditions.push(`gp.category ILIKE $${paramIndex}`);
        params.push('%' + category + '%');
        paramIndex++;
      }
      
      // Filtrage par pharmacies
      if (pharmacyIds.length > 0) {
        const pIds = pharmacyIds.map((_, idx) => `$${paramIndex + idx}`).join(',');
        whereConditions.push(`p.pharmacy_id IN (${pIds})`);
        params.push(...pharmacyIds);
        paramIndex += pharmacyIds.length;
      }
      
      // Ajouter les conditions WHERE si elles existent
      if (whereConditions.length > 0) {
        query += ` AND ${whereConditions.join(' AND ')}`;
      }
      
      // Fermer la CTE et sélectionner seulement le premier produit pour chaque code_13_ref
      query += `
        )
        SELECT 
          id,
          internal_id,
          internal_name,
          global_name,
          display_name,
          code_13_ref,
          category,
          brand_lab,
          CASE 
            WHEN universe IS NOT NULL AND universe != '' THEN universe
            WHEN code_13_ref LIKE '34009%' THEN 'Médicaments'
            ELSE 'Autre'
          END AS universe,
          sort_priority
        FROM 
          filtered_products
        WHERE 
          row_num = 1
        ORDER BY 
          sort_priority, display_name
        LIMIT $${paramIndex}
      `;
      
      params.push(limit);
      
      // Exécuter la requête
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