'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';

import { ProductStockMonthsPanelFiltered } from '@/components/dashboard/stock/ProductStockMonthsPanel';
import { ProductMarginsPanelFiltered } from '@/components/dashboard/margins/ProductMarginsPanel';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProductEvolutionPanel } from '@/components/dashboard/evolution/ProductEvolutionPanel';
import { ProductPriceComparisonPanel } from '@/components/dashboard/price/ProductPriceComparisonPanel';

export default function ProductDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFilterActive } = useProductFilter();

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
            Analyse Produits
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Explorez les performances de stock et de marge pour vos produits
          </p>
        </div>

        {/* Filtre actif */}

        {!isFilterActive ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mb-4">
                <FiFilter size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sélectionnez des produits pour commencer
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Utilisez le filtre dans l'en-tête pour sélectionner des produits, laboratoires ou segments à analyser.
              </p>
            </div>
          </div>
        ) : (
          <>

            <KpiCards/>
            {/* Panneaux d'analyse côte à côte (Stock et Marges) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <ProductStockMonthsPanelFiltered />
              <ProductMarginsPanelFiltered />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              <ProductEvolutionPanel />
              <ProductPriceComparisonPanel />
            </div>
          </>
        )}
      </div>
    </div>
  );
}