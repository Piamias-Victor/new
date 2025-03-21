// src/app/api/pharmacy/grouping-comparison/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Récupérer les paramètres de recherche
    const { searchParams } = new URL(request.url);
    const pharmacyId = searchParams.get('pharmacyId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const code13refs = searchParams.getAll('code13refs'); // Récupérer tous les codes EAN13 sélectionnés
    
    // Validation des paramètres
    if (!pharmacyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Les paramètres pharmacyId, startDate et endDate sont requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      // Construction des conditions de filtrage par code EAN13
      let codeFilter = '';
      let codeFilterParams = [];
      
      if (code13refs.length > 0) {
        const placeholders = code13refs.map((_, index) => `$${index + 4}`).join(',');
        codeFilter = `AND p.code_13_ref_id IN (${placeholders})`;
        codeFilterParams = code13refs;
      }

      // Requête pour obtenir les données de la pharmacie spécifique
      const pharmacyQuery = `
        WITH pharmacy_data AS (
          -- Données de vente (sell-out)
          SELECT 
            SUM(s.quantity * i.price_with_tax) AS total_sellout,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin,
            COUNT(DISTINCT p.code_13_ref_id) AS references_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            p.pharmacy_id = $1
            AND s.date BETWEEN $2 AND $3
            ${codeFilter}
        ),
        pharmacy_sellin AS (
          -- Données d'achat (sell-in)
          SELECT 
            SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )) AS total_sellin
          FROM 
            data_order o
          JOIN 
            data_productorder po ON o.id = po.order_id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.pharmacy_id = $1
            AND o.sent_date BETWEEN $2 AND $3
            ${codeFilter}
        ),
        pharmacy_stock AS (
          -- Données de stock
          SELECT 
            SUM(i.stock * i.weighted_average_price) AS total_stock
          FROM 
            data_inventorysnapshot i
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            p.pharmacy_id = $1
            AND i.date = (
              SELECT MAX(date)
              FROM data_inventorysnapshot
              WHERE date <= $3
            )
            ${codeFilter}
        ),
        pharmacy_evolution AS (
          -- Calcul de l'évolution par rapport à la période précédente
          WITH current_period AS (
            SELECT 
              SUM(s.quantity * i.price_with_tax) AS current_revenue
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              p.pharmacy_id = $1
              AND s.date BETWEEN $2 AND $3
              ${codeFilter}
          ),
          previous_period AS (
            SELECT 
              SUM(s.quantity * i.price_with_tax) AS previous_revenue
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              p.pharmacy_id = $1
              AND s.date BETWEEN 
                ($2::date - ($3::date - $2::date)) AND ($2::date - INTERVAL '1 day')
              ${codeFilter}
          )
          SELECT 
            cp.current_revenue,
            pp.previous_revenue,
            CASE 
              WHEN pp.previous_revenue > 0 
              THEN ((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue * 100)
              ELSE 0
            END AS evolution_percentage
          FROM 
            current_period cp, previous_period pp
        )
        SELECT 
          pd.total_sellout,
          pd.total_margin,
          CASE WHEN pd.total_sellout > 0 THEN (pd.total_margin / pd.total_sellout * 100) ELSE 0 END AS margin_percentage,
          pd.references_count,
          ps.total_sellin,
          pst.total_stock,
          pe.evolution_percentage
        FROM 
          pharmacy_data pd, 
          pharmacy_sellin ps, 
          pharmacy_stock pst, 
          pharmacy_evolution pe
      `;
      
      // Construction du filtre de code pour le groupement
      let groupCodeFilter = '';
      let groupQueryParams = [startDate, endDate];
      
      if (code13refs.length > 0) {
        const groupPlaceholders = code13refs.map((_, index) => `$${index + 3}`).join(',');
        groupCodeFilter = `AND p.code_13_ref_id IN (${groupPlaceholders})`;
        groupQueryParams = [...groupQueryParams, ...code13refs];
      }

      // Requête pour obtenir la moyenne du groupement (toutes les pharmacies)
      const groupQuery = `
        WITH group_data AS (
          -- Données de vente (sell-out) pour le groupement
          SELECT 
            COUNT(DISTINCT p.pharmacy_id) AS pharmacy_count,
            SUM(s.quantity * i.price_with_tax) AS total_sellout,
            SUM(s.quantity * (i.price_with_tax - (i.weighted_average_price * (1 + p."TVA"/100)))) AS total_margin,
            -- Modification ici: Nombre de codes EAN13 uniques pour tout le groupement, puis divisé par pharmacie
            (
              SELECT COUNT(DISTINCT ip.code_13_ref_id) 
              FROM data_internalproduct ip
              JOIN data_sales ss ON ss.product_id = ip.id
              WHERE ss.date BETWEEN $1 AND $2
              ${groupCodeFilter}
            ) AS total_references_count
          FROM 
            data_sales s
          JOIN 
            data_inventorysnapshot i ON s.product_id = i.id
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            s.date BETWEEN $1 AND $2
            ${groupCodeFilter}
        ),
        group_sellin AS (
          -- Données d'achat (sell-in) pour le groupement
          SELECT 
            SUM(po.qte_r * (
              SELECT COALESCE(weighted_average_price, 0)
              FROM data_inventorysnapshot
              WHERE product_id = po.product_id
              ORDER BY date DESC
              LIMIT 1
            )) AS total_sellin
          FROM 
            data_order o
          JOIN 
            data_productorder po ON o.id = po.order_id
          JOIN
            data_internalproduct p ON po.product_id = p.id
          WHERE 
            o.sent_date BETWEEN $1 AND $2
            ${groupCodeFilter}
        ),
        group_stock AS (
          -- Données de stock pour le groupement
          SELECT 
            SUM(i.stock * i.weighted_average_price) AS total_stock
          FROM 
            data_inventorysnapshot i
          JOIN
            data_internalproduct p ON i.product_id = p.id
          WHERE 
            i.date = (
              SELECT MAX(date)
              FROM data_inventorysnapshot
              WHERE date <= $2
            )
            ${groupCodeFilter}
        ),
        group_evolution AS (
          -- Calcul de l'évolution par rapport à la période précédente pour le groupement
          WITH current_period AS (
            SELECT 
              SUM(s.quantity * i.price_with_tax) AS current_revenue
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              s.date BETWEEN $1 AND $2
              ${groupCodeFilter}
          ),
          previous_period AS (
            SELECT 
              SUM(s.quantity * i.price_with_tax) AS previous_revenue
            FROM 
              data_sales s
            JOIN 
              data_inventorysnapshot i ON s.product_id = i.id
            JOIN
              data_internalproduct p ON i.product_id = p.id
            WHERE 
              s.date BETWEEN 
                ($1::date - ($2::date - $1::date)) AND ($1::date - INTERVAL '1 day')
              ${groupCodeFilter}
          )
          SELECT 
            cp.current_revenue,
            pp.previous_revenue,
            CASE 
              WHEN pp.previous_revenue > 0 
              THEN ((cp.current_revenue - pp.previous_revenue) / pp.previous_revenue * 100)
              ELSE 0
            END AS evolution_percentage
          FROM 
            current_period cp, previous_period pp
        )
        SELECT 
          gd.pharmacy_count,
          gd.total_sellout / NULLIF(gd.pharmacy_count, 0) AS avg_sellout,
          gd.total_margin / NULLIF(gd.pharmacy_count, 0) AS avg_margin,
          CASE WHEN gd.total_sellout > 0 THEN (gd.total_margin / gd.total_sellout * 100) ELSE 0 END AS avg_margin_percentage,
          gd.total_references_count / NULLIF(gd.pharmacy_count, 0) AS avg_references_count,
          gs.total_sellin / NULLIF(gd.pharmacy_count, 0) AS avg_sellin,
          gst.total_stock / NULLIF(gd.pharmacy_count, 0) AS avg_stock,
          ge.evolution_percentage AS avg_evolution_percentage
        FROM 
          group_data gd, 
          group_sellin gs, 
          group_stock gst, 
          group_evolution ge
      `;
      
      // Exécuter les deux requêtes
      const pharmacyParams = [pharmacyId, startDate, endDate, ...codeFilterParams];
      const pharmacyResult = await client.query(pharmacyQuery, pharmacyParams);
      const groupResult = await client.query(groupQuery, groupQueryParams);
      
      // Préparer la réponse
      const response = {
        pharmacy: pharmacyResult.rows[0] || {},
        group: groupResult.rows[0] || {},
        filters: {
          pharmacyId,
          startDate,
          endDate,
          code13refsCount: code13refs.length
        }
      };
      
      return NextResponse.json(response);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des données de comparaison:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}