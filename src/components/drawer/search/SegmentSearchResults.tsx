import React from 'react';
import { FiGrid, FiAlertCircle, FiLoader, FiCheck } from 'react-icons/fi';

export interface Segment {
  id: string;
  name: string;
  parentCategory?: string;
  productCount: number;
}

interface SegmentSearchResultsProps {
  results: Segment[];
  isLoading: boolean;
  error: string | null;
  selectedSegments: Segment[];
  onToggleSegment: (segment: Segment) => void;
}

export function SegmentSearchResults({ 
  results, 
  isLoading, 
  error, 
  selectedSegments,
  onToggleSegment
}: SegmentSearchResultsProps) {
  // Vérifier si un segment est sélectionné
  const isSelected = (segment: Segment) => {
    return selectedSegments.some(s => s.id === segment.id);
  };

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
              className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
                isSelected(segment) 
                  ? 'border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={() => onToggleSegment(segment)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  {/* Icône de sélection */}
                  <div className={`mr-3 p-1 rounded-full ${
                    isSelected(segment) 
                      ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400' 
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
                  }`}>
                    <FiCheck size={14} />
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {segment.name}
                    </h3>
                  </div>
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