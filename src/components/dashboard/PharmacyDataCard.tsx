// src/components/dashboard/PharmacyDataCard.tsx
'use client';

import React from 'react';
import { FiHome, FiUsers, FiMap, FiDollarSign, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { usePharmacy } from '@/contexts/PharmacyContext';
import { useDateRange } from '@/contexts/DateRangeContext';
import { useRevenue } from '@/hooks/useRevenue';

export function PharmacyDataCard() {
  const { selectedPharmacy, selectedPharmacyId, isLoading: isLoadingPharmacy } = usePharmacy();
  const { totalRevenue, isLoading: isLoadingRevenue, error: revenueError, actualDateRange } = useRevenue();
  const { displayLabel } = useDateRange();
  
  const isLoading = isLoadingPharmacy || isLoadingRevenue;
  
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
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }
  
  // Si erreur de chargement des revenus
  if (revenueError) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiDollarSign size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {revenueError}
        </p>
      </div>
    );
  }
  
  // Si aucune pharmacie spécifique n'est sélectionnée
  if (selectedPharmacyId === 'all') {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 mr-3">
            <FiHome size={20} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Toutes les pharmacies</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Les données affichées correspondent à l'ensemble des pharmacies.
        </p>
        
        {/* Affichage du CA actuel */}
        <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
          <div className="flex items-center mb-2">
            <FiDollarSign className="text-emerald-500 mr-2" size={16} />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Chiffre d'Affaires ({displayLabel})</span>
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
      </div>
    );
  }
  
  // Afficher les détails de la pharmacie sélectionnée
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-teal-500/10 to-sky-500/10 dark:from-teal-600/20 dark:to-sky-600/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 mr-3">
            <FiHome size={20} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {selectedPharmacy?.name || 'Pharmacie'}
          </h3>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <FiMap className="text-sky-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zone</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedPharmacy?.area || 'Non spécifiée'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <FiDollarSign className="text-emerald-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CA Annuel</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedPharmacy?.ca 
                ? formatCurrency(selectedPharmacy.ca)
                : 'Non spécifié'}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <FiUsers className="text-purple-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employés</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {selectedPharmacy?.employees_count !== undefined
                ? `${selectedPharmacy.employees_count} personnes`
                : 'Non spécifié'}
            </div>
          </div>
          
          {/* Nouvelle carte pour le CA de la période */}
          <div className="bg-gray-50 dark:bg-gray-900/30 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <FiTrendingUp className="text-sky-500 mr-2" size={16} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">CA ({displayLabel})</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(totalRevenue)}
            </div>
            {actualDateRange && (
              <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                <FiCalendar size={12} className="mr-1" />
                {actualDateRange.days} jours
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}