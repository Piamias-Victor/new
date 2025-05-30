// src/app/dashboard/detailed/laboratories/page.tsx (Avec écran d'accueil)
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ImprovedSalesEvolutionChart } from '@/components/dashboard/SalesEvolutionChart';
import { StockEvolutionChart } from '@/components/dashboard/products/StockEvolutionChart';
import { SalesProjection } from '@/components/dashboard/SalesProjection';
import { LaboratoryAnalysisContainer } from '@/components/dashboard/laboratories/LaboratoryAnalysisContainer';
import { PharmaciesList } from '@/components/dashboard/products/PharmaciesList';
import { SelectedProductsList } from '@/components/dashboard/products/SelectedProductsList';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { LaboratoriesWelcomeScreen } from '@/components/dashboard/laboratories/LaboratoriesWelcomeScreen';
import { useFirstLoad } from '@/hooks/useFirstLoad';

export default function LaboratoriesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFilterActive, selectedLabs } = useProductFilter();
  const { isFirstLoad } = useFirstLoad();

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

  const isPharmacyUser = session.user?.role === 'pharmacy_user';

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          
          {/* Header avec titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analyse Laboratoires
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {isFirstLoad 
                ? "Configurez vos paramètres et cliquez sur Appliquer pour analyser vos laboratoires."
                : "Explorez les performances commerciales de vos laboratoires et marques"
              }
            </p>
          </div>

          {/* Contenu conditionnel */}
          {isFirstLoad ? (
            /* Écran d'accueil pour la première utilisation */
            <LaboratoriesWelcomeScreen />
          ) : (
            /* Contenu normal après le premier chargement */
            <>
              {/* KPI Cards */}
              <div className="my-8">
                <KpiCards />
              </div>

              {/* Conteneur d'analyse de laboratoire */}
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
              
              <div className="mt-6" />
              
              {/* Liste des produits sélectionnés */}
              <SelectedProductsList />
              
              <div className="mt-6" />
              
              {/* Liste des pharmacies pour les admins */}
              {!isPharmacyUser && <PharmaciesList />}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}