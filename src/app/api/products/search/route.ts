// src/app/api/products/search/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const code = searchParams.get('code');
    const suffix = searchParams.get('suffix');
    const codes = searchParams.getAll('codes');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Validation: au moins un critère de recherche doit être fourni
    if (!name && !code && !suffix && (!codes || codes.length === 0)) {
      return NextResponse.json(
        { error: 'Au moins un critère de recherche doit être fourni' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Vérifier si l'extension pg_trgm est disponible
      const hasTrgm = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm'
        ) as has_trgm
      `);
      const usesTrgm = hasTrgm.rows[0]?.has_trgm || false;

      // Créer une table temporaire pour les pharmacies si nécessaire
      if (pharmacyIds.length > 0) {
        await client.query(`
          CREATE TEMP TABLE temp_pharmacies (
            pharmacy_id UUID
          )
        `);
        
        const pharmacyValues = pharmacyIds.map(id => `('${id}')`).join(',');
        await client.query(`
          INSERT INTO temp_pharmacies (pharmacy_id)
          VALUES ${pharmacyValues}
        `);
      }
      
      let query = '';
      let params: any[] = [];
      
      // Construction de la requête selon le type de recherche
      if (name) {
        // Recherche par nom avec priorité aux correspondances exactes
        let relevanceQuery;
        
        if (usesTrgm) {
          // Utiliser pg_trgm pour la similarité si disponible
          relevanceQuery = `
            CASE 
              WHEN LOWER(p.name) = LOWER($1) THEN 100
              WHEN LOWER(p.name) LIKE LOWER($1 || '%') THEN 90
              WHEN LOWER(p.name) LIKE LOWER('%' || $1 || '%') THEN 80
              WHEN LOWER(g.name) = LOWER($1) THEN 70
              WHEN LOWER(g.name) LIKE LOWER($1 || '%') THEN 60
              WHEN LOWER(g.name) LIKE LOWER('%' || $1 || '%') THEN 50
              WHEN similarity(LOWER(p.name), LOWER($1)) > 0.4 THEN 40 * similarity(LOWER(p.name), LOWER($1))
              WHEN similarity(LOWER(g.name), LOWER($1)) > 0.4 THEN 30 * similarity(LOWER(g.name), LOWER($1))
              ELSE 10
            END as relevance
          `;
        } else {
          // Version sans pg_trgm
          relevanceQuery = `
            CASE 
              WHEN LOWER(p.name) = LOWER($1) THEN 100
              WHEN LOWER(p.name) LIKE LOWER($1 || '%') THEN 90
              WHEN LOWER(p.name) LIKE LOWER('%' || $1 || '%') THEN 80
              WHEN LOWER(g.name) = LOWER($1) THEN 70
              WHEN LOWER(g.name) LIKE LOWER($1 || '%') THEN 60
              WHEN LOWER(g.name) LIKE LOWER('%' || $1 || '%') THEN 50
              ELSE 10
            END as relevance
          `;
        }
        
        // Vérifier si la recherche concerne un laboratoire ou une catégorie
        query = `
          WITH filtered_products AS (
            SELECT 
              p.id,
              p.name,
              p.code_13_ref_id,
              p.pharmacy_id,
              ${relevanceQuery},
              ROW_NUMBER() OVER (PARTITION BY p.code_13_ref_id ORDER BY p.id) as row_num
            FROM 
              data_internalproduct p
            LEFT JOIN 
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND (
                LOWER(p.name) LIKE LOWER('%' || $1 || '%') 
                OR LOWER(g.name) LIKE LOWER('%' || $1 || '%')
                OR LOWER(g.brand_lab) LIKE LOWER('%' || $1 || '%')
                OR LOWER(g.category) LIKE LOWER('%' || $1 || '%')
              )
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          )
          SELECT 
            fp.id,
            fp.name,
            CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN fp.name ELSE g.name END AS display_name,
            fp.code_13_ref_id AS code_13_ref,
            g.category,
            g.brand_lab,
            ls.current_stock,
            ls.price_with_tax,
            ls.weighted_average_price,
            p."TVA" as tva_rate,
            fp.relevance
          FROM 
            filtered_products fp
          JOIN
            data_internalproduct p ON fp.id = p.id
          LEFT JOIN 
            data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
          LEFT JOIN 
            latest_snapshot ls ON fp.id = ls.product_id
          WHERE 
            fp.row_num = 1
          ORDER BY relevance DESC, display_name
          LIMIT $2
        `;
        params.push(name, limit);
        
      } else if (code) {
        // Recherche par code EAN exact
        query = `
          WITH filtered_products AS (
            SELECT 
              p.id,
              p.name,
              p.code_13_ref_id,
              p.pharmacy_id,
              ROW_NUMBER() OVER (PARTITION BY p.code_13_ref_id ORDER BY p.id) as row_num
            FROM 
              data_internalproduct p
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id = $1
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          )
          SELECT 
            fp.id,
            fp.name,
            CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN fp.name ELSE g.name END AS display_name,
            fp.code_13_ref_id AS code_13_ref,
            g.category,
            g.brand_lab,
            ls.current_stock,
            ls.price_with_tax,
            ls.weighted_average_price,
            p."TVA" as tva_rate
          FROM 
            filtered_products fp
          JOIN
            data_internalproduct p ON fp.id = p.id
          LEFT JOIN 
            data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
          LEFT JOIN 
            latest_snapshot ls ON fp.id = ls.product_id
          WHERE 
            fp.row_num = 1
          ORDER BY display_name
          LIMIT $2
        `;
        params.push(code, limit);
        
      } else if (suffix) {
        // Recherche par suffixe de code
        query = `
          WITH filtered_products AS (
            SELECT 
              p.id,
              p.name,
              p.code_13_ref_id,
              p.pharmacy_id,
              ROW_NUMBER() OVER (PARTITION BY p.code_13_ref_id ORDER BY p.id) as row_num
            FROM 
              data_internalproduct p
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id LIKE $1
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          )
          SELECT 
            fp.id,
            fp.name,
            CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN fp.name ELSE g.name END AS display_name,
            fp.code_13_ref_id AS code_13_ref,
            g.category,
            g.brand_lab,
            ls.current_stock,
            ls.price_with_tax,
            ls.weighted_average_price,
            p."TVA" as tva_rate
          FROM 
            filtered_products fp
          JOIN
            data_internalproduct p ON fp.id = p.id
          LEFT JOIN 
            data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
          LEFT JOIN 
            latest_snapshot ls ON fp.id = ls.product_id
          WHERE 
            fp.row_num = 1
          ORDER BY display_name
          LIMIT $2
        `;
        params.push(`%${suffix}`, limit);
        
      } else if (codes && codes.length > 0) {
        // Pour la recherche avec beaucoup de codes, utilisons aussi une table temporaire
        await client.query(`
          CREATE TEMP TABLE temp_codes (
            code VARCHAR(20)
          )
        `);
        
        // Insérer les codes en lot
        const codeValues = codes.map(code => `('${code}')`).join(',');
        await client.query(`
          INSERT INTO temp_codes (code)
          VALUES ${codeValues}
        `);
        
        query = `
          WITH filtered_products AS (
            SELECT 
              p.id,
              p.name,
              p.code_13_ref_id,
              p.pharmacy_id,
              ROW_NUMBER() OVER (PARTITION BY p.code_13_ref_id ORDER BY p.id) as row_num
            FROM 
              data_internalproduct p
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id IN (SELECT code FROM temp_codes)
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          )
          SELECT 
            fp.id,
            fp.name,
            CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN fp.name ELSE g.name END AS display_name,
            fp.code_13_ref_id AS code_13_ref,
            g.category,
            g.brand_lab,
            ls.current_stock,
            ls.price_with_tax,
            ls.weighted_average_price,
            p."TVA" as tva_rate
          FROM 
            filtered_products fp
          JOIN
            data_internalproduct p ON fp.id = p.id
          LEFT JOIN 
            data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
          LEFT JOIN 
            latest_snapshot ls ON fp.id = ls.product_id
          WHERE 
            fp.row_num = 1
          ORDER BY display_name
          LIMIT $1
        `;
        params.push(limit);
      }
      
      const result = await client.query(query, params);
      
      // Nettoyer les tables temporaires
      if (pharmacyIds.length > 0) {
        await client.query('DROP TABLE IF EXISTS temp_pharmacies');
      }
      if (codes && codes.length > 0) {
        await client.query('DROP TABLE IF EXISTS temp_codes');
      }
      
      return NextResponse.json({
        count: result.rows.length,
        products: result.rows
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