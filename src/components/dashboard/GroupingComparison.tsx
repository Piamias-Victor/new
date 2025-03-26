// src/components/dashboard/GroupingComparison.tsx
import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiShoppingCart, FiPackage, FiPercent, FiBox } from 'react-icons/fi';
import { useGroupingComparison } from '@/hooks/useGroupingComparison';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useProductFilter } from '@/contexts/ProductFilterContext';

export function GroupingComparison() {
  const { selectedPharmacyIds } = usePharmacySelection();
  const selectedPharmacyId = selectedPharmacyIds.length > 0 ? selectedPharmacyIds[0] : '';
  const { pharmacy, group, isLoading, error } = useGroupingComparison(selectedPharmacyId);
  const { isFilterActive } = useProductFilter();
  
  // Formateurs pour les différentes valeurs
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(value));
  };
  
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };
  
  const formatDiff = (value: number, isPercent = false) => {
    const prefix = value >= 0 ? '+' : '';
    const formattedValue = value.toFixed(1);
    return `${prefix}${formattedValue}${isPercent ? ' pts' : '%'}`;
  };
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
    );
  }
  
  // État d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-300">
        <h3 className="font-medium">Erreur de chargement</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Si aucune pharmacie n'est sélectionnée
  if (!selectedPharmacyId) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-300">
        <h3 className="font-medium">Sélectionnez une pharmacie</h3>
      </div>
    );
  }

  // Calculs des différences
  const selloutDiff = pharmacy.total_sellout > 0 && group.avg_sellout > 0 
    ? ((pharmacy.total_sellout - group.avg_sellout) / group.avg_sellout) * 100 
    : 0;
  
  const sellinDiff = pharmacy.total_sellin > 0 && group.avg_sellin > 0 
    ? ((pharmacy.total_sellin - group.avg_sellin) / group.avg_sellin) * 100 
    : 0;
  
  const marginDiff = pharmacy.total_margin > 0 && group.avg_margin > 0 
    ? ((pharmacy.total_margin - group.avg_margin) / group.avg_margin) * 100 
    : 0;
  
  const marginPercentDiff = pharmacy.margin_percentage - group.avg_margin_percentage;
  
  const stockDiff = pharmacy.total_stock > 0 && group.avg_stock > 0 
    ? ((pharmacy.total_stock - group.avg_stock) / group.avg_stock) * 100 
    : 0;
  
  const refsDiff = pharmacy.references_count > 0 && group.avg_references_count > 0 
    ? ((pharmacy.references_count - group.avg_references_count) / group.avg_references_count) * 100 
    : 0;

  return (
    <div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="p-2 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Indicateur</th>
              <th className="p-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Ma Pharmacie</th>
              <th className="p-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Moyenne Apothical</th>
              <th className="p-2 text-right text-sm font-medium text-gray-600 dark:text-gray-300">Écart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* CA Sell-out */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiShoppingBag className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">CA Vente</span>
                </div>
                {isFilterActive && pharmacy.sellout_percentage && (
                  <div className="text-xs text-gray-500 ml-6 mt-1">
                    {pharmacy.sellout_percentage.toFixed(1)}% du total
                  </div>
                )}
              </td>
              <td className="p-2 text-right font-bold">{formatCurrency(pharmacy.total_sellout)}</td>
              <td className="p-2 text-right">{formatCurrency(group.avg_sellout)}</td>
              <td className={`p-2 text-right font-medium ${selloutDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatDiff(selloutDiff)}
              </td>
            </tr>
            
            {/* CA Sell-in */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiShoppingCart className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">CA Achat</span>
                </div>
                {isFilterActive && pharmacy.sellin_percentage && (
                  <div className="text-xs text-gray-500 ml-6 mt-1">
                    {pharmacy.sellin_percentage.toFixed(1)}% du total
                  </div>
                )}
              </td>
              <td className="p-2 text-right font-bold">{formatCurrency(pharmacy.total_sellin)}</td>
              <td className="p-2 text-right">{formatCurrency(group.avg_sellin)}</td>
              <td className={`p-2 text-right font-medium ${sellinDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatDiff(sellinDiff)}
              </td>
            </tr>
            
            {/* Marge */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiTrendingUp className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">Marge</span>
                </div>
                {isFilterActive && pharmacy.margin_percentage_of_total && (
                  <div className="text-xs text-gray-500 ml-6 mt-1">
                    {pharmacy.margin_percentage_of_total.toFixed(1)}% du total
                  </div>
                )}
              </td>
              <td className="p-2 text-right font-bold">{formatCurrency(pharmacy.total_margin)}</td>
              <td className="p-2 text-right">{formatCurrency(group.avg_margin)}</td>
              <td className={`p-2 text-right font-medium ${marginDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatDiff(marginDiff)}
              </td>
            </tr>
            
            {/* Taux de marge */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiPercent className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">Taux de marge</span>
                </div>
              </td>
              <td className="p-2 text-right font-bold">{formatPercent(pharmacy.margin_percentage)}</td>
              <td className="p-2 text-right">{formatPercent(group.avg_margin_percentage)}</td>
              <td className={`p-2 text-right font-medium ${marginPercentDiff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatDiff(marginPercentDiff, true)}
              </td>
            </tr>
            
            {/* Stock */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiBox className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">Stock</span>
                </div>
                {isFilterActive && pharmacy.stock_percentage && (
                  <div className="text-xs text-gray-500 ml-6 mt-1">
                    {pharmacy.stock_percentage.toFixed(1)}% du total
                  </div>
                )}
              </td>
              <td className="p-2 text-right font-bold">{formatCurrency(pharmacy.total_stock)}</td>
              <td className="p-2 text-right">{formatCurrency(group.avg_stock)}</td>
              <td className={`p-2 text-right font-medium ${stockDiff <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatDiff(stockDiff)}
              </td>
            </tr>
            
            {/* Références */}
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2">
                <div className="flex items-center">
                  <FiPackage className="text-sky-600 mr-2" size={16} />
                  <span className="font-medium">Références</span>
                </div>
              </td>
              <td className="p-2 text-right font-bold">{formatNumber(pharmacy.references_count)}</td>
              <td className="p-2 text-right">{formatNumber(group.avg_references_count)}</td>
              <td className="p-2 text-right font-medium text-gray-600">
                {formatDiff(refsDiff)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}