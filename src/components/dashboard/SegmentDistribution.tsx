// src/components/dashboard/SegmentDistribution.tsx
import React, { useState } from 'react';
import { FiPieChart, FiFilter, FiGrid, FiTag, FiPackage, FiLayers, FiDatabase, FiList, FiBox, FiStar } from 'react-icons/fi';
import { useSegmentDistribution, SegmentType } from '@/hooks/useSegmentDistribution';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { FilterBadge } from '@/components/filters/FilterBadge';

// Palette de couleurs
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#FF6B6B', '#6A7FDB', '#F06292', '#4DB6AC'
];

// Type de segment à libellé
const segmentLabels: Record<SegmentType, string> = {
  'universe': 'Univers',
  'category': 'Catégorie',
  'sub_category': 'Sous-catégorie',
  'brand_lab': 'Laboratoire',
  'family': 'Famille',
  'sub_family': 'Sous-famille',
  'range_name': 'Gamme',
};

// Icônes pour chaque type de segment
const segmentIcons: Record<SegmentType, React.ReactNode> = {
  'universe': <FiDatabase size={16} />,
  'category': <FiGrid size={16} />,
  'sub_category': <FiTag size={16} />,
  'brand_lab': <FiPackage size={16} />,
  'family': <FiLayers size={16} />,
  'sub_family': <FiLayers size={16} />,
  'range_name': <FiBox size={16} />,
};

export function SegmentDistribution() {
  const [segmentType, setSegmentType] = useState<SegmentType>('universe');
  const { distributions, isLoading, error } = useSegmentDistribution(segmentType);
  const { isFilterActive, selectedCodes } = useProductFilter();
  
  // Formateurs
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(value);
  };
  
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };
  
  // Préparer les données pour l'affichage
  const tableData = distributions
    .filter(item => item.total_revenue > 0)
    .map((item, index) => ({
      name: item.segment,
      value: Number(item.revenue_percentage),
      revenue: Number(item.total_revenue),
      margin: Number(item.total_margin),
      marginPercentage: Number(item.margin_percentage),
      quantity: Number(item.total_quantity),
      productCount: Number(item.product_count),
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.revenue - a.revenue);
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiPieChart size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiList size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Distribution par {segmentLabels[segmentType]}
              </h2>
              {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {distributions.length} segments • {tableData.reduce((acc, curr) => acc + curr.productCount, 0)} produits
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {Object.keys(segmentLabels).map((type) => (
            <button
              key={type}
              onClick={() => setSegmentType(type as SegmentType)}
              className={`px-2 py-1.5 flex items-center text-xs rounded ${
                segmentType === type 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm font-medium' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              {segmentIcons[type as SegmentType]}
              <span className="ml-1">{segmentLabels[type as SegmentType]}</span>
            </button>
          ))}
        </div>
      </div>

      {tableData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <FiFilter size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible pour ce segment</p>
        </div>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {segmentLabels[segmentType]}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  CA
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Marge
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Quantité
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Produits
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {tableData.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      {item.name || 'Non défini'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatPercent(item.value)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right">
                    <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {formatCurrency(item.margin)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatPercent(item.marginPercentage)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">
                    {formatNumber(item.quantity)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatNumber(item.productCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}