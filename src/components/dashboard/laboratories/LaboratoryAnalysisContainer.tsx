// src/components/dashboard/laboratories/LaboratoryAnalysisContainer.tsx

import React, { useState, useEffect } from 'react';
import { FiPackage, FiSearch } from 'react-icons/fi';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { LaboratorySegmentsPanel } from './LaboratorySegmentsPanel';
import { ActiveEanFilter } from '@/components/filters/ActiveFilter';
import { SegmentAnalysisPanel } from './SegmentAnalysisPanel';

export function LaboratoryAnalysisContainer() {
  // Utiliser le contexte ProductFilterContext
  const { selectedLabs, selectedSegments, isFilterActive } = useProductFilter();
  
  // États locaux pour les sélections actuelles
  const [currentLabId, setCurrentLabId] = useState<string | null>(null);
  const [currentSegmentId, setCurrentSegmentId] = useState<string | null>(null);
  
  // Mettre à jour les sélections lorsque les filtres changent
  useEffect(() => {
    if (selectedLabs.length > 0) {
      setCurrentLabId(selectedLabs[0].name);
      setCurrentSegmentId(null); // Réinitialiser le segment si un labo est sélectionné
    } else if (selectedSegments.length > 0) {
      setCurrentSegmentId(selectedSegments[0].id);
      setCurrentLabId(null); // Réinitialiser le labo si un segment est sélectionné
    } else {
      setCurrentLabId(null);
      setCurrentSegmentId(null);
    }
  }, [selectedLabs, selectedSegments]);

  return (
    <div className="space-y-6">
      {/* Analyses conditionnelles */}
      {currentLabId ? (
        // Analyse par laboratoire (avec ses segments)
        <LaboratorySegmentsPanel laboratoryId={currentLabId} />
      ) : currentSegmentId ? (
        // Analyse directe d'un segment sans laboratoire spécifique
        <SegmentAnalysisPanel 
          segmentId={currentSegmentId}
          // Pas de laboratoryId car on veut une analyse globale du segment
        />
      ) : (
        // Message d'aide à l'utilisateur
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mb-4">
            <FiSearch size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Sélectionnez un laboratoire ou un segment
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto">
            Utilisez le filtre dans l'en-tête pour sélectionner un laboratoire ou un segment et accéder à son analyse détaillée.
          </p>
        </div>
      )}
    </div>
  );
}