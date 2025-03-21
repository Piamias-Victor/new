// src/app/api/kpi/sell-in/route.ts
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

    // Requête modifiée pour prendre en compte toutes les commandes 
    // et filtrer par codes EAN13 si spécifié
    const query = `
      WITH filtered_global_products AS (
        SELECT code_13_ref
        FROM data_globalproduct
        WHERE ($4::text[] IS NULL OR code_13_ref = ANY($4))
      ),
      
      filtered_products AS (
        SELECT 
          dip.id as internal_product_id,
          dip.pharmacy_id
        FROM data_internalproduct dip
        LEFT JOIN filtered_global_products fgp ON dip.code_13_ref_id = fgp.code_13_ref
        WHERE ($1::uuid[] IS NULL OR dip.pharmacy_id = ANY($1))
          AND ($4::text[] IS NULL OR fgp.code_13_ref IS NOT NULL)
      ),
      
      -- Récupérer les derniers prix connus par produit
      latest_prices AS (
        SELECT DISTINCT ON (dis.product_id)
          dis.product_id,
          dis.weighted_average_price as cost_price
        FROM data_inventorysnapshot dis
        JOIN filtered_products fp ON dis.product_id = fp.internal_product_id
        ORDER BY dis.product_id, dis.date DESC
      ),
      
      -- Période actuelle
      current_data AS (
        SELECT 
          COUNT(DISTINCT dor.id) AS orders_count,
          SUM(dpo.qte) AS total_ordered,
          SUM(dpo.qte_r) AS total_received,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) ELSE 0 END
          ) AS stock_break_quantity,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) * COALESCE(lp.cost_price, 0) ELSE 0 END
          ) AS stock_break_amount,
          SUM(dpo.qte * COALESCE(lp.cost_price, 0)) AS purchase_amount
        FROM data_order dor
        JOIN data_productorder dpo ON dor.id = dpo.order_id
        JOIN filtered_products fp ON dpo.product_id = fp.internal_product_id
        LEFT JOIN latest_prices lp ON dpo.product_id = lp.product_id
        WHERE dor.sent_date BETWEEN $2 AND $3
          AND ($1::uuid[] IS NULL OR dor.pharmacy_id = ANY($1))
      ),
      
      -- Période de comparaison
      comparison_data AS (
        SELECT 
          COUNT(DISTINCT dor.id) AS orders_count,
          SUM(dpo.qte) AS total_ordered,
          SUM(dpo.qte_r) AS total_received,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) ELSE 0 END
          ) AS stock_break_quantity,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) * COALESCE(lp.cost_price, 0) ELSE 0 END
          ) AS stock_break_amount,
          SUM(dpo.qte * COALESCE(lp.cost_price, 0)) AS purchase_amount
        FROM data_order dor
        JOIN data_productorder dpo ON dor.id = dpo.order_id
        JOIN filtered_products fp ON dpo.product_id = fp.internal_product_id
        LEFT JOIN latest_prices lp ON dpo.product_id = lp.product_id
        WHERE dor.sent_date BETWEEN $5 AND $6
          AND ($1::uuid[] IS NULL OR dor.pharmacy_id = ANY($1))
      )
      
      SELECT 
        -- Données actuelles
        COALESCE((SELECT orders_count FROM current_data), 0) AS current_orders_count,
        COALESCE((SELECT total_ordered FROM current_data), 0) AS current_total_ordered,
        COALESCE((SELECT total_received FROM current_data), 0) AS current_total_received,
        COALESCE((SELECT stock_break_quantity FROM current_data), 0) AS current_stock_break_quantity,
        COALESCE((SELECT stock_break_amount FROM current_data), 0) AS current_stock_break_amount,
        COALESCE((SELECT purchase_amount FROM current_data), 0) AS current_purchase_amount,
        
        -- Données de comparaison
        COALESCE((SELECT orders_count FROM comparison_data), 0) AS comparison_orders_count,
        COALESCE((SELECT total_ordered FROM comparison_data), 0) AS comparison_total_ordered,
        COALESCE((SELECT total_received FROM comparison_data), 0) AS comparison_total_received,
        COALESCE((SELECT stock_break_quantity FROM comparison_data), 0) AS comparison_stock_break_quantity,
        COALESCE((SELECT stock_break_amount FROM comparison_data), 0) AS comparison_stock_break_amount,
        COALESCE((SELECT purchase_amount FROM comparison_data), 0) AS comparison_purchase_amount
    `;

    const params = [
      pharmacyIds && pharmacyIds.length > 0 ? pharmacyIds : null,
      startDate,
      endDate,
      code13refs && code13refs.length > 0 ? code13refs : null,
      comparisonStartDate,
      comparisonEndDate
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
      
      // Calcul des taux de rupture sur les commandes avec réception uniquement
      const currentStockBreakRate = data.current_total_ordered > 0 
        ? (data.current_stock_break_quantity / data.current_total_ordered) * 100 
        : 0;
        
      const comparisonStockBreakRate = data.comparison_total_ordered > 0 
        ? (data.comparison_stock_break_quantity / data.comparison_total_ordered) * 100 
        : 0;

      // Calcul des évolutions avec formatage pour l'affichage
      const purchaseAmountEvolution = {
        value: parseFloat(data.current_purchase_amount) - parseFloat(data.comparison_purchase_amount),
        percentage: parseFloat(data.comparison_purchase_amount) > 0 
          ? ((parseFloat(data.current_purchase_amount) - parseFloat(data.comparison_purchase_amount)) / parseFloat(data.comparison_purchase_amount)) * 100 
          : 0,
        isPositive: parseFloat(data.current_purchase_amount) >= parseFloat(data.comparison_purchase_amount),
        displayValue: `${((parseFloat(data.current_purchase_amount) - parseFloat(data.comparison_purchase_amount)) / (parseFloat(data.comparison_purchase_amount) || 1) * 100).toFixed(1)}%`
      };
      
      const purchaseQuantityEvolution = {
        value: parseInt(data.current_total_ordered) - parseInt(data.comparison_total_ordered),
        percentage: parseInt(data.comparison_total_ordered) > 0 
          ? ((parseInt(data.current_total_ordered) - parseInt(data.comparison_total_ordered)) / parseInt(data.comparison_total_ordered)) * 100 
          : 0,
        isPositive: parseInt(data.current_total_ordered) >= parseInt(data.comparison_total_ordered),
        displayValue: `${((parseInt(data.current_total_ordered) - parseInt(data.comparison_total_ordered)) / (parseInt(data.comparison_total_ordered) || 1) * 100).toFixed(1)}%`
      };
      
      const stockBreakAmountEvolution = {
        value: parseFloat(data.current_stock_break_amount) - parseFloat(data.comparison_stock_break_amount),
        percentage: parseFloat(data.comparison_stock_break_amount) > 0 
          ? ((parseFloat(data.current_stock_break_amount) - parseFloat(data.comparison_stock_break_amount)) / parseFloat(data.comparison_stock_break_amount)) * 100 
          : 0,
        isPositive: parseFloat(data.current_stock_break_amount) <= parseFloat(data.comparison_stock_break_amount), // Pour les ruptures, moins est mieux
        displayValue: `${((parseFloat(data.current_stock_break_amount) - parseFloat(data.comparison_stock_break_amount)) / (parseFloat(data.comparison_stock_break_amount) || 1) * 100).toFixed(1)}%`
      };
      
      const stockBreakQuantityEvolution = {
        value: parseInt(data.current_stock_break_quantity) - parseInt(data.comparison_stock_break_quantity),
        percentage: parseInt(data.comparison_stock_break_quantity) > 0 
          ? ((parseInt(data.current_stock_break_quantity) - parseInt(data.comparison_stock_break_quantity)) / parseInt(data.comparison_stock_break_quantity)) * 100 
          : 0,
        isPositive: parseInt(data.current_stock_break_quantity) <= parseInt(data.comparison_stock_break_quantity), // Pour les ruptures, moins est mieux
        displayValue: `${((parseInt(data.current_stock_break_quantity) - parseInt(data.comparison_stock_break_quantity)) / (parseInt(data.comparison_stock_break_quantity) || 1) * 100).toFixed(1)}%`
      };
      
      const stockBreakRateEvolution = {
        points: currentStockBreakRate - comparisonStockBreakRate,
        isPositive: currentStockBreakRate <= comparisonStockBreakRate, // Pour le taux de rupture, moins est mieux
        displayValue: `${(currentStockBreakRate - comparisonStockBreakRate).toFixed(1)}%`
      };
      
      const ordersEvolution = {
        value: parseInt(data.current_orders_count) - parseInt(data.comparison_orders_count),
        percentage: parseInt(data.comparison_orders_count) > 0 
          ? ((parseInt(data.current_orders_count) - parseInt(data.comparison_orders_count)) / parseInt(data.comparison_orders_count)) * 100 
          : 0,
        isPositive: parseInt(data.current_orders_count) <= parseInt(data.comparison_orders_count), // Pour les commandes, moins est mieux (efficacité)
        displayValue: `${((parseInt(data.current_orders_count) - parseInt(data.comparison_orders_count)) / (parseInt(data.comparison_orders_count) || 1) * 100).toFixed(1)}%`
      };

      const response = {
        current: {
          purchaseAmount: parseFloat(data.current_purchase_amount),
          purchaseQuantity: parseInt(data.current_total_ordered), // Changement ici
          stockBreakAmount: parseFloat(data.current_stock_break_amount),
          stockBreakQuantity: parseInt(data.current_stock_break_quantity),
          stockBreakRate: currentStockBreakRate,
          ordersCount: parseInt(data.current_orders_count)
        },
        comparison: {
          purchaseAmount: parseFloat(data.comparison_purchase_amount),
          purchaseQuantity: parseInt(data.comparison_total_ordered), // Changement ici
          stockBreakAmount: parseFloat(data.comparison_stock_break_amount),
          stockBreakQuantity: parseInt(data.comparison_stock_break_quantity),
          stockBreakRate: comparisonStockBreakRate,
          ordersCount: parseInt(data.comparison_orders_count),
          evolution: {
            purchaseAmount: purchaseAmountEvolution,
            purchaseQuantity: purchaseQuantityEvolution,
            stockBreakAmount: stockBreakAmountEvolution,
            stockBreakQuantity: stockBreakQuantityEvolution,
            stockBreakRate: stockBreakRateEvolution,
            orders: ordersEvolution
          }
        }
      };

      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'achat:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error instanceof Error ? error.message : "Erreur inconnue" },
      { status: 500 }
    );
  }
}