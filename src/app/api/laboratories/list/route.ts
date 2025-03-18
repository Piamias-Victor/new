// src/app/api/laboratories/list/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Connexion à la BD et exécution de la requête
    const client = await pool.connect();
    
    try {
      // Requête pour récupérer tous les laboratoires uniques
      const query = `
        SELECT DISTINCT brand_lab 
        FROM data_globalproduct 
        WHERE brand_lab IS NOT NULL AND brand_lab != '' 
        ORDER BY brand_lab ASC
      `;
      
      const result = await client.query(query);
      
      // Extraction des noms de laboratoires
      const laboratories = result.rows.map(row => row.brand_lab);
      
      // Retourner les résultats en JSON
      return NextResponse.json({
        laboratories,
        count: laboratories.length
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des laboratoires:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des laboratoires', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}