// src/app/dashboard/rdv-labos/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProductStockMonthsPanelFiltered } from '@/components/dashboard/stock/ProductStockMonthsPanel';
import { ProductMarginsPanelFiltered } from '@/components/dashboard/margins/ProductMarginsPanel';
import { ProductEvolutionPanel } from '@/components/dashboard/evolution/ProductEvolutionPanel';
import { ProductPriceComparisonPanel } from '@/components/dashboard/price/ProductPriceComparisonPanel';
import { LaboratoryAnalysisContainer } from '@/components/dashboard/laboratories/LaboratoryAnalysisContainer';
import { SalesProjection } from '@/components/dashboard/SalesProjection';
import { SelectedProductsList } from '@/components/dashboard/products/SelectedProductsList';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export default function RdvLabosPage() {
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
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rendez-vous Laboratoires
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Préparation des rendez-vous et analyse des performances
            </p>
          </div>
          
          {/* KPI Cards */}
          <div className="my-8">
            <KpiCards />
          </div>
          
          {/* Analyse segmentation du laboratoire */}
          <div className="mb-8">
            <LaboratoryAnalysisContainer />
          </div>
          
          {/* Panneaux d'analyse côte à côte (Stock et Marges) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <ProductStockMonthsPanelFiltered />
            <ProductMarginsPanelFiltered />
          </div>
          
          {/* Panneaux d'analyse côte à côte (Évolution et Prix) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <ProductEvolutionPanel />
            <ProductPriceComparisonPanel />
          </div>
          
          {/* Projection annuelle */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <SalesProjection />
          </div>
          
          {/* Liste des produits du laboratoire */}
          <div className="mt-6">
            <SelectedProductsList />
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}