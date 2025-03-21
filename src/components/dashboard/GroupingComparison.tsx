// src/components/dashboard/GroupingComparison.tsx
import React from 'react';
import { FiTrendingUp, FiShoppingBag, FiShoppingCart, FiPackage, FiPercent, FiBox } from 'react-icons/fi';
import { useGroupingComparison } from '@/hooks/useGroupingComparison';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { FilterBadge } from '../filters/FilterBadge';
import { useProductFilter } from '@/contexts/ProductFilterContext';

// Fonction utilitaire pour formater les grands nombres
const formatLargeNumber = (num: number, isPercentage = false) => {
  if (isNaN(num)) return '0';
  
  // Format pour les pourcentages
  if (isPercentage) {
    return new Intl.NumberFormat('fr-FR', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(num / 100);
  }
  
  // Format pour les différences en pourcentage
  if (num >= 1000000) {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(num / 1000000)}M`;
  } else if (num >= 1000) {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(num / 1000)}k`;
  } else {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(num);
  }
};

// Composant pour afficher un indicateur de comparaison
interface ComparisonIndicatorProps {
  title: string;
  icon: React.ReactNode;
  pharmacyValue: number;
  groupValue: number;
  formatValue: (value: number) => string;
  isPercentage?: boolean;
  colorBasedOnComparison?: boolean;
}

const ComparisonIndicator: React.FC<ComparisonIndicatorProps> = ({
  title,
  icon,
  pharmacyValue,
  groupValue,
  formatValue,
  isPercentage = false,
  colorBasedOnComparison = true
}) => {
  // Calculer la différence par rapport à la moyenne du groupement
  const difference = pharmacyValue - groupValue;
  const percentDifference = groupValue !== 0 ? (difference / groupValue) * 100 : 0;
  const { isFilterActive, selectedCodes } = useProductFilter();
  
  // Déterminer si la différence est positive (bonne performance) ou négative
  // Pour certains KPIs (comme le stock), moins c'est mieux
  let isPositive = percentDifference >= 0;
  
  // Inverser pour certains indicateurs où moins est mieux
  if (title === 'Stock') {
    isPositive = !isPositive;
  }
  
  // Couleur à utiliser selon la performance
  const colorClass = !colorBasedOnComparison ? 'text-gray-700 dark:text-gray-300' :
    isPositive ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';
  
  return (
    <div className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
      </div>

      {isFilterActive && (
        <div className="mb-4 flex items-center">
          <FilterBadge count={selectedCodes.length} />
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Pharmacie</div>
          <div className="text-lg font-bold text-gray-800 dark:text-white">
            {formatValue(pharmacyValue)}
          </div>
        </div>
        
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Moyenne Groupe</div>
          <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            {formatValue(groupValue)}
          </div>
        </div>
      </div>
      
      <div className={`mt-2 text-sm font-medium ${colorClass} flex items-center`}>
        {isPositive ? (
          <FiTrendingUp className="mr-1" size={14} />
        ) : (
          <FiTrendingUp className="mr-1 transform rotate-180" size={14} />
        )}
        {isPercentage 
          ? `${formatLargeNumber(Math.abs(percentDifference), false)} pts`
          : `${percentDifference >= 0 ? '+' : ''}${formatLargeNumber(percentDifference, false)}%`
        }
      </div>
    </div>
  );
};

export function GroupingComparison() {
  const { selectedPharmacyIds } = usePharmacySelection();
  
  // S'il y a plusieurs pharmacies sélectionnées, on prend la première
  const selectedPharmacyId = selectedPharmacyIds.length > 0 ? selectedPharmacyIds[0] : '';
  
  const { pharmacy, group, isLoading, error } = useGroupingComparison(selectedPharmacyId);
  
  // Formateurs
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
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }
  
  // État d'erreur
  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-300">
        <h3 className="font-medium text-lg">Erreur de chargement</h3>
        <p>{error}</p>
      </div>
    );
  }
  
  // Si aucune pharmacie n'est sélectionnée
  if (!selectedPharmacyId) {
    return (
      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-600 dark:text-yellow-300">
        <h3 className="font-medium text-lg">Sélection requise</h3>
        <p>Veuillez sélectionner une pharmacie pour afficher la comparaison avec le groupement.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
      {/* CA Sell-out */}
      <ComparisonIndicator
        title="CA Sell-out"
        icon={<FiShoppingBag className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.total_sellout}
        groupValue={group.avg_sellout}
        formatValue={formatCurrency}
      />
      
      {/* CA Sell-in */}
      <ComparisonIndicator
        title="CA Sell-in"
        icon={<FiShoppingCart className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.total_sellin}
        groupValue={group.avg_sellin}
        formatValue={formatCurrency}
      />
      
      {/* Marge */}
      <ComparisonIndicator
        title="Marge"
        icon={<FiTrendingUp className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.total_margin}
        groupValue={group.avg_margin}
        formatValue={formatCurrency}
      />
      
      {/* Taux de marge */}
      <ComparisonIndicator
        title="Taux de marge"
        icon={<FiPercent className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.margin_percentage}
        groupValue={group.avg_margin_percentage}
        formatValue={formatPercent}
        isPercentage={true}
      />
      
      {/* Stock */}
      <ComparisonIndicator
        title="Stock"
        icon={<FiBox className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.total_stock}
        groupValue={group.avg_stock}
        formatValue={formatCurrency}
      />
      
      {/* Références */}
      <ComparisonIndicator
        title="Références"
        icon={<FiPackage className="text-sky-600" size={16} />}
        pharmacyValue={pharmacy.references_count}
        groupValue={group.avg_references_count}
        formatValue={formatNumber}
        colorBasedOnComparison={false}
      />
    </div>
  );
}