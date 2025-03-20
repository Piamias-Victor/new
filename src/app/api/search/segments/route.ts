// src/app/api/search/segments/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || '';
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Un terme de recherche d\'au moins 2 caractères est requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let query;
      let params = [name + '%', '%' + name + '%']; // Recherche par préfixe et contient
      
      if (pharmacyIds.length === 0) {
        // Pour toutes les pharmacies - MODIFIÉ pour inclure la recherche dans les univers, familles et sous-familles
        query = `
          WITH segment_search AS (
            SELECT DISTINCT
              universe,
              category,
              sub_category,
              family,
              sub_family
            FROM 
              data_globalproduct
            WHERE 
              universe ILIKE $1 OR universe ILIKE $2 OR
              category ILIKE $1 OR category ILIKE $2 OR
              sub_category ILIKE $1 OR sub_category ILIKE $2 OR
              family ILIKE $1 OR family ILIKE $2 OR
              sub_family ILIKE $1 OR sub_family ILIKE $2
          ),
          product_counts AS (
            SELECT
              ss.universe,
              ss.category,
              ss.sub_category,
              ss.family,
              ss.sub_family,
              COUNT(DISTINCT gp.code_13_ref) as product_count,
              ARRAY_AGG(DISTINCT gp.code_13_ref) as code_13_refs
            FROM
              segment_search ss
            JOIN
              data_globalproduct gp ON 
                (ss.universe = gp.universe OR ss.universe IS NULL) AND
                (ss.category = gp.category OR ss.category IS NULL) AND
                (ss.sub_category = gp.sub_category OR ss.sub_category IS NULL) AND
                (ss.family = gp.family OR ss.family IS NULL) AND
                (ss.sub_family = gp.sub_family OR ss.sub_family IS NULL)
            GROUP BY
              ss.universe, ss.category, ss.sub_category, ss.family, ss.sub_family
          )
          SELECT
            CASE 
              WHEN universe IS NOT NULL AND category IS NOT NULL AND sub_category IS NOT NULL THEN 
                universe || '-' || category || '-' || sub_category
              WHEN universe IS NOT NULL AND category IS NOT NULL THEN 
                universe || '-' || category
              WHEN universe IS NOT NULL THEN 
                universe
              WHEN category IS NOT NULL AND sub_category IS NOT NULL THEN
                category || '-' || sub_category
              WHEN family IS NOT NULL AND sub_family IS NOT NULL THEN
                family || '-' || sub_family
              WHEN family IS NOT NULL THEN
                family
              ELSE COALESCE(category, family, universe)
            END as id,
            COALESCE(
              sub_category, 
              category, 
              sub_family,
              family,
              universe
            ) as name,
            universe,
            COALESCE(category, family) as parent_category,
            family,
            sub_family,
            product_count,
            code_13_refs,
            CASE
              WHEN sub_family IS NOT NULL THEN 'subfamily'
              WHEN family IS NOT NULL THEN 'family'
              WHEN sub_category IS NOT NULL THEN 'subcategory'
              WHEN category IS NOT NULL THEN 'category'
              WHEN universe IS NOT NULL THEN 'universe'
              ELSE 'other'
            END as segment_type
          FROM
            product_counts
          ORDER BY
            product_count DESC
        `;
      } else {
        // Pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        query = `
          WITH segment_search AS (
            SELECT DISTINCT
              universe,
              category,
              sub_category,
              family,
              sub_family
            FROM 
              data_globalproduct
            WHERE 
              universe ILIKE $1 OR universe ILIKE $2 OR
              category ILIKE $1 OR category ILIKE $2 OR
              sub_category ILIKE $1 OR sub_category ILIKE $2 OR
              family ILIKE $1 OR family ILIKE $2 OR
              sub_family ILIKE $1 OR sub_family ILIKE $2
          ),
          pharmacy_products AS (
            SELECT DISTINCT
              ip.code_13_ref_id
            FROM
              data_internalproduct ip
            WHERE
              ip.pharmacy_id IN (${pharmacyPlaceholders})
          ),
          product_counts AS (
            SELECT
              ss.universe,
              ss.category,
              ss.sub_category,
              ss.family,
              ss.sub_family,
              COUNT(DISTINCT gp.code_13_ref) as product_count,
              ARRAY_AGG(DISTINCT gp.code_13_ref) as code_13_refs
            FROM
              segment_search ss
            JOIN
              data_globalproduct gp ON 
                (ss.universe = gp.universe OR ss.universe IS NULL) AND
                (ss.category = gp.category OR ss.category IS NULL) AND
                (ss.sub_category = gp.sub_category OR ss.sub_category IS NULL) AND
                (ss.family = gp.family OR ss.family IS NULL) AND
                (ss.sub_family = gp.sub_family OR ss.sub_family IS NULL)
            JOIN
              pharmacy_products pp ON gp.code_13_ref = pp.code_13_ref_id
            GROUP BY
              ss.universe, ss.category, ss.sub_category, ss.family, ss.sub_family
          )
          SELECT
            CASE 
              WHEN universe IS NOT NULL AND category IS NOT NULL AND sub_category IS NOT NULL THEN 
                universe || '-' || category || '-' || sub_category
              WHEN universe IS NOT NULL AND category IS NOT NULL THEN 
                universe || '-' || category
              WHEN universe IS NOT NULL THEN 
                universe
              WHEN category IS NOT NULL AND sub_category IS NOT NULL THEN
                category || '-' || sub_category
              WHEN family IS NOT NULL AND sub_family IS NOT NULL THEN
                family || '-' || sub_family
              WHEN family IS NOT NULL THEN
                family
              ELSE COALESCE(category, family, universe)
            END as id,
            COALESCE(
              sub_category, 
              category, 
              sub_family,
              family,
              universe
            ) as name,
            universe,
            COALESCE(category, family) as parent_category,
            family,
            sub_family,
            product_count,
            code_13_refs,
            CASE
              WHEN sub_family IS NOT NULL THEN 'subfamily'
              WHEN family IS NOT NULL THEN 'family'
              WHEN sub_category IS NOT NULL THEN 'subcategory'
              WHEN category IS NOT NULL THEN 'category'
              WHEN universe IS NOT NULL THEN 'universe'
              ELSE 'other'
            END as segment_type
          FROM
            product_counts
          ORDER BY
            product_count DESC
        `;
        params = [...params, ...pharmacyIds];
      }
      
      const result = await client.query(query, params);
      
      // Transformation du résultat pour correspondre au format Segment
      const segments = result.rows.map(row => ({
        id: row.id || `segment-${row.name}`,
        name: row.name,
        universe: row.universe,
        parentCategory: row.parent_category,
        family: row.family,
        subFamily: row.sub_family,
        productCount: row.product_count || 0,
        code_13_refs: row.code_13_refs || [],
        segmentType: row.segment_type || 'other'
      }));

      return NextResponse.json({
        segments
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