// src/components/dashboard/AnnualProgress.tsx
import React from 'react';
import { FiCalendar, FiTarget, FiShoppingBag, FiShoppingCart } from 'react-icons/fi';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useAnnualData } from '@/hooks/useAnnualData';

interface AnnualProgressProps {
  sellOutGoal: number;
  sellInGoal: number;
}

export function AnnualProgress({ sellOutGoal, sellInGoal }: AnnualProgressProps) {
  const annualData = useAnnualData();
  
  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  if (annualData.isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
          <FiTarget size={20} />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Progression des objectifs
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Progression sur l'année {new Date().getFullYear()}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Progression de l'année */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiCalendar className="text-gray-500 dark:text-gray-400 mr-2" size={16} />
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
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Jan</span>
            <span>Avr</span>
            <span>Juil</span>
            <span>Oct</span>
            <span>Déc</span>
          </div>
        </div>
        
        {/* Progression Sell-Out */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiShoppingBag className="text-blue-500 dark:text-blue-400 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progression Sell-Out
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(annualData.sellOutRevenue)} / {formatCurrency(sellOutGoal)}
            </span>
          </div>
          <ProgressBar 
            value={annualData.sellOutRevenue} 
            maxValue={sellOutGoal} 
            colorClass="bg-blue-500" 
            showPercentage={true}
          />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Évolution vs N-1</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {((annualData.sellOutRevenue / annualData.previousYearSellOut - 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Reste à réaliser</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(sellOutGoal - annualData.sellOutRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Progression Sell-In */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <FiShoppingCart className="text-amber-500 dark:text-amber-400 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Progression Sell-In
              </span>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(annualData.sellInRevenue)} / {formatCurrency(sellInGoal)}
            </span>
          </div>
          <ProgressBar 
            value={annualData.sellInRevenue} 
            maxValue={sellInGoal} 
            colorClass="bg-amber-500" 
            showPercentage={true}
          />
          <div className="grid grid-cols-2 gap-2 mt-1">
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Évolution vs N-1</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {((annualData.sellInRevenue / annualData.previousYearSellIn - 1) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded p-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">Reste à réaliser</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formatCurrency(sellInGoal - annualData.sellInRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}