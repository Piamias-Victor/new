// src/components/dashboard/KpiCards.tsx
import { useState } from 'react';
import { useRevenue } from "@/hooks/useRevenue";
import { useInventoryValuation } from "@/hooks/useInventoryValuation";
import { FiBarChart2, FiTrendingUp, FiPackage, FiActivity, FiPercent, FiDollarSign, FiInfo, FiBox } from "react-icons/fi";

// Types pour les props du composant KpiCard
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  change?: {
    value: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
  alternateView?: {
    title?: string;
    subtitle?: string;
    value: string;
    change?: {
      value: string;
      previousValue?: string;
      isPositive: boolean;
    };
  };
  infoTooltip?: string;
}

// Composant pour une carte KPI individuelle
function KpiCard({ 
  icon, 
  title, 
  subtitle, 
  value, 
  change, 
  isLoading, 
  alternateView, 
  infoTooltip 
}: KpiCardProps) {
  // État local pour suivre quel affichage est actif (pourcentage ou montant)
  const [showAlternate, setShowAlternate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
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
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {infoTooltip}
                </div>
              )}
            </div>
          )}
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
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {showAlternate && alternateView.title ? alternateView.title : title}
            </h3>
            {showAlternate && alternateView.subtitle 
              ? <p className="text-xs text-gray-500 dark:text-gray-400">{alternateView.subtitle}</p>
              : subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            }
          </div>
        </div>
        
        {/* Section boutons de basculement et info tooltip */}
        <div className="flex items-center space-x-2">
          {/* Boutons de basculement */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setShowAlternate(false)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                !showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title === "Stock" ? "Afficher en montant" : "Afficher en pourcentage"}
            >
              {title === "Stock" ? <FiDollarSign size={14} /> : <FiPercent size={14} />}
            </button>
            
            <button
              onClick={() => setShowAlternate(true)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title === "Stock" ? "Afficher en unités" : "Afficher en montant"}
            >
              {title === "Stock" ? <FiBox size={14} /> : <FiDollarSign size={14} />}
            </button>
          </div>
          
          {/* Info tooltip */}
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {infoTooltip}
                </div>
              )}
            </div>
          )}
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
            {showAlternate && alternateView.change
              ? (alternateView.change.isPositive ? '+' : '') + alternateView.change.value
              : change && (change.isPositive ? '+' : '') + change.value
            }
          </span>
          
          {(showAlternate && alternateView.change?.previousValue || !showAlternate && change?.previousValue) && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({showAlternate && alternateView.change
                ? alternateView.change.previousValue
                : change?.previousValue})
            </span>
          )}
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
    isLoading: revenueLoading,
    actualDateRange
  } = useRevenue();
  
  // Utilisation du hook pour les stocks
  const { 
    totalStockValueHT, 
    totalUnits, 
    comparison: stockComparison,
    isLoading: stockLoading 
  } = useInventoryValuation();
  
  // Formatter pour la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formatter pour les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };
  
  // CA - Données réelles
  const revenueChange = comparison ? {
    value: `${comparison.evolution.revenue.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(comparison.totalRevenue),
    isPositive: comparison.evolution.revenue.isPositive
  } : undefined;
  
  // Marge (montant) - Vue alternative pour la carte de marge
  const marginMoneyView = {
    title: "Marge",
    value: formatCurrency(totalMargin),
    change: comparison ? {
      value: `${comparison.evolution.margin.percentage.toFixed(1)}%`,
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
  
  // Stock en montant - Vue principale
  const stockChange = stockComparison ? {
    value: `${stockComparison.evolution.stockValue.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(stockComparison.totalStockValueHT),
    isPositive: stockComparison.evolution.stockValue.isPositive
  } : undefined;
  
  // Stock en unités - Vue alternative
  const stockUnitsView = {
    title: "Stock",
    subtitle: "En unités",
    value: formatNumber(totalUnits),
    change: stockComparison ? {
      value: `${stockComparison.evolution.units.percentage.toFixed(1)}%`,
      previousValue: formatNumber(stockComparison.totalUnits),
      isPositive: stockComparison.evolution.units.isPositive
    } : undefined
  };
  
  // Calcul de la rotation du stock
  const daysInPeriod = actualDateRange?.days || 30;
  const dailyRevenue = totalRevenue / daysInPeriod;
  const annualizedRevenue = dailyRevenue * 365;
  const rotation = totalStockValueHT > 0 ? annualizedRevenue / totalStockValueHT : 0;
  
  // Calcul de la rotation précédente si les données sont disponibles
  let previousRotation: number | undefined;
  let rotationChange: {
    value: string;
    previousValue: string;
    isPositive: boolean;
  } | undefined;
  
  if (comparison && stockComparison) {
    const previousDailyRevenue = comparison.totalRevenue / (comparison.actualDateRange?.days || 30);
    const previousAnnualizedRevenue = previousDailyRevenue * 365;
    previousRotation = stockComparison.totalStockValueHT > 0 
      ? previousAnnualizedRevenue / stockComparison.totalStockValueHT 
      : 0;
    
    const rotationDiff = rotation - previousRotation;
    const rotationPerc = previousRotation !== 0 
      ? (rotationDiff / previousRotation) * 100 
      : 0;
    
    rotationChange = {
      value: `${rotationPerc.toFixed(1)}%`,
      previousValue: `${previousRotation.toFixed(1)}x`,
      isPositive: rotationDiff > 0
    };
  }
  
  // Description de la rotation pour l'infobulle
  const rotationTooltip = "La rotation du stock est calculée en divisant le chiffre d'affaires annualisé par la valeur du stock. Elle indique combien de fois le stock est renouvelé en une année.";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        icon={<FiBarChart2 size={24} />}
        title="Ventes"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        isLoading={revenueLoading}
      />
      
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Marge"
        value={`${marginPercentage.toFixed(1)}%`}
        change={marginPercentChange}
        alternateView={marginMoneyView}
        isLoading={revenueLoading}
      />
      
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock"
        subtitle="Valorisé en PMP HT"
        value={formatCurrency(totalStockValueHT)}
        change={stockChange}
        alternateView={stockUnitsView}
        isLoading={stockLoading}
      />
      
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={rotationChange}
        isLoading={revenueLoading || stockLoading}
        infoTooltip={rotationTooltip}
      />
    </div>
  );
}