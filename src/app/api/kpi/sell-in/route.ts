// src/app/api/kpi/sell-in/route.ts - version corrigée
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db"; // Ajustez selon votre configuration

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startDate, endDate, comparisonStartDate, comparisonEndDate, pharmacyIds } = body;

    // Vérification des paramètres
    if (!startDate || !endDate || !comparisonStartDate || !comparisonEndDate) {
      return NextResponse.json(
        { error: "Paramètres de date manquants" },
        { status: 400 }
      );
    }

    // Requête modifiée pour ne prendre en compte que les commandes avec quantité reçue > 0
    const query = `
      WITH filtered_orders AS (
        SELECT 
          dor.id as order_id,
          dor.pharmacy_id
        FROM data_order dor
        WHERE ($1::uuid[] IS NULL OR dor.pharmacy_id = ANY($1))
          AND dor.step >= 3  -- Commandes envoyées
      ),
      
      -- Récupérer les derniers prix connus par produit
      latest_prices AS (
        SELECT DISTINCT ON (dis.product_id)
          dis.product_id,
          dis.weighted_average_price as cost_price
        FROM data_inventorysnapshot dis
        ORDER BY dis.product_id, dis.date DESC
      ),
      
      -- Période actuelle
      current_data AS (
        SELECT 
          COUNT(DISTINCT fo.order_id) AS orders_count,
          SUM(dpo.qte) AS total_ordered,
          SUM(dpo.qte_r) AS total_received,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) ELSE 0 END
          ) AS stock_break_quantity,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) * COALESCE(lp.cost_price, 0) ELSE 0 END
          ) AS stock_break_amount,
          SUM(dpo.qte_r * COALESCE(lp.cost_price, 0)) AS purchase_amount
        FROM filtered_orders fo
        JOIN data_order dor ON fo.order_id = dor.id
        JOIN data_productorder dpo ON dor.id = dpo.order_id
        LEFT JOIN latest_prices lp ON dpo.product_id = lp.product_id
        WHERE dor.sent_date BETWEEN $2 AND $3
      ),
      
      -- Période de comparaison
      comparison_data AS (
        SELECT 
          COUNT(DISTINCT fo.order_id) AS orders_count,
          SUM(dpo.qte) AS total_ordered,
          SUM(dpo.qte_r) AS total_received,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) ELSE 0 END
          ) AS stock_break_quantity,
          SUM(
            CASE WHEN dpo.qte_r > 0 THEN GREATEST(0, dpo.qte - dpo.qte_r) * COALESCE(lp.cost_price, 0) ELSE 0 END
          ) AS stock_break_amount,
          SUM(dpo.qte_r * COALESCE(lp.cost_price, 0)) AS purchase_amount
        FROM filtered_orders fo
        JOIN data_order dor ON fo.order_id = dor.id
        JOIN data_productorder dpo ON dor.id = dpo.order_id
        LEFT JOIN latest_prices lp ON dpo.product_id = lp.product_id
        WHERE dor.sent_date BETWEEN $4 AND $5
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

    const { rows } = await pool.query(query, [
      pharmacyIds && pharmacyIds.length > 0 ? pharmacyIds : null,
      startDate,
      endDate,
      comparisonStartDate,
      comparisonEndDate
    ]);

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée trouvée" }, 
        { status: 404 }
      );
    }

    const data = rows[0];
    
    // Calcul des taux de rupture sur les commandes avec réception uniquement
    const currentStockBreakRate = data.current_total_received > 0 
      ? (data.current_stock_break_quantity / data.current_total_ordered) * 100 
      : 0;
      
    const comparisonStockBreakRate = data.comparison_total_received > 0 
      ? (data.comparison_stock_break_quantity / data.comparison_total_ordered) * 100 
      : 0;

    // Calcul des évolutions
    const purchaseAmountEvolution = {
      value: data.current_purchase_amount - data.comparison_purchase_amount,
      percentage: data.comparison_purchase_amount > 0 
        ? ((data.current_purchase_amount - data.comparison_purchase_amount) / data.comparison_purchase_amount) * 100 
        : 0,
      isPositive: data.current_purchase_amount >= data.comparison_purchase_amount
    };
    
    const purchaseQuantityEvolution = {
      value: data.current_total_received - data.comparison_total_received,
      percentage: data.comparison_total_received > 0 
        ? ((data.current_total_received - data.comparison_total_received) / data.comparison_total_received) * 100 
        : 0,
      isPositive: data.current_total_received >= data.comparison_total_received
    };
    
    const stockBreakAmountEvolution = {
      value: data.current_stock_break_amount - data.comparison_stock_break_amount,
      percentage: data.comparison_stock_break_amount > 0 
        ? ((data.current_stock_break_amount - data.comparison_stock_break_amount) / data.comparison_stock_break_amount) * 100 
        : 0,
      isPositive: data.current_stock_break_amount <= data.comparison_stock_break_amount // Note: Lower is better for stock breaks
    };
    
    const stockBreakQuantityEvolution = {
      value: data.current_stock_break_quantity - data.comparison_stock_break_quantity,
      percentage: data.comparison_stock_break_quantity > 0 
        ? ((data.current_stock_break_quantity - data.comparison_stock_break_quantity) / data.comparison_stock_break_quantity) * 100 
        : 0,
      isPositive: data.current_stock_break_quantity <= data.comparison_stock_break_quantity // Note: Lower is better for stock breaks
    };
    
    const stockBreakRateEvolution = {
      points: currentStockBreakRate - comparisonStockBreakRate,
      isPositive: currentStockBreakRate <= comparisonStockBreakRate // Note: Lower is better for stock break rate
    };
    
    const ordersEvolution = {
      value: data.current_orders_count - data.comparison_orders_count,
      percentage: data.comparison_orders_count > 0 
        ? ((data.current_orders_count - data.comparison_orders_count) / data.comparison_orders_count) * 100 
        : 0,
      isPositive: data.current_orders_count >= data.comparison_orders_count
    };

    const response = {
      current: {
        purchaseAmount: data.current_purchase_amount,
        purchaseQuantity: data.current_total_received,
        stockBreakAmount: data.current_stock_break_amount,
        stockBreakQuantity: data.current_stock_break_quantity,
        stockBreakRate: currentStockBreakRate,
        ordersCount: data.current_orders_count
      },
      comparison: {
        purchaseAmount: data.comparison_purchase_amount,
        purchaseQuantity: data.comparison_total_received,
        stockBreakAmount: data.comparison_stock_break_amount,
        stockBreakQuantity: data.comparison_stock_break_quantity,
        stockBreakRate: comparisonStockBreakRate,
        ordersCount: data.comparison_orders_count
      },
      evolution: {
        purchaseAmount: purchaseAmountEvolution,
        purchaseQuantity: purchaseQuantityEvolution,
        stockBreakAmount: stockBreakAmountEvolution,
        stockBreakQuantity: stockBreakQuantityEvolution,
        stockBreakRate: stockBreakRateEvolution,
        orders: ordersEvolution
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des données d'achat:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}