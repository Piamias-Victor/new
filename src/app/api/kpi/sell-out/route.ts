// src/app/api/kpi/sell-out/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, comparisonStartDate, comparisonEndDate, pharmacyIds, code13refs } = body;

    // Vérification des paramètres
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: "Paramètres de date manquants" },
        { status: 400 }
      );
    }

    const query = `
      WITH filtered_products AS (
        SELECT 
          dip.id as internal_product_id,
          dgp.code_13_ref,
          dgp.tva_percentage
        FROM data_internalproduct dip
        JOIN data_globalproduct dgp ON dip.code_13_ref_id = dgp.code_13_ref
        WHERE ($1::uuid[] IS NULL OR dip.pharmacy_id = ANY($1))
          -- Condition de filtrage par code EAN13 si spécifié
          AND ($4::text[] IS NULL OR dgp.code_13_ref = ANY($4))
      ),
      
      current_sales AS (
        SELECT 
          SUM(ds.quantity) AS total_quantity,
          SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
          COUNT(DISTINCT dip.code_13_ref_id) AS unique_references,
          SUM((dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) * ds.quantity) AS total_margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.id = fp.internal_product_id
        WHERE ds.date BETWEEN $2 AND $3
          AND ($1::uuid[] IS NULL OR dip.pharmacy_id = ANY($1))
      ),
      
      comparison_sales AS (
        SELECT 
          SUM(ds.quantity) AS total_quantity,
          SUM(ds.quantity * dis.price_with_tax) AS total_revenue,
          COUNT(DISTINCT dip.code_13_ref_id) AS unique_references,
          SUM((dis.price_with_tax - (dis.weighted_average_price * (1 + (fp.tva_percentage / 100)))) * ds.quantity) AS total_margin
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN data_internalproduct dip ON dis.product_id = dip.id
        JOIN filtered_products fp ON dip.id = fp.internal_product_id
        WHERE ds.date BETWEEN $5 AND $6
          AND ($1::uuid[] IS NULL OR dip.pharmacy_id = ANY($1))
      )
      
      SELECT 
        COALESCE((SELECT total_revenue FROM current_sales), 0) AS current_revenue,
        COALESCE((SELECT total_quantity FROM current_sales), 0) AS current_quantity,
        COALESCE((SELECT unique_references FROM current_sales), 0) AS current_references,
        COALESCE((SELECT total_margin FROM current_sales), 0) AS current_margin,
        
        COALESCE((SELECT total_revenue FROM comparison_sales), 0) AS comparison_revenue,
        COALESCE((SELECT total_quantity FROM comparison_sales), 0) AS comparison_quantity,
        COALESCE((SELECT unique_references FROM comparison_sales), 0) AS comparison_references,
        COALESCE((SELECT total_margin FROM comparison_sales), 0) AS comparison_margin
    `;

    const params = [
      pharmacyIds && pharmacyIds.length > 0 ? pharmacyIds : null,
      startDate,
      endDate,
      code13refs && code13refs.length > 0 ? code13refs : null,
      comparisonStartDate,
      comparisonEndDate,
    ];

    const client = await pool.connect();
    
    try {
      const { rows } = await client.query(query, params);

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Aucune donnée trouvée" },
          { status: 404 }
        );
      }

      const data = rows[0];
      
      // Calcul des taux de marge
      const currentMarginPercentage = data.current_revenue > 0 
        ? (data.current_margin / data.current_revenue) * 100 
        : 0;
        
      const comparisonMarginPercentage = data.comparison_revenue > 0 
        ? (data.comparison_margin / data.comparison_revenue) * 100 
        : 0;

      // Calcul des évolutions
      const revenueEvolution = data.comparison_revenue > 0 
        ? ((data.current_revenue - data.comparison_revenue) / data.comparison_revenue) * 100 
        : 0;
        
      const quantityEvolution = data.comparison_quantity > 0 
        ? ((data.current_quantity - data.comparison_quantity) / data.comparison_quantity) * 100 
        : 0;
        
      const referencesEvolution = data.comparison_references > 0 
        ? ((data.current_references - data.comparison_references) / data.comparison_references) * 100 
        : 0;
        
      const marginEvolution = data.comparison_margin > 0 
        ? ((data.current_margin - data.comparison_margin) / data.comparison_margin) * 100 
        : 0;
        
      // Différence en points de pourcentage pour le taux de marge
      const marginPercentagePoints = currentMarginPercentage - comparisonMarginPercentage;

      // Préparation des strings d'affichage avec signes +/-
      const revenueDisplayValue = `${revenueEvolution >= 0 ? '+' : ''}${revenueEvolution.toFixed(1)}%`;
      const quantityDisplayValue = `${quantityEvolution >= 0 ? '+' : ''}${quantityEvolution.toFixed(1)}%`;
      const referencesDisplayValue = `${referencesEvolution >= 0 ? '+' : ''}${referencesEvolution.toFixed(1)}%`;
      const marginDisplayValue = `${marginEvolution >= 0 ? '+' : ''}${marginEvolution.toFixed(1)}%`;
      const marginPointsDisplayValue = `${marginPercentagePoints >= 0 ? '+' : ''}${marginPercentagePoints.toFixed(1)} pts`;

      const response = {
        current: {
          revenue: parseFloat(data.current_revenue) || 0,
          quantity: parseInt(data.current_quantity) || 0,
          uniqueReferences: parseInt(data.current_references) || 0,
          margin: parseFloat(data.current_margin) || 0,
          marginPercentage: currentMarginPercentage
        },
        comparison: {
          revenue: parseFloat(data.comparison_revenue) || 0,
          quantity: parseInt(data.comparison_quantity) || 0,
          uniqueReferences: parseInt(data.comparison_references) || 0,
          margin: parseFloat(data.comparison_margin) || 0,
          marginPercentage: comparisonMarginPercentage,
          evolution: {
            revenue: { 
              value: parseFloat(data.current_revenue) - parseFloat(data.comparison_revenue),
              percentage: revenueEvolution,
              isPositive: revenueEvolution >= 0,
              displayValue: revenueDisplayValue
            },
            quantity: { 
              value: parseInt(data.current_quantity) - parseInt(data.comparison_quantity),
              percentage: quantityEvolution,
              isPositive: quantityEvolution >= 0,
              displayValue: quantityDisplayValue
            },
            uniqueReferences: { 
              value: parseInt(data.current_references) - parseInt(data.comparison_references),
              percentage: referencesEvolution,
              isPositive: referencesEvolution >= 0,
              displayValue: referencesDisplayValue
            },
            margin: { 
              value: parseFloat(data.current_margin) - parseFloat(data.comparison_margin),
              percentage: marginEvolution,
              isPositive: marginEvolution >= 0,
              displayValue: marginDisplayValue
            },
            marginPercentage: { 
              points: marginPercentagePoints,
              isPositive: marginPercentagePoints >= 0,
              displayValue: marginPointsDisplayValue
            }
          }
        }
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données de vente:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}