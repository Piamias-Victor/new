// src/components/shared/pharmacy-selector/FiltersTab.tsx
import React, { useEffect, useState } from 'react';
import { FiInfo, FiMap, FiDollarSign } from 'react-icons/fi';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface FiltersTabProps {
  onClose: () => void;
}

// Types pour les données de filtre
interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export function FiltersTab({ onClose }: FiltersTabProps) {
  const { 
    pharmacies, 
    setSelectedPharmacyIds, 
    setLastFilterType, 
    setSelectedFilter 
  } = usePharmacySelection();
  
  const [regions, setRegions] = useState<FilterOption[]>([]);
  const [revenueBrackets, setRevenueBrackets] = useState<FilterOption[]>([]);

  // Extraire les valeurs uniques pour les filtres au chargement
  useEffect(() => {
    // Pour les régions
    const uniqueRegions = new Map<string, number>();
    pharmacies.forEach(p => {
      if (p.area) {
        uniqueRegions.set(p.area, (uniqueRegions.get(p.area) || 0) + 1);
      }
    });
    
    const regionOptions: FilterOption[] = Array.from(uniqueRegions.entries())
      .map(([area, count]) => ({
        id: area,
        label: area,
        count: count
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    setRegions(regionOptions);
    
    // Pour les tranches de CA
    const revenueBrackets = new Map<string, { label: string, pharmacies: string[] }>();
    
    pharmacies.forEach(p => {
      if (p.ca) {
        let bracket: string;
        
        if (p.ca < 1000000) {
          bracket = "low";
        } else if (p.ca < 2000000) {
          bracket = "medium";
        } else if (p.ca < 3000000) {
          bracket = "high";
        } else {
          bracket = "vhigh";
        }
        
        if (!revenueBrackets.has(bracket)) {
          const labels: Record<string, string> = {
            low: "< 1M€",
            medium: "1M€ - 2M€",
            high: "2M€ - 3M€",
            vhigh: "> 3M€"
          };
          
          revenueBrackets.set(bracket, { 
            label: labels[bracket],
            pharmacies: []
          });
        }
        
        revenueBrackets.get(bracket)?.pharmacies.push(p.id);
      }
    });
    
    const revenueOptions: FilterOption[] = Array.from(revenueBrackets.entries())
      .map(([id, { label, pharmacies }]) => ({
        id,
        label,
        count: pharmacies.length
      }))
      .sort((a, b) => {
        const order = { low: 0, medium: 1, high: 2, vhigh: 3 };
        return order[a.id as keyof typeof order] - order[b.id as keyof typeof order];
      });
    
    setRevenueBrackets(revenueOptions);
  }, [pharmacies]);

  // Appliquer un filtre de région
  const applyRegionFilter = (region: string) => {
    const pharmaciesInRegion = pharmacies
      .filter(p => p.area === region)
      .map(p => p.id);
      
    setSelectedPharmacyIds(pharmaciesInRegion);
    setLastFilterType('region');
    setSelectedFilter(region);
    onClose();
  };
  
  // Appliquer un filtre de CA
  const applyRevenueFilter = (revenueId: string) => {
    let caMin = 0;
    let caMax = Number.MAX_SAFE_INTEGER;
    
    if (revenueId === 'low') {
      caMax = 999999;
    } else if (revenueId === 'medium') {
      caMin = 1000000;
      caMax = 1999999;
    } else if (revenueId === 'high') {
      caMin = 2000000;
      caMax = 2999999;
    } else if (revenueId === 'vhigh') {
      caMin = 3000000;
    }
    
    const pharmaciesInRange = pharmacies
      .filter(p => p.ca && p.ca >= caMin && p.ca <= caMax)
      .map(p => p.id);
      
    setSelectedPharmacyIds(pharmaciesInRange);
    setLastFilterType('revenue');
    
    // Trouver le label correspondant
    const option = revenueBrackets.find(o => o.id === revenueId);
    setSelectedFilter(option?.label || revenueId);
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
        <div className="mb-6">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FiMap className="mr-2 text-teal-500 dark:text-teal-400" size={16} />
            Régions
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {regions.map(region => (
              <button
                key={region.id}
                onClick={() => applyRegionFilter(region.id)}
                className="flex items-center justify-between p-2 rounded-lg text-left text-sm border border-gray-200 dark:border-gray-700 hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-700 transition-colors"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300 truncate">{region.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {region.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Filtres par CA */}
      {revenueBrackets.length > 0 && (
        <div className="mb-4">
          <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            <FiDollarSign className="mr-2 text-emerald-500 dark:text-emerald-400" size={16} />
            Chiffre d'affaires
          </h4>
          <div className="space-y-2">
            {revenueBrackets.map(bracket => (
              <button
                key={bracket.id}
                onClick={() => applyRevenueFilter(bracket.id)}
                className="flex items-center justify-between w-full p-2 rounded-lg text-left text-sm border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700 transition-colors"
              >
                <div className="font-medium text-gray-700 dark:text-gray-300">{bracket.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                  {bracket.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      
      {regions.length === 0 && revenueBrackets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun filtre disponible</p>
          <p className="text-sm mt-1">Les données des pharmacies ne contiennent pas d'informations filtrables</p>
        </div>
      )}
    </div>
  );
}