// src/libs/db.ts
import { Pool } from 'pg';

/**
 * Configuration et instance du pool de connexions PostgreSQL.
 * 
 * Ce pool permet de gérer plusieurs connexions à la base de données de manière efficace.
 */
const pool = new Pool({
  user: process.env.DB_USER, // Utilisateur de la base de données
  host: process.env.DB_HOST, // Hôte de la base de données
  database: process.env.DB_NAME, // Nom de la base de données
  password: process.env.DB_PASSWORD, // Mot de passe de la base de données
  port: parseInt(process.env.DB_PORT || '5432', 10), // Port de la base de données avec valeur par défaut
  ssl: {
    rejectUnauthorized: false, // Désactive la vérification SSL si nécessaire (utilisé souvent avec AWS RDS)
  },
});

// Optionnel : Gestion des erreurs de connexion au pool
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Ferme le processus en cas d'erreur critique
});

export default pool;
