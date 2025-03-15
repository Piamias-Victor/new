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
  
  // Pharmacie sélectionnée
  selectedPharmacyId: string;
  selectedPharmacy: Pharmacy | null;
  
  // Méthodes
  setSelectedPharmacyId: (id: string) => void;
  refreshPharmacies: () => Promise<void>;
}

// Valeurs par défaut du contexte
const defaultContext: PharmacyContextType = {
  pharmacies: [],
  isLoading: false,
  error: null,
  
  selectedPharmacyId: ALL_PHARMACIES_VALUE,
  selectedPharmacy: null,
  
  setSelectedPharmacyId: () => {},
  refreshPharmacies: async () => {}
};

// Création du contexte
const PharmacyContext = createContext<PharmacyContextType>(defaultContext);

// Hook personnalisé pour utiliser le contexte
export const usePharmacy = () => useContext(PharmacyContext);

// Le fournisseur de contexte
interface PharmacyProviderProps {
  children: ReactNode;
}

export function PharmacyProvider({ children }: PharmacyProviderProps) {
  // État pour les pharmacies
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // État pour la pharmacie sélectionnée
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>(ALL_PHARMACIES_VALUE);

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
      setPharmacies(data.pharmacies || []);
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
        setSelectedPharmacyId,
        refreshPharmacies
      }}
    >
      {children}
    </PharmacyContext.Provider>
  );
}