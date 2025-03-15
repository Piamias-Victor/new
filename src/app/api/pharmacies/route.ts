// src/app/api/pharmacies/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Connexion à la BD et exécution de la requête
    const client = await pool.connect();
    
    const query = `
      SELECT id, name, area, ca, employees_count, address
      FROM data_pharmacy
      ORDER BY name ASC
    `;
    
    const result = await client.query(query);
    client.release();

    // Retourner les résultats en JSON
    return NextResponse.json({
      pharmacies: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pharmacies' },
      { status: 500 }
    );
  }
}