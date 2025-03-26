// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    // Vérifier l'authentification et les droits d'admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const { email, name, password, role, pharmacyId } = await req.json();

    // Valider les champs requis
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: 'Email, nom et mot de passe sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const checkEmail = await pool.query(
      'SELECT id FROM data_user WHERE email = $1',
      [email]
    );

    if (checkEmail.rowCount > 0) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const result = await pool.query(
      `INSERT INTO data_user (email, name, password_hash, role, pharmacy_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, name, role, pharmacy_id`,
      [email, name, passwordHash, role || 'pharmacy_user', pharmacyId || null]
    );

    const newUser = result.rows[0];

    return NextResponse.json(
      {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        pharmacyId: newUser.pharmacy_id
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// Récupérer la liste des utilisateurs (Admin uniquement)
export async function GET(req: NextRequest) {
  try {
    // Vérifier l'authentification et les droits d'admin
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      );
    }

    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.created_at, u.last_login_at, 
              u.pharmacy_id, p.name as pharmacy_name
       FROM data_user u
       LEFT JOIN data_pharmacy p ON u.pharmacy_id = p.id
       ORDER BY u.created_at DESC`
    );

    return NextResponse.json({ users: result.rows });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}