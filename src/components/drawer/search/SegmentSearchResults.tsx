// src/components/drawer/search/SegmentSearchResults.tsx
import React from 'react';
import { FiGrid, FiAlertCircle, FiLoader } from 'react-icons/fi';

interface Segment {
  id: string;
  name: string;
  parentCategory?: string;
  productCount: number;
}

interface SegmentSearchResultsProps {
  results: Segment[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Composant pour afficher les résultats de recherche de segments
 */
export function SegmentSearchResults({ results, isLoading, error }: SegmentSearchResultsProps) {
  // État de chargement
  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiLoader className="animate-spin mb-3" size={24} />
        <p>Chargement des segments...</p>
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
        <FiGrid className="mb-3" size={24} />
        <p>Aucun segment trouvé</p>
        <p className="text-sm">Essayez de modifier votre recherche</p>
      </div>
    );
  }

  // Grouper les segments par catégorie parentale
  const groupedSegments: Record<string, Segment[]> = {};
  results.forEach(segment => {
    const parent = segment.parentCategory || 'Autres';
    if (!groupedSegments[parent]) {
      groupedSegments[parent] = [];
    }
    groupedSegments[parent].push(segment);
  });

  // Affichage des résultats groupés
  return (
    <div className="space-y-6">
      {Object.entries(groupedSegments).map(([category, segments]) => (
        <div key={category} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            {category}
          </h3>
          
          {segments.map(segment => (
            <div 
              key={segment.id}
              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full mr-3">
                    <FiGrid size={18} />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {segment.name}
                  </h3>
                </div>
                
                {/* Badge avec le nombre de produits */}
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                  {segment.productCount} produits
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}