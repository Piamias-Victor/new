// src/app/dashboard/detailed/laboratories/page.tsx - Mise à jour
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';

import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ImprovedSalesEvolutionChart } from '@/components/dashboard/SalesEvolutionChart';
import { StockEvolutionChart } from '@/components/dashboard/products/StockEvolutionChart';
import { SalesProjection } from '@/components/dashboard/SalesProjection';
import { LaboratoryAnalysisContainer } from '@/components/dashboard/laboratories/LaboratoryAnalysisContainer';
import { PharmaciesList } from '@/components/dashboard/products/PharmaciesList';
import { SelectedProductsList } from '@/components/dashboard/products/SelectedProductsList';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export default function LaboratoriesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFilterActive, selectedLabs } = useProductFilter();

  // Redirection if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // If no session, don't display anything (redirection will happen via useEffect)
  if (!session) {
    return null;
  }

  // Détermine si un laboratoire est sélectionné
  const hasSelectedLab = selectedLabs.length > 0;

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analyse Laboratoires
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Explorez les performances commerciales de vos laboratoires et marques
          </p>
        </div>

        {/* Conteneur d'analyse de laboratoire - UTILISE LE FILTRE EXISTANT */}
        {/* Afficher les graphiques d'évolution et de projection uniquement si un filtre est actif */}
          <>
            <div className="my-8">
              <KpiCards />
            </div>

            <LaboratoryAnalysisContainer />

            
            {/* Sales and Stock Evolution Charts */}
            <div className="mt-6">
              <ImprovedSalesEvolutionChart />
            </div>
            <div className="mt-6">
              <StockEvolutionChart />
            </div>

            {/* Sales Projection */}
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <SalesProjection />
            </div>
            <div className="mt-6"/>  
            <SelectedProductsList/>
            <div className="mt-6"/>  
            <PharmaciesList />
          </>
      </div>
    </div>
    </SidebarLayout>
    
  );
}