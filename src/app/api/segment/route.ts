// src/app/api/segments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const client = await pool.connect();
    
    try {
      const query = `
        -- Récupération de tous les univers uniques avec leurs catégories associées
        WITH universe_categories AS (
          SELECT DISTINCT
            universe,
            jsonb_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL AND category != '') AS categories
          FROM
            data_globalproduct
          WHERE
            universe IS NOT NULL AND universe != ''
          GROUP BY
            universe
        ),
        
        -- Récupération de toutes les catégories uniques avec leurs sous-catégories associées
        category_subcategories AS (
          SELECT DISTINCT
            category,
            jsonb_agg(DISTINCT sub_category) FILTER (WHERE sub_category IS NOT NULL AND sub_category != '') AS sub_categories
          FROM
            data_globalproduct
          WHERE
            category IS NOT NULL AND category != ''
          GROUP BY
            category
        ),
        
        -- Récupération de toutes les familles uniques avec leurs sous-familles associées
        family_subfamilies AS (
          SELECT DISTINCT
            family,
            jsonb_agg(DISTINCT sub_family) FILTER (WHERE sub_family IS NOT NULL AND sub_family != '') AS sub_families
          FROM
            data_globalproduct
          WHERE
            family IS NOT NULL AND family != ''
          GROUP BY
            family
        ),
        
        -- Récupération des liens entre catégories et familles
        category_families AS (
          SELECT DISTINCT
            category,
            jsonb_agg(DISTINCT family) FILTER (WHERE family IS NOT NULL AND family != '') AS families
          FROM
            data_globalproduct
          WHERE
            category IS NOT NULL AND category != ''
          GROUP BY
            category
        )
        
        -- Construction du résultat final
        SELECT json_build_object(
          -- Liste de tous les univers avec leurs catégories
          'universe_hierarchy', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'universe', universe,
                'categories', categories
              )
            )
            FROM universe_categories
          ),
          
          -- Liste de toutes les catégories avec leurs sous-catégories et familles
          'category_hierarchy', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'category', cs.category,
                'sub_categories', cs.sub_categories,
                'families', COALESCE(cf.families, '[]'::jsonb)
              )
            )
            FROM category_subcategories cs
            LEFT JOIN category_families cf ON cs.category = cf.category
          ),
          
          -- Liste de toutes les familles avec leurs sous-familles
          'family_hierarchy', (
            SELECT jsonb_agg(
              jsonb_build_object(
                'family', family,
                'sub_families', sub_families
              )
            )
            FROM family_subfamilies
          ),
          
          -- Liste plate de tous les segments uniques
          'flat_segments', json_build_object(
            'universes', (SELECT jsonb_agg(DISTINCT universe) FROM data_globalproduct WHERE universe IS NOT NULL AND universe != ''),
            'categories', (SELECT jsonb_agg(DISTINCT category) FROM data_globalproduct WHERE category IS NOT NULL AND category != ''),
            'sub_categories', (SELECT jsonb_agg(DISTINCT sub_category) FROM data_globalproduct WHERE sub_category IS NOT NULL AND sub_category != ''),
            'families', (SELECT jsonb_agg(DISTINCT family) FROM data_globalproduct WHERE family IS NOT NULL AND family != ''),
            'sub_families', (SELECT jsonb_agg(DISTINCT sub_family) FROM data_globalproduct WHERE sub_family IS NOT NULL AND sub_family != '')
          )
        ) AS segment_hierarchies;
      `;
      
      const result = await client.query(query);
      
      // Extraire l'objet JSON des résultats
      const segmentHierarchies = result.rows[0]?.segment_hierarchies || {
        universe_hierarchy: [],
        category_hierarchy: [],
        family_hierarchy: [],
        flat_segments: {
          universes: [],
          categories: [],
          sub_categories: [],
          families: [],
          sub_families: []
        }
      };
      
      return NextResponse.json(segmentHierarchies);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des hiérarchies de segments:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}