// src/app/api/sales/revenue/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
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

  try {
    const client = await pool.connect();
    
    // Construire la requête pour la période principale
    let mainQuery = '';
    let mainParams = [startDate, endDate];
    const mainParamIndex = 3; // Commencer à 3 car nous avons déjà 2 paramètres
    
    if (pharmacyIds.length > 0) {
      // Pharmacies spécifiques - période principale
      const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + mainParamIndex}`).join(',');
      
      mainQuery = `
        WITH filtered_products AS (
          SELECT id 
          FROM data_internalproduct 
          WHERE pharmacy_id IN (${pharmacyPlaceholders})
        ),
        filtered_snapshots AS (
          SELECT id, product_id, price_with_tax
          FROM data_inventorysnapshot
          WHERE product_id IN (SELECT id FROM filtered_products)
        )
        SELECT 
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
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
    } else {
      // Toutes les pharmacies - période principale
      mainQuery = `
        SELECT 
          COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
          TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
          TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
          COUNT(DISTINCT s.date) as days_count
        FROM 
          data_sales s
        JOIN 
          data_inventorysnapshot i ON s.product_id = i.id
        WHERE 
          s.date BETWEEN $1 AND $2
      `;
    }
    
    // Exécuter la requête principale
    const mainResult = await client.query({
      text: mainQuery,
      values: mainParams,
      rowMode: 'array'
    });
    
    // Préparer la requête de comparaison si nécessaire
    let comparisonResult = null;
    
    if (comparisonStartDate && comparisonEndDate) {
      let comparisonQuery = '';
      let comparisonParams = [comparisonStartDate, comparisonEndDate];
      const comparisonParamIndex = 3; // Réinitialiser pour la nouvelle requête
      
      if (pharmacyIds.length > 0) {
        // Pharmacies spécifiques - période de comparaison
        const pharmacyPlaceholders = pharmacyIds.map((_, index) => `$${index + comparisonParamIndex}`).join(',');
        
        comparisonQuery = `
          WITH filtered_products AS (
            SELECT id 
            FROM data_internalproduct 
            WHERE pharmacy_id IN (${pharmacyPlaceholders})
          ),
          filtered_snapshots AS (
            SELECT id, product_id, price_with_tax
            FROM data_inventorysnapshot
            WHERE product_id IN (SELECT id FROM filtered_products)
          )
          SELECT 
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
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
      } else {
        // Toutes les pharmacies - période de comparaison
        comparisonQuery = `
          SELECT 
            COALESCE(SUM(s.quantity * i.price_with_tax), 0) as total_revenue,
            TO_CHAR(MIN(s.date), 'YYYY-MM-DD') as min_date,
            TO_CHAR(MAX(s.date), 'YYYY-MM-DD') as max_date,
            COUNT(DISTINCT s.date) as days_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          WHERE 
            s.date BETWEEN $1 AND $2
        `;
      }
      
      // Exécuter la requête de comparaison
      comparisonResult = await client.query({
        text: comparisonQuery,
        values: comparisonParams,
        rowMode: 'array'
      });
    }
    
    client.release();
    
    // Extraire les résultats
    const [totalRevenue, minDate, maxDate, daysCount] = mainResult.rows[0] || [0, null, null, 0];
    
    // Préparer la réponse
    const response: any = {
      startDate,
      endDate,
      actualDateRange: {
        min: minDate,
        max: maxDate,
        days: daysCount
      },
      pharmacyIds: pharmacyIds.length > 0 ? pharmacyIds : 'all',
      totalRevenue: parseFloat(totalRevenue) || 0
    };
    
    // Ajouter les données de comparaison si disponibles
    if (comparisonResult && comparisonResult.rows.length > 0) {
      const [comparisonTotalRevenue, comparisonMinDate, comparisonMaxDate, comparisonDaysCount] = 
        comparisonResult.rows[0] || [0, null, null, 0];
      
      const comparisonRevenueValue = parseFloat(comparisonTotalRevenue) || 0;
      
      // Calculer l'évolution
      const evolution = comparisonRevenueValue > 0 
        ? (parseFloat(totalRevenue) - comparisonRevenueValue) / comparisonRevenueValue 
        : 0;
      
      response.comparison = {
        startDate: comparisonStartDate,
        endDate: comparisonEndDate,
        actualDateRange: {
          min: comparisonMinDate,
          max: comparisonMaxDate,
          days: comparisonDaysCount
        },
        totalRevenue: comparisonRevenueValue,
        evolution: {
          absolute: parseFloat(totalRevenue) - comparisonRevenueValue,
          percentage: evolution * 100,
          isPositive: evolution >= 0
        }
      };
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Erreur lors du calcul du chiffre d\'affaires:', error);
    return NextResponse.json(
      { error: 'Erreur lors du calcul du chiffre d\'affaires', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}