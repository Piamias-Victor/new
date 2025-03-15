// src/components/shared/pharmacy-selector/PharmacyList.tsx
import React from 'react';
import { FiCheck, FiMapPin, FiUsers, FiDollarSign } from 'react-icons/fi';
import { usePharmacySelection, Pharmacy } from '@/providers/PharmacyProvider';

interface PharmacyListProps {
  pharmacies: Pharmacy[];
}

export function PharmacyList({ pharmacies }: PharmacyListProps) {
  const { selectedPharmacyIds, setSelectedPharmacyIds } = usePharmacySelection();

  // Sélectionner ou désélectionner une pharmacie
  const togglePharmacy = (id: string) => {
    if (selectedPharmacyIds.includes(id)) {
      setSelectedPharmacyIds(selectedPharmacyIds.filter(pharmId => pharmId !== id));
    } else {
      setSelectedPharmacyIds([...selectedPharmacyIds, id]);
    }
  };

  if (pharmacies.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <div className="mb-3 flex justify-center">
          <svg className="w-12 h-12 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <p className="text-lg font-medium">Aucune pharmacie trouvée</p>
        <p className="text-sm">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div className="p-2">
      {pharmacies.map((pharmacy) => (
        <div key={pharmacy.id} className="mb-2 last:mb-0">
          <div 
            onClick={() => togglePharmacy(pharmacy.id)}
            className={`cursor-pointer transition-all duration-200 rounded-lg overflow-hidden ${
              selectedPharmacyIds.includes(pharmacy.id) 
                ? 'bg-teal-50 border-teal-200 dark:bg-teal-900/30 dark:border-teal-800/50' 
                : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'
            } border shadow-sm hover:shadow`}
          >
            <div className="flex items-center p-3">
              {/* Case à cocher */}
              <div className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-md border ${
                selectedPharmacyIds.includes(pharmacy.id) 
                  ? 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {selectedPharmacyIds.includes(pharmacy.id) && <FiCheck className="text-white" size={14} />}
              </div>

              {/* Informations de la pharmacie */}
              <div className="ml-3 flex-1">
                <div className="font-medium text-gray-900 dark:text-white">{pharmacy.name}</div>
                
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {(pharmacy.region || pharmacy.area) && (
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                      <FiMapPin size={12} className="mr-1 text-teal-500 dark:text-teal-400" />
                      {pharmacy.region || pharmacy.area}
                    </div>
                  )}
                  
                  {pharmacy.ca && (
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                      <FiDollarSign size={12} className="mr-1 text-emerald-500 dark:text-emerald-400" />
                      {formatCurrency(pharmacy.ca)}
                    </div>
                  )}
                  
                  {pharmacy.employees_count && (
                    <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                      <FiUsers size={12} className="mr-1 text-blue-500 dark:text-blue-400" />
                      {pharmacy.employees_count} employés
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Fonction utilitaire pour formater les montants
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M€`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K€`;
  }
  return `${amount}€`;
}
