// src/providers/PharmacyProvider.tsx
'use client';

import { useSession } from 'next-auth/react';
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
  const { data: session } = useSession();
  
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

  useEffect(() => {
    refreshPharmacies();
  }, []);

  // Surveiller les changements de session pour mettre à jour la sélection si nécessaire
  useEffect(() => {
    // Si la session est chargée et que l'utilisateur est de type pharmacy_user
    if (session?.user?.role === 'pharmacy_user' && session?.user?.pharmacyId) {
      // Si la sélection actuelle ne correspond pas à sa pharmacie, mettre à jour
      if (selectedPharmacyIds.length !== 1 || selectedPharmacyIds[0] !== session.user.pharmacyId) {
        setSelectedPharmacyIds([session.user.pharmacyId]);
        setTempSelectedPharmacyIds([session.user.pharmacyId]);
      }
    }
  }, [session, selectedPharmacyIds]);

  // Ajoute ces logs temporaires dans ton PharmacyProvider existant
// (Juste ajouter les console.log, pas remplacer tout le fichier)

// Dans la fonction refreshPharmacies, ajoute ces logs :
const refreshPharmacies = async () => {
  console.log('🏥 PharmacyProvider: refreshPharmacies démarré');
  setIsLoading(true);
  setError(null);
  
  try {
    console.log('🏥 PharmacyProvider: Appel API /api/pharmacies');
    const response = await fetch('/api/pharmacies');
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const loadedPharmacies = data.pharmacies || [];
    
    console.log('🏥 PharmacyProvider: Pharmacies chargées', { 
      count: loadedPharmacies.length,
      first: loadedPharmacies[0]?.name || 'Aucune'
    });
    
    setPharmacies(loadedPharmacies);
    
    // Vérifier la session actuelle
    const currentSession = session;
    const isPharmacyUser = currentSession?.user?.role === 'pharmacy_user' && currentSession?.user?.pharmacyId;
    
    console.log('🏥 PharmacyProvider: Session info', { 
      userRole: currentSession?.user?.role,
      pharmacyId: currentSession?.user?.pharmacyId,
      isPharmacyUser 
    });
    
    if (isPharmacyUser) {
      // Si c'est un utilisateur de pharmacie, sélectionner sa pharmacie
      const pharmacyId = currentSession.user.pharmacyId as string;
      console.log('🏥 PharmacyProvider: Sélection pharmacie utilisateur', pharmacyId);
      setSelectedPharmacyIds([pharmacyId]);
      setTempSelectedPharmacyIds([pharmacyId]);
    } else {
      // Pour les admins ou si pas de session, sélectionner toutes les pharmacies
      const allPharmacyIds = loadedPharmacies.map(p => p.id);
      console.log('🏥 PharmacyProvider: Sélection toutes pharmacies', { count: allPharmacyIds.length });
      setSelectedPharmacyIds(allPharmacyIds);
      setTempSelectedPharmacyIds(allPharmacyIds);
    }
  } catch (err) {
    console.error('❌ PharmacyProvider: Erreur chargement pharmacies:', err);
    setError(err instanceof Error ? err.message : 'Erreur inconnue');
  } finally {
    console.log('🏥 PharmacyProvider: refreshPharmacies terminé');
    setIsLoading(false);
  }
};

// Dans le useEffect qui surveille les changements de selectedPharmacyIds :
useEffect(() => {
  console.log('🏥 PharmacyProvider: selectedPharmacyIds changé', { 
    count: selectedPharmacyIds.length,
    ids: selectedPharmacyIds.slice(0, 3)
  });
}, [selectedPharmacyIds]);

// Dans le useEffect du chargement initial :
useEffect(() => {
  console.log('🏥 PharmacyProvider: useEffect initial déclenché');
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