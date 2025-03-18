// src/components/dashboard/comparison/GlobalComparisonCard.tsx
import React from 'react';
import { FiTrendingUp, FiArrowUp, FiArrowDown, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';

interface GlobalComparisonProps {
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  evolutionPercentage: number;
  currentPeriodMargin: number;
  previousPeriodMargin: number;
  marginEvolutionPercentage: number;
  isLoading: boolean;
}

export function GlobalComparisonCard({
  currentPeriodRevenue,
  previousPeriodRevenue,
  evolutionPercentage,
  currentPeriodMargin,
  previousPeriodMargin,
  marginEvolutionPercentage,
  isLoading
}: GlobalComparisonProps) {
  const { startDate, endDate, comparisonStartDate, comparisonEndDate } = useDateRange();
  
  // Formatage des montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formatage des dates
  const formatDateRange = (start?: string, end?: string) => {
    if (!start || !end) return 'Période';
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleDateString('fr-FR')} - ${endDate.toLocaleDateString('fr-FR')}`;
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="space-y-4">
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="p-3 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
          <FiTrendingUp size={24} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Comparaison des périodes
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section période actuelle */}
        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-900/30">
          <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
            <FiCalendar className="mr-2" size={14} />
            <span>Période actuelle: {formatDateRange(startDate, endDate)}</span>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Chiffre d'affaires</span>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(currentPeriodRevenue)}
              </div>
            </div>
            
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Marge</span>
              <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(currentPeriodMargin)}
                <span className="ml-1 text-sm font-normal">
                  ({currentPeriodRevenue > 0 
                    ? ((currentPeriodMargin / currentPeriodRevenue) * 100).toFixed(1) 
                    : '0'}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section période de comparaison */}
        <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-2 text-sm text-gray-600 dark:text-gray-400">
            <FiCalendar className="mr-2" size={14} />
            <span>Période de comparaison: {formatDateRange(comparisonStartDate, comparisonEndDate)}</span>
          </div>
          
          <div className="flex flex-col space-y-3">
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Chiffre d'affaires</span>
              <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {formatCurrency(previousPeriodRevenue)}
              </div>
            </div>
            
            <div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Marge</span>
              <div className="text-xl font-semibold text-gray-600 dark:text-gray-400">
                {formatCurrency(previousPeriodMargin)}
                <span className="ml-1 text-sm font-normal">
                  ({previousPeriodRevenue > 0 
                    ? ((previousPeriodMargin / previousPeriodRevenue) * 100).toFixed(1) 
                    : '0'}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Section évolution */}
      <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-sky-50 dark:from-gray-800/50 dark:to-sky-900/10 border border-sky-100 dark:border-sky-900/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              evolutionPercentage > 0 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : evolutionPercentage < 0
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            } mr-4 flex-shrink-0`}>
              {evolutionPercentage > 0 
                ? <FiArrowUp size={24} />
                : evolutionPercentage < 0 
                  ? <FiArrowDown size={24} />
                  : <FiTrendingUp size={24} />}
            </div>
            
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Évolution CA</span>
              <div className={`text-2xl font-bold ${
                evolutionPercentage > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : evolutionPercentage < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
              }`}>
                {evolutionPercentage > 0 ? '+' : ''}{evolutionPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(currentPeriodRevenue - previousPeriodRevenue)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              marginEvolutionPercentage > 0 
                ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                : marginEvolutionPercentage < 0
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
            } mr-4 flex-shrink-0`}>
              {marginEvolutionPercentage > 0 
                ? <FiArrowUp size={24} />
                : marginEvolutionPercentage < 0 
                  ? <FiArrowDown size={24} />
                  : <FiDollarSign size={24} />}
            </div>
            
            <div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Évolution Marge</span>
              <div className={`text-2xl font-bold ${
                marginEvolutionPercentage > 0 
                  ? 'text-green-600 dark:text-green-400'
                  : marginEvolutionPercentage < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-blue-600 dark:text-blue-400'
              }`}>
                {marginEvolutionPercentage > 0 ? '+' : ''}{marginEvolutionPercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatCurrency(currentPeriodMargin - previousPeriodMargin)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}