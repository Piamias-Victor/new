'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { FiArrowLeft, FiBox, FiPackage, FiGrid, FiSearch, FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';
import { AnalysisCategoryCard } from '@/components/dashboard/analysis/AnalysisCategoryCard';
import { StatisticsSection } from '@/components/dashboard/analysis/StatisticsSection';
import { useGlobalStatistics } from '@/hooks/useGlobalStatistics';


export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};


/**
 * Page d'analyse détaillée
 * 
 * Cette page sert de hub pour l'exploration détaillée des données par produit,
 * laboratoire ou catégorie.
 */
export default function DetailedAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startDate, endDate } = useDateRange();
  const { statistics, isLoading: statsLoading } = useGlobalStatistics();

  // Données pour les tops 3
  const topProducts = [
    { name: 'Doliprane 1000mg', value: '342 ventes', change: '+8.4%' },
    { name: 'Efferalgan 500mg', value: '285 ventes', change: '+4.2%' },
    { name: 'Amoxicilline Biogaran', value: '210 ventes', change: '+12.8%' },
  ];

  const topLabs = [
    { name: 'Sanofi', value: '1245 ventes', change: '+3.2%' },
    { name: 'Pfizer', value: '986 ventes', change: '+1.8%' },
    { name: 'Biogaran', value: '854 ventes', change: '-2.1%' },
  ];

  const topCategories = [
    { name: 'Douleur & Fièvre', value: '2450 ventes', change: '+5.7%' },
    { name: 'Vitamines', value: '1320 ventes', change: '+9.8%' },
    { name: 'Antibiotiques', value: '965 ventes', change: '-1.2%' },
  ];

  // Formatage des statistiques globales

  const globalStats = [
    { label: 'Produits analysés', value: formatNumber(statistics.uniqueProducts) },
    { label: 'Laboratoires', value: formatNumber(statistics.uniqueLabs) },
    { label: 'Catégories', value: formatNumber(statistics.uniqueCategories) },
    { label: 'Ventes analysées', value: formatNumber(statistics.totalSales) },
  ];

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

  // Création de l'URL avec les paramètres de date actuels
  const createUrlWithParams = (baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    return url.pathname + url.search;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link 
            href={createUrlWithParams("/dashboard")} 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <FiArrowLeft className="mr-2" /> Retour au tableau de bord
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analyse Détaillée
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Explorez les données spécifiques par produit, laboratoire ou catégorie
          </p>
        </div>
        
        {/* Contenu de la page avec carte d'analyse */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <AnalysisCategoryCard
            title="Par produit"
            description="Analysez les performances de chaque produit individuellement avec des recherches par code EAN13 ou nom."
            icon={<FiBox size={22} />}
            buttonIcon={<FiSearch className="mr-2" size={16} />}
            buttonText="Rechercher un produit"
            linkPath={createUrlWithParams("/dashboard/detailed/products")}
            topItems={topProducts}
            topTitle="Top 3 Produits"
            bgColorClass="bg-sky-100 dark:bg-sky-900/30"
            textColorClass="text-sky-600 dark:text-sky-300"
          />
          
          <AnalysisCategoryCard
            title="Par laboratoire"
            description="Évaluez les performances par fabricant ou laboratoire pour identifier les partenaires stratégiques."
            icon={<FiPackage size={22} />}
            buttonIcon={<FiBarChart className="mr-2" size={16} />}
            buttonText="Explorer les laboratoires"
            linkPath={createUrlWithParams("/dashboard/detailed/laboratories")}
            topItems={topLabs}
            topTitle="Top 3 Laboratoires"
            bgColorClass="bg-teal-100 dark:bg-teal-900/30"
            textColorClass="text-teal-600 dark:text-teal-300"
          />
          
          <AnalysisCategoryCard
            title="Par catégorie"
            description="Analysez les tendances et performances par segment de marché pour optimiser votre offre commerciale."
            icon={<FiGrid size={22} />}
            buttonIcon={<FiTrendingUp className="mr-2" size={16} />}
            buttonText="Analyser les catégories"
            linkPath={createUrlWithParams("/dashboard/detailed/categories")}
            topItems={topCategories}
            topTitle="Top 3 Catégories"
            bgColorClass="bg-emerald-100 dark:bg-emerald-900/30"
            textColorClass="text-emerald-600 dark:text-emerald-300"
          />
        </div>
        
        {/* Section statistiques avec état de chargement */}
        {statsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Statistiques globales d'analyse
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700 animate-pulse"
                >
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <StatisticsSection
            title="Statistiques globales d'analyse"
            stats={globalStats}
          />
        )}
      </div>
    </div>
  );
}