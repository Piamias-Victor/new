'use client';

import React, { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiFilter } from 'react-icons/fi';

import { useProductFilter } from '@/contexts/ProductFilterContext';
import { KpiCards } from '@/components/dashboard/KpiCards';
import { SelectedProductsList } from '@/components/dashboard/products/SelectedProductsList';
import { PharmaciesList } from '@/components/dashboard/products/PharmaciesList';
import { ImprovedSalesEvolutionChart } from '@/components/dashboard/SalesEvolutionChart';
import { StockEvolutionChart } from '@/components/dashboard/products/StockEvolutionChart';
import { SalesProjection } from '@/components/dashboard/SalesProjection';

export default function LaboratoriesDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isFilterActive } = useProductFilter();

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

  return (
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

        {!isFilterActive ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mb-4">
                <FiFilter size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Sélectionnez des laboratoires pour commencer
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                Utilisez le filtre dans l'en-tête pour sélectionner des laboratoires ou marques à analyser.
              </p>
            </div>
          </div>
        ) : (
          <>
            <KpiCards/>
            <div className="mt-6"/>  
            
            {/* Sales and Stock Evolution Charts */}
            <ImprovedSalesEvolutionChart />
            <StockEvolutionChart />

             <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <SalesProjection />
              </div>
           
            {/* Products List */}
            <SelectedProductsList/>
            <div className="mt-6"/>  
            
            {/* Pharmacies List */}
            <PharmaciesList />
          </>
        )}
      </div>
    </div>
  );
}