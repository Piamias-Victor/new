// src/types/next-auth.d.ts

declare module "next-auth" {
  /**
   * Étendre l'objet User
   */
  interface User extends DefaultUser {
    role?: string;
    pharmacyName?: string;
  }

  /**
   * Étendre l'objet Session pour inclure nos propriétés personnalisées
   */
  interface Session {
    user: {
      id?: string;
      role?: string;
      pharmacyName?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Étendre l'objet JWT
   */
  interface JWT {
    role?: string;
    pharmacyName?: string;
  }
}