// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { sendEmail } from '@/lib/email'; // À implémenter

// Demande de réinitialisation de mot de passe
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }
    
    // Vérifier si l'utilisateur existe
    const result = await pool.query(
      'SELECT id, name FROM data_user WHERE email = $1',
      [email]
    );
    
    if (result.rowCount === 0) {
      // Toujours renvoyer un succès pour éviter les attaques par énumération
      return NextResponse.json(
        { message: 'Si cet email existe, les instructions ont été envoyées.' }
      );
    }
    
    const user = result.rows[0];
    
    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 heure
    
    // Enregistrer le token dans la base de données
    await pool.query(
      'UPDATE data_user SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );
    
    // URL de réinitialisation
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`;
    
    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de mot de passe - ApoData Analytics',
      text: `Bonjour ${user.name},\n\nVous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :\n\n${resetUrl}\n\nCe lien est valable pendant 1 heure.\n\nSi vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.\n\nCordialement,\nL'équipe ApoData Analytics`,
      html: `
        <h1>Réinitialisation de mot de passe</h1>
        <p>Bonjour ${user.name},</p>
        <p>Vous avez demandé une réinitialisation de mot de passe. Veuillez cliquer sur le lien suivant pour définir un nouveau mot de passe :</p>
        <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien est valable pendant 1 heure.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
        <p>Cordialement,<br>L'équipe ApoData Analytics</p>
      `
    });
    
    return NextResponse.json(
      { message: 'Les instructions de réinitialisation ont été envoyées à votre adresse email.' }
    );
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}

// Traiter la réinitialisation de mot de passe
export async function PUT(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    
    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token et mot de passe requis' },
        { status: 400 }
      );
    }
    
    // Vérifier le token et sa validité
    const result = await pool.query(
      'SELECT id FROM data_user WHERE password_reset_token = $1 AND password_reset_expires > NOW()',
      [token]
    );
    
    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Token invalide ou expiré' },
        { status: 400 }
      );
    }
    
    const userId = result.rows[0].id;
    
    // Hasher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Mettre à jour le mot de passe et effacer le token
    await pool.query(
      'UPDATE data_user SET password_hash = $1, password_reset_token = NULL, password_reset_expires = NULL, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );
    
    return NextResponse.json(
      { message: 'Mot de passe réinitialisé avec succès' }
    );
  } catch (error) {
    console.error('Error resetting password:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}