// src/components/shared/PharmacyDropdownMenu.tsx
import React, { useState } from 'react';
import { FiUsers, FiFilter, FiX, FiCheckCircle } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { PharmaciesTab } from './PharmaciesTab';
import { FiltersTab } from './FiltersTab';

interface PharmacyDropdownMenuProps {
  onClose: () => void;
}

export function PharmacyDropdownMenu({ onClose }: PharmacyDropdownMenuProps) {
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'filters'>('pharmacies');
  const { 
    lastFilterType, 
    selectedFilter, 
    setLastFilterType, 
    setSelectedFilter,
    selectedPharmacyIds,
    setSelectedPharmacyIds,
    pharmacies
  } = usePharmacySelection();

  // Fonction pour réinitialiser les filtres sans cause de boucle infinie
  const handleResetFilters = () => {
    const resetFilters = () => {
      setLastFilterType('none');
      setSelectedFilter(null);
      setSelectedPharmacyIds([]);
    };
    resetFilters();
  };

  // Fonction pour sélectionner toutes les pharmacies
  const handleSelectAll = () => {
    setSelectedPharmacyIds(pharmacies.map(p => p.id));
    setLastFilterType('none');
    setSelectedFilter(null);
  };

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <button
          onClick={() => setActiveTab('pharmacies')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'pharmacies'
              ? 'text-teal-600 border-b-2 border-teal-500 dark:text-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <FiUsers className="mr-2" size={16} />
            Pharmacies
          </div>
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex-1 py-3 text-sm font-medium ${
            activeTab === 'filters'
              ? 'text-teal-600 border-b-2 border-teal-500 dark:text-teal-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <div className="flex items-center justify-center">
            <FiFilter className="mr-2" size={16} />
            Filtres rapides
          </div>
        </button>
      </div>

      {/* Tab Content - avec un seul scroll contrôlé */}
      <div className="overflow-y-auto flex-grow">
        {activeTab === 'pharmacies' ? 
          <PharmaciesTab onClose={onClose} /> : 
          <FiltersTab onClose={onClose} />
        }
      </div>
      
      {/* Footer commun */}
      <div className="p-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selectedPharmacyIds.length > 0 && (
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              {selectedPharmacyIds.length} pharmacie(s) sélectionnée(s)
            </span>
          )}
          {lastFilterType !== 'none' && selectedFilter && (
            <span className="text-teal-600 dark:text-teal-400 font-medium ml-1">
              {selectedPharmacyIds.length > 0 ? ' · ' : ''}{selectedFilter}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {/* Bouton pour réinitialiser/effacer */}
          {(lastFilterType !== 'none' || selectedPharmacyIds.length > 0) && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <FiX className="inline-block mr-1" size={12} />
              Effacer
            </button>
          )}
          
          {/* Bouton pour appliquer les sélections */}
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
          >
            <FiCheckCircle className="inline-block mr-1" size={12} />
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}