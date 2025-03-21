// src/components/dashboard/EnhancedSegmentDistribution.tsx
import React, { useState, useMemo } from 'react';
import { FiList, FiFilter, FiArrowDown, FiArrowUp, FiGrid, FiTag, FiPackage, 
         FiLayers, FiDatabase, FiBox, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';
import { useSegmentDistribution, SegmentType } from '@/hooks/useSegmentDistribution';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { useSellInBySegment } from '@/hooks/useSellInBySegment';
import { useStockBySegment } from '@/hooks/useStockBySegment';
import { useSegmentEvolution } from '@/hooks/useSegmentEvolution';

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

// Type pour le tri
type SortColumn = 'name' | 'sellout' | 'sellin' | 'stock' | 'margin' | 'quantity' | 'evolution';
type SortDirection = 'asc' | 'desc';

// Interface pour les données combinées du tableau
interface CombinedSegmentData {
  name: string;
  color: string;
  sellout: number;
  sellin: number;
  stock: number;
  margin: number;
  marginPercentage: number;
  quantity: number;
  productCount: number;
  evolution: number;
  previousRevenue: number;
}

export function EnhancedSegmentDistribution() {
  const [segmentType, setSegmentType] = useState<SegmentType>('universe');
  const [sortColumn, setSortColumn] = useState<SortColumn>('sellout');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Hooks pour obtenir les données
  const { distributions, isLoading: isLoadingSellout } = useSegmentDistribution(segmentType);
  const { sellInData, isLoading: isLoadingSellin } = useSellInBySegment(segmentType);
  const { stockData, isLoading: isLoadingStock } = useStockBySegment(segmentType);
  const { evolutionData, isLoading: evolutionLoading } = useSegmentEvolution(segmentType);
  const { isFilterActive, selectedCodes } = useProductFilter();
  
  // Vérifier si on est en chargement
  const isLoading = isLoadingSellout || isLoadingSellin || isLoadingStock || evolutionLoading;
  
  // Combine les données de différentes sources
  const combinedData: CombinedSegmentData[] = useMemo(() => {
    if (isLoading) return [];
    
    return distributions.map((item, index) => {
      // Trouver les données correspondantes dans les autres sources
      const sellinItem = sellInData.find(si => si.segment === item.segment);
      const stockItem = stockData.find(st => st.segment === item.segment);
      
      // Trouver les données d'évolution correspondantes
      const evolutionItem = evolutionData && Array.isArray(evolutionData) 
        ? evolutionData.find(ev => ev.segment === item.segment)
        : null;
      
      // Calculer l'évolution en % si disponible, sinon utiliser 0
      const evolutionPercentage = evolutionItem 
        ? Number(evolutionItem.evolution_percentage) 
        : 0;
      
      // Récupérer le CA précédent si disponible
      const previousRevenue = evolutionItem 
        ? Number(evolutionItem.previous_revenue) 
        : 0;
      
      return {
        name: item.segment || 'Non défini',
        color: COLORS[index % COLORS.length],
        sellout: Number(item.total_revenue) || 0,
        sellin: sellinItem ? Number(sellinItem.total_amount) || 0 : 0,
        stock: stockItem ? Number(stockItem.total_value) || 0 : 0,
        margin: Number(item.total_margin) || 0,
        marginPercentage: Number(item.margin_percentage) || 0,
        quantity: Number(item.total_quantity) || 0,
        productCount: Number(item.product_count) || 0,
        evolution: evolutionPercentage,
        previousRevenue: previousRevenue
      };
    });
  }, [distributions, sellInData, stockData, evolutionData, isLoading]);
  
  // Trier les données
  const sortedData = useMemo(() => {
    if (!combinedData.length) return [];
    
    return [...combinedData].sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sellout':
          comparison = a.sellout - b.sellout;
          break;
        case 'sellin':
          comparison = a.sellin - b.sellin;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'margin':
          comparison = a.margin - b.margin;
          break;
        case 'quantity':
          comparison = a.quantity - b.quantity;
          break;
        case 'evolution':
          comparison = a.evolution - b.evolution;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [combinedData, sortColumn, sortDirection]);
  
  // Gestionnaire pour changer la colonne de tri
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Si c'est déjà la colonne de tri, inverser la direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Sinon, définir la nouvelle colonne et réinitialiser la direction
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
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
  
  const formatEvolution = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  // Obtenir le titre trié et la direction
  const getSortIndicator = (column: SortColumn) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? <FiArrowUp className="ml-1 inline" /> : <FiArrowDown className="ml-1 inline" />;
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
              {sortedData.length} segments • {sortedData.reduce((acc, curr) => acc + curr.productCount, 0)} produits
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

      {sortedData.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
            <FiFilter size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible pour ce segment</p>
        </div>
      ) : (
        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <span className="flex items-center">
                    {segmentLabels[segmentType]}
                    {getSortIndicator('name')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sellout')}
                >
                  <span className="flex items-center justify-end">
                    <FiShoppingBag className="mr-1" /> CA Sell-out
                    {getSortIndicator('sellout')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sellin')}
                >
                  <span className="flex items-center justify-end">
                    <FiShoppingCart className="mr-1" /> CA Sell-in
                    {getSortIndicator('sellin')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stock')}
                >
                  <span className="flex items-center justify-end">
                    <FiBox className="mr-1" /> Stock
                    {getSortIndicator('stock')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('margin')}
                >
                  <span className="flex items-center justify-end">
                    Marge
                    {getSortIndicator('margin')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  <span className="flex items-center justify-end">
                    Quantité
                    {getSortIndicator('quantity')}
                  </span>
                </th>
                <th 
                  className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('evolution')}
                >
                  <span className="flex items-center justify-end">
                    Évolution
                    {getSortIndicator('evolution')}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900/50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      {item.name}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatCurrency(item.sellout)}
                    {item.previousRevenue > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(item.previousRevenue)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatCurrency(item.sellin)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white font-medium">
                    {formatCurrency(item.stock)}
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
                  <td className={`px-4 py-3 text-sm text-right font-medium ${
                    item.evolution > 0 
                      ? 'text-green-500 dark:text-green-400' 
                      : item.evolution < 0 
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {formatEvolution(item.evolution)}
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