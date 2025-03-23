// src/app/api/products/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  const code13ref = params.code;

  if (!code13ref) {
    return NextResponse.json(
      { error: 'Le code EAN est requis' },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    
    try {
      // Requête pour récupérer les informations du produit
      const query = `
        SELECT 
          gp.code_13_ref,
          gp.name,
          gp.universe,
          gp.category,
          gp.sub_category,
          gp.family,
          gp.sub_family,
          gp.brand_lab,
          gp.range_name,
          (
            SELECT MIN(created_at)::date
            FROM data_internalproduct 
            WHERE code_13_ref_id = gp.code_13_ref
          ) AS first_seen_date,
          (
            SELECT COALESCE(AVG(s.quantity), 0)
            FROM data_inventorysnapshot i
            JOIN data_internalproduct ip ON i.product_id = ip.id
            JOIN data_sales s ON s.product_id = i.id
            WHERE ip.code_13_ref_id = gp.code_13_ref
            AND s.date >= NOW() - INTERVAL '6 months'
            GROUP BY ip.code_13_ref_id
          ) AS avg_monthly_rotation
        FROM 
          data_globalproduct gp
        WHERE 
          gp.code_13_ref = $1
      `;
      
      const result = await client.query(query, [code13ref]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        );
      }
      
      const product = result.rows[0];
      
      return NextResponse.json({ 
        id: product.code_13_ref, // Utiliser le code EAN comme ID
        code_13_ref: product.code_13_ref,
        name: product.name,
        universe: product.universe,
        category: product.category,
        sub_category: product.sub_category,
        family: product.family,
        sub_family: product.sub_family,
        brand_lab: product.brand_lab,
        range_name: product.range_name,
        first_seen_date: product.first_seen_date,
        avg_monthly_rotation: parseFloat(product.avg_monthly_rotation || 0)
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des informations du produit:', error);
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}