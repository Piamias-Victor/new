// src/app/api/products/grouping-comparison/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres
    const searchParams = request.nextUrl.searchParams;
    const code13ref = searchParams.get('code13ref');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const pharmacyIds = searchParams.getAll('pharmacyIds');
    
    // Validation des paramètres obligatoires
    if (!code13ref || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les paramètres code13ref, startDate et endDate sont requis' },
        { status: 400 }
      );
    }

    // Connexion à la base de données
    const client = await pool.connect();
    
    try {
      // Préparation des paramètres pour la requête SQL
      let params = [code13ref, startDate, endDate];
      let pharmacyCondition = '';
      
      if (pharmacyIds && pharmacyIds.length > 0) {
        // Construire la liste des placeholders (ex: $4, $5, $6)
        const placeholders = pharmacyIds.map((_, index) => `$${index + 4}`).join(',');
        pharmacyCondition = `AND ip.pharmacy_id IN (${placeholders})`;
        params = [...params, ...pharmacyIds];
      }
      
      // Requête SQL pour obtenir les données de comparaison
      const query = `
        WITH product_data AS (
          -- Obtenir les données du produit spécifique dans la pharmacie sélectionnée
          SELECT 
            g.code_13_ref,
            MAX(i.price_with_tax) as price,
            MAX((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) as margin,
            MAX(CASE WHEN s.quantity > 0 THEN i.stock / s.quantity ELSE 0 END) as rotation,
            MAX(i.stock) as stock,
            SUM(s.quantity) as sales
          FROM 
            data_internalproduct ip
          JOIN 
            data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
          JOIN 
            data_inventorysnapshot i ON i.product_id = ip.id
          LEFT JOIN 
            data_sales s ON s.product_id = i.id
          JOIN 
            data_pharmacy p ON ip.pharmacy_id = p.id
          WHERE 
            g.code_13_ref = $1
            AND s.date BETWEEN $2 AND $3
            ${pharmacyCondition}
          GROUP BY 
            g.code_13_ref
        ),
        grouping_data AS (
          -- Obtenir les données agrégées pour le groupement
          SELECT 
            AVG(i.price_with_tax) as avg_price,
            MAX(CASE WHEN i.price_with_tax > 0 AND i.price_with_tax < 1000 THEN i.price_with_tax ELSE NULL END) as max_price,
            MIN(CASE WHEN i.price_with_tax > 0 THEN i.price_with_tax ELSE NULL END) as min_price,
            AVG((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) as avg_margin,
            MAX(CASE WHEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                 AND ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) < 1000
                 THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                 ELSE NULL END) as max_margin,
            MIN(CASE WHEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                ELSE NULL END) as min_margin,
            AVG(CASE WHEN s.quantity > 0 THEN i.stock / s.quantity ELSE 0 END) as avg_rotation,
            MAX(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) < 100 THEN i.stock / s.quantity ELSE NULL END) as max_rotation,
            MIN(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) > 0 THEN i.stock / s.quantity ELSE NULL END) as min_rotation,
            AVG(i.stock) as avg_stock,
            MAX(CASE WHEN i.stock > 0 AND i.stock < 1000 THEN i.stock ELSE NULL END) as max_stock,
            MIN(CASE WHEN i.stock > 0 THEN i.stock ELSE NULL END) as min_stock,
            AVG(s.quantity) as avg_sales,
            MAX(CASE WHEN s.quantity > 0 AND s.quantity < 1000 THEN s.quantity ELSE NULL END) as max_sales,
            MIN(CASE WHEN s.quantity > 0 THEN s.quantity ELSE NULL END) as min_sales
          FROM 
            data_internalproduct ip
          JOIN 
            data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
          JOIN 
            data_inventorysnapshot i ON i.product_id = ip.id
          LEFT JOIN 
            data_sales s ON s.product_id = i.id
          WHERE 
            g.category = (SELECT category FROM data_globalproduct WHERE code_13_ref = $1)
            AND s.date BETWEEN $2 AND $3
        )
        SELECT 
          pd.price as your_price,
          gd.avg_price,
          gd.max_price,
          gd.min_price,
          ROUND(((pd.price - gd.avg_price) / gd.avg_price) * 100, 1) as price_percentage,
          
          pd.margin as your_margin,
          gd.avg_margin,
          gd.max_margin,
          gd.min_margin,
          ROUND(((pd.margin - gd.avg_margin) / gd.avg_margin) * 100, 1) as margin_percentage,
          
          pd.rotation as your_rotation,
          gd.avg_rotation,
          gd.max_rotation,
          gd.min_rotation,
          ROUND(((pd.rotation - gd.avg_rotation) / gd.avg_rotation) * 100, 1) as rotation_percentage,
          
          pd.stock as your_stock,
          gd.avg_stock,
          gd.max_stock,
          gd.min_stock,
          ROUND(((pd.stock - gd.avg_stock) / gd.avg_stock) * 100, 1) as stock_percentage,
          
          pd.sales as your_sales,
          gd.avg_sales,
          gd.max_sales,
          gd.min_sales,
          ROUND(((pd.sales - gd.avg_sales) / gd.avg_sales) * 100, 1) as sales_percentage
        FROM 
          product_data pd, 
          grouping_data gd
      `;
      
      const result = await client.query(query, params);
      
      // Si aucun résultat, retourner une erreur
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Aucune donnée trouvée pour ce produit et cette période' },
          { status: 404 }
        );
      }
      
      // Formater les données pour la réponse
      const data = result.rows[0];
      
      const responseData = {
        price: {
          yourValue: Number(data.your_price) || 0,
          average: Number(data.avg_price) || 0,
          maximum: Number(data.max_price) || 0,
          minimum: Number(data.min_price) || 0,
          percentage: Number(data.price_percentage) || 0
        },
        margin: {
          yourValue: Number(data.your_margin) || 0,
          average: Number(data.avg_margin) || 0,
          maximum: Number(data.max_margin) || 0,
          minimum: Number(data.min_margin) || 0,
          percentage: Number(data.margin_percentage) || 0
        },
        rotation: {
          yourValue: Number(data.your_rotation) || 0,
          average: Number(data.avg_rotation) || 0,
          maximum: Number(data.max_rotation) || 0,
          minimum: Number(data.min_rotation) || 0,
          percentage: Number(data.rotation_percentage) || 0
        },
        stock: {
          yourValue: Number(data.your_stock) || 0,
          average: Number(data.avg_stock) || 0,
          maximum: Number(data.max_stock) || 0,
          minimum: Number(data.min_stock) || 0,
          percentage: Number(data.stock_percentage) || 0
        },
        sales: {
          yourValue: Number(data.your_sales) || 0,
          average: Number(data.avg_sales) || 0,
          maximum: Number(data.max_sales) || 0,
          minimum: Number(data.min_sales) || 0,
          percentage: Number(data.sales_percentage) || 0
        }
      };
      
      return NextResponse.json(responseData);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de comparaison:', error);
    
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données de comparaison', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}