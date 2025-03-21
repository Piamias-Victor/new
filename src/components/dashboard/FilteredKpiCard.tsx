// src/components/dashboard/FilteredKpiCard.tsx
import React, { useState, useRef } from 'react';
import { FiInfo } from 'react-icons/fi';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { useProductFilter } from '@/contexts/ProductFilterContext';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  change?: {
    displayValue: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
  alternateView?: {
    title?: string;
    subtitle?: string;
    value: string;
    change?: {
      displayValue: string;
      previousValue?: string;
      isPositive: boolean;
    };
  };
  infoTooltip?: string;
}

export function FilteredKpiCard({ 
  icon, 
  title, 
  subtitle, 
  value, 
  change, 
  isLoading, 
  alternateView, 
  infoTooltip
}: KpiCardProps) {
  const [showAlternate, setShowAlternate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isFilterActive, selectedCodes } = useProductFilter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Déterminer la couleur en fonction de isPositive
  const getColorClass = (isPositive: boolean) => {
    return isPositive 
      ? 'text-green-500 dark:text-green-400' 
      : 'text-red-500 dark:text-red-400';
  };

  // Gérer l'affichage du tooltip avec un délai
  const handleTooltipEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(true), 300);
  };
  
  const handleTooltipLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setShowTooltip(false), 200);
  };

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

  if (!alternateView) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-gray-900 dark:text-white">{title}</h3>
                {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
              </div>
              {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={handleTooltipEnter}
                onMouseLeave={handleTooltipLeave}
                aria-label="Plus d'informations"
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  onMouseEnter={handleTooltipEnter}
                  onMouseLeave={handleTooltipLeave}
                >
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
            <span className={`font-medium ${getColorClass(change.isPositive)}`}>
              {change.displayValue}
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                {showAlternate && alternateView.title ? alternateView.title : title}
              </h3>
              {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
            </div>
            {showAlternate && alternateView.subtitle 
              ? <p className="text-xs text-gray-500 dark:text-gray-400">{alternateView.subtitle}</p>
              : subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            }
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setShowAlternate(false)}
              className={`flex text-xs items-center justify-center p-1.5 rounded-md transition-colors ${
                !showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title.includes("Stock") ? "Afficher en montant" : "Afficher en pourcentage"}
            >
              {title.includes("Stock") ? "€" : "%"}
            </button>
            
            <button
              onClick={() => setShowAlternate(true)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title.includes("Stock") ? "Afficher en unités" : "Afficher en montant"}
            >
              {title.includes("Stock") ? "#" : "€"}
            </button>
          </div>
          
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={handleTooltipEnter}
                onMouseLeave={handleTooltipLeave}
                aria-label="Plus d'informations"
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg 
                  border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                  onMouseEnter={handleTooltipEnter}
                  onMouseLeave={handleTooltipLeave}
                >
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
      
      {/* Partie modifiée pour l'alternateView */}
      {(showAlternate ? alternateView.change : change) && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`font-medium ${
            showAlternate && alternateView.change 
              ? getColorClass(alternateView.change.isPositive)
              : change && getColorClass(change.isPositive)
          }`}>
            {showAlternate && alternateView.change
              ? alternateView.change.displayValue
              : change && change.displayValue
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