// src/contexts/DataLoadingContext.tsx
'use client';

import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface DataLoadingContextType {
  // État principal
  isReadyToLoad: boolean;
  isGlobalLoading: boolean;
  
  // 🔥 NOUVEL ÉTAT : Premier déclenchement
  hasEverTriggered: boolean;
  
  // Méthodes de contrôle
  triggerDataLoad: () => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Gestion des requêtes
  abortController: AbortController | null;
  createAbortSignal: () => AbortSignal;
  cancelAllRequests: () => void;
  
  // Compteurs pour le feedback UX
  activeRequestsCount: number;
  incrementActiveRequests: () => void;
  decrementActiveRequests: () => void;
}

const DataLoadingContext = createContext<DataLoadingContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte
export function useDataLoading() {
  const context = useContext(DataLoadingContext);
  if (!context) {
    throw new Error('useDataLoading doit être utilisé dans un DataLoadingProvider');
  }
  return context;
}

// Provider du contexte
interface DataLoadingProviderProps {
  children: ReactNode;
}

export function DataLoadingProvider({ children }: DataLoadingProviderProps) {
  // État principal
  const [isReadyToLoad, setIsReadyToLoad] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [activeRequestsCount, setActiveRequestsCount] = useState(0);
  
  // 🔥 NOUVEL ÉTAT : A-t-on déjà cliqué sur Appliquer au moins une fois ?
  const [hasEverTriggered, setHasEverTriggered] = useState(false);
  
  // Référence pour l'AbortController
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Déclencher le chargement des données
  const triggerDataLoad = () => {
    console.log('🚀 DataLoading: Déclenchement du chargement des données');
    
    // Si déjà en cours de chargement, on force l'annulation et on relance
    if (isGlobalLoading) {
      console.log('🔄 DataLoading: Annulation du chargement en cours et relance');
    }
    
    // Annuler les requêtes précédentes si elles existent
    cancelAllRequests();
    
    // Créer un nouveau controller pour cette session de chargement
    abortControllerRef.current = new AbortController();
    
    // 🔥 MARQUER qu'on a déclenché AVANT de démarrer le chargement
    setHasEverTriggered(true);
    
    // Activer le chargement
    setIsReadyToLoad(true);
    setIsGlobalLoading(true);
    setActiveRequestsCount(0);
    
    // Debug: remettre isReadyToLoad à false après un délai pour éviter les re-déclenchements
    setTimeout(() => {
      setIsReadyToLoad(false);
    }, 100);
  };
  
  // Annuler toutes les requêtes en cours
  const cancelAllRequests = () => {
    if (abortControllerRef.current) {
      console.log('❌ DataLoading: Annulation des requêtes en cours');
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setActiveRequestsCount(0);
    setIsGlobalLoading(false);
  };
  
  // Créer un signal d'abort pour une nouvelle requête
  const createAbortSignal = (): AbortSignal => {
    if (!abortControllerRef.current) {
      abortControllerRef.current = new AbortController();
    }
    return abortControllerRef.current.signal;
  };
  
  // Incrémenter le compteur de requêtes actives
  const incrementActiveRequests = () => {
    setActiveRequestsCount(prev => {
      const newCount = prev + 1;
      console.log(`📈 DataLoading: Requêtes actives: ${newCount}`);
      return newCount;
    });
  };
  
  // Décrémenter le compteur de requêtes actives
  const decrementActiveRequests = () => {
    setActiveRequestsCount(prev => {
      const newCount = Math.max(0, prev - 1);
      console.log(`📉 DataLoading: Requêtes actives: ${newCount}`);
      
      // Si plus aucune requête active, arrêter le loading global
      if (newCount === 0) {
        console.log('✅ DataLoading: Toutes les requêtes terminées');
        setTimeout(() => setIsGlobalLoading(false), 100);
      }
      
      return newCount;
    });
  };
  
  // Valeur du contexte
  const value: DataLoadingContextType = {
    isReadyToLoad,
    isGlobalLoading,
    hasEverTriggered, // 🔥 AJOUT MANQUANT !
    triggerDataLoad,
    setGlobalLoading: setIsGlobalLoading,
    abortController: abortControllerRef.current,
    createAbortSignal,
    cancelAllRequests,
    activeRequestsCount,
    incrementActiveRequests,
    decrementActiveRequests
  };
  
  return (
    <DataLoadingContext.Provider value={value}>
      {children}
    </DataLoadingContext.Provider>
  );
}