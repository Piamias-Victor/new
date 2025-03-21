// src/components/dashboard/SalesProjection.tsx
import React, { useState, useEffect } from 'react';
import { FiInfo, FiTrendingUp, FiShoppingBag, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { useAnnualData } from '@/hooks/useAnnualData';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function SalesProjection() {
  const annualData = useAnnualData();
  const { isFilterActive, selectedCodes } = useProductFilter();
  
  // État pour les projections
  const [sellOutGoalPercent, setSellOutGoalPercent] = useState<number>(0);
  const [sellOutGoalAmount, setSellOutGoalAmount] = useState<number>(0);
  const [sellInGoalPercent, setSellInGoalPercent] = useState<number>(0);
  const [sellInGoalAmount, setSellInGoalAmount] = useState<number>(0);
  
  // États pour afficher les tooltips
  const [showDateTooltip, setShowDateTooltip] = useState(false);
  
  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formater les pourcentages
  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };
  
  // Calculer les projections quand les données annuelles changent
  useEffect(() => {
    if (!annualData.isLoading) {
      // Calcul des projections Sell-Out
      const evolutionRate = annualData.sellOutRevenue / annualData.previousYearSellOut;
      const projectedSellOut = annualData.lastYearTotal.sellOut * evolutionRate;
      const sellOutGrowthPercent = ((projectedSellOut / annualData.lastYearTotal.sellOut) - 1) * 100;
      setSellOutGoalPercent(parseFloat(sellOutGrowthPercent.toFixed(1)));
      setSellOutGoalAmount(projectedSellOut);
      
      // Calcul des projections Sell-In
      const projectedSellIn = (annualData.sellInRevenue / annualData.yearProgressPercentage) * 100;
      const sellInGrowthPercent = ((projectedSellIn / annualData.lastYearTotal.sellIn) - 1) * 100;
      setSellInGoalPercent(parseFloat(sellInGrowthPercent.toFixed(1)));
      setSellInGoalAmount(projectedSellIn);
    }
  }, [annualData]);
  
  // Gestionnaire pour mettre à jour le pourcentage d'objectif sell-out
  const handleSellOutPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSellOutGoalPercent(value);
      
      // Calculer le montant basé sur le pourcentage
      const targetAmount = annualData.lastYearTotal.sellOut * (1 + value / 100);
      setSellOutGoalAmount(targetAmount);
    }
  };
  
  // Gestionnaire pour mettre à jour le montant d'objectif sell-out
  const handleSellOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSellOutGoalAmount(value);
      
      // Calculer le pourcentage basé sur le montant
      const targetPercent = ((value / annualData.lastYearTotal.sellOut) - 1) * 100;
      setSellOutGoalPercent(parseFloat(targetPercent.toFixed(1)));
    }
  };
  
  // Gestionnaire pour mettre à jour le pourcentage d'objectif sell-in
  const handleSellInPercentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSellInGoalPercent(value);
      
      // Calculer le montant basé sur le pourcentage
      const targetAmount = annualData.lastYearTotal.sellIn * (1 + value / 100);
      setSellInGoalAmount(targetAmount);
    }
  };
  
  // Gestionnaire pour mettre à jour le montant d'objectif sell-in
  const handleSellInAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setSellInGoalAmount(value);
      
      // Calculer le pourcentage basé sur le montant
      const targetPercent = ((value / annualData.lastYearTotal.sellIn) - 1) * 100;
      setSellInGoalPercent(parseFloat(targetPercent.toFixed(1)));
    }
  };
  
  // Calculer les objectifs restants pour atteindre les projections
  const calculateRemaining = (current: number, goal: number, remainingMonths: number) => {
    // Montant restant à faire
    const remainingAmount = goal - current;
    
    // Montant mensuel nécessaire pour atteindre l'objectif
    const monthlyTarget = remainingMonths > 0 ? remainingAmount / remainingMonths : 0;
    
    return {
      remainingAmount,
      monthlyTarget
    };
  };
  
  const sellOutRemaining = calculateRemaining(
    annualData.sellOutRevenue,
    sellOutGoalAmount,
    annualData.remainingMonths
  );
  
  const sellInRemaining = calculateRemaining(
    annualData.sellInRevenue,
    sellInGoalAmount,
    annualData.remainingMonths
  );
  
  // Évolution VS N-1 pour le sell-out et sell-in actuel
  const sellOutEvolutionVsLastYear = annualData.previousYearSellOut > 0
    ? ((annualData.sellOutRevenue - annualData.previousYearSellOut) / annualData.previousYearSellOut) * 100
    : 0;
    
  const sellInEvolutionVsLastYear = annualData.previousYearSellIn > 0
    ? ((annualData.sellInRevenue - annualData.previousYearSellIn) / annualData.previousYearSellIn) * 100
    : 0;
  
  if (annualData.isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiTrendingUp size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Projection annuelle
              </h2>
              {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
              <div className="relative">
                <button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onMouseEnter={() => setShowDateTooltip(true)}
                  onMouseLeave={() => setShowDateTooltip(false)}
                >
                  <FiInfo size={16} />
                </button>
                
                {showDateTooltip && (
                  <div className="absolute z-10 w-64 p-3 right-0 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg 
                    border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  >
                    Cette projection est basée sur les données de l'année complète, 
                    indépendamment du filtre de date sélectionné. L'année actuelle est 
                    écoulée à {annualData.yearProgressPercentage.toFixed(1)}%.
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Projection basée sur les {annualData.elapsedMonths} mois écoulés ({annualData.yearProgressPercentage.toFixed(1)}% de l'année)
            </p>
          </div>
        </div>
      </div>
      
      {/* Progression de l'année */}
      <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-100 dark:border-purple-800/30">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <FiCalendar className="text-purple-500 dark:text-purple-400 mr-2" size={16} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progression de l'année
            </span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {annualData.yearProgressPercentage.toFixed(1)}%
          </span>
        </div>
        <ProgressBar 
          value={annualData.yearProgressPercentage} 
          maxValue={100} 
          colorClass="bg-purple-500" 
          showPercentage={false}
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>Jan</span>
          <span>Avr</span>
          <span>Juil</span>
          <span>Oct</span>
          <span>Déc</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Sell-Out */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 
          border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 mr-2">
              <FiShoppingBag size={16} />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Projection Sell-Out (Ventes)
            </h3>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Réalisé {new Date().getFullYear()}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(annualData.sellOutRevenue)}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Année précédente</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(annualData.lastYearTotal.sellOut)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Projection</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(sellOutGoalAmount)}</span>
            </div>
          </div>
          
          {/* Progression Sell-Out */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-300">Progression</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                {formatCurrency(annualData.sellOutRevenue)} / {formatCurrency(sellOutGoalAmount)}
              </span>
            </div>
            <ProgressBar 
              value={annualData.sellOutRevenue} 
              maxValue={sellOutGoalAmount} 
              colorClass="bg-blue-500" 
            />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500 dark:text-gray-400">Évolution vs N-1:</span>
              <span className={sellOutEvolutionVsLastYear >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercent(sellOutEvolutionVsLastYear)}
              </span>
            </div>
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="sellOutPercent" className="block text-xs text-gray-600 dark:text-gray-400">
                Évolution (%)
              </label>
              <input
                id="sellOutPercent"
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-sky-500 focus:border-sky-500 text-sm"
                value={sellOutGoalPercent}
                onChange={handleSellOutPercentChange}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sellOutAmount" className="block text-xs text-gray-600 dark:text-gray-400">
                Montant (€)
              </label>
              <input
                id="sellOutAmount"
                type="number"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-sky-500 focus:border-sky-500 text-sm"
                value={Math.round(sellOutGoalAmount)}
                onChange={handleSellOutAmountChange}
              />
            </div>
          </div>
          
          <div className="border-t border-blue-200 dark:border-blue-800/50 pt-3 mt-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Objectif restant ({annualData.remainingMonths} mois)
            </h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">À réaliser</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(sellOutRemaining.remainingAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Par mois</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(sellOutRemaining.monthlyTarget)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Section Sell-In */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 
          border border-amber-100 dark:border-amber-800/30 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-800/50 text-amber-600 dark:text-amber-300 mr-2">
              <FiShoppingCart size={16} />
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              Projection Sell-In (Achats)
            </h3>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Réalisé {new Date().getFullYear()}</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(annualData.sellInRevenue)}</span>
            </div>
            <div className="flex justify-between mb-1 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Année précédente</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(annualData.lastYearTotal.sellIn)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-gray-600 dark:text-gray-300">Projection</span>
              <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(sellInGoalAmount)}</span>
            </div>
          </div>
          
          {/* Progression Sell-In */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-300">Progression</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-200">
                {formatCurrency(annualData.sellInRevenue)} / {formatCurrency(sellInGoalAmount)}
              </span>
            </div>
            <ProgressBar 
              value={annualData.sellInRevenue} 
              maxValue={sellInGoalAmount} 
              colorClass="bg-amber-500" 
            />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500 dark:text-gray-400">Évolution vs N-1:</span>
              <span className={sellInEvolutionVsLastYear >= 0 ? 'text-green-500' : 'text-red-500'}>
                {formatPercent(sellInEvolutionVsLastYear)}
              </span>
            </div>
          </div>
          
          <div className="mb-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="sellInPercent" className="block text-xs text-gray-600 dark:text-gray-400">
                Évolution (%)
              </label>
              <input
                id="sellInPercent"
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-sky-500 focus:border-sky-500 text-sm"
                value={sellInGoalPercent}
                onChange={handleSellInPercentChange}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="sellInAmount" className="block text-xs text-gray-600 dark:text-gray-400">
                Montant (€)
              </label>
              <input
                id="sellInAmount"
                type="number"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                  text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-sky-500 focus:border-sky-500 text-sm"
                value={Math.round(sellInGoalAmount)}
                onChange={handleSellInAmountChange}
              />
            </div>
          </div>
          
          <div className="border-t border-amber-200 dark:border-amber-800/50 pt-3 mt-3">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
              Objectif restant ({annualData.remainingMonths} mois)
            </h4>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">À réaliser</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(sellInRemaining.remainingAmount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Par mois</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(sellInRemaining.monthlyTarget)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}