// src/app/api/products/purchases/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// Fonction utilitaire pour la journalisation
function logDebug(message: string, obj?: any) {
  console.log(`[API/PURCHASES ${new Date().toISOString()}] ${message}`, obj ? JSON.stringify(obj) : '');
}

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const productIds = searchParams.getAll('productIds');
    const pharmacyIds = searchParams.getAll('pharmacyIds');

    logDebug('Paramètres de recherche:', { startDate, endDate, productIds, pharmacyIds });
    
    // Validation des paramètres
    if ((!startDate || !endDate) && productIds.length === 0) {
      logDebug('Validation échouée: Dates de période ou IDs de produits requis');
      return NextResponse.json(
        { error: 'Dates de période ou IDs de produits requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    logDebug('Connexion à la base de données établie');
    
    try {
      // Définir des valeurs de date par défaut si non spécifiées
      const effectiveStartDate = startDate || (() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return date.toISOString().split('T')[0];
      })();
      
      const effectiveEndDate = endDate || new Date().toISOString().split('T')[0];
      
      logDebug(`Période effective: ${effectiveStartDate} à ${effectiveEndDate}`);
      
      // Construire les conditions pour la requête
      let productCondition = '';
      let pharmacyCondition = '';
      let params: any[] = [effectiveStartDate, effectiveEndDate]; // Ajoutez les dates au début des paramètres
      let paramIndex = 3; // Commencer à 3 car les deux premiers sont les dates
      
      // Condition sur les produits
      if (productIds.length > 0) {
        const productPlaceholders = productIds.map((_, index) => `$${paramIndex + index}`).join(',');
        productCondition = `AND p.id IN (${productPlaceholders})`;
        params.push(...productIds);
        paramIndex += productIds.length;
        logDebug(`Condition sur les produits: ${productCondition} avec ${productIds.length} produits`);
      }
      
      // Condition sur les pharmacies
      if (pharmacyIds.length > 0) {
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${paramIndex + index}`).join(',');
        pharmacyCondition = `AND ph.id IN (${pharmacyPlaceholders})`;
        params.push(...pharmacyIds);
        logDebug(`Condition sur les pharmacies: ${pharmacyCondition} avec ${pharmacyIds.length} pharmacies`);
      }

      // Requête SQL avec date filtrage explicite
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
            COALESCE(p.weighted_average_price, 0) AS unit_price
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
            o.sent_date BETWEEN $1 AND $2 -- Filtrage de date explicite avec les paramètres 1 et 2
            ${productCondition}
            ${pharmacyCondition}
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
          
          -- Date du premier achat dans la période
          MIN(po.sent_date)::text AS first_purchase_date,
          
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
      
      logDebug('Paramètres de requête SQL:', params);
      const result = await client.query(query, params);
      logDebug('Requête SQL exécutée avec succès');
      logDebug('Résultats bruts:', result.rows);
      
      if (!result.rows || result.rows.length === 0) {
        logDebug('Aucun résultat retourné par la requête SQL');
      }
      
      // Extraire les données
      const purchaseData = result.rows[0] || {
        total_purchase_amount: 0,
        total_purchase_quantity: 0,
        average_purchase_price: 0,
        first_purchase_date: null,
        last_purchase_date: null,
        total_orders: 0,
        delivery_rate: 0
      };
      
      const response = {
        startDate: effectiveStartDate,
        endDate: effectiveEndDate,
        productIds: productIds.length > 0 ? productIds : 'all',
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalPurchaseAmount: parseFloat(purchaseData.total_purchase_amount) || 0,
        totalPurchaseQuantity: parseInt(purchaseData.total_purchase_quantity) || 0,
        averagePurchasePrice: parseFloat(purchaseData.average_purchase_price) || 0,
        firstPurchaseDate: purchaseData.first_purchase_date || null,
        lastPurchaseDate: purchaseData.last_purchase_date || null,
        totalOrders: parseInt(purchaseData.total_orders) || 0,
        deliveryRate: parseFloat(purchaseData.delivery_rate) || 0
      };
      
      logDebug('Réponse générée:', response);
      return NextResponse.json(response);
    } catch (dbError) {
      logDebug('Erreur de base de données:', dbError);
      throw dbError;
    } finally {
      client.release();
      logDebug('Connexion à la base de données libérée');
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données d\'achat:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données d\'achat', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}