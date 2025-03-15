// src/components/shared/pharmacy-selector/PharmaciesTab.tsx
import { usePharmacySelection } from '@/providers/PharmacyProvider';
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiMap, FiDollarSign, FiCheck } from 'react-icons/fi';
import { PharmacyList } from './PharmacyList';

// Type pour les options de regroupement
type GroupingType = 'none' | 'region' | 'ca';

export function PharmaciesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<GroupingType>('none');
  const [groupedPharmacies, setGroupedPharmacies] = useState<{ [key: string]: any }>({});
  const [groupKeys, setGroupKeys] = useState<string[]>([]);
  
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
  
  // Regrouper les pharmacies lorsque l'option de regroupement change
  useEffect(() => {
    if (groupBy === 'none') {
      setGroupedPharmacies({});
      setGroupKeys([]);
      return;
    }
    
    const result: { [key: string]: any } = {};
    let valueKey = '';
    
    if (groupBy === 'region') {
      valueKey = 'area';
    } else if (groupBy === 'ca') {
      valueKey = 'ca';
    }
    
    // Regrouper par la clé appropriée
    filteredPharmacies.forEach(pharmacy => {
      const value = pharmacy[valueKey];
      
      if (value) {
        let groupKey = String(value);
        
        // Pour le CA, créer des tranches
        if (groupBy === 'ca') {
          const ca = Number(value);
          if (ca < 1000000) {
            groupKey = "< 1M€";
          } else if (ca < 2000000) {
            groupKey = "1M€ - 2M€";
          } else if (ca < 3000000) {
            groupKey = "2M€ - 3M€";
          } else {
            groupKey = "> 3M€";
          }
        }
        
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(pharmacy);
      }
    });
    
    setGroupedPharmacies(result);
    setGroupKeys(Object.keys(result).sort());
  }, [groupBy, filteredPharmacies]);

  // Afficher un groupe spécifique de pharmacies
  const renderGroup = (groupKey: string) => {
    if (!groupedPharmacies[groupKey]) return null;
    
    const pharmaciesInGroup = groupedPharmacies[groupKey];
    const allInGroupSelected = pharmaciesInGroup.every((p: any) => 
      selectedPharmacyIds.includes(p.id)
    );
    
    return (
      <div key={groupKey} className="mb-4">
        <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div className="font-medium text-gray-700 dark:text-gray-300 flex items-center">
            {groupBy === 'region' ? (
              <FiMap className="mr-2 text-teal-500" size={14} />
            ) : (
              <FiDollarSign className="mr-2 text-emerald-500" size={14} />
            )}
            {groupKey} ({pharmaciesInGroup.length})
          </div>
          
          <button
            onClick={() => {
              if (allInGroupSelected) {
                // Désélectionner toutes les pharmacies du groupe
                setSelectedPharmacyIds(selectedPharmacyIds.filter(id => 
                  !pharmaciesInGroup.some((p: any) => p.id === id)
                ));
              } else {
                // Sélectionner toutes les pharmacies du groupe
                const idsToAdd = pharmaciesInGroup
                  .map((p: any) => p.id)
                  .filter((id: string) => !selectedPharmacyIds.includes(id));
                  
                setSelectedPharmacyIds([...selectedPharmacyIds, ...idsToAdd]);
              }
            }}
            className={`text-xs font-medium px-2 py-1 rounded ${
              allInGroupSelected
                ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }`}
          >
            {allInGroupSelected ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>
        
        <PharmacyList pharmacies={pharmaciesInGroup} />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
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
        <div className="mt-3">
          <button 
            onClick={toggleSelectAll}
            className={`flex items-center w-full py-2 px-3 rounded-md text-sm transition-colors ${
              allSelected 
                ? 'bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className={`w-5 h-5 mr-3 flex items-center justify-center rounded-md ${
              allSelected 
                ? 'bg-teal-500 text-white' 
                : 'border-2 border-gray-300 dark:border-gray-600'
            }`}>
              {allSelected && <FiCheck size={14} />}
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
              onClick={() => setGroupBy(groupBy === 'region' ? 'none' : 'region')}
              className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                groupBy === 'region' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <FiMap className="mr-1" size={12} /> Région
            </button>
            <button
              onClick={() => setGroupBy(groupBy === 'ca' ? 'none' : 'ca')}
              className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                groupBy === 'ca' 
                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <FiDollarSign className="mr-1" size={12} /> CA
            </button>
          </div>
        </div>
      </div>
      
      {/* Liste des pharmacies */}
      <div className="overflow-y-auto flex-grow p-3">
        {groupBy === 'none' ? (
          <PharmacyList pharmacies={filteredPharmacies} />
        ) : (
          <div>
            {groupKeys.length > 0 ? (
              groupKeys.map(key => renderGroup(key))
            ) : (
              <div className="text-center py-4 text-gray-500">
                Aucun groupe trouvé pour ce critère
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}