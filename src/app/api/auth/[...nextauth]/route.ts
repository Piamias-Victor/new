import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// Utilisateurs de test (à remplacer par une API vers le backend)
const users = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@phardev.fr',
    password: 'admin123', // Dans une vraie app, utiliser bcrypt
    role: 'admin',
    pharmacyName: 'Admin'
  }
];

// Définir les options d'authentification
const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Dans une vraie app, requête à votre API/Backend
        const user = users.find(user => user.email === credentials.email);
        
        if (user && user.password === credentials.password) {
          // Ne pas inclure le mot de passe dans l'objet retourné
          const { password, ...userWithoutPassword } = user;
          return userWithoutPassword;
        }
        
        return null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Persister les données de l'utilisateur dans le JWT lors de la connexion
      if (user) {
        token.role = user.role;
        token.pharmacyName = user.pharmacyName;
      }
      return token;
    },
    async session({ session, token }) {
      // Ajouter les propriétés du token à la session
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
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
  secret: process.env.NEXTAUTH_SECRET || 'votre-secret-temporaire-a-changer',
};

// Créer et exporter le handler avec les méthodes HTTP appropriées
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };