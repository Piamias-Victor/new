// src/components/sidebar/PharmacyFilterSummary.tsx
import React from 'react';
import { FiHome } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import { SidebarCard } from './SidebarCard';

export function PharmacyFilterSummary() {
  const { pharmacies, selectedPharmacyIds, selectedFilter } = usePharmacySelection();

  if (pharmacies.length === 0) {
    return (
      <SidebarCard title="Pharmacies" icon={<FiHome size={16} className="text-teal-500" />}>
        <div className="text-sm text-gray-500">Chargement...</div>
      </SidebarCard>
    );
  }

  return (
    <SidebarCard title="Pharmacies" icon={<FiHome size={16} className="text-teal-500" />}>
      <div className="space-y-2">
        <div className="inline-flex items-center px-2.5 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 rounded-full text-xs font-medium">
          {selectedPharmacyIds.length === pharmacies.length 
            ? "Toutes les pharmacies" 
            : `${selectedPharmacyIds.length} / ${pharmacies.length}`}
        </div>
        
        {selectedFilter && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Filtre: {selectedFilter}
          </div>
        )}
      </div>
    </SidebarCard>
  );
}