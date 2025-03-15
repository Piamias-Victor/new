// src/app/api/sales/revenue/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const comparisonStartDate = searchParams.get('comparisonStartDate');
    const comparisonEndDate = searchParams.get('comparisonEndDate');
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
      // Test simple pour vérifier la connexion
      const testResult = await client.query('SELECT 1 as test');
      console.log("Test query successful:", testResult.rows);
      
      // Requête pour la période principale
      let mainQuery = '';
      let mainParams = [startDate, endDate];
      
      if (pharmacyIds.length === 0) {
        // Requête pour toutes les pharmacies avec calcul de marge correct
        mainQuery = `
          SELECT 
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) - COALESCE(SUM(s.quantity * (i.weighted_average_price * (1 + p."TVA"/100))), 0) as total_margin,
            TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT s.date) as days_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            s.date BETWEEN $1 AND $2
        `;
      } else {
        // Requête pour pharmacies spécifiques avec calcul de marge correct
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
        
        mainQuery = `
          WITH filtered_products AS (
            SELECT id 
            FROM data_internalproduct 
            WHERE pharmacy_id IN (${pharmacyPlaceholders})
          ),
          filtered_snapshots AS (
            SELECT 
              i.id, 
              i.price_with_tax,
              i.weighted_average_price,
              p."TVA"
            FROM data_inventorysnapshot i
            JOIN data_internalproduct p ON i.product_id = p.id
            WHERE i.product_id IN (SELECT id FROM filtered_products)
          )
          SELECT 
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) - COALESCE(SUM(s.quantity * (i.weighted_average_price * (1 + i."TVA"/100))), 0) as total_margin,
            TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT s.date) as days_count
          FROM 
            data_sales s
          JOIN 
            filtered_snapshots i ON s.product_id = i.id
          WHERE 
            s.date BETWEEN $1 AND $2
        `;
        mainParams = [...mainParams, ...pharmacyIds];
      }
      
      // Exécuter la requête principale
      console.log("Executing main query");
      const mainResult = await client.query(mainQuery, mainParams);
      console.log("Main query executed successfully");
      
      // Extraire les résultats
      const mainRow = mainResult.rows[0] || {
        total_revenue: 0,
        total_margin: 0,
        min_date: null,
        max_date: null,
        days_count: 0
      };
      
      // Calculer le taux de marge
      const totalRevenue = parseFloat(mainRow.total_revenue) || 0;
      const totalMargin = parseFloat(mainRow.total_margin) || 0;
      const marginPercentage = totalRevenue > 0 
        ? (totalMargin / totalRevenue) * 100 
        : 0;
      
      // Préparer la réponse
      const response = {
        startDate,
        endDate,
        actualDateRange: {
          min: mainRow.min_date,
          max: mainRow.max_date,
          days: parseInt(mainRow.days_count) || 0
        },
        pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
        totalRevenue: totalRevenue,
        totalMargin: totalMargin,
        marginPercentage: parseFloat(marginPercentage.toFixed(2))
      };
      
      // Ajouter la comparaison si demandée
      if (comparisonStartDate && comparisonEndDate) {
        console.log("Processing comparison data");
        let comparisonQuery = '';
        let comparisonParams = [comparisonStartDate, comparisonEndDate];
        
        if (pharmacyIds.length === 0) {
          // Requête de comparaison pour toutes les pharmacies
          comparisonQuery = `
            SELECT 
              COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
              COALESCE(SUM(s.quantity * i.price_with_tax), 0) - COALESCE(SUM(s.quantity * (i.weighted_average_price * (1 + p."TVA"/100))), 0) as total_margin,
              TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT s.date) as days_count
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              s.date BETWEEN $1 AND $2
          `;
        } else {
          // Requête de comparaison pour pharmacies spécifiques
          const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + 3}`).join(',');
          
          comparisonQuery = `
            WITH filtered_products AS (
              SELECT id 
              FROM data_internalproduct 
              WHERE pharmacy_id IN (${pharmacyPlaceholders})
            ),
            filtered_snapshots AS (
              SELECT 
                i.id, 
                i.price_with_tax,
                i.weighted_average_price,
                p."TVA"
              FROM data_inventorysnapshot i
              JOIN data_internalproduct p ON i.product_id = p.id
              WHERE i.product_id IN (SELECT id FROM filtered_products)
            )
            SELECT 
              COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
              COALESCE(SUM(s.quantity * i.price_with_tax), 0) - COALESCE(SUM(s.quantity * (i.weighted_average_price * (1 + i."TVA"/100))), 0) as total_margin,
              TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
              TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
              COUNT(DISTINCT s.date) as days_count
            FROM 
              data_sales s
            JOIN 
              filtered_snapshots i ON s.product_id = i.id
            WHERE 
              s.date BETWEEN $1 AND $2
          `;
          comparisonParams = [...comparisonParams, ...pharmacyIds];
        }
        
        // Exécuter la requête de comparaison
        const comparisonResult = await client.query(comparisonQuery, comparisonParams);
        console.log("Comparison query executed successfully");
        
        // Extraire les résultats
        const comparisonRow = comparisonResult.rows[0] || {
          total_revenue: 0,
          total_margin: 0,
          min_date: null,
          max_date: null,
          days_count: 0
        };
        
        // Calculer les valeurs et le taux de marge pour la comparaison
        const comparisonRevenue = parseFloat(comparisonRow.total_revenue) || 0;
        const comparisonMargin = parseFloat(comparisonRow.total_margin) || 0;
        const comparisonMarginPercentage = comparisonRevenue > 0 
          ? (comparisonMargin / comparisonRevenue) * 100 
          : 0;
        
        // Calculer les évolutions
        const revenueEvolution = comparisonRevenue > 0 
          ? (totalRevenue - comparisonRevenue) / comparisonRevenue 
          : 0;
        
        const marginEvolution = comparisonMargin > 0 
          ? (totalMargin - comparisonMargin) / comparisonMargin 
          : 0;
        
        const marginPercentageEvolution = marginPercentage - comparisonMarginPercentage;
        
        // Ajouter à la réponse
        response.comparison = {
          startDate: comparisonStartDate,
          endDate: comparisonEndDate,
          actualDateRange: {
            min: comparisonRow.min_date,
            max: comparisonRow.max_date,
            days: parseInt(comparisonRow.days_count) || 0
          },
          totalRevenue: comparisonRevenue,
          totalMargin: comparisonMargin,
          marginPercentage: parseFloat(comparisonMarginPercentage.toFixed(2)),
          evolution: {
            revenue: {
              absolute: totalRevenue - comparisonRevenue,
              percentage: parseFloat((revenueEvolution * 100).toFixed(2)),
              isPositive: revenueEvolution >= 0
            },
            margin: {
              absolute: totalMargin - comparisonMargin,
              percentage: parseFloat((marginEvolution * 100).toFixed(2)),
              isPositive: marginEvolution >= 0
            },
            marginPercentage: {
              points: parseFloat(marginPercentageEvolution.toFixed(2)),
              isPositive: marginPercentageEvolution >= 0
            }
          }
        };
      }
      
      return NextResponse.json(response);
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    } finally {
      // S'assurer que le client est libéré même en cas d'erreur
      client.release();
      console.log("Client released");
    }
  } catch (error) {
    console.error('Erreur lors du calcul du chiffre d\'affaires et de la marge:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du chiffre d\'affaires et de la marge', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}