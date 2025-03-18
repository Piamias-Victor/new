// src/app/api/statistics/sell-in-stockouts/route.ts

import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les dates de début et de fin sont requises' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Requête pour les données de sell-in (achats)
      let sellInQuery = '';
      let sellInParams = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        sellInQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r * COALESCE(
              (SELECT weighted_average_price FROM data_inventorysnapshot 
               WHERE product_id = po.product_id 
               ORDER BY date DESC LIMIT 1), 0)), 0) AS total_purchase_amount,
            COALESCE(SUM(po.qte_r), 0) AS total_purchase_quantity,
            COUNT(DISTINCT o.id) AS total_orders
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          WHERE 
            o.delivery_date BETWEEN $1 AND $2
        `;
      } else {
        // Requête pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        sellInQuery = `
          SELECT 
            COALESCE(SUM(po.qte_r * COALESCE(
              (SELECT weighted_average_price FROM data_inventorysnapshot 
               WHERE product_id = po.product_id 
               ORDER BY date DESC LIMIT 1), 0)), 0) AS total_purchase_amount,
            COALESCE(SUM(po.qte_r), 0) AS total_purchase_quantity,
            COUNT(DISTINCT o.id) AS total_orders
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          WHERE 
            o.delivery_date BETWEEN $1 AND $2
            AND o.pharmacy_id IN (${pharmacyPlaceholders})
        `;
        sellInParams = [...sellInParams, ...pharmacyIds];
      }
      
      // Requête pour les données de ruptures
      let stockoutsQuery = '';
      let stockoutsParams = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies
        stockoutsQuery = `
          WITH order_data AS (
            SELECT 
              po.product_id,
              SUM(po.qte) AS ordered_quantity,
              SUM(po.qte_r) AS received_quantity,
              COALESCE((SELECT price_with_tax FROM data_inventorysnapshot 
                        WHERE product_id = po.product_id 
                        ORDER BY date DESC LIMIT 1), 0) AS product_price
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
            GROUP BY
              po.product_id
          )
          SELECT 
            COALESCE(SUM(CASE WHEN ordered_quantity > received_quantity 
                         THEN (ordered_quantity - received_quantity) * product_price
                         ELSE 0 END), 0) AS total_stockouts_value,
            COALESCE(SUM(CASE WHEN ordered_quantity > received_quantity 
                         THEN (ordered_quantity - received_quantity)
                         ELSE 0 END), 0) AS total_stockouts_quantity
          FROM 
            order_data
        `;
      } else {
        // Requête pour pharmacies spécifiques
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        stockoutsQuery = `
          WITH order_data AS (
            SELECT 
              po.product_id,
              SUM(po.qte) AS ordered_quantity,
              SUM(po.qte_r) AS received_quantity,
              COALESCE((SELECT price_with_tax FROM data_inventorysnapshot 
                        WHERE product_id = po.product_id 
                        ORDER BY date DESC LIMIT 1), 0) AS product_price
            FROM 
              data_productorder po
            JOIN 
              data_order o ON po.order_id = o.id
            WHERE 
              o.sent_date BETWEEN $1 AND $2
              AND o.pharmacy_id IN (${pharmacyPlaceholders})
            GROUP BY
              po.product_id
          )
          SELECT 
            COALESCE(SUM(CASE WHEN ordered_quantity > received_quantity 
                         THEN (ordered_quantity - received_quantity) * product_price
                         ELSE 0 END), 0) AS total_stockouts_value,
            COALESCE(SUM(CASE WHEN ordered_quantity > received_quantity 
                         THEN (ordered_quantity - received_quantity)
                         ELSE 0 END), 0) AS total_stockouts_quantity
          FROM 
            order_data
        `;
        stockoutsParams = [...stockoutsParams, ...pharmacyIds];
      }
      
      // Exécuter les requêtes
      const sellInResult = await client.query(sellInQuery, sellInParams);
      const stockoutsResult = await client.query(stockoutsQuery, stockoutsParams);
      
      // Extraire les résultats
      const sellInData = sellInResult.rows[0] || {
        total_purchase_amount: 0,
        total_purchase_quantity: 0,
        total_orders: 0
      };
      
      const stockoutsData = stockoutsResult.rows[0] || {
        total_stockouts_value: 0,
        total_stockouts_quantity: 0
      };
      
      // Préparer la réponse
      return NextResponse.json({
        startDate,
        endDate,
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        sellIn: {
          totalPurchaseAmount: parseFloat(sellInData.total_purchase_amount) || 0,
          totalPurchaseQuantity: parseInt(sellInData.total_purchase_quantity) || 0,
          totalOrders: parseInt(sellInData.total_orders) || 0
        },
        stockouts: {
          totalStockoutsValue: parseFloat(stockoutsData.total_stockouts_value) || 0,
          totalStockoutsQuantity: parseInt(stockoutsData.total_stockouts_quantity) || 0
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}