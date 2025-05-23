// src/components/dashboard/laboratories/SegmentAnalysisPanel.tsx
import React from 'react';
import { FiBarChart2, FiPieChart } from 'react-icons/fi';
import { useSegmentAnalysis } from '@/hooks/useSegmentAnalysis';
import { SegmentMarketShare } from './SegmentMarketShare';
import { SegmentTopProducts } from './SegmentTopProducts';

interface SegmentAnalysisPanelProps {
  segmentId: string;
  laboratoryId?: string; // Rendre laboratoryId optionnel
}

export function SegmentAnalysisPanel({ 
  segmentId, 
  laboratoryId 
}: SegmentAnalysisPanelProps) {
  const { 
    segmentInfo, 
    selectedLabProductsTop, 
    otherLabProductsTop, 
    marketShareByLab,
    isLoading, 
    error 
  } = useSegmentAnalysis(segmentId, laboratoryId);

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-36 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-red-500 dark:text-red-400">
        <div className="flex items-center mb-4">
          <FiBarChart2 className="mr-2" size={20} />
          <h3 className="text-lg font-medium">Erreur de chargement</h3>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  // Déterminer si on est en mode global (sans laboratoire spécifique)
  const isGlobalMode = !laboratoryId;

  console.log('otherLabsProductsTop', otherLabProductsTop);

  // Vérifier si nous avons des produits concurrents

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* En-tête avec informations sur le segment */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Analyse du segment: {segmentInfo.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Univers: {segmentInfo.universe} {segmentInfo.category && `• Catégorie: ${segmentInfo.category}`}
            </p>
          </div>
        </div>

        {/* Résumé du CA du segment */}
        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <span className="font-medium">Chiffre d'affaires total du segment:</span> {' '}
            {new Intl.NumberFormat('fr-FR', { 
              style: 'currency', 
              currency: 'EUR',
              maximumFractionDigits: 0 
            }).format(segmentInfo.total_revenue)}
            
            {isGlobalMode && (
              <span className="ml-2 text-xs bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">
                Analyse globale tous laboratoires
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Contenu principal - Réorganisé selon le mode */}
      <div className="p-6 space-y-6">
        {/* Part de marché des laboratoires - Sur toute la largeur */}
        <div>
          <div className="flex items-center mb-4">
            <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-2">
              <FiPieChart size={16} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Parts de marché des laboratoires
            </h3>
          </div>
          <SegmentMarketShare 
            marketShareData={marketShareByLab} 
            selectedLabId={laboratoryId || ''} // Chaîne vide si pas de laboratoryId
          />
        </div>

        {/* Top produits côte à côte ou global selon le mode */}
        {isGlobalMode ? (
          // Mode global: afficher tous les produits dans une seule liste
          <div>
            <SegmentTopProducts 
              products={selectedLabProductsTop || []} 
              title="Top produits du segment"
            />
          </div>
        ) : (
          // Mode laboratoire: afficher les produits du labo et les concurrents côte à côte
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SegmentTopProducts 
              products={selectedLabProductsTop || []} 
              title="Top produits du laboratoire"
            />
            {/* Seulement afficher les produits concurrents s'il y en a */}
              <SegmentTopProducts 
                products={otherLabProductsTop || []}
                title="Top produits concurrents"
              />
          </div>
        )}
      </div>
    </div>
  );
}