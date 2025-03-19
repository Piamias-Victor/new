'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PharmacyDataCard } from '@/components/dashboard/PharmacyDataCard';
import { DatePeriodDisplay } from '@/components/shared/DatePeriodDisplay';
import { NavigationCards } from '@/components/dashboard/NavigationCards';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { SalesEvolutionChart } from '@/components/dashboard/SalesEvolutionChart';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { SalesDistribution } from '@/components/dashboard/SalesDistribution';

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
            Bienvenue, {session.user?.name}. Consultez les données et analyses de vos pharmacies.
          </p>
        </div>
        
        {/* KPI Cards */}
        <div className="mb-8">
          <KpiCards />
        </div>

        {/* Navigation Cards */}
        <NavigationCards />
        
        {/* Nouveau composant d'évolution des ventes */}
        {/* <SalesEvolutionChart /> */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top produits
            </h2>
            
            {/* <TopProducts /> */}
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Répartition des ventes
            </h2>
            
            {/* <SalesDistribution /> */}
          </div>
        </div>
      </div>
    </div>
  );
}