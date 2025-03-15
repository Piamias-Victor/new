'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { PharmacyDataCard } from '@/components/dashboard/PharmacyDataCard';
import { DatePeriodDisplay } from '@/components/shared/DatePeriodDisplay';
import { FiBarChart2, FiPackage, FiTrendingUp, FiActivity } from 'react-icons/fi';

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <PharmacyDataCard />
          </div>
          <div>
            <DatePeriodDisplay />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
                <FiBarChart2 size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              23,458€
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium mr-1">+5.3%</span>
              <span className="text-gray-500 dark:text-gray-400">vs période précédente</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 mr-3">
                <FiTrendingUp size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marge</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              32.4%
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium mr-1">+1.2%</span>
              <span className="text-gray-500 dark:text-gray-400">vs période précédente</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
                <FiPackage size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stock</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              45K€
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-red-500 dark:text-red-400 font-medium mr-1">-2.1%</span>
              <span className="text-gray-500 dark:text-gray-400">vs période précédente</span>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-4">
              <div className="p-3 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 mr-3">
                <FiActivity size={24} />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rotation</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              6.8x
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-green-500 dark:text-green-400 font-medium mr-1">+0.5x</span>
              <span className="text-gray-500 dark:text-gray-400">vs période précédente</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Évolution des ventes
          </h2>
          
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">
              Le graphique d'évolution des ventes sera intégré ici.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Top produits
            </h2>
            
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Le tableau des meilleurs produits sera intégré ici.
              </p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Répartition des ventes
            </h2>
            
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-500 dark:text-gray-400">
                Le graphique de répartition des ventes sera intégré ici.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}