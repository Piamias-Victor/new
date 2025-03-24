// src/components/sidebar/PharmacyFilterSummary.tsx
import React from 'react';
import { FiHome, FiMap, FiDollarSign } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { SidebarCard } from './SidebarCard';

export function PharmacyFilterSummary() {
  const { 
    pharmacies,
    selectedPharmacyIds,
    lastFilterType,
    selectedFilter
  } = usePharmacySelection();

  // Obtenir l'icône en fonction du type de filtre
  const getFilterIcon = () => {
    switch (lastFilterType) {
      case 'region': return <FiMap size={16} className="text-teal-500" />;
      case 'revenue': return <FiDollarSign size={16} className="text-teal-500" />;
      case 'size': return <FiDollarSign size={16} className="text-teal-500" />;
      default: return <FiHome size={16} className="text-teal-500" />;
    }
  };

  // S'il n'y a pas de pharmacies chargées
  if (pharmacies.length === 0) {
    return (
      <SidebarCard
        title="Pharmacies"
        icon={<FiHome size={16} className="text-teal-500" />}
      >
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Chargement des pharmacies...
        </div>
      </SidebarCard>
    );
  }

  return (
    <SidebarCard
      title="Pharmacies"
      icon={getFilterIcon()}
    >
      <div className="space-y-2">
        {/* Badge du nombre de pharmacies */}
        <div className="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
          {selectedPharmacyIds.length === pharmacies.length 
            ? "Toutes les pharmacies" 
            : `${selectedPharmacyIds.length} / ${pharmacies.length} pharmacies`}
        </div>
        
        {/* Filtre appliqué */}
        {lastFilterType !== 'none' && selectedFilter && (
          <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
            <div className="flex items-center text-teal-600 dark:text-teal-400">
              {getFilterIcon()}
              <span className="ml-2 font-medium">
                {lastFilterType === 'region' ? 'Région' : 
                 lastFilterType === 'revenue' ? 'Chiffre d\'affaires' : 
                 lastFilterType === 'size' ? 'Taille' : 'Filtre'}
              </span>
            </div>
            <div className="mt-1 ml-6 text-gray-600 dark:text-gray-400">
              {selectedFilter}
            </div>
          </div>
        )}
        
        {/* Liste de pharmacies limitée */}
        {selectedPharmacyIds.length > 0 && selectedPharmacyIds.length < pharmacies.length && selectedPharmacyIds.length <= 5 && (
          <div className="mt-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Pharmacies sélectionnées :
            </div>
            <ul className="space-y-1 ml-2">
              {selectedPharmacyIds.map(id => {
                const pharmacy = pharmacies.find(p => p.id === id);
                return pharmacy ? (
                  <li key={id} className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    • {pharmacy.name}
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        )}
      </div>
    </SidebarCard>
  );
}