// src/app/api/products/purchases/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const productIds = searchParams.getAll('productIds');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres
    if ((!startDate || !endDate) && productIds.length === 0) {
      return NextResponse.json(
        { error: 'Dates de période ou IDs de produits requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construire les conditions pour la requête
      let productCondition = '';
      let pharmacyCondition = '';
      let dateCondition = '';
      let params: any[] = [];
      let paramIndex = 1;
      
      // Condition sur les dates
      if (startDate && endDate) {
        dateCondition = `AND o.sent_date BETWEEN ${paramIndex} AND ${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
      } else {
        // Si pas de dates spécifiées, utiliser une condition par défaut pour éviter
        // de récupérer toutes les données historiques
        const defaultEndDate = new Date().toISOString().split('T')[0];
        const defaultStartDate = new Date();
        defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);
        
        dateCondition = `AND o.sent_date BETWEEN ${paramIndex} AND ${paramIndex + 1}`;
        params.push(defaultStartDate.toISOString().split('T')[0], defaultEndDate);
        paramIndex += 2;
      }
      
      // Condition sur les produits
      if (productIds.length > 0) {
        const productPlaceholders = productIds.map((_, index) => `$${paramIndex + index}`).join(',');
        productCondition = `AND p.id IN (${productPlaceholders})`;
        params.push(...productIds);
        paramIndex += productIds.length;
      }
      
      // Condition sur les pharmacies
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${paramIndex + index}`).join(',');
        pharmacyCondition = `AND ph.id IN (${pharmacyPlaceholders})`;
        params.push(...pharmacyIds);
      }

      // Requête SQL pour récupérer les données d'achat (commandes et livraisons)
      const query = `
        WITH product_orders AS (
          -- Récupération des commandes pour les produits sélectionnés
          SELECT 
            po.product_id,
            p.name AS product_name,
            o.internal_id AS order_id,
            o.sent_date,
            o.delivery_date,
            ph.id AS pharmacy_id,
            ph.name AS pharmacy_name,
            po.qte AS ordered_quantity,
            po.qte_r AS received_quantity,
            s.id AS supplier_id,
            s.name AS supplier_name,
            p.weighted_average_price AS unit_price
          FROM 
            data_productorder po
          JOIN 
            data_order o ON po.order_id = o.id
          JOIN 
            data_internalproduct p ON po.product_id = p.id
          JOIN 
            data_pharmacy ph ON o.pharmacy_id = ph.id
          LEFT JOIN 
            data_supplier s ON o.supplier_id = s.id
          WHERE 
            1=1 
            ${productCondition}
            ${pharmacyCondition}
            ${dateCondition}
        )
        SELECT 
          -- Montant total d'achat
          COALESCE(SUM(po.received_quantity * po.unit_price), 0) AS total_purchase_amount,
          
          -- Quantité totale achetée (reçue)
          COALESCE(SUM(po.received_quantity), 0) AS total_purchase_quantity,
          
          -- Prix d'achat moyen
          CASE 
            WHEN SUM(po.received_quantity) > 0 
            THEN COALESCE(SUM(po.received_quantity * po.unit_price) / SUM(po.received_quantity), 0) 
            ELSE 0 
          END AS average_purchase_price,
          
          -- Date du dernier achat
          MAX(po.sent_date)::text AS last_purchase_date,
          
          -- Nombre de commandes
          COUNT(DISTINCT po.order_id) AS total_orders,
          
          -- Taux de livraison (reçus / commandés)
          CASE 
            WHEN SUM(po.ordered_quantity) > 0 
            THEN ROUND((SUM(po.received_quantity) / SUM(po.ordered_quantity)) * 100, 2)
            ELSE 0 
          END AS delivery_rate
        FROM 
          product_orders po
      `;
      
      const result = await client.query(query, params);
      
      // Extraire les données
      const purchaseData = result.rows[0] || {
        total_purchase_amount: 0,
        total_purchase_quantity: 0,
        average_purchase_price: 0,
        last_purchase_date: null,
        total_orders: 0,
        delivery_rate: 0
      };
      
      return NextResponse.json({
        startDate,
        endDate,
        productIds: productIds.length > 0 ? productIds : 'all',
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalPurchaseAmount: parseFloat(purchaseData.total_purchase_amount) || 0,
        totalPurchaseQuantity: parseInt(purchaseData.total_purchase_quantity) || 0,
        averagePurchasePrice: parseFloat(purchaseData.average_purchase_price) || 0,
        lastPurchaseDate: purchaseData.last_purchase_date || null,
        totalOrders: parseInt(purchaseData.total_orders) || 0,
        deliveryRate: parseFloat(purchaseData.delivery_rate) || 0
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'achat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'achat', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}