// src/app/api/admin/pharmacies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    // Récupérer les pharmacies depuis la base de données
    const result = await pool.query(`
      SELECT id, id_nat, name, ca, area, employees_count, address
      FROM data_pharmacy
      ORDER BY name ASC
    `);
    
    return NextResponse.json({ pharmacies: result.rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des pharmacies:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des pharmacies' }, 
      { status: 500 }
    );
  }
}