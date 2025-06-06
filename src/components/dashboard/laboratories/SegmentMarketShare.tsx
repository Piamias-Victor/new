// src/components/dashboard/laboratories/SegmentMarketShare.tsx

import React from 'react';
import { FiAward } from 'react-icons/fi';
import { LaboratoryMarketShare } from '@/hooks/useSegmentAnalysis';

interface SegmentMarketShareProps {
  marketShareData: LaboratoryMarketShare[];
  selectedLabId: string; // Peut être une chaîne vide en mode global
}

export function SegmentMarketShare({ 
  marketShareData, 
  selectedLabId 
}: SegmentMarketShareProps) {
  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${Number(value).toFixed(1)}%`;
  };

  // Fonction pour déterminer la couleur en fonction du classement
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-amber-500 dark:text-amber-400';
    if (rank === 2) return 'text-gray-400 dark:text-gray-300';
    if (rank === 3) return 'text-amber-700 dark:text-amber-600';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  // Fonction pour obtenir l'icône de classement
  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  // Vérifier s'il y a des données de part de marché
  if (!marketShareData || marketShareData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Aucune donnée de part de marché disponible</p>
      </div>
    );
  }

  // Trouver la position du laboratoire sélectionné (si un laboratoire est sélectionné)
  const selectedLabInfo = selectedLabId ? 
    marketShareData.find(lab => lab.id === selectedLabId) : null;

  return (
    <div className="space-y-4">
      {/* Information sur la position du laboratoire sélectionné - affiché uniquement si un labo est sélectionné */}
      {selectedLabInfo && (
        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-800 dark:text-sky-300 mr-3">
              <FiAward size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                Position du laboratoire: {getRankIcon(selectedLabInfo.rank)}
              </p>
              <p className="text-sm text-sky-600 dark:text-sky-400">
                PDM valeur: {formatPercentage(selectedLabInfo.market_share)} • 
                {selectedLabInfo.volume_share && `PDM volume: ${formatPercentage(selectedLabInfo.volume_share)} • `}
                {selectedLabInfo.margin_percentage && `Marge: ${formatPercentage(selectedLabInfo.margin_percentage)}`}
              </p>
              <p className="text-sm text-sky-600 dark:text-sky-400">
                CA: {formatCurrency(selectedLabInfo.total_revenue)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tableau des parts de marché avec hauteur fixe et défilement */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                  #
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Laboratoire
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produits
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CA Sell-Out
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  PDM Valeur
                </th>
                {marketShareData[0]?.volume_share !== undefined && (
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    PDM Volume
                  </th>
                )}
                {marketShareData[0]?.margin_percentage !== undefined && (
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Marge
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {marketShareData.map((lab) => (
                <tr 
                  key={lab.id} 
                  className={lab.id === selectedLabId ? 'bg-sky-50 dark:bg-sky-900/20' : ''}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getRankColor(lab.rank)}`}>
                      {getRankIcon(lab.rank)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {lab.name}
                      {lab.id === selectedLabId && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300">
                          Sélectionné
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {lab.product_count}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatCurrency(lab.total_revenue)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <div className="text-sm">
                      <div className="flex items-center justify-end">
                        <div 
                          className="h-2 bg-sky-500 rounded-full mr-2" 
                          style={{ width: `${Math.min(lab.market_share, 100) * 0.7}px` }}
                        ></div>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatPercentage(lab.market_share)}
                        </span>
                      </div>
                    </div>
                  </td>
                  {lab.volume_share !== undefined && (
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm">
                        <div className="flex items-center justify-end">
                          <div 
                            className="h-2 bg-purple-500 rounded-full mr-2" 
                            style={{ width: `${Math.min(lab.volume_share, 100) * 0.7}px` }}
                          ></div>
                          <span className="text-gray-900 dark:text-white font-medium">
                            {formatPercentage(lab.volume_share)}
                          </span>
                        </div>
                      </div>
                    </td>
                  )}
                  {lab.margin_percentage !== undefined && (
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm">
                        <span className={`text-gray-900 dark:text-white font-medium ${
                          lab.margin_percentage < 0 ? 'text-red-500 dark:text-red-400' :
                          lab.margin_percentage < 10 ? 'text-amber-500 dark:text-amber-400' :
                          'text-green-500 dark:text-green-400'
                        }`}>
                          {formatPercentage(lab.margin_percentage)}
                        </span>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}