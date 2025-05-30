// src/hooks/useFirstLoad.ts (Version ULTRA SIMPLE)
import { useDataLoading } from '@/contexts/DataLoadingContext';

/**
 * Hook pour gérer l'état de première utilisation du dashboard
 * RÈGLE: Une fois qu'on a cliqué sur "Appliquer", on ne revient JAMAIS à l'écran d'accueil
 */
export function useFirstLoad() {
  const { hasEverTriggered } = useDataLoading();
  
  // 🔥 ULTRA SIMPLE: Si on a déjà cliqué une fois, JAMAIS d'écran d'accueil
  const isFirstLoad = !hasEverTriggered;
  
  console.log('🎯 useFirstLoad SIMPLE:', { 
    hasEverTriggered, 
    isFirstLoad 
  });
  
  return {
    isFirstLoad
  };
}