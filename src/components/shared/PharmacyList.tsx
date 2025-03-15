// src/components/shared/PharmacyList.tsx
import React from 'react';
import { FiCheck, FiMapPin, FiDollarSign } from 'react-icons/fi';
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
    <div>
      {pharmacies.map((pharmacy) => (
        <div 
          key={pharmacy.id} 
          onClick={() => togglePharmacy(pharmacy.id)}
          className={`cursor-pointer transition-all duration-200 p-3 mb-2 border-l-4 ${
            selectedPharmacyIds.includes(pharmacy.id) 
              ? 'bg-teal-50 dark:bg-teal-900/20 border-l-teal-500' 
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 border-l-transparent'
          } rounded-md hover:shadow-sm`}
        >
          <div className="flex items-center">
            {/* Case à cocher stylisée */}
            <div className={`flex-shrink-0 w-5 h-5 rounded-md ${
              selectedPharmacyIds.includes(pharmacy.id) 
                ? 'bg-teal-500 text-white' 
                : 'border-2 border-gray-300 dark:border-gray-600'
            } mr-3 flex items-center justify-center`}>
              {selectedPharmacyIds.includes(pharmacy.id) && <FiCheck size={14} />}
            </div>
            
            {/* Informations de la pharmacie */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 dark:text-white">{pharmacy.name}</h3>
                {pharmacy.id_nat && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                    {pharmacy.id_nat}
                  </span>
                )}
              </div>
              
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                {pharmacy.area && (
                  <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                    <FiMapPin size={12} className="mr-1 text-teal-500 dark:text-teal-400" />
                    {pharmacy.area}
                  </div>
                )}
                
                {pharmacy.ca && (
                  <div className="inline-flex items-center text-gray-600 dark:text-gray-300">
                    <FiDollarSign size={12} className="mr-1 text-emerald-500 dark:text-emerald-400" />
                    {formatCurrency(pharmacy.ca)}
                  </div>
                )}
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
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    maximumFractionDigits: 0
  }).format(amount);
}