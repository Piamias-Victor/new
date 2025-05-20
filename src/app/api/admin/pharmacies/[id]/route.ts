// src/app/api/admin/pharmacies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import pool from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Récupérer les détails d'une pharmacie
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Récupérer la pharmacie depuis la base de données
    const result = await pool.query(`
      SELECT id, id_nat, name, ca, area, employees_count, address
      FROM data_pharmacy
      WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Pharmacie non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json({ pharmacy: result.rows[0] });
  } catch (error) {
    console.error('Erreur lors de la récupération de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la pharmacie' }, 
      { status: 500 }
    );
  }
}

// Mettre à jour une pharmacie
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les autorisations
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }
    
    const { id } = params;
    const { name, ca, area, employees_count, address } = await req.json();
    
    // Vérifier que la pharmacie existe
    const checkResult = await pool.query('SELECT id FROM data_pharmacy WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pharmacie non trouvée' }, { status: 404 });
    }
    
    // Mettre à jour la pharmacie
    const now = new Date();
    
    const result = await pool.query(`
      UPDATE data_pharmacy 
      SET 
        name = $1,
        ca = $2,
        area = $3,
        employees_count = $4,
        address = $5,
        updated_at = $6
      WHERE id = $7
      RETURNING id, id_nat, name, ca, area, employees_count, address
    `, [name, ca, area, employees_count, address, now, id]);
    
    return NextResponse.json({ 
      message: 'Pharmacie mise à jour avec succès',
      pharmacy: result.rows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la pharmacie:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la pharmacie' }, 
      { status: 500 }
    );
  }
}