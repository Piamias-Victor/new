// src/app/api/search/segments-unified/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get('term');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation basique
    if (!term) {
      return NextResponse.json(
        { error: 'Le terme de recherche est requis' },
        { status: 400 }
      );
    }

    // Normalisation du terme de recherche pour la correspondance
    const searchTerm = `%${term.toLowerCase().trim()}%`;
    
    const client = await pool.connect();
    
    try {
      let query;
      let queryParams = [searchTerm];
      let pharmacyCondition = '';
      
      // Ajouter la condition de pharmacie si nécessaire
      if (pharmacyIds.length > 0) {
        pharmacyCondition = `AND EXISTS (
          SELECT 1 FROM data_internalproduct ip
          WHERE ip.code_13_ref_id = gp.code_13_ref
          AND ip.pharmacy_id IN (${pharmacyIds.map((_, idx) => `$${idx + 2}`).join(',')})
        )`;
        queryParams = [searchTerm, ...pharmacyIds];
      }
      
      // 1. Recherche dans les univers
      const universeQuery = `
        WITH universe_data AS (
          SELECT DISTINCT
            'universe_' || COALESCE(universe, 'autre') AS id,
            COALESCE(universe, 'Autre') AS name,
            'universe' AS type,
            NULL AS parent,
            1 AS level,
            ARRAY[]::text[] AS breadcrumb,
            COUNT(DISTINCT code_13_ref) AS product_count,
            ARRAY_AGG(DISTINCT code_13_ref) AS code_13_refs
          FROM data_globalproduct gp
          WHERE LOWER(universe) LIKE $1
            ${pharmacyCondition}
          GROUP BY universe
        )
        SELECT * FROM universe_data
        WHERE product_count > 0
      `;
      
      // 2. Recherche dans les catégories
      const categoryQuery = `
        WITH category_data AS (
          SELECT DISTINCT
            'category_' || COALESCE(category, 'autre') AS id,
            COALESCE(category, 'Autre') AS name,
            'category' AS type,
            'universe_' || COALESCE(universe, 'autre') AS parent,
            2 AS level,
            ARRAY[COALESCE(universe, 'Autre')] AS breadcrumb,
            COUNT(DISTINCT code_13_ref) AS product_count,
            ARRAY_AGG(DISTINCT code_13_ref) AS code_13_refs
          FROM data_globalproduct gp
          WHERE (LOWER(category) LIKE $1 OR LOWER(universe) LIKE $1)
            ${pharmacyCondition}
          GROUP BY universe, category
        )
        SELECT * FROM category_data
        WHERE product_count > 0
      `;
      
      // 3. Recherche dans les sous-catégories
      const subcategoryQuery = `
        WITH subcategory_data AS (
          SELECT DISTINCT
            'subcategory_' || COALESCE(sub_category, 'autre') AS id,
            COALESCE(sub_category, 'Autre') AS name,
            'subcategory' AS type,
            'category_' || COALESCE(category, 'autre') AS parent,
            3 AS level,
            ARRAY[COALESCE(universe, 'Autre'), COALESCE(category, 'Autre')] AS breadcrumb,
            COUNT(DISTINCT code_13_ref) AS product_count,
            ARRAY_AGG(DISTINCT code_13_ref) AS code_13_refs
          FROM data_globalproduct gp
          WHERE (LOWER(sub_category) LIKE $1 OR LOWER(category) LIKE $1 OR LOWER(universe) LIKE $1)
            ${pharmacyCondition}
          GROUP BY universe, category, sub_category
        )
        SELECT * FROM subcategory_data
        WHERE product_count > 0
      `;
      
      // 4. Recherche dans les familles
      const familyQuery = `
        WITH family_data AS (
          SELECT DISTINCT
            'family_' || COALESCE(family, 'autre') AS id,
            COALESCE(family, 'Autre') AS name,
            'family' AS type,
            NULL AS parent,
            1 AS level,
            ARRAY[]::text[] AS breadcrumb,
            COUNT(DISTINCT code_13_ref) AS product_count,
            ARRAY_AGG(DISTINCT code_13_ref) AS code_13_refs
          FROM data_globalproduct gp
          WHERE LOWER(family) LIKE $1
            ${pharmacyCondition}
          GROUP BY family
        )
        SELECT * FROM family_data
        WHERE product_count > 0
      `;
      
      // 5. Recherche dans les sous-familles
      const subfamilyQuery = `
        WITH subfamily_data AS (
          SELECT DISTINCT
            'subfamily_' || COALESCE(sub_family, 'autre') AS id,
            COALESCE(sub_family, 'Autre') AS name,
            'subfamily' AS type,
            'family_' || COALESCE(family, 'autre') AS parent,
            2 AS level,
            ARRAY[COALESCE(family, 'Autre')] AS breadcrumb,
            COUNT(DISTINCT code_13_ref) AS product_count,
            ARRAY_AGG(DISTINCT code_13_ref) AS code_13_refs
          FROM data_globalproduct gp
          WHERE (LOWER(sub_family) LIKE $1 OR LOWER(family) LIKE $1)
            ${pharmacyCondition}
          GROUP BY family, sub_family
        )
        SELECT * FROM subfamily_data
        WHERE product_count > 0
      `;
      
      // Exécuter toutes les requêtes et fusionner les résultats
      const [universeResult, categoryResult, subcategoryResult, familyResult, subfamilyResult] = await Promise.all([
        client.query(universeQuery, queryParams),
        client.query(categoryQuery, queryParams),
        client.query(subcategoryQuery, queryParams),
        client.query(familyQuery, queryParams),
        client.query(subfamilyQuery, queryParams)
      ]);
      
      // Fusionner les résultats
      const allResults = [
        ...universeResult.rows,
        ...categoryResult.rows,
        ...subcategoryResult.rows,
        ...familyResult.rows,
        ...subfamilyResult.rows
      ];
      
      // Trier par pertinence (similarité avec le terme recherché)
      const sortedResults = allResults.sort((a, b) => {
        // Correspondance exacte a priorité
        if (a.name.toLowerCase() === term.toLowerCase()) return -1;
        if (b.name.toLowerCase() === term.toLowerCase()) return 1;
        
        // Ensuite, les segments qui commencent par le terme
        const aStartsWith = a.name.toLowerCase().startsWith(term.toLowerCase());
        const bStartsWith = b.name.toLowerCase().startsWith(term.toLowerCase());
        
        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;
        
        // Ensuite par niveau (1 = niveau supérieur)
        if (a.level !== b.level) return a.level - b.level;
        
        // Enfin par nombre de produits
        return b.product_count - a.product_count;
      });
      
      return NextResponse.json({
        term,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        segments: sortedResults
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la recherche de segments:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la recherche de segments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}