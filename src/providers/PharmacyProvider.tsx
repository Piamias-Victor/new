// src/providers/PharmacyProvider.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Types pour les données de pharmacie
export interface Pharmacy {
  id: string;
  name: string;
  area?: string;
  ca?: number;
  employees_count?: number;
  region?: string;
  revenue?: string;
  size?: string;
}

// Types pour les filtres
export type FilterType = 'none' | 'region' | 'revenue' | 'size';

// Interface pour le contexte
interface PharmacyContextProps {
  pharmacies: Pharmacy[];
  isLoading: boolean;
  error: string | null;
  selectedPharmacyIds: string[];
  setSelectedPharmacyIds: (ids: string[]) => void;
  lastFilterType: FilterType;
  selectedFilter: string | null;
  setLastFilterType: (type: FilterType) => void;
  setSelectedFilter: (filter: string | null) => void;
  refreshPharmacies: () => Promise<void>;
  
  // Valeurs temporaires avant validation
  tempSelectedPharmacyIds: string[];
  setTempSelectedPharmacyIds: (ids: string[]) => void;
  tempLastFilterType: FilterType;
  tempSelectedFilter: string | null;
  setTempLastFilterType: (type: FilterType) => void;
  setTempSelectedFilter: (filter: string | null) => void;
  
  // Méthode pour appliquer les changements
  applyPharmacyChanges: () => void;
}

// Valeur spéciale pour "toutes les pharmacies"
export const ALL_PHARMACIES_VALUE = 'all';

// Création du contexte
const PharmacyContext = createContext<PharmacyContextProps>({
  pharmacies: [],
  isLoading: false,
  error: null,
  selectedPharmacyIds: [],
  setSelectedPharmacyIds: () => {},
  lastFilterType: 'none',
  selectedFilter: null,
  setLastFilterType: () => {},
  setSelectedFilter: () => {},
  refreshPharmacies: async () => {},
  
  tempSelectedPharmacyIds: [],
  setTempSelectedPharmacyIds: () => {},
  tempLastFilterType: 'none',
  tempSelectedFilter: null,
  setTempLastFilterType: () => {},
  setTempSelectedFilter: () => {},
  applyPharmacyChanges: () => {}
});

// Hook personnalisé
export const usePharmacySelection = () => useContext(PharmacyContext);

// Provider
interface PharmacyProviderProps {
  children: ReactNode;
}

export function PharmacyProvider({ children }: PharmacyProviderProps) {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPharmacyIds, setSelectedPharmacyIds] = useState<string[]>([]);
  const [lastFilterType, setLastFilterType] = useState<FilterType>('none');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Nouveaux états pour les valeurs temporaires
  const [tempSelectedPharmacyIds, setTempSelectedPharmacyIds] = useState<string[]>([]);
  const [tempLastFilterType, setTempLastFilterType] = useState<FilterType>('none');
  const [tempSelectedFilter, setTempSelectedFilter] = useState<string | null>(null);

  // Fonction pour appliquer les changements temporaires
  const applyPharmacyChanges = () => {
    setSelectedPharmacyIds(tempSelectedPharmacyIds);
    setLastFilterType(tempLastFilterType);
    setSelectedFilter(tempSelectedFilter);
  };

  const refreshPharmacies = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/pharmacies');
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      const loadedPharmacies = data.pharmacies || [];
      setPharmacies(loadedPharmacies);
      
      // Toujours initialiser avec toutes les pharmacies si des données sont chargées
      if (loadedPharmacies.length > 0) {
        // Utiliser les IDs des pharmacies chargées
        const allPharmacyIds = loadedPharmacies.map(p => p.id);
        
        // Ne mettre à jour que si la sélection est vide ou différente
        if (selectedPharmacyIds.length === 0 || 
            selectedPharmacyIds.length !== allPharmacyIds.length ||
            !allPharmacyIds.every(id => selectedPharmacyIds.includes(id))) {
          setSelectedPharmacyIds(allPharmacyIds);
          setTempSelectedPharmacyIds(allPharmacyIds);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des pharmacies:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les pharmacies au montage du composant
  useEffect(() => {
    refreshPharmacies();
  }, []);
  
  // Initialiser les valeurs temporaires lorsque les valeurs réelles changent
  useEffect(() => {
    setTempSelectedPharmacyIds(selectedPharmacyIds);
    setTempLastFilterType(lastFilterType);
    setTempSelectedFilter(selectedFilter);
  }, [selectedPharmacyIds, lastFilterType, selectedFilter]);

  return (
    <PharmacyContext.Provider
      value={{
        pharmacies,
        isLoading,
        error,
        selectedPharmacyIds,
        setSelectedPharmacyIds,
        lastFilterType,
        selectedFilter,
        setLastFilterType,
        setSelectedFilter,
        refreshPharmacies,
        
        tempSelectedPharmacyIds,
        setTempSelectedPharmacyIds,
        tempLastFilterType,
        tempSelectedFilter,
        setTempLastFilterType,
        setTempSelectedFilter,
        applyPharmacyChanges
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}