// src/app/api/kpi/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

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

    // Calcul du nombre de jours dans la période actuelle (pour les jours de stock)
    const currentStartDate = new Date(startDate);
    const currentEndDate = new Date(endDate);
    const daysInPeriod = Math.ceil((currentEndDate.getTime() - currentStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const query = `
      WITH filtered_products AS (
        SELECT 
          dip.id as internal_product_id,
          dip.pharmacy_id
        FROM data_internalproduct dip
        WHERE ($1::uuid[] IS NULL OR dip.pharmacy_id = ANY($1))
      ),
      
      -- Derniers snapshots de stock pour la période actuelle
      current_inventory AS (
        SELECT 
          dis.product_id,
          dis.date,
          dis.stock,
          dis.weighted_average_price,
          ROW_NUMBER() OVER (PARTITION BY dis.product_id ORDER BY dis.date DESC) as rn
        FROM data_inventorysnapshot dis
        JOIN filtered_products fp ON dis.product_id = fp.internal_product_id
        WHERE dis.date <= $3
          AND dis.date >= $2
      ),
      
      -- Derniers snapshots de stock pour la période de comparaison
      comparison_inventory AS (
        SELECT 
          dis.product_id,
          dis.date,
          dis.stock,
          dis.weighted_average_price,
          ROW_NUMBER() OVER (PARTITION BY dis.product_id ORDER BY dis.date DESC) as rn
        FROM data_inventorysnapshot dis
        JOIN filtered_products fp ON dis.product_id = fp.internal_product_id
        WHERE dis.date <= $5
          AND dis.date >= $4
      ),
      
      -- Données de vente pour la période actuelle (pour calculer les jours de stock)
      current_sales AS (
        SELECT 
          SUM(ds.quantity) AS total_quantity,
          SUM(ds.quantity * dis.price_with_tax) AS total_revenue
        FROM data_sales ds
        JOIN data_inventorysnapshot dis ON ds.product_id = dis.id
        JOIN filtered_products fp ON dis.product_id = fp.internal_product_id
        WHERE ds.date BETWEEN $2 AND $3
      )
      
      SELECT 
        -- Stock actuel
        SUM(CASE WHEN ci.rn = 1 THEN ci.stock ELSE 0 END) AS current_total_units,
        SUM(CASE WHEN ci.rn = 1 THEN ci.stock * ci.weighted_average_price ELSE 0 END) AS current_stock_value,
        AVG(CASE WHEN ci.rn = 1 THEN ci.weighted_average_price ELSE NULL END) AS current_avg_price,
        
        -- Stock de comparaison
        SUM(CASE WHEN cmp.rn = 1 THEN cmp.stock ELSE 0 END) AS comparison_total_units,
        SUM(CASE WHEN cmp.rn = 1 THEN cmp.stock * cmp.weighted_average_price ELSE 0 END) AS comparison_stock_value,
        AVG(CASE WHEN cmp.rn = 1 THEN cmp.weighted_average_price ELSE NULL END) AS comparison_avg_price,
        
        -- Données de vente pour jours de stock
        (SELECT total_quantity FROM current_sales) AS total_sales_quantity,
        (SELECT total_revenue FROM current_sales) AS total_sales_revenue
      FROM current_inventory ci
      FULL OUTER JOIN comparison_inventory cmp ON ci.product_id = cmp.product_id
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
    
    // Calcul des évolutions
    const stockValueEvolution = {
      value: data.current_stock_value - data.comparison_stock_value,
      percentage: data.comparison_stock_value > 0 
        ? ((data.current_stock_value - data.comparison_stock_value) / data.comparison_stock_value) * 100 
        : 0,
      isPositive: data.current_stock_value >= data.comparison_stock_value
    };
    
    const unitsEvolution = {
      value: data.current_total_units - data.comparison_total_units,
      percentage: data.comparison_total_units > 0 
        ? ((data.current_total_units - data.comparison_total_units) / data.comparison_total_units) * 100 
        : 0,
      isPositive: data.current_total_units >= data.comparison_total_units
    };
    
    const avgPriceEvolution = {
      value: data.current_avg_price - data.comparison_avg_price,
      percentage: data.comparison_avg_price > 0 
        ? ((data.current_avg_price - data.comparison_avg_price) / data.comparison_avg_price) * 100 
        : 0,
      isPositive: data.current_avg_price >= data.comparison_avg_price
    };
    
    // Calcul des jours de stock
    const averageSalePerDay = data.total_sales_quantity > 0 
      ? data.total_sales_quantity / daysInPeriod 
      : 0;
    
    const stockDaysValue = averageSalePerDay > 0 
      ? data.current_total_units / averageSalePerDay 
      : 0;

    const response = {
      current: {
        stockValueHT: data.current_stock_value || 0,
        stockUnits: data.current_total_units || 0,
        averagePrice: data.current_avg_price || 0
      },
      comparison: {
        stockValueHT: data.comparison_stock_value || 0,
        stockUnits: data.comparison_total_units || 0,
        averagePrice: data.comparison_avg_price || 0
      },
      evolution: {
        stockValue: stockValueEvolution,
        units: unitsEvolution,
        averagePrice: avgPriceEvolution
      },
      stockDaysInfo: {
        daysInPeriod,
        averageSalePerDay,
        stockDaysValue
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erreur lors de la récupération des données de stock:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}