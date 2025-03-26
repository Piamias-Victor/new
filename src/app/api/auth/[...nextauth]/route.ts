// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
// src/app/api/auth/[...nextauth]/route.ts
// Modifiez la partie authorize du CredentialsProvider

async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) return null;

  try {
    // Rechercher l'utilisateur dans la base de données
    const result = await pool.query(
      `SELECT id, email, name, password_hash, role, pharmacy_id, 
       (SELECT name FROM data_pharmacy WHERE id = data_user.pharmacy_id) as pharmacy_name
       FROM data_user 
       WHERE email = $1`,
      [credentials.email]
    );

    const user = result.rows[0];
    
    if (!user) {
      console.log('Utilisateur non trouvé:', credentials.email);
      return null;
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(
      credentials.password,
      user.password_hash
    );

    if (!isPasswordValid) {
      console.log('Mot de passe incorrect pour:', credentials.email);
      return null;
    }
    
    console.log('Authentification réussie pour:', credentials.email);
    
    // Mettre à jour la date de dernière connexion
    await pool.query(
      'UPDATE data_user SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Retourner les données de l'utilisateur (sans le hash du mot de passe)
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      pharmacyId: user.pharmacy_id,
      pharmacyName: user.pharmacy_name
    };
  } catch (error) {
    console.error('Erreur dans la fonction authorize:', error);
    return null;
  }
}
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Persister les données de l'utilisateur dans le JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.pharmacyId = user.pharmacyId;
        token.pharmacyName = user.pharmacyName;
      }
      return token;
    },
    async session({ session, token }) {
      // Ajouter les propriétés du token à la session
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.pharmacyId = token.pharmacyId;
        session.user.pharmacyName = token.pharmacyName;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };