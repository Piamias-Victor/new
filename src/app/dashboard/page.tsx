// src/app/dashboard/page.tsx (Version avec écran d'accueil)
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ImprovedSalesEvolutionChart } from '@/components/dashboard/SalesEvolutionChart';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { EnhancedSegmentDistribution } from '@/components/dashboard/SegmentDistribution';
import { SalesProjection } from '@/components/dashboard/SalesProjection';
import { GroupingComparison } from '@/components/dashboard/GroupingComparison';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { useFirstLoad } from '@/hooks/useFirstLoad';
import { WelcomeScreen } from './WelcomeScreen';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFirstLoad } = useFirstLoad();

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
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          
          {/* Header avec titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de bord
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Bienvenue, {session.user?.name}. 
              {isFirstLoad 
                ? "Configurez vos paramètres et cliquez sur Appliquer pour commencer."
                : "Consultez les données et analyses de vos pharmacies."
              }
            </p>
          </div>

          {/* Contenu conditionnel */}
          {isFirstLoad ? (
            /* Écran d'accueil pour la première utilisation */
            <WelcomeScreen />
          ) : (
            /* Contenu normal du dashboard après le premier chargement */
            <>
              {/* KPI Cards */}
              <div className="mb-8">
                <KpiCards />
              </div>
              
              {/* Graphique d'évolution des ventes */}
              <ImprovedSalesEvolutionChart />
              
              {/* Grille des composants analytics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Top produits
                  </h2>
                  <TopProducts />
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Comparatif Groupement
                  </h2>
                  <GroupingComparison />
                </div>
              </div>
              
              {/* Distribution des segments */}
              <div className="mt-8">
                <EnhancedSegmentDistribution />
              </div>

              {/* Projection des ventes */}
              <div className="my-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <SalesProjection />
              </div>
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}