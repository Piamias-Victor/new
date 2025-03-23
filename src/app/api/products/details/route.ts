// src/app/api/products/details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code13refs, 
      pharmacyIds, 
      allPharmacies,
      startDate, 
      endDate, 
      comparisonStartDate, 
      comparisonEndDate 
    } = body;
    
    // Vérifier que les codes EAN13 sont fournis
    if (!code13refs || code13refs.length === 0) {
      return NextResponse.json(
        { error: 'Les codes EAN13 sont requis' },
        { status: 400 }
      );
    }
    
    const client = await pool.connect();
    
    try {
      // Construire les paramètres de requête
      let params: any[] = [startDate, endDate, comparisonStartDate || startDate, comparisonEndDate || endDate];
      let paramOffset = params.length + 1;
      
      // Placeholders pour les codes EAN13
      const codePlaceholders = code13refs.map((_, i) => `$${paramOffset + i}`).join(',');
      params.push(...code13refs);
      paramOffset += code13refs.length;
      
      // Condition pour le filtrage par pharmacie
      let pharmacyCondition = '';
      if (!allPharmacies && pharmacyIds && pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, i) => `$${paramOffset + i}`).join(',');
        pharmacyCondition = `AND p.pharmacy_id IN (${pharmacyPlaceholders})`;
        params.push(...pharmacyIds);
      }
      
      const query = `
        WITH current_period AS (
          -- Données pour la période actuelle
          SELECT
            p.id,
            p.name AS product_name,
            g.name AS global_name,
            CASE WHEN g.name IS NULL OR g.name = '' THEN p.name ELSE g.name END AS display_name,
            g.brand_lab,
            g.code_13_ref,
            SUM(s.quantity) AS sales_quantity,
            -- Prix de vente TTC
            MAX(i.price_with_tax) AS sell_out_price_ttc,
            -- Prix d'achat HT
            MAX(i.weighted_average_price) AS sell_in_price_ht,
            -- Taux de TVA (pour conversion HT/TTC)
            COALESCE(MAX(p."TVA"), 20) AS tva_rate,
            -- Quantité en stock actuelle
            SUM(i.stock) AS stock_quantity,
            -- Valeur du stock HT
            SUM(i.stock * i.weighted_average_price) AS stock_value_ht,
            -- CA total TTC (sell-out)
            SUM(s.quantity * i.price_with_tax) AS total_sell_out,
            -- CA total HT (sell-in)
            SUM(s.quantity * i.weighted_average_price) AS total_sell_in
          FROM
            data_internalproduct p
          JOIN
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN
            data_sales s ON s.product_id = i.id AND s.date BETWEEN $1 AND $2
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE
            g.code_13_ref IN (${codePlaceholders})
            ${pharmacyCondition}
          GROUP BY
            p.id, p.name, g.name, g.brand_lab, g.code_13_ref
        ),
        previous_period AS (
          -- Données pour la période de comparaison
          SELECT
            p.id,
            SUM(s.quantity) AS sales_quantity
          FROM
            data_internalproduct p
          JOIN
            data_inventorysnapshot i ON p.id = i.product_id
          LEFT JOIN
            data_sales s ON s.product_id = i.id AND s.date BETWEEN $3 AND $4
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          WHERE
            g.code_13_ref IN (${codePlaceholders})
            ${pharmacyCondition}
          GROUP BY
            p.id
        ),
        -- Agréger par code EAN13 pour éviter les doublons
        product_aggregated AS (
          SELECT
            g.code_13_ref,
            CASE WHEN g.name IS NULL OR g.name = '' THEN MAX(p.name) ELSE MAX(g.name) END AS display_name,
            MAX(g.brand_lab) AS brand_lab,
            SUM(cp.sales_quantity) AS sales_quantity,
            -- Prix moyen pondéré
            SUM(cp.sell_out_price_ttc * cp.sales_quantity) / NULLIF(SUM(cp.sales_quantity), 0) AS sell_out_price_ttc,
            SUM(cp.sell_in_price_ht * cp.sales_quantity) / NULLIF(SUM(cp.sales_quantity), 0) AS sell_in_price_ht,
            -- Taux TVA moyen
            AVG(cp.tva_rate) AS tva_rate,
            -- Stock total
            SUM(cp.stock_quantity) AS stock_quantity,
            SUM(cp.stock_value_ht) AS stock_value_ht,
            -- Totaux ventes 
            SUM(cp.total_sell_out) AS total_sell_out, 
            SUM(cp.total_sell_in) AS total_sell_in,
            -- Ventes période précédente
            SUM(pp.sales_quantity) AS previous_sales_quantity
          FROM
            current_period cp
          LEFT JOIN
            previous_period pp ON cp.id = pp.id
          JOIN
            data_internalproduct p ON cp.id = p.id
          LEFT JOIN
            data_globalproduct g ON p.code_13_ref_id = g.code_13_ref
          GROUP BY
            g.code_13_ref
        )
        SELECT
          pa.code_13_ref AS id,
          pa.display_name,
          pa.code_13_ref,
          pa.sell_out_price_ttc,
          pa.brand_lab,
          pa.sell_in_price_ht,
          -- Calcul de la marge en pourcentage 
          CASE 
            WHEN pa.sell_out_price_ttc > 0 THEN
              ROUND(((pa.sell_out_price_ttc / (1 + pa.tva_rate/100)) - pa.sell_in_price_ht) / (pa.sell_out_price_ttc / (1 + pa.tva_rate/100)) * 100, 2)
            ELSE 0
          END AS margin_percentage,
          -- Montant de la marge brute par unité
          ROUND((pa.sell_out_price_ttc / (1 + pa.tva_rate/100)) - pa.sell_in_price_ht, 2) AS margin_amount,
          pa.stock_value_ht,
          pa.stock_quantity,
          pa.sales_quantity,
          COALESCE(pa.previous_sales_quantity, 0) AS previous_sales_quantity,
          -- Calcul de l'évolution des ventes en pourcentage
          CASE 
            WHEN COALESCE(pa.previous_sales_quantity, 0) > 0 THEN
              ROUND(((pa.sales_quantity - pa.previous_sales_quantity) / pa.previous_sales_quantity) * 100, 1)
            ELSE 
              CASE WHEN pa.sales_quantity > 0 THEN 100 ELSE 0 END
          END AS sales_evolution_percentage,
          pa.total_sell_out,
          pa.total_sell_in
        FROM
          product_aggregated pa
        ORDER BY
          pa.sales_quantity DESC, pa.display_name
      `;
      
      const result = await client.query(query, params);
      
      return NextResponse.json({
        products: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails produits:', error);
    return NextResponse.json(
      { error: 'Erreur serveur', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    );
  }
}