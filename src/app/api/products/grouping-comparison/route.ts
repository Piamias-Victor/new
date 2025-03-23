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
        WITH current_pharmacy AS (
          -- Identifier la pharmacie actuelle
          SELECT DISTINCT ip.pharmacy_id
          FROM data_internalproduct ip
          JOIN data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
          WHERE g.code_13_ref = $1
          ${pharmacyCondition}
          LIMIT 1
        ),
        product_data AS (
          -- Obtenir les données du produit spécifique dans la pharmacie sélectionnée
          SELECT 
            g.code_13_ref,
            MAX(CASE WHEN i.price_with_tax > 0 AND i.price_with_tax < 1000 THEN i.price_with_tax ELSE NULL END) as price,
            MAX(CASE WHEN 
                ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                AND ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) < 1000
                THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                ELSE NULL END) as margin,
            AVG(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) BETWEEN 0 AND 100 THEN i.stock / s.quantity ELSE NULL END) as rotation,
            MAX(CASE WHEN i.stock >= 0 AND i.stock < 10000 THEN i.stock ELSE NULL END) as stock,
            SUM(CASE WHEN s.quantity >= 0 AND s.quantity < 1000 THEN s.quantity ELSE NULL END) as sales
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
          JOIN
            current_pharmacy cp ON ip.pharmacy_id = cp.pharmacy_id
          WHERE 
            g.code_13_ref = $1
            AND s.date BETWEEN $2 AND $3
          GROUP BY 
            g.code_13_ref
        ),
        grouping_data AS (
          -- Obtenir les données agrégées pour le même produit dans les autres pharmacies
          SELECT 
            AVG(CASE WHEN i.price_with_tax > 0 AND i.price_with_tax < 1000 THEN i.price_with_tax ELSE NULL END) as avg_price,
            MAX(CASE WHEN i.price_with_tax > 0 AND i.price_with_tax < 1000 THEN i.price_with_tax ELSE NULL END) as max_price,
            MIN(CASE WHEN i.price_with_tax > 0 AND i.price_with_tax < 1000 THEN i.price_with_tax ELSE NULL END) as min_price,
            
            AVG(CASE WHEN 
                ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                AND ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) < 1000
                THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                ELSE NULL END) as avg_margin,
            MAX(CASE WHEN 
                ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                AND ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) < 1000
                THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                ELSE NULL END) as max_margin,
            MIN(CASE WHEN 
                ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) > 0 
                AND ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) < 1000
                THEN ((i.price_with_tax / (1 + COALESCE(ip."TVA", 0)/100)) - i.weighted_average_price) 
                ELSE NULL END) as min_margin,
            
            AVG(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) BETWEEN 0 AND 100 THEN i.stock / s.quantity ELSE NULL END) as avg_rotation,
            MAX(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) BETWEEN 0 AND 100 THEN i.stock / s.quantity ELSE NULL END) as max_rotation,
            MIN(CASE WHEN s.quantity > 0 AND (i.stock / s.quantity) BETWEEN 0 AND 100 THEN i.stock / s.quantity ELSE NULL END) as min_rotation,
            
            AVG(CASE WHEN i.stock >= 0 AND i.stock < 10000 THEN i.stock ELSE NULL END) as avg_stock,
            MAX(CASE WHEN i.stock >= 0 AND i.stock < 10000 THEN i.stock ELSE NULL END) as max_stock,
            MIN(CASE WHEN i.stock >= 0 AND i.stock < 10000 THEN i.stock ELSE NULL END) as min_stock,
            
            AVG(CASE WHEN s.quantity >= 0 AND s.quantity < 1000 THEN s.quantity ELSE NULL END) as avg_sales,
            MAX(CASE WHEN s.quantity >= 0 AND s.quantity < 1000 THEN s.quantity ELSE NULL END) as max_sales,
            MIN(CASE WHEN s.quantity >= 0 AND s.quantity < 1000 THEN s.quantity ELSE NULL END) as min_sales
          FROM 
            data_internalproduct ip
          JOIN 
            data_globalproduct g ON ip.code_13_ref_id = g.code_13_ref
          JOIN 
            data_inventorysnapshot i ON i.product_id = ip.id
          LEFT JOIN 
            data_sales s ON s.product_id = i.id
          LEFT JOIN
            current_pharmacy cp ON true
          WHERE 
            g.code_13_ref = $1  -- Filtrer sur le même produit uniquement
            AND s.date BETWEEN $2 AND $3
            AND ip.pharmacy_id != cp.pharmacy_id  -- Exclure la pharmacie actuelle
        )
        SELECT 
          COALESCE(pd.price, 0) as your_price,
          COALESCE(gd.avg_price, 0) as avg_price,
          COALESCE(gd.max_price, 0) as max_price,
          COALESCE(gd.min_price, 0) as min_price,
          CASE 
            WHEN gd.avg_price > 0 THEN LEAST(200, GREATEST(-200, ROUND(((COALESCE(pd.price, 0) - COALESCE(gd.avg_price, 0)) / NULLIF(gd.avg_price, 0)) * 100, 1)))
            ELSE 0
          END as price_percentage,
          
          COALESCE(pd.margin, 0) as your_margin,
          COALESCE(gd.avg_margin, 0) as avg_margin,
          COALESCE(gd.max_margin, 0) as max_margin,
          COALESCE(gd.min_margin, 0) as min_margin,
          CASE 
            WHEN gd.avg_margin > 0 THEN LEAST(200, GREATEST(-200, ROUND(((COALESCE(pd.margin, 0) - COALESCE(gd.avg_margin, 0)) / NULLIF(gd.avg_margin, 0)) * 100, 1)))
            ELSE 0
          END as margin_percentage,
          
          COALESCE(pd.rotation, 0) as your_rotation,
          COALESCE(gd.avg_rotation, 0) as avg_rotation,
          COALESCE(gd.max_rotation, 0) as max_rotation,
          COALESCE(gd.min_rotation, 0) as min_rotation,
          CASE 
            WHEN gd.avg_rotation > 0 THEN LEAST(200, GREATEST(-200, ROUND(((COALESCE(pd.rotation, 0) - COALESCE(gd.avg_rotation, 0)) / NULLIF(gd.avg_rotation, 0)) * 100, 1)))
            ELSE 0
          END as rotation_percentage,
          
          COALESCE(pd.stock, 0) as your_stock,
          COALESCE(gd.avg_stock, 0) as avg_stock,
          COALESCE(gd.max_stock, 0) as max_stock,
          COALESCE(gd.min_stock, 0) as min_stock,
          CASE 
            WHEN gd.avg_stock > 0 THEN LEAST(200, GREATEST(-200, ROUND(((COALESCE(pd.stock, 0) - COALESCE(gd.avg_stock, 0)) / NULLIF(gd.avg_stock, 0)) * 100, 1)))
            ELSE 0
          END as stock_percentage,
          
          COALESCE(pd.sales, 0) as your_sales,
          COALESCE(gd.avg_sales, 0) as avg_sales,
          COALESCE(gd.max_sales, 0) as max_sales,
          COALESCE(gd.min_sales, 0) as min_sales,
          CASE 
            WHEN gd.avg_sales > 0 THEN LEAST(200, GREATEST(-200, ROUND(((COALESCE(pd.sales, 0) - COALESCE(gd.avg_sales, 0)) / NULLIF(gd.avg_sales, 0)) * 100, 1)))
            ELSE 0
          END as sales_percentage
        FROM 
          product_data pd, 
          grouping_data gd
      `;
      
      const result = await client.query(query, params);
      
      // Si aucun résultat, retourner des données par défaut
      if (result.rows.length === 0) {
        const defaultResponse = {
          price: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
          margin: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
          rotation: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
          stock: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 },
          sales: { yourValue: 0, average: 0, maximum: 0, minimum: 0, percentage: 0 }
        };
        
        return NextResponse.json(defaultResponse);
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