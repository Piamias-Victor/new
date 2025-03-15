// src/components/shared/pharmacy-selector/GroupedPharmacyList.tsx
import React from 'react';
import { FiMap, FiDollarSign, FiMaximize, FiCheck } from 'react-icons/fi';
import { usePharmacySelection, Pharmacy } from '@/providers/PharmacyProvider';

interface GroupedPharmacyListProps {
  pharmacies: Pharmacy[];
  groupBy: 'region' | 'revenue' | 'size';
}

export function GroupedPharmacyList({ pharmacies, groupBy }: GroupedPharmacyListProps) {
  const { selectedPharmacyIds, setSelectedPharmacyIds } = usePharmacySelection();

  // Sélectionner ou désélectionner une pharmacie
  const togglePharmacy = (id: string) => {
    if (selectedPharmacyIds.includes(id)) {
      setSelectedPharmacyIds(selectedPharmacyIds.filter(pharmId => pharmId !== id));
    } else {
      setSelectedPharmacyIds([...selectedPharmacyIds, id]);
    }
  };

  // Extraire les valeurs de groupement et trier les pharmacies
  const getGroupedPharmacies = () => {
    // Extraire les valeurs uniques pour le groupement sélectionné
    const groupValues = [...new Set(pharmacies.map(p => p[groupBy]).filter(Boolean))];
    
    // Créer un object avec les pharmacies groupées
    const grouped: { [key: string]: Pharmacy[] } = {};
    
    // Initialiser les groupes
    groupValues.forEach(value => {
      if (value) grouped[value as string] = [];
    });
    
    // Remplir les groupes
    pharmacies.forEach(pharmacy => {
      const groupValue = pharmacy[groupBy];
      if (groupValue) {
        grouped[groupValue as string].push(pharmacy);
      }
    });
    
    return { groupValues, grouped };
  };

  const { groupValues, grouped } = getGroupedPharmacies();

  // Obtenir l'icône en fonction du type de groupement
  const getGroupIcon = (value: string) => {
    switch (groupBy) {
      case 'region': return <FiMap className="mr-2 text-teal-500 dark:text-teal-400" size={16} />;
      case 'revenue': return <FiDollarSign className="mr-2 text-emerald-500 dark:text-emerald-400" size={16} />;
      case 'size': return <FiMaximize className="mr-2 text-amber-500 dark:text-amber-400" size={16} />;
      default: return null;
    }
  };

  return (
    <div>
      {groupValues.map(groupValue => {
        if (!groupValue) return null;
        
        const pharmaciesInGroup = grouped[groupValue as string];
        if (!pharmaciesInGroup || pharmaciesInGroup.length === 0) return null;
        
        const allInGroupSelected = pharmaciesInGroup.every(p => selectedPharmacyIds.includes(p.id));
        
        return (
          <div key={groupValue as string} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
              <div className="flex items-center">
                {getGroupIcon(groupValue as string)}
                <span className="font-medium text-gray-700 dark:text-gray-300">{groupValue}</span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  ({pharmaciesInGroup.length})
                </span>
              </div>
              <button
                onClick={() => {
                  if (allInGroupSelected) {
                    // Désélectionner toutes les pharmacies de ce groupe
                    setSelectedPharmacyIds(selectedPharmacyIds.filter(id => 
                      !pharmaciesInGroup.some(p => p.id === id)
                    ));
                  } else {
                    // Sélectionner toutes les pharmacies de ce groupe
                    const newSelection = [...new Set([
                      ...selectedPharmacyIds,
                      ...pharmaciesInGroup.map(p => p.id)
                    ])];
                    setSelectedPharmacyIds(newSelection);
                  }
                }}
                className={`text-xs font-medium px-2 py-1 rounded ${
                  allInGroupSelected
                    ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {allInGroupSelected ? 'Désélectionner' : 'Sélectionner'}
              </button>
            </div>
            <div className="p-2">
              {pharmaciesInGroup.map(pharmacy => (
                <div key={pharmacy.id} className="mb-1 last:mb-0">
                  <button
                    onClick={() => togglePharmacy(pharmacy.id)}
                    className={`flex items-center w-full py-2 px-2 rounded-md text-sm transition-colors ${
                      selectedPharmacyIds.includes(pharmacy.id) 
                        ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-5 h-5 mr-2 flex items-center justify-center rounded-md border ${
                      selectedPharmacyIds.includes(pharmacy.id) 
                        ? 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {selectedPharmacyIds.includes(pharmacy.id) && <FiCheck className="text-white" size={14} />}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="font-medium">{pharmacy.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {groupBy !== 'region' && pharmacy.region && `${pharmacy.region} · `}
                        {groupBy !== 'revenue' && pharmacy.revenue && `${pharmacy.revenue} · `}
                        {groupBy !== 'size' && pharmacy.size && pharmacy.size}
                      </span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}