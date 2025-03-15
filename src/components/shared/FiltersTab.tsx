// src/components/shared/FiltersTab.tsx
import React, { useEffect, useState } from 'react';
import { FiInfo, FiMap, FiDollarSign, FiCheckCircle, FiX } from 'react-icons/fi';
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
    setTempSelectedPharmacyIds, 
    setTempLastFilterType, 
    setTempSelectedFilter,
  } = usePharmacySelection();
  
  const [regions, setRegions] = useState<FilterOption[]>([]);
  const [revenueBrackets, setRevenueBrackets] = useState<FilterOption[]>([]);
  
  // State pour suivre les filtres sélectionnés (plusieurs possibles)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedRevenues, setSelectedRevenues] = useState<string[]>([]);

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

  // Appliquer les filtres sélectionnés
  useEffect(() => {
    // Si aucun filtre sélectionné, ne rien faire
    if (selectedRegions.length === 0 && selectedRevenues.length === 0) {
      return;
    }

    // Collecter toutes les pharmacies correspondant aux filtres
    let filteredIds: string[] = [];
    
    // Ajouter les pharmacies par région
    if (selectedRegions.length > 0) {
      const regionPharmacies = pharmacies
        .filter(p => p.area && selectedRegions.includes(p.area))
        .map(p => p.id);
      
      filteredIds = [...regionPharmacies];
    }
    
    // Ajouter les pharmacies par CA
    if (selectedRevenues.length > 0) {
      const revenuePharmacies: string[] = [];
      
      pharmacies.forEach(p => {
        if (!p.ca) return;
        
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
        
        if (selectedRevenues.includes(bracket)) {
          revenuePharmacies.push(p.id);
        }
      });
      
      // Si nous avons déjà des pharmacies par région, faire l'intersection
      if (filteredIds.length > 0 && selectedRegions.length > 0) {
        filteredIds = filteredIds.filter(id => revenuePharmacies.includes(id));
      } else {
        filteredIds = [...revenuePharmacies];
      }
    }
    
    // Mettre à jour les pharmacies temporairement sélectionnées
    setTempSelectedPharmacyIds(filteredIds);
    
    // Mettre à jour le type de filtre et le libellé temporaires
    if (selectedRegions.length > 0 && selectedRevenues.length > 0) {
      setTempLastFilterType('region');
      const regionLabels = selectedRegions.join(', ');
      const revenueLabels = selectedRevenues.map(id => {
        const bracket = revenueBrackets.find(b => b.id === id);
        return bracket ? bracket.label : id;
      }).join(', ');
      setTempSelectedFilter(`${regionLabels} + ${revenueLabels}`);
    } else if (selectedRegions.length > 0) {
      setTempLastFilterType('region');
      setTempSelectedFilter(selectedRegions.join(', '));
    } else if (selectedRevenues.length > 0) {
      setTempLastFilterType('revenue');
      const labels = selectedRevenues.map(id => {
        const bracket = revenueBrackets.find(b => b.id === id);
        return bracket ? bracket.label : id;
      }).join(', ');
      setTempSelectedFilter(labels);
    }
    
  }, [selectedRegions, selectedRevenues, pharmacies, setTempSelectedPharmacyIds, setTempLastFilterType, setTempSelectedFilter, revenueBrackets]);

  // Toggle la sélection d'une région
  const toggleRegionFilter = (region: string) => {
    setSelectedRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };
  
  // Toggle la sélection d'une tranche de CA
  const toggleRevenueFilter = (revenueId: string) => {
    setSelectedRevenues(prev => {
      if (prev.includes(revenueId)) {
        return prev.filter(r => r !== revenueId);
      } else {
        return [...prev, revenueId];
      }
    });
  };

  return (
    <div className="p-3">
      {/* Info explicative */}
      <div className="mb-4 bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg">
        <div className="flex items-start">
          <FiInfo className="text-teal-500 dark:text-teal-400 mt-0.5 mr-2 flex-shrink-0" size={16} />
          <p className="text-xs text-teal-700 dark:text-teal-300">
            Sélectionnez un ou plusieurs filtres pour afficher un groupe de pharmacies ayant des caractéristiques communes.
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
                onClick={() => toggleRegionFilter(region.id)}
                className={`flex items-center justify-between p-2 rounded-lg text-left text-sm border
                  ${selectedRegions.includes(region.id) 
                    ? 'bg-teal-50 border-teal-300 dark:bg-teal-900/30 dark:border-teal-700' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-teal-50 hover:border-teal-200 dark:hover:bg-teal-900/20 dark:hover:border-teal-700'
                  } transition-colors`}
              >
                <div className="font-medium text-gray-700 dark:text-gray-300 truncate">{region.label}</div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {region.count}
                  </div>
                  {selectedRegions.includes(region.id) && (
                    <div className="ml-2 h-4 w-4 bg-teal-500 dark:bg-teal-400 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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
                onClick={() => toggleRevenueFilter(bracket.id)}
                className={`flex items-center justify-between w-full p-2 rounded-lg text-left text-sm border
                  ${selectedRevenues.includes(bracket.id) 
                    ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/30 dark:border-emerald-700' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-emerald-50 hover:border-emerald-200 dark:hover:bg-emerald-900/20 dark:hover:border-emerald-700'
                  } transition-colors`}
              >
                <div className="font-medium text-gray-700 dark:text-gray-300">{bracket.label}</div>
                <div className="flex items-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
                    {bracket.count}
                  </div>
                  {selectedRevenues.includes(bracket.id) && (
                    <div className="ml-2 h-4 w-4 bg-emerald-500 dark:bg-emerald-400 rounded-full flex items-center justify-center">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
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