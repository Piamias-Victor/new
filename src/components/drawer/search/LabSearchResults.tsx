// src/components/drawer/search/LabSearchResults.tsx
import React from 'react';
import { FiPackage, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface Laboratory {
  id: string;
  name: string;
  productCount: number;
}

interface LabSearchResultsProps {
  results: Laboratory[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Composant pour afficher les résultats de recherche de laboratoires
 */
export function LabSearchResults({ results, isLoading, error }: LabSearchResultsProps) {
  // État de chargement
  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiLoader className="animate-spin mb-3" size={24} />
        <p>Chargement des laboratoires...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
        <FiAlertCircle className="mb-3" size={24} />
        <p>{error}</p>
      </div>
    );
  }

  // Aucun résultat
  if (results.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiPackage className="mb-3" size={24} />
        <p>Aucun laboratoire trouvé</p>
        <p className="text-sm">Essayez de modifier votre recherche</p>
      </div>
    );
  }

  // Affichage des résultats
  return (
    <div className="space-y-2">
      {results.map(lab => (
        <div 
          key={lab.id}
          className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-full mr-3">
                <FiPackage size={18} />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {lab.name}
              </h3>
            </div>
            
            {/* Badge avec le nombre de produits */}
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
              {lab.productCount} produits
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}