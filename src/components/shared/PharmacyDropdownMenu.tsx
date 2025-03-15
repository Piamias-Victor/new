// src/components/shared/PharmacyDropdownMenu.tsx
import React, { useState } from 'react';
import { FiUsers, FiFilter, FiCheckCircle } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { PharmaciesTab } from './PharmaciesTab';
import { FiltersTab } from './FiltersTab';
import { Button, GhostButton } from '@/components/ui/Button';

interface PharmacyDropdownMenuProps {
  onClose: () => void;
}

export function PharmacyDropdownMenu({ onClose }: PharmacyDropdownMenuProps) {
  const [activeTab, setActiveTab] = useState<'pharmacies' | 'filters'>('pharmacies');
  const { 
    tempLastFilterType, 
    tempSelectedFilter, 
    setTempLastFilterType, 
    setTempSelectedFilter,
    tempSelectedPharmacyIds,
    setTempSelectedPharmacyIds,
    applyPharmacyChanges
  } = usePharmacySelection();

  // Fonction pour réinitialiser les filtres temporaires
  const handleResetFilters = () => {
    setTempLastFilterType('none');
    setTempSelectedFilter(null);
    setTempSelectedPharmacyIds([]);
  };

  
  // Handler pour appliquer les changements
  const handleApply = () => {
    applyPharmacyChanges();
    onClose();
  };

  return (
    <div className="flex flex-col" style={{ height: '500px' }}>
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

      {/* Tab Content - avec un seul scroll */}
      <div className="overflow-y-auto flex-grow">
        {activeTab === 'pharmacies' ? 
          <PharmaciesTab onClose={onClose} /> : 
          <FiltersTab onClose={onClose} />
        }
      </div>
      
      {/* Footer commun - Avec les composants Button réutilisables */}
      <div className="p-3 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30 flex-shrink-0">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {tempSelectedPharmacyIds.length > 0 && (
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              {tempSelectedPharmacyIds.length} pharmacie(s) sélectionnée(s)
            </span>
          )}
          {tempLastFilterType !== 'none' && tempSelectedFilter && (
            <span className="text-teal-600 dark:text-teal-400 font-medium ml-1">
              {tempSelectedPharmacyIds.length > 0 ? ' · ' : ''}{tempSelectedFilter}
            </span>
          )}
        </div>
        
        <div className="flex space-x-2">
          {/* Bouton pour réinitialiser/effacer - Utiliser GhostButton */}
          {(tempLastFilterType !== 'none' || tempSelectedPharmacyIds.length > 0) && (
            <GhostButton
              size="sm"
              onClick={handleResetFilters}
            >
              Effacer
            </GhostButton>
          )}
          
          
          {/* Bouton pour appliquer les sélections - Utiliser Button */}
          <Button
            size="sm"
            variant="teal"
            rightIcon={<FiCheckCircle size={12} />}
            onClick={handleApply}
          >
            Appliquer
          </Button>
        </div>
      </div>
    </div>
  );
}