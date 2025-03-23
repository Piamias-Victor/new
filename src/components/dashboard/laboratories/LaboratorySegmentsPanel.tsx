// src/components/dashboard/laboratories/LaboratorySegmentsPanel.tsx
import React, { useState } from 'react';
import { FiPackage, FiGrid } from 'react-icons/fi';
import { useLaboratorySegments } from '@/hooks/useLaboratorySegments';
import { SegmentAnalysisPanel } from './SegmentAnalysisPanel';
import { LaboratorySegmentsTable } from './LaboratorySegmentsTable';

interface LaboratorySegmentsPanelProps {
  laboratoryId: string;
}

export function LaboratorySegmentsPanel({ laboratoryId }: LaboratorySegmentsPanelProps) {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const { laboratory, segments, isLoading, error } = useLaboratorySegments(laboratoryId);

  // Gérer le clic sur un segment pour l'analyse détaillée
  const handleSegmentSelect = (segmentId: string) => {
    setSelectedSegmentId(segmentId === selectedSegmentId ? null : segmentId);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 h-64"></div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-red-500 dark:text-red-400">
        <div className="flex items-center mb-4">
          <FiPackage className="mr-2" size={20} />
          <h3 className="text-lg font-medium">Erreur de chargement</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tableau des segments */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300 mr-3">
            <FiGrid size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Segments du laboratoire
          </h3>
        </div>
        
        <LaboratorySegmentsTable 
          segments={segments} 
          onSegmentSelect={handleSegmentSelect}
          selectedSegmentId={selectedSegmentId}
        />
      </div>

      {/* Analyse détaillée du segment sélectionné */}
      {selectedSegmentId && (
        <SegmentAnalysisPanel
          segmentId={selectedSegmentId}
          laboratoryId={laboratoryId}
        />
      )}
    </div>
  );
}