// src/app/dashboard/detailed/laboratories/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';

import { LaboratorySearch } from '@/components/dashboard/laboratories/LaboratorySearch';
import { useDateRange } from '@/contexts/DateRangeContext';

export default function LaboratoryAnalysisPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { startDate, endDate } = useDateRange();
  
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [labData, setLabData] = useState<any | null>(null);

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

  // Fonction pour rechercher un laboratoire
  const handleLabSearch = async (labName: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedLab(labName);
      
      // Préparer les paramètres de la requête
      const params = new URLSearchParams({
        name: labName
      });
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      // Faire la requête à l'API
      const response = await fetch(`/api/laboratories/details?${params}`, {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la récupération des données du laboratoire');
      }
      
      const data = await response.json();
      setLabData(data);
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
          
          {/* Contenu principal - à implémenter au fur et à mesure */}
          {selectedLab && labData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Résultats pour {selectedLab}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Les détails de l'analyse seront affichés ici. Cette partie est en cours d'implémentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}