// src/components/sidebar/PharmacyFilterSummary.tsx
import React from 'react';
import { FiHome, FiTrash, FiX } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { SidebarCard } from './SidebarCard';

export function PharmacyFilterSummary() {
  const { 
    pharmacies, 
    selectedPharmacyIds, 
    selectedFilter, 
    setSelectedPharmacyIds, 
    setLastFilterType,
    setSelectedFilter 
  } = usePharmacySelection();

  if (pharmacies.length === 0) {
    return (
      <SidebarCard title="Pharmacies" icon={<FiHome size={16} className="text-teal-500" />}>
        <div className="text-sm text-gray-500">Chargement...</div>
      </SidebarCard>
    );
  }

  // Obtenir les pharmacies sélectionnées
  const selectedPharmacies = pharmacies.filter(p => selectedPharmacyIds.includes(p.id));

  // Réinitialiser les filtres de pharmacie
  const clearPharmacyFilter = () => {
    setSelectedPharmacyIds(pharmacies.map(p => p.id));
    setLastFilterType('none');
    setSelectedFilter(null);
  };

  // Supprimer une pharmacie individuelle
  const removePharmacy = (pharmacyId: string) => {
    // Ne pas permettre de tout supprimer
    if (selectedPharmacyIds.length > 1) {
      setSelectedPharmacyIds(selectedPharmacyIds.filter(id => id !== pharmacyId));
    }
  };

  return (
    <SidebarCard title="Pharmacies" icon={<FiHome size={16} className="text-teal-500" />}>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
            {selectedPharmacyIds.length === pharmacies.length 
              ? "Toutes les pharmacies" 
              : `${selectedPharmacyIds.length} / ${pharmacies.length}`}
          </div>
          
          {(selectedPharmacyIds.length !== pharmacies.length || selectedFilter) && (
            <button 
              onClick={clearPharmacyFilter}
              className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              title="Réinitialiser le filtre"
            >
              <FiTrash size={16} />
            </button>
          )}
        </div>
        
        {selectedPharmacyIds.length < pharmacies.length && (
          <div className="max-h-20 overflow-y-auto text-xs">
            {selectedPharmacies.map((pharmacy) => (
              <div 
                key={pharmacy.id} 
                className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 px-1 py-0.5 rounded"
              >
                <span className="truncate mr-2">{pharmacy.name}</span>
                {selectedPharmacyIds.length > 1 && (
                  <button 
                    onClick={() => removePharmacy(pharmacy.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Supprimer cette pharmacie"
                  >
                    <FiX size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        
        {selectedFilter && (
          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-between">
            <span>Filtre: {selectedFilter}</span>
          </div>
        )}
      </div>
    </SidebarCard>
  );
}