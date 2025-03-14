'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Afficher un état de chargement si la session est en cours de chargement
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Si pas de session, ne rien afficher (la redirection se fera via useEffect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Bienvenue, {session.user?.name}. Cette page sera bientôt disponible avec toutes les fonctionnalités d'analyse.
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Développement en cours
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Le tableau de bord est actuellement en développement. Nous travaillons à intégrer toutes les fonctionnalités 
            d'analyse et de visualisation des données pour vous offrir une expérience optimale.
          </p>
          
          <div className="mt-8 p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
            <h3 className="text-lg font-medium text-sky-800 dark:text-sky-300 mb-2">Prochaines étapes :</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
              <li>Intégration avec l'API pour les données en temps réel</li>
              <li>Tableaux de bord personnalisés par pharmacie</li>
              <li>Visualisations des ventes et des stocks</li>
              <li>Analyse des marges et détection des ruptures</li>
              <li>Comparaison de performance avec le groupement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}