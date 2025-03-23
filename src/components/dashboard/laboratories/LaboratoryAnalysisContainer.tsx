// src/components/dashboard/laboratories/LaboratoryAnalysisContainer.tsx
import React, { useState, useEffect } from 'react';
import { FiPackage } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { LaboratorySegmentsPanel } from './LaboratorySegmentsPanel';
import { ActiveEanFilter } from '@/components/filters/ActiveFilter';

export function LaboratoryAnalysisContainer() {
  // Utiliser le contexte ProductFilterContext
  const { selectedLabs, isFilterActive } = useProductFilter();
  
  // État local pour le laboratoire sélectionné actuellement
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);
  
  // Mettre à jour le laboratoire sélectionné lorsque selectedLabs change
  useEffect(() => {
    // Si un laboratoire est sélectionné, prendre le premier
    if (selectedLabs.length > 0) {
      setCurrentLabId(selectedLabs[0].name); // Utiliser name comme ID
    } else {
      setCurrentLabId(null);
    }
  }, [selectedLabs]);

  return (
    <div className="space-y-6">
      {/* Afficher le filtre actif */}
      {/* Afficher l'analyse du laboratoire sélectionné */}
      {currentLabId ? (
        <LaboratorySegmentsPanel laboratoryId={currentLabId} />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mb-4">
            <FiPackage size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sélectionnez un laboratoire pour commencer
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Utilisez le filtre dans l'en-tête pour sélectionner un laboratoire et accéder à son analyse détaillée par segment.
          </p>
        </div>
      )}
    </div>
  );
}