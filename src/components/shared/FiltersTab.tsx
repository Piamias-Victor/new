// src/components/shared/pharmacy-selector/FiltersTab.tsx
import React from 'react';
import { FiInfo, FiMap, FiDollarSign, FiMaximize } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface FiltersTabProps {
  onClose: () => void;
}

export function FiltersTab({ onClose }: FiltersTabProps) {
  const { 
    pharmacies, 
    setSelectedPharmacyIds, 
    setLastFilterType, 
    setSelectedFilter 
  } = usePharmacySelection();

  // Extraction des valeurs uniques pour les filtres
  const regions = [...new Set(pharmacies.map(p => p.region).filter(Boolean))];
  const revenueBrackets = [...new Set(pharmacies.map(p => p.revenue).filter(Boolean))];
  const sizes = [...new Set(pharmacies.map(p => p.size).filter(Boolean))];

  // Appliquer un filtre de région
  const applyRegionFilter = (region: string) => {
    const pharmaciesInRegion = pharmacies.filter(p => p.region === region).map(p => p.id);
    setSelectedPharmacyIds(pharmaciesInRegion);
    setLastFilterType('region');
    setSelectedFilter(region);
    onClose();
  };
  
  // Appliquer un filtre de CA
  const applyRevenueFilter = (revenue: string) => {
    const pharmaciesWithRevenue = pharmacies.filter(p => p.revenue === revenue).map(p => p.id);
    setSelectedPharmacyIds(pharmaciesWithRevenue);
    setLastFilterType('revenue');
    setSelectedFilter(revenue);
    onClose();
  };
  
  // Appliquer un filtre de taille
  const applySizeFilter = (size: string) => {
    const pharmaciesWithSize = pharmacies.filter(p => p.size === size).map(p => p.id);
    setSelectedPharmacyIds(pharmaciesWithSize);
    setLastFilterType('size');
    setSelectedFilter(size);
    onClose();
  };

  return (
    <div className="overflow-y-auto flex-grow p-3">
      {/* Info explicative */}
      <div className="mb-4 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
        <div className="flex items-start">
          <FiInfo className="text-teal-500 dark:text-teal-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
          <p className="text-xs text-teal-700 dark:text-teal-300">
            Sélectionnez un filtre pour rapidement afficher un groupe de pharmacies ayant les mêmes caractéristiques.
          </p>
        </div>
      </div>
      
      {/* Filtres par région */}
      {regions.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiMap className="mr-2 text-teal-500 dark:text-teal-400" size={16} />
            Régions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {regions.map(region => region && (
              <button
                key={region}
                onClick={() => applyRegionFilter(region)}
                className="flex items-center justify-between p-2 rounded-lg text-left text-sm border border-gray-200 dark:border-gray-700 hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-700 transition-colors"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300 truncate">{region}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {pharmacies.filter(p => p.region === region).length}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtres par CA */}
      {revenueBrackets.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiDollarSign className="mr-2 text-emerald-500 dark:text-emerald-400" size={16} />
            Chiffre d'affaires
          </h4>
          <div className="space-y-2">
            {revenueBrackets.map(revenue => revenue && (
              <button
                key={revenue}
                onClick={() => applyRevenueFilter(revenue)}
                className="flex items-center justify-between w-full p-2 rounded-lg text-left text-sm border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300">{revenue}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {pharmacies.filter(p => p.revenue === revenue).length}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtres par taille */}
      {sizes.length > 0 && (
        <div>
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FiMaximize className="mr-2 text-amber-500 dark:text-amber-400" size={16} />
            Superficie
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map(size => size && (
              <button
                key={size}
                onClick={() => applySizeFilter(size)}
                className="flex flex-col items-center justify-center p-2 rounded-lg text-center text-sm border border-gray-200 dark:border-gray-700 hover:bg-amber-50 hover:border-amber-200 dark:hover:bg-amber-900/20 dark:hover:border-amber-700 transition-colors"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">{size}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {pharmacies.filter(p => p.size === size).length}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}