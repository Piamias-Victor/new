// src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import pool from '@/lib/db';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Vérifier les droits (admin ou l'utilisateur lui-même)
    if (session.user.role !== 'admin' && session.user.id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { name, email, password, role, pharmacyId } = await req.json();
    
    // Préparer les champs à mettre à jour
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (name) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    
    if (email) {
      updates.push(`email = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }
    
    // Ces champs ne peuvent être modifiés que par un admin
    if (session.user.role === 'admin') {
      if (role) {
        updates.push(`role = $${paramIndex}`);
        values.push(role);
        paramIndex++;
      }
      
      // Si pharmacyId est défini explicitement (même à null)
      if (pharmacyId !== undefined) {
        updates.push(`pharmacy_id = $${paramIndex}`);
        values.push(pharmacyId);
        paramIndex++;
      }
    }
    
    // Si aucun champ à mettre à jour
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donnée à mettre à jour' },
        { status: 400 }
      );
    }
    
    // Ajouter updated_at et l'ID de l'utilisateur aux paramètres
    updates.push(`updated_at = NOW()`);
    values.push(userId);
    
    // Construire et exécuter la requête
    const query = `
      UPDATE data_user 
      SET ${updates.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING id, email, name, role, pharmacy_id
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const updatedUser = result.rows[0];
    
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      pharmacyId: updatedUser.pharmacy_id
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Récupérer un utilisateur spécifique
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    
    // Vérifier les droits (admin ou l'utilisateur lui-même)
    if (session.user.role !== 'admin' && session.user.id !== userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at, 
              u.pharmacy_id, p.name as pharmacy_name
       FROM data_user u
       LEFT JOIN data_pharmacy p ON u.pharmacy_id = p.id
       WHERE u.id = $1`,
      [userId]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }
    
    const user = result.rows[0];
    
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.created_at,
      lastLoginAt: user.last_login_at,
      pharmacyId: user.pharmacy_id,
      pharmacyName: user.pharmacy_name
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Supprimer un utilisateur (Admin uniquement)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const session = await getServerSession(authOptions);
    
    // Vérifier l'authentification et les droits d'admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }
    
    const result = await pool.query(
      'DELETE FROM data_user WHERE id = $1 RETURNING id',
      [userId]
    );
// Suite de src/app/api/users/[id]/route.ts - Fonction DELETE

if (result.rowCount === 0) {
    return NextResponse.json(
      { error: 'Utilisateur non trouvé' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(
    { message: 'Utilisateur supprimé avec succès' }
  );
} catch (error) {
  console.error('Error deleting user:', error);
  return NextResponse.json(
    { error: 'Une erreur est survenue lors de la suppression de l\'utilisateur' },
    { status: 500 }
  );
}
}