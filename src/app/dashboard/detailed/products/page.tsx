// src/app/dashboard/detailed/products/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import { ProductSearch } from '@/components/dashboard/products/ProductSearch';
import { ProductResultsList } from '@/components/dashboard/products/ProductResultsList';
import { ProductSearchSummary } from '@/components/dashboard/products/ProductSearchSummary';
import { ProductSalesEvolution } from '@/components/dashboard/products/ProductSalesEvolution';
import { useProductSearch } from '@/hooks/useProductSearch';
import { useDateRange } from '@/contexts/DateRangeContext';
import { ProductSearchProvider, useProductSearchContext } from '@/contexts/ProductSearchContext';

// Composant interne qui utilise les contextes
function ProductAnalysisContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startDate, endDate } = useDateRange();
  
  // Accéder au contexte de recherche
  const { getSearchParams } = useProductSearchContext();
  
  // Utiliser notre hook personnalisé pour la recherche de produits
  const { results, isLoading, error, searchProducts } = useProductSearch();
  
  // Gestionnaire pour la recherche
  const handleSearch = async () => {
    const searchParams = getSearchParams();
    await searchProducts(searchParams);
  };

  // Création de l'URL avec les paramètres de date actuels
  const createUrlWithParams = (baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    return url.pathname + url.search;
  };

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Effet pour exécuter la recherche lorsque les dates changent
  useEffect(() => {
    // Si des résultats existent déjà, refaire la recherche avec les nouvelles dates
    if (results.length > 0) {
      handleSearch();
    }
  }, [startDate, endDate]);

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
        <div className="mb-6">
          <Link 
            href={createUrlWithParams("/dashboard/detailed")} 
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400"
          >
            <FiArrowLeft className="mr-2" /> Retour à l'analyse détaillée
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analyse par Produit
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Recherchez et analysez les performances de produits spécifiques
            {startDate && endDate && (
              <span className="ml-1 text-sm text-sky-600 dark:text-sky-400">
                du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        
        {/* Interface de recherche */}
        <div className="grid gap-6 mb-8">
          <ProductSearch 
            onSearch={handleSearch}
            isLoading={isLoading}
          />
          
          {/* Graphique d'évolution des ventes si des produits sont sélectionnés */}
          {results.length > 0 && (
            <ProductSalesEvolution 
              products={results} 
              isLoading={isLoading} 
            />
          )}
          
          {/* Synthèse des résultats */}
          {results.length > 0 && (
            <ProductSearchSummary products={results} />
          )}
          
          {/* Résultats de recherche */}
          <ProductResultsList 
            products={results}
            isLoading={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  );
}

// Composant principal qui englobe tout avec le Provider
export default function ProductAnalysisPage() {
  return (
    <ProductSearchProvider>
      <ProductAnalysisContent />
    </ProductSearchProvider>
  );
}