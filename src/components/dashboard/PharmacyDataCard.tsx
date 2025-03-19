// src/components/dashboard/PharmacyDataCard.tsx
'use client';

import React from 'react';
import { FiDollarSign, FiCalendar } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useRevenue } from '@/hooks/useRevenueold';

export function PharmacyDataCard() {
  const { selectedPharmacyIds } = usePharmacySelection();
  const { totalRevenue, isLoading, error: revenueError, actualDateRange } = useRevenue();
  const { displayLabel } = useDateRange();
  
  // Formatter pour les montants
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-full"></div>
      </div>
    );
  }
  
  if (revenueError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiDollarSign size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{revenueError}</p>
      </div>
    );
  }
  
  // Version simplifiée : uniquement le KPI de chiffre d'affaires
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-2">
        <FiDollarSign className="text-emerald-500 mr-2" size={16} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Chiffre d'Affaires ({displayLabel}) - {selectedPharmacyIds.length} pharmacie(s)
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-white">
        {formatCurrency(totalRevenue)}
      </div>
      {actualDateRange && (
        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <FiCalendar size={12} className="mr-1" />
          Période: {actualDateRange.min} - {actualDateRange.max} ({actualDateRange.days} jours)
        </div>
      )}
    </div>
  );
}