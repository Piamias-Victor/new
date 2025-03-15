// src/components/shared/pharmacy-selector/PharmaciesTab.tsx
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import React, { useState } from 'react';
import { FiSearch, FiX, FiMap, FiDollarSign, FiMaximize, FiCheck } from 'react-icons/fi';
import { GroupedPharmacyList } from './GroupedPharmacyList';
import { PharmacyList } from './PharmacyList';


// Type pour les options de regroupement
type GroupingType = 'none' | 'region' | 'revenue' | 'size';

export function PharmaciesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupingType>('none');
  
  const { 
    pharmacies, 
    selectedPharmacyIds, 
    setSelectedPharmacyIds 
  } = usePharmacySelection();

  // Filtrer les pharmacies en fonction de la recherche
  const filteredPharmacies = pharmacies.filter(pharmacy => 
    pharmacy.name && pharmacy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Vérifier si toutes les pharmacies sont sélectionnées
  const allSelected = selectedPharmacyIds.length === pharmacies.length;
  
  // Sélectionner ou désélectionner toutes les pharmacies
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedPharmacyIds([]);
    } else {
      setSelectedPharmacyIds(pharmacies.map(p => p.id));
    }
  };

  return (
    <>
      {/* Barre de recherche */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une pharmacie..."
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={16} />
            </button>
          )}
        </div>

        {/* Option "Toutes les pharmacies" */}
        <div className="mt-3 flex items-center">
          <button 
            onClick={toggleSelectAll}
            className={`flex items-center w-full py-2 px-3 rounded-md text-sm transition-colors ${
              allSelected 
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 mr-3 flex items-center justify-center rounded-md border ${
              allSelected 
                ? 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500' 
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {allSelected && <FiCheck className="text-white" size={14} />}
            </div>
            Toutes les pharmacies
          </button>
        </div>
      </div>
      
      {/* Options de regroupement */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Regrouper par
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setGroupBy('region')}
              className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                groupBy === 'region' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <FiMap className="mr-1" size={12} /> Région
            </button>
            <button
              onClick={() => setGroupBy('revenue')}
              className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                groupBy === 'revenue' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <FiDollarSign className="mr-1" size={12} /> CA
            </button>
            <button
              onClick={() => setGroupBy('size')}
              className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                groupBy === 'size' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <FiMaximize className="mr-1" size={12} /> Taille
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des pharmacies */}
      <div className="overflow-y-auto flex-grow">
        {groupBy === 'none' ? (
          <PharmacyList pharmacies={filteredPharmacies} />
        ) : (
          <GroupedPharmacyList pharmacies={filteredPharmacies} groupBy={groupBy} />
        )}
      </div>
    </>
  );
}