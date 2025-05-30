// src/app/dashboard/detailed/products/page.tsx (Avec écran d'accueil)
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import { ProductStockMonthsPanelFiltered } from '@/components/dashboard/stock/ProductStockMonthsPanel';
import { ProductMarginsPanelFiltered } from '@/components/dashboard/margins/ProductMarginsPanel';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { ProductEvolutionPanel } from '@/components/dashboard/evolution/ProductEvolutionPanel';
import { ProductPriceComparisonPanel } from '@/components/dashboard/price/ProductPriceComparisonPanel';
import { SelectedProductsList } from '@/components/dashboard/products/SelectedProductsList';
import { PharmaciesList } from '@/components/dashboard/products/PharmaciesList';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ProductsWelcomeScreen } from '@/components/dashboard/products/ProductsWelcomeScreen';
import { useFirstLoad } from '@/hooks/useFirstLoad';

export default function ProductDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFilterActive } = useProductFilter();
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

  // Vérifier si l'utilisateur est une pharmacie
  const isPharmacyUser = session.user?.role === 'pharmacy_user';

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          
          {/* Header avec titre */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analyse Produits
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {isFirstLoad 
                ? "Configurez vos filtres et cliquez sur Appliquer pour analyser vos produits."
                : "Explorez les performances de stock et de marge pour vos produits"
              }
            </p>
          </div>

          {/* Contenu conditionnel */}
          {isFirstLoad ? (
            /* Écran d'accueil pour la première utilisation */
            <ProductsWelcomeScreen />
          ) : (
            /* Contenu normal après le premier chargement */
            <>
              {/* KPI Cards */}
              <KpiCards />
              
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
              
              {/* Liste des produits sélectionnés */}
              <SelectedProductsList />
              
              <div className="mt-6" />
              
              {/* Afficher la liste des pharmacies uniquement si l'utilisateur n'est PAS une pharmacie */}
              {!isPharmacyUser && <PharmaciesList />}
            </>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}