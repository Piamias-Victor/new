// src/app/dashboard/comparison/page.tsx
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ComparativeMetrics } from '@/components/dashboard/comparison/ComparativeMetrics';
import { ComparisonGapAnalysis } from '@/components/dashboard/comparison/ComparisonGapAnalysis';
import { ComparisonHeader } from '@/components/dashboard/comparison/ComparisonHeader';
import { ComparisonSummary } from '@/components/dashboard/comparison/ComparisonSummary';
import { PerformanceRadarChart } from '@/components/dashboard/comparison/PerformanceRadarChart';
import { SalesEvolutionComparison } from '@/components/dashboard/comparison/SalesEvolutionComparison';
import { SegmentDistributionComparison } from '@/components/dashboard/comparison/SegmentDistributionComparison';
import { TopProductsComparison } from '@/components/dashboard/comparison/TopProductsComparison';


export default function ComparisonPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedItems, setSelectedItems] = useState({
    itemA: null,
    itemB: null,
    type: 'product' // 'product', 'laboratory', 'segment'
  });

  // Redirection si non authentifié
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Gestion du changement d'éléments sélectionnés
  const handleItemsChange = (itemA, itemB, type) => {
    setSelectedItems({ itemA, itemB, type });
  };

  // Gestion de l'inversion des éléments
  const handleSwapItems = () => {
    setSelectedItems({
      ...selectedItems,
      itemA: selectedItems.itemB,
      itemB: selectedItems.itemA
    });
  };

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
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analyse Comparative
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Comparez les performances et métriques entre produits, laboratoires ou segments
            </p>
          </div>

          {/* Sélecteurs de comparaison */}
          <div className="mb-6">
            <ComparisonHeader 
              selectedItems={selectedItems}
              onItemsChange={handleItemsChange}
              onSwapItems={handleSwapItems}
            />
          </div>

          {/* Section des métriques comparative */}
          {selectedItems.itemA && selectedItems.itemB ? (
            <div className="space-y-6">
              <ComparativeMetrics itemA={selectedItems.itemA} itemB={selectedItems.itemB} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesEvolutionComparison itemA={selectedItems.itemA} itemB={selectedItems.itemB} />
                <PerformanceRadarChart itemA={selectedItems.itemA} itemB={selectedItems.itemB} />
              </div>

              <SegmentDistributionComparison itemA={selectedItems.itemA} itemB={selectedItems.itemB} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TopProductsComparison itemA={selectedItems.itemA} itemB={selectedItems.itemB} />
                <ComparisonGapAnalysis itemA={selectedItems.itemA} itemB={selectedItems.itemB} />
              </div>

              <ComparisonSummary itemA={selectedItems.itemA} itemB={selectedItems.itemB} />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-10 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-sky-600 dark:text-sky-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Sélectionnez des éléments à comparer
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Utilisez les champs de recherche ci-dessus pour sélectionner deux produits, laboratoires ou segments à comparer.
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}