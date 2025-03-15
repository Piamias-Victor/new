// src/components/dashboard/PharmacyDataCard.tsx
'use client';

import React from 'react';
import { FiHome, FiUsers, FiMap, FiDollarSign } from 'react-icons/fi';
import { usePharmacy } from '@/contexts/PharmacyContext';

export function PharmacyDataCard() {

const { selectedPharmacy, selectedPharmacyId, isLoading } = usePharmacy();
  
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
          Les données affichées correspondent à l'ensemble des pharmacies. Sélectionnez une pharmacie spécifique pour voir ses détails.
        </p>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                ? `${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selectedPharmacy.ca)}`
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
        </div>
      </div>
    </div>
    );
}