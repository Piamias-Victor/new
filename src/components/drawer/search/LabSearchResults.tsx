import React from 'react';
import { FiPackage, FiAlertCircle, FiLoader, FiCheck } from 'react-icons/fi';

export interface Laboratory {
  name: string;
  code_13_refs: string[];
  product_count: number;
}

interface LabSearchResultsProps {
  results: Laboratory[];
  isLoading: boolean;
  error: string | null;
  selectedLabs: Laboratory[];
  onToggleLab: (lab: Laboratory) => void;
}

/**
 * Composant pour afficher les résultats de recherche de laboratoires
 */
export function LabSearchResults({ 
  results, 
  isLoading, 
  error, 
  selectedLabs,
  onToggleLab
}: LabSearchResultsProps) {
  // Vérifier si un laboratoire est sélectionné
  const isSelected = (lab: Laboratory) => {
    return selectedLabs.some(l => l.name === lab.name);
  };

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
          key={lab.name}
          className={`p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer transition-colors ${
            isSelected(lab) 
              ? 'border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
              : 'border-gray-200 dark:border-gray-700'
          }`}
          onClick={() => onToggleLab(lab)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start">
              {/* Icône de sélection */}
              <div className={`mr-3 p-1 rounded-full ${
                isSelected(lab) 
                  ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400' 
                  : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
              }`}>
                <FiCheck size={14} />
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {lab.name}
                </h3>
              </div>
            </div>
            
            {/* Badge avec le nombre de produits */}
            <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
              {lab.product_count} produits
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}