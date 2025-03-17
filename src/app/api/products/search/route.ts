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
    const limit = parseInt(searchParams.get('limit') || '200');
    
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
          CREATE TEMP TABLE IF NOT EXISTS temp_pharmacies (
            pharmacy_id UUID
          )
        `);
        
        // Nettoyer la table temporaire avant d'insérer de nouvelles valeurs
        await client.query(`DELETE FROM temp_pharmacies`);
        
        const pharmacyValues = pharmacyIds.map(id => `('${id}')`).join(',');
        if (pharmacyValues.length > 0) {
          await client.query(`
            INSERT INTO temp_pharmacies (pharmacy_id)
            VALUES ${pharmacyValues}
          `);
        }
      }
      
      let query = '';
      let params: any[] = [];
      
      // Construction de la requête selon le type de recherche
      if (name) {
        // Recherche par nom avec priorité aux correspondances exactes
        let relevanceQuery;
        
        if (usesTrgm) {
          // Utiliser pg_trgm pour la similarité si disponible avec priorité aux correspondances exactes
          relevanceQuery = `
            CASE 
              WHEN LOWER(p.name) = LOWER($1) THEN 1000
              WHEN LOWER(g.name) = LOWER($1) THEN 900
              WHEN LOWER(p.name) LIKE LOWER($1 || ' %') THEN 800
              WHEN LOWER(g.name) LIKE LOWER($1 || ' %') THEN 700
              WHEN LOWER(p.name) LIKE LOWER('% ' || $1 || ' %') THEN 600
              WHEN LOWER(g.name) LIKE LOWER('% ' || $1 || ' %') THEN 500
              WHEN LOWER(p.name) LIKE LOWER($1 || '%') THEN 400
              WHEN LOWER(g.name) LIKE LOWER($1 || '%') THEN 350
              WHEN LOWER(p.name) LIKE LOWER('%' || $1 || '%') THEN 300
              WHEN LOWER(g.name) LIKE LOWER('%' || $1 || '%') THEN 250
              WHEN similarity(LOWER(p.name), LOWER($1)) > 0.4 THEN 200 * similarity(LOWER(p.name), LOWER($1))
              WHEN similarity(LOWER(g.name), LOWER($1)) > 0.4 THEN 150 * similarity(LOWER(g.name), LOWER($1))
              ELSE 10
            END as relevance
          `;
        } else {
          // Version sans pg_trgm avec priorité aux correspondances exactes
          relevanceQuery = `
            CASE 
              WHEN LOWER(p.name) = LOWER($1) THEN 1000
              WHEN LOWER(g.name) = LOWER($1) THEN 900  
              WHEN LOWER(p.name) LIKE LOWER($1 || ' %') THEN 800
              WHEN LOWER(g.name) LIKE LOWER($1 || ' %') THEN 700
              WHEN LOWER(p.name) LIKE LOWER('% ' || $1 || ' %') THEN 600
              WHEN LOWER(g.name) LIKE LOWER('% ' || $1 || ' %') THEN 500
              WHEN LOWER(p.name) LIKE LOWER($1 || '%') THEN 400
              WHEN LOWER(g.name) LIKE LOWER($1 || '%') THEN 350
              WHEN LOWER(p.name) LIKE LOWER('%' || $1 || '%') THEN 300
              WHEN LOWER(g.name) LIKE LOWER('%' || $1 || '%') THEN 250
              ELSE 10
            END as relevance
          `;
        }
        
        // Recherche par nom avec groupement par code 13
        query = `
          WITH sales_data AS (
            SELECT 
              i.product_id,
              SUM(s.quantity) as total_quantity
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
            GROUP BY 
              i.product_id
          ),
          filtered_products AS (
            SELECT 
              p.id,
              p.name,
              p.code_13_ref_id,
              p.pharmacy_id,
              ${relevanceQuery}
            FROM 
              data_internalproduct p
            LEFT JOIN 
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            WHERE 
              p.code_13_ref_id IS NOT NULL  -- Filtrer les produits sans code EAN
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
          ),
          grouped_products AS (
            SELECT
              fp.code_13_ref_id,
              (array_agg(fp.id ORDER BY fp.id))[1] as id,
              (array_agg(fp.name ORDER BY fp.id))[1] as name,
              (array_agg(CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN fp.name ELSE g.name END ORDER BY fp.id))[1] AS display_name,
              (array_agg(g.category ORDER BY fp.id))[1] as category,
              (array_agg(g.brand_lab ORDER BY fp.id))[1] as brand_lab,
              AVG(p."TVA") as tva_rate,
              SUM(ls.current_stock) as total_stock,
              AVG(ls.price_with_tax) as avg_price,
              AVG(ls.weighted_average_price) as avg_weighted_price,
              COUNT(DISTINCT p.pharmacy_id) as pharmacy_count,
              COUNT(DISTINCT CASE WHEN ls.current_stock > 0 THEN p.pharmacy_id END) as pharmacies_with_stock,
              (AVG(ls.price_with_tax) - AVG(ls.weighted_average_price)) / NULLIF(AVG(ls.weighted_average_price), 0) * 100 as avg_margin_percentage,
              SUM(COALESCE(sd.total_quantity, 0)) as total_sales,
              MAX(fp.relevance) as relevance
            FROM 
              filtered_products fp
            JOIN
              data_internalproduct p ON fp.id = p.id
            LEFT JOIN 
              data_globalproduct g ON fp.code_13_ref_id = g.code_13_ref
            LEFT JOIN 
              latest_snapshot ls ON fp.id = ls.product_id
            LEFT JOIN
              sales_data sd ON fp.id = sd.product_id
            GROUP BY
              fp.code_13_ref_id
          )
          SELECT 
            id,
            name,
            display_name,
            code_13_ref_id AS code_13_ref,
            category,
            brand_lab,
            tva_rate,
            total_stock as current_stock,
            avg_price as price_with_tax,
            avg_weighted_price as weighted_average_price,
            pharmacy_count,
            pharmacies_with_stock,
            ROUND(avg_margin_percentage::numeric, 2) as margin_percentage,
            total_sales,
            relevance
          FROM 
            grouped_products
          ORDER BY relevance DESC, display_name
          LIMIT $2
        `;
        params.push(name, limit);
        
      } else if (code) {
        // Recherche par code EAN exact ou partiel avec groupement
        query = `
          WITH sales_data AS (
            SELECT 
              i.product_id,
              SUM(s.quantity) as total_quantity
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
            GROUP BY 
              i.product_id
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          ),
          filtered_pharmacies AS (
            SELECT DISTINCT pharmacy_id
            FROM data_internalproduct
            WHERE 
              code_13_ref_id IS NOT NULL
              AND code_13_ref_id LIKE $1 || '%'
              ${pharmacyIds.length > 0 ? 'AND pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
          ),
          grouped_products AS (
            SELECT
              p.code_13_ref_id,
              (array_agg(p.id ORDER BY p.id))[1] as id,
              (array_agg(p.name ORDER BY p.id))[1] as name,
              (array_agg(CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END ORDER BY p.id))[1] AS display_name,
              (array_agg(g.category ORDER BY p.id))[1] as category,
              (array_agg(g.brand_lab ORDER BY p.id))[1] as brand_lab,
              AVG(p."TVA") as tva_rate,
              SUM(ls.current_stock) as total_stock,
              AVG(ls.price_with_tax) as avg_price,
              AVG(ls.weighted_average_price) as avg_weighted_price,
              COUNT(DISTINCT p.pharmacy_id) as pharmacy_count,
              COUNT(DISTINCT CASE WHEN ls.current_stock > 0 THEN p.pharmacy_id END) as pharmacies_with_stock,
              (AVG(ls.price_with_tax) - AVG(ls.weighted_average_price)) / NULLIF(AVG(ls.weighted_average_price), 0) * 100 as avg_margin_percentage,
              SUM(COALESCE(sd.total_quantity, 0)) as total_sales
            FROM 
              data_internalproduct p
            LEFT JOIN 
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            LEFT JOIN 
              latest_snapshot ls ON p.id = ls.product_id
            LEFT JOIN
              sales_data sd ON p.id = sd.product_id
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id LIKE $1 || '%'
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
            GROUP BY
              p.code_13_ref_id
          )
          SELECT
            id,
            name,
            display_name,
            code_13_ref_id AS code_13_ref,
            category,
            brand_lab,
            tva_rate,
            total_stock as current_stock,
            avg_price as price_with_tax,
            avg_weighted_price as weighted_average_price,
            pharmacy_count,
            pharmacies_with_stock,
            ROUND(avg_margin_percentage::numeric, 2) as margin_percentage,
            total_sales
          FROM
            grouped_products
          ORDER BY 
            CASE WHEN code_13_ref_id = $1 THEN 0 ELSE 1 END,  -- Priorité aux correspondances exactes
            code_13_ref_id
          LIMIT $2
        `;
        params.push(code, limit);
        
      } else if (suffix) {
        // Recherche par suffixe de code avec groupement
        query = `
          WITH sales_data AS (
            SELECT 
              i.product_id,
              SUM(s.quantity) as total_quantity
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
            GROUP BY 
              i.product_id
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          ),
          grouped_products AS (
            SELECT
              p.code_13_ref_id,
              (array_agg(p.id ORDER BY p.id))[1] as id,
              (array_agg(p.name ORDER BY p.id))[1] as name,
              (array_agg(CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END ORDER BY p.id))[1] AS display_name,
              (array_agg(g.category ORDER BY p.id))[1] as category,
              (array_agg(g.brand_lab ORDER BY p.id))[1] as brand_lab,
              AVG(p."TVA") as tva_rate,
              SUM(ls.current_stock) as total_stock,
              AVG(ls.price_with_tax) as avg_price,
              AVG(ls.weighted_average_price) as avg_weighted_price,
              COUNT(DISTINCT p.pharmacy_id) as pharmacy_count,
              COUNT(DISTINCT CASE WHEN ls.current_stock > 0 THEN p.pharmacy_id END) as pharmacies_with_stock,
              (AVG(ls.price_with_tax) - AVG(ls.weighted_average_price)) / NULLIF(AVG(ls.weighted_average_price), 0) * 100 as avg_margin_percentage,
              SUM(COALESCE(sd.total_quantity, 0)) as total_sales
            FROM 
              data_internalproduct p
            LEFT JOIN 
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            LEFT JOIN 
              latest_snapshot ls ON p.id = ls.product_id
            LEFT JOIN
              sales_data sd ON p.id = sd.product_id
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id LIKE $1
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
            GROUP BY
              p.code_13_ref_id
          )
          SELECT
            id,
            name,
            display_name,
            code_13_ref_id AS code_13_ref,
            category,
            brand_lab,
            tva_rate,
            total_stock as current_stock,
            avg_price as price_with_tax,
            avg_weighted_price as weighted_average_price,
            pharmacy_count,
            pharmacies_with_stock,
            ROUND(avg_margin_percentage::numeric, 2) as margin_percentage,
            total_sales
          FROM
            grouped_products
          ORDER BY display_name
          LIMIT $2
        `;
        params.push(`%${suffix}`, limit);
        
      } else if (codes && codes.length > 0) {
        // Pour la recherche avec beaucoup de codes, utilisons aussi une table temporaire
        await client.query(`
          CREATE TEMP TABLE IF NOT EXISTS temp_codes (
            code VARCHAR(20)
          )
        `);
        
        // Nettoyer la table temporaire avant d'insérer de nouvelles valeurs
        await client.query(`DELETE FROM temp_codes`);
        
        // Insérer les codes en lot
        const codeValues = codes.map(code => `('${code}')`).join(',');
        if (codeValues.length > 0) {
          await client.query(`
            INSERT INTO temp_codes (code)
            VALUES ${codeValues}
          `);
        }
        
        // Recherche par liste de codes avec groupement
        query = `
          WITH sales_data AS (
            SELECT 
              i.product_id,
              SUM(s.quantity) as total_quantity
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN CURRENT_DATE - INTERVAL '30 days' AND CURRENT_DATE
            GROUP BY 
              i.product_id
          ),
          latest_snapshot AS (
            SELECT DISTINCT ON (product_id) 
              product_id,
              stock as current_stock,
              price_with_tax,
              weighted_average_price
            FROM data_inventorysnapshot
            ORDER BY product_id, date DESC
          ),
          grouped_products AS (
            SELECT
              p.code_13_ref_id,
              (array_agg(p.id ORDER BY p.id))[1] as id,
              (array_agg(p.name ORDER BY p.id))[1] as name,
              (array_agg(CASE WHEN g.name IS NULL OR g.name = 'Default Name' THEN p.name ELSE g.name END ORDER BY p.id))[1] AS display_name,
              (array_agg(g.category ORDER BY p.id))[1] as category,
              (array_agg(g.brand_lab ORDER BY p.id))[1] as brand_lab,
              AVG(p."TVA") as tva_rate,
              SUM(ls.current_stock) as total_stock,
              AVG(ls.price_with_tax) as avg_price,
              AVG(ls.weighted_average_price) as avg_weighted_price,
              COUNT(DISTINCT p.pharmacy_id) as pharmacy_count,
              COUNT(DISTINCT CASE WHEN ls.current_stock > 0 THEN p.pharmacy_id END) as pharmacies_with_stock,
              (AVG(ls.price_with_tax) - AVG(ls.weighted_average_price)) / NULLIF(AVG(ls.weighted_average_price), 0) * 100 as avg_margin_percentage,
              SUM(COALESCE(sd.total_quantity, 0)) as total_sales
            FROM 
              data_internalproduct p
            LEFT JOIN 
              data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
            LEFT JOIN 
              latest_snapshot ls ON p.id = ls.product_id
            LEFT JOIN
              sales_data sd ON p.id = sd.product_id
            WHERE 
              p.code_13_ref_id IS NOT NULL
              AND p.code_13_ref_id IN (SELECT code FROM temp_codes)
              ${pharmacyIds.length > 0 ? 'AND p.pharmacy_id IN (SELECT pharmacy_id FROM temp_pharmacies)' : ''}
            GROUP BY
              p.code_13_ref_id
          )
          SELECT
            id,
            name,
            display_name,
            code_13_ref_id AS code_13_ref,
            category,
            brand_lab,
            tva_rate,
            total_stock as current_stock,
            avg_price as price_with_tax,
            avg_weighted_price as weighted_average_price,
            pharmacy_count,
            pharmacies_with_stock,
            ROUND(avg_margin_percentage::numeric, 2) as margin_percentage,
            total_sales
          FROM
            grouped_products
          ORDER BY display_name
          LIMIT $1
        `;
        params.push(limit);
      }
      
      // Exécuter la requête
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