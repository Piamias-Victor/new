// src/app/api/products/price-comparison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pharmacyIds = [], code13refs = [] } = body;

    const client = await pool.connect();
    
    try {
      // Requête pour comparer les prix des produits avec la moyenne du groupement
      const query = `
        WITH pharmacy_products AS (
          SELECT 
            ip.id,
            ip.name AS display_name,
            gp.code_13_ref,
            gp.brand_lab,
            gp.category,
            i.price_with_tax AS price,
            i.product_id
          FROM 
            data_internalproduct ip
          JOIN 
            data_inventorysnapshot i ON ip.id = i.product_id
          JOIN 
            data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
          WHERE 
            ($1::uuid[] IS NULL OR ip.pharmacy_id = ANY($1))
            AND ($2::text[] IS NULL OR gp.code_13_ref = ANY($2))
            AND i.date = (
              SELECT MAX(date) 
              FROM data_inventorysnapshot 
              WHERE product_id = ip.id
            )
        ),
        average_prices AS (
          SELECT 
            gp.code_13_ref,
            AVG(i.price_with_tax) AS avg_price,
            MIN(i.price_with_tax) AS min_price,
            MAX(i.price_with_tax) AS max_price
          FROM 
            data_internalproduct ip
          JOIN 
            data_inventorysnapshot i ON ip.id = i.product_id
          JOIN 
            data_globalproduct gp ON ip.code_13_ref_id = gp.code_13_ref
          WHERE 
            i.date = (
              SELECT MAX(date) 
              FROM data_inventorysnapshot 
              WHERE product_id = ip.id
            )
          GROUP BY 
            gp.code_13_ref
        ),
        product_data AS (
          SELECT 
            pp.id,
            pp.display_name,
            pp.code_13_ref,
            pp.brand_lab,
            pp.category,
            pp.price,
            ap.avg_price,
            ap.min_price,
            ap.max_price,
            CASE 
              WHEN ap.avg_price = 0 THEN 0
              ELSE ((pp.price - ap.avg_price) / ap.avg_price) * 100 
            END AS price_difference_percentage
          FROM 
            pharmacy_products pp
          JOIN 
            average_prices ap ON pp.code_13_ref = ap.code_13_ref
        ),
        -- Agrégation par code EAN13 pour éviter les doublons
        aggregated_ean AS (
          SELECT
            code_13_ref,
            (array_agg(display_name ORDER BY id))[1] AS display_name,
            MAX(brand_lab) AS brand_lab,
            MAX(category) AS category,
            -- Utiliser la moyenne des prix pour les produits ayant le même code EAN13
            AVG(price) AS price,
            AVG(avg_price) AS avg_price,
            MIN(min_price) AS min_price,
            MAX(max_price) AS max_price,
            -- Recalculer l'écart de prix en pourcentage
            CASE 
              WHEN AVG(avg_price) = 0 THEN 0
              ELSE ((AVG(price) - AVG(avg_price)) / AVG(avg_price)) * 100 
            END AS price_difference_percentage
          FROM
            product_data
          GROUP BY
            code_13_ref
        )
        SELECT
          code_13_ref AS id,
          display_name,
          code_13_ref,
          brand_lab,
          category,
          price,
          avg_price,
          min_price,
          max_price,
          price_difference_percentage
        FROM
          aggregated_ean
      `;
      
      const result = await client.query(query, [
        pharmacyIds.length > 0 ? pharmacyIds : null,
        code13refs.length > 0 ? code13refs : null
      ]);
      
      // Classement des produits selon leur écart de prix
      const veryLowPrice = [];
      const lowPrice = [];
      const averagePrice = [];
      const highPrice = [];
      const veryHighPrice = [];
      
      result.rows.forEach(product => {
        const diff = parseFloat(product.price_difference_percentage);
        if (diff < -15) {
          veryLowPrice.push(product);
        } else if (diff < -5) {
          lowPrice.push(product);
        } else if (diff <= 5) {
          averagePrice.push(product);
        } else if (diff <= 15) {
          highPrice.push(product);
        } else {
          veryHighPrice.push(product);
        }
      });
      
      return NextResponse.json({
        veryLowPrice,
        lowPrice,
        averagePrice,
        highPrice,
        veryHighPrice
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la comparaison des prix:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la comparaison des prix', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}