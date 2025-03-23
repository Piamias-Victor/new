// src/app/api/products/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  // Pour Next.js 14+, nous devons attendre les paramètres
  const { code } = params;
  const code13ref = code;
  
  // Récupération des dates de début et fin depuis les paramètres de requête
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!code13ref) {
    return NextResponse.json(
      { error: 'Le code EAN est requis' },
      { status: 400 }
    );
  }

  try {
    const client = await pool.connect();
    
    try {
      let periodQuery = '';
      let periodParams = [];
      
      // Si les dates sont spécifiées, nous les utilisons pour le calcul de la rotation
      if (startDate && endDate) {
        // Version corrigée du calcul des jours sans utiliser l'addition avec INTERVAL
        periodQuery = `
          WITH period_sales AS (
            SELECT 
              SUM(s.quantity) AS total_quantity,
              (EXTRACT(EPOCH FROM ($3::timestamp)) - EXTRACT(EPOCH FROM ($2::timestamp))) / 86400 + 1 AS days_count
            FROM 
              data_inventorysnapshot i
            JOIN 
              data_internalproduct ip ON i.product_id = ip.id
            JOIN 
              data_sales s ON s.product_id = i.id
            WHERE 
              ip.code_13_ref_id = $1
              AND s.date BETWEEN $2 AND $3
          )
          SELECT 
            COALESCE(ps.total_quantity, 0) AS total_quantity,
            COALESCE(ps.days_count, 0) AS days_count,
            CASE 
              WHEN COALESCE(ps.days_count, 0) > 0 THEN 
                -- Extrapolation sur une année (365 jours)
                (COALESCE(ps.total_quantity, 0) / ps.days_count) * 365 / 12
              ELSE 0
            END AS extrapolated_monthly_rotation
          FROM 
            period_sales ps
        `;
        periodParams = [code13ref, startDate, endDate];
      } else {
        // Si les dates ne sont pas spécifiées, nous utilisons une période par défaut (3 derniers mois)
        periodQuery = `
          WITH period_sales AS (
            SELECT 
              SUM(s.quantity) AS total_quantity,
              90 AS days_count -- Période par défaut de 3 mois (90 jours)
            FROM 
              data_inventorysnapshot i
            JOIN 
              data_internalproduct ip ON i.product_id = ip.id
            JOIN 
              data_sales s ON s.product_id = i.id
            WHERE 
              ip.code_13_ref_id = $1
              AND s.date >= CURRENT_DATE - INTERVAL '90 days'
          )
          SELECT 
            COALESCE(ps.total_quantity, 0) AS total_quantity,
            COALESCE(ps.days_count, 0) AS days_count,
            CASE 
              WHEN COALESCE(ps.days_count, 0) > 0 THEN 
                -- Extrapolation sur une année (365 jours)
                (COALESCE(ps.total_quantity, 0) / ps.days_count) * 365 / 12
              ELSE 0
            END AS extrapolated_monthly_rotation
          FROM 
            period_sales ps
        `;
        periodParams = [code13ref];
      }
      
      // Requête pour les données de rotation
      const rotationResult = await client.query(periodQuery, periodParams);
      const rotationData = rotationResult.rows[0] || { extrapolated_monthly_rotation: 0 };
      
      // Requête pour les informations du produit
      const productQuery = `
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
          ) AS first_seen_date
        FROM 
          data_globalproduct gp
        WHERE 
          gp.code_13_ref = $1
      `;
      
      const productResult = await client.query(productQuery, [code13ref]);
      
      if (productResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Produit non trouvé' },
          { status: 404 }
        );
      }
      
      const product = productResult.rows[0];
      
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
        // Utilisation de la rotation extrapolée
        avg_monthly_rotation: parseFloat(rotationData.extrapolated_monthly_rotation || 0)
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