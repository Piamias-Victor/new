// src/app/dashboard/detailed/laboratories/page.tsx (mise à jour)
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import { LaboratorySearch } from '@/components/dashboard/laboratories/LaboratorySearch';
import { ProductResultsList } from '@/components/dashboard/products/ProductResultsList';
import { ProductSearchSummary } from '@/components/dashboard/products/ProductSearchSummary';
import { ProductSalesEvolutionChart } from '@/components/dashboard/products/ProductSalesEvolution';
import { ProductStockMonthsPanel } from '@/components/dashboard/stock/ProductStockMonthsPanel';
import { ProductMarginsPanel } from '@/components/dashboard/margins/ProductMarginsPanel';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { Product } from '@/services/productService';

export default function LaboratoryAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();
  
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labData, setLabData] = useState<any | null>(null);
  const [labProducts, setLabProducts] = useState<Product[]>([]);

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

  // Effet pour recharger les données lorsque les dates changent
  useEffect(() => {
    if (selectedLab) {
      handleLabSearch(selectedLab);
    }
  }, [startDate, endDate, selectedPharmacyIds]);

  // Fonction pour rechercher un laboratoire
  const handleLabSearch = async (labName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedLab(labName);
      
      // Préparer les paramètres pour la requête des détails
      const detailsParams = new URLSearchParams({
        name: labName
      });
      
      if (startDate) detailsParams.append('startDate', startDate);
      if (endDate) detailsParams.append('endDate', endDate);
      
      selectedPharmacyIds.forEach(id => {
        detailsParams.append('pharmacyIds', id);
      });
      
      // Requête pour les détails du laboratoire
      const detailsResponse = await fetch(`/api/laboratories/details?${detailsParams}`, {
        cache: 'no-store'
      });
      
      if (!detailsResponse.ok) {
        const errorData = await detailsResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données du laboratoire');
      }
      
      const detailsData = await detailsResponse.json();
      setLabData(detailsData);
      
      // Préparer les paramètres pour la requête des produits
      const productsParams = new URLSearchParams({
        name: labName
      });
      
      selectedPharmacyIds.forEach(id => {
        productsParams.append('pharmacyIds', id);
      });
      
      // Requête pour les produits du laboratoire
      const productsResponse = await fetch(`/api/laboratories/products?${productsParams}`, {
        cache: 'no-store'
      });
      
      if (!productsResponse.ok) {
        const errorData = await productsResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des produits du laboratoire');
      }
      
      const productsData = await productsResponse.json();
      setLabProducts(productsData.products);
    } catch (error) {
      console.error('Erreur lors de la recherche du laboratoire:', error);
      setError(error instanceof Error ? error.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
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
            Analyse par Laboratoire
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Analysez les performances des laboratoires et leurs produits
            {startDate && endDate && (
              <span className="ml-1 text-sm text-sky-600 dark:text-sky-400">
                du {new Date(startDate).toLocaleDateString('fr-FR')} au {new Date(endDate).toLocaleDateString('fr-FR')}
              </span>
            )}
          </p>
        </div>
        
        {/* Interface de recherche */}
        <div className="grid gap-6 mb-8">
          <LaboratorySearch 
            onSearch={handleLabSearch}
            isLoading={isLoading}
          />
          
          {/* Affichage de l'erreur si présente */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          {/* Résultats de l'analyse de laboratoire */}
          {selectedLab && labData && (
            <div className="space-y-6">
              {/* En-tête du laboratoire */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {selectedLab}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Produits</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {labData.summary?.total_products || 0}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Chiffre d'affaires</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(labData.sales?.total_revenue || 0)}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Marge</div>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(labData.sales?.total_margin || 0)}
                      <span className="ml-2 text-sm font-normal">
                        ({(labData.sales?.margin_percentage || 0).toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Synthèse des résultats - si des produits existent */}
              {labProducts.length > 0 && (
                <ProductSearchSummary products={labProducts} 
                labData={labData}/>
              )}
              
              {/* Graphique d'évolution des ventes - si des produits existent */}
              {labProducts.length > 0 && (
                <ProductSalesEvolutionChart 
                  products={labProducts} 
                  isLoading={isLoading} 
                />
              )}
              
              {/* Panneaux d'analyse côte à côte (Stock et Marges) - si des produits existent */}
              {labProducts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ProductStockMonthsPanel 
                    products={labProducts} 
                    isLoading={isLoading} 
                    labData={labData}
                  />
                  
                  <ProductMarginsPanel 
                    products={labProducts} 
                    isLoading={isLoading} 
                    labData={labData}
                  />
                </div>
              )}
              
              {/* Résultats de recherche détaillés */}
              {/* <ProductResultsList 
                products={labProducts}
                isLoading={isLoading}
                error={error}
              /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}