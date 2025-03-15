// src/contexts/PharmacyContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// Types pour les pharmacies
export interface Pharmacy {
  id: string;
  name: string;
  area?: string;
  ca?: number;
  employees_count?: number;
}

// Valeur spéciale pour "toutes les pharmacies"
export const ALL_PHARMACIES_VALUE = 'all';

// Interface pour le contexte
interface PharmacyContextType {
  // Liste complète des pharmacies
  pharmacies: Pharmacy[];
  isLoading: boolean;
  error: string | null;
  
  // Sélection de pharmacies
  selectedPharmacyId: string;
  selectedPharmacy: Pharmacy | null;
  selectedPharmacyIds: string[]; // Pour la sélection multiple
  
  // Méthodes
  setSelectedPharmacyId: (id: string) => void;
  setSelectedPharmacyIds: (ids: string[]) => void;
  refreshPharmacies: () => Promise<void>;
  
  // Pour le filtrage
  lastFilterType: 'none' | 'region' | 'revenue' | 'size';
  selectedFilter: string | null;
  setLastFilterType: (type: 'none' | 'region' | 'revenue' | 'size') => void;
  setSelectedFilter: (filter: string | null) => void;
}

// Valeurs par défaut du contexte
const defaultContext: PharmacyContextType = {
  pharmacies: [],
  isLoading: false,
  error: null,
  
  selectedPharmacyId: ALL_PHARMACIES_VALUE,
  selectedPharmacy: null,
  selectedPharmacyIds: [], // Sera initialisé avec toutes les pharmacies
  
  setSelectedPharmacyId: () => {},
  setSelectedPharmacyIds: () => {},
  refreshPharmacies: async () => {},
  
  lastFilterType: 'none',
  selectedFilter: null,
  setLastFilterType: () => {},
  setSelectedFilter: () => {},
};

// Création du contexte
const PharmacyContext = createContext<PharmacyContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const usePharmacy = () => useContext(PharmacyContext);

// Hook pour la sélection de pharmacies (compatible avec le nouveau sélecteur)
export const usePharmacySelection = () => {
  const context = useContext(PharmacyContext);
  return {
    pharmacies: context.pharmacies,
    selectedPharmacyIds: context.selectedPharmacyIds,
    setSelectedPharmacyIds: context.setSelectedPharmacyIds,
    lastFilterType: context.lastFilterType,
    selectedFilter: context.selectedFilter,
    setLastFilterType: context.setLastFilterType,
    setSelectedFilter: context.setSelectedFilter,
  };
};

// Le fournisseur de contexte
interface PharmacyProviderProps {
  children: ReactNode;
}

export function PharmacyProvider({ children }: PharmacyProviderProps) {
  // État pour les pharmacies
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour la sélection de pharmacies
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(ALL_PHARMACIES_VALUE);
  const [selectedPharmacyIds, setSelectedPharmacyIds] = useState<string[]>([]);
  
  // État pour le filtrage
  const [lastFilterType, setLastFilterType] = useState<'none' | 'region' | 'revenue' | 'size'>('none');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Calculer la pharmacie sélectionnée à partir de l'ID
  const selectedPharmacy = selectedPharmacyId === ALL_PHARMACIES_VALUE 
    ? null 
    : pharmacies.find(p => p.id === selectedPharmacyId) || null;

  // Fonction pour rafraîchir la liste des pharmacies
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
      
      // Initialiser la sélection avec toutes les pharmacies
      if (loadedPharmacies.length > 0 && selectedPharmacyIds.length === 0) {
        setSelectedPharmacyIds(loadedPharmacies.map(p => p.id));
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

  return (
    <PharmacyContext.Provider
      value={{
        pharmacies,
        isLoading,
        error,
        selectedPharmacyId,
        selectedPharmacy,
        selectedPharmacyIds,
        setSelectedPharmacyId,
        setSelectedPharmacyIds,
        refreshPharmacies,
        lastFilterType,
        selectedFilter,
        setLastFilterType,
        setSelectedFilter
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}