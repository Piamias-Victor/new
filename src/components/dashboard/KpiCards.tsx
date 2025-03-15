// src/components/dashboard/KpiCards.tsx
import { useState } from 'react';
import { useRevenue } from "@/hooks/useRevenue";
import { FiBarChart2, FiTrendingUp, FiPackage, FiActivity, FiPercent, FiDollarSign } from "react-icons/fi";

// Types pour les props du composant KpiCard
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: {
    value: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
  alternateView?: {
    value: string;
    change?: {
      value: string;
      previousValue?: string;
      isPositive: boolean;
    };
  };
}

// Composant pour une carte KPI individuelle
function KpiCard({ icon, title, value, change, isLoading, alternateView }: KpiCardProps) {
  // État local pour suivre quel affichage est actif (pourcentage ou montant)
  const [showAlternate, setShowAlternate] = useState(false);
  
  // Si chargement, afficher un placeholder
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  // Si pas de vue alternative, afficher une carte simple
  if (!alternateView) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              {icon}
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          </div>
        </div>
        
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        
        {change && (
          <div className="mt-2 flex items-center text-sm">
            <span className={`font-medium ${
              change.isPositive 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-red-500 dark:text-red-400'
            }`}>
              {change.isPositive ? '+' : ''}{change.value}
            </span>
            
            {change.previousValue && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({change.previousValue})
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Avec vue alternative, afficher une carte avec boutons de bascule
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            {icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
        </div>
        
        {/* Boutons de basculement */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setShowAlternate(false)}
            className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
              !showAlternate
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Afficher en pourcentage"
          >
            <FiPercent size={14} />
          </button>
          
          <button
            onClick={() => setShowAlternate(true)}
            className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
              showAlternate
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            title="Afficher en montant"
          >
            <FiDollarSign size={14} />
          </button>
        </div>
      </div>
      
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {showAlternate ? alternateView.value : value}
      </div>
      
      {(showAlternate ? alternateView.change : change) && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`font-medium ${
            (showAlternate ? alternateView.change?.isPositive : change?.isPositive) 
              ? 'text-green-500 dark:text-green-400' 
              : 'text-red-500 dark:text-red-400'
          }`}>
            {showAlternate 
              ? (alternateView.change?.isPositive ? '+' : '') + alternateView.change?.value
              : (change?.isPositive ? '+' : '') + change?.value
            }
          </span>
          
          <span className="text-gray-500 dark:text-gray-400 ml-2">
            {showAlternate 
              ? '(' + alternateView.change?.previousValue + ')'
              : '(' + change?.previousValue + ')'
            }
          </span>
        </div>
      )}
    </div>
  );
}

// Composant principal pour afficher toutes les cartes KPI
export function KpiCards() {
  const { 
    totalRevenue, 
    totalMargin, 
    marginPercentage, 
    comparison, 
    isLoading 
  } = useRevenue();
  
  // Formatter pour la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // CA - Données réelles
  const revenueChange = comparison ? {
    value: `${comparison.evolution.revenue.percentage}%`,
    previousValue: formatCurrency(comparison.totalRevenue),
    isPositive: comparison.evolution.revenue.isPositive
  } : undefined;
  
  // Marge (montant) - Vue alternative pour la carte de marge
  const marginMoneyView = {
    value: formatCurrency(totalMargin),
    change: comparison ? {
      value: `${comparison.evolution.margin.percentage}%`,
      previousValue: formatCurrency(comparison.totalMargin),
      isPositive: comparison.evolution.margin.isPositive
    } : undefined
  };
  
  // Marge (pourcentage) - Vue principale
  const marginPercentChange = comparison ? {
    value: `${comparison.evolution.marginPercentage.points.toFixed(1)} pts`,
    previousValue: `${comparison.marginPercentage.toFixed(1)}%`,
    isPositive: comparison.evolution.marginPercentage.isPositive
  } : undefined;
  
  // Stock - Simulation complète (pas encore de données réelles)
  const stock = 45000; // valeur simulée  
  const stockPrevious = stock * 1.021; // simulation: 2.1% de plus
  const stockChange = {
    value: `${((stock / stockPrevious - 1) * 100).toFixed(1)}%`,
    previousValue: formatCurrency(stockPrevious),
    isPositive: stock < stockPrevious // Moins de stock est positif (moins d'immobilisation)
  };
  
  // Rotation - Simulation complète (pas encore de données réelles)
  const rotation = 6.8; // valeur simulée
  const rotationPrevious = rotation - 0.5; // simulation: 0.5 de moins
  const rotationChange = {
    value: `${(rotation - rotationPrevious).toFixed(1)}x`,
    previousValue: `${rotationPrevious.toFixed(1)}x`,
    isPositive: rotation > rotationPrevious
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        icon={<FiBarChart2 size={24} />}
        title="Ventes"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Marge"
        value={`${marginPercentage.toFixed(1)}%`}
        change={marginPercentChange}
        alternateView={marginMoneyView}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock"
        value={formatCurrency(stock)}
        change={stockChange}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={rotationChange}
        isLoading={isLoading}
      />
    </div>
  );
}