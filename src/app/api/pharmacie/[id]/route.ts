// src/app/api/pharmacies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID de pharmacie requis' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const query = `
        SELECT 
          id, 
          name, 
          id_nat, 
          ca, 
          area, 
          employees_count, 
          address
        FROM 
          data_pharmacy 
        WHERE 
          id = $1
      `;
      
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Pharmacie non trouvée' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}