// src/hooks/useFirstLoad.ts (Version affichage immédiat - corrigée)
import { useDataLoading } from '@/contexts/DataLoadingContext';

/**
 * Hook pour gérer l'état de première utilisation du dashboard
 * L'écran d'accueil disparaît DÈS le premier clic sur "Appliquer"
 */
export function useFirstLoad() {
  const { hasEverTriggered, isGlobalLoading } = useDataLoading();
  
  // 🔥 CORRECTION: L'écran d'accueil disparaît si :
  // - On a déjà cliqué une fois OU on est en train de charger
  const isFirstLoad = !hasEverTriggered && !isGlobalLoading;
  
  // Mais on veut que ça disparaisse dès le clic, donc :
  const shouldShowWelcome = !hasEverTriggered && !isGlobalLoading;
  
  console.log('🎯 useFirstLoad:', { 
    hasEverTriggered, 
    isGlobalLoading, 
    shouldShowWelcome 
  });
  
  return {
    isFirstLoad: shouldShowWelcome
  };
}