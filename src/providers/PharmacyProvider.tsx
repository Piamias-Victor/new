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
  refreshPharmacies: async () => {}
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
    
    // Également, lorsque la liste des pharmacies change, met à jour la sélection
    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

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
        refreshPharmacies
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}