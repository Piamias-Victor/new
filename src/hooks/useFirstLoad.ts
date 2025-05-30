// src/hooks/useFirstLoad.ts (Version simplifiée)
import { useDataLoading } from '@/contexts/DataLoadingContext';

/**
 * Hook pour gérer l'état de première utilisation du dashboard
 * Retourne true tant que l'utilisateur n'a pas cliqué sur "Appliquer" au moins une fois
 */
export function useFirstLoad() {
  const { hasEverTriggered } = useDataLoading();
  
  // Simple : on affiche l'écran d'accueil tant qu'on n'a jamais cliqué sur Appliquer
  const isFirstLoad = !hasEverTriggered;
  
  console.log('🎯 useFirstLoad:', { hasEverTriggered, isFirstLoad });
  
  return {
    isFirstLoad
  };
}