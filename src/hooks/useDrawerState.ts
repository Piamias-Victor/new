// src/hooks/useDrawerState.ts
import { useState, useRef } from 'react';

/**
 * Hook personnalisé pour gérer l'état d'ouverture/fermeture du drawer
 * avec animation de fermeture
 * @returns Un objet contenant l'état du drawer et les méthodes pour le manipuler
 */
export function useDrawerState() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const openDrawer = () => {
    // Annuler toute animation de fermeture en cours
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsClosing(false);
    setIsOpen(true);
    // Bloquer le défilement du body lorsque le drawer est ouvert
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    // Démarrer l'animation de fermeture
    setIsClosing(true);
    
    // Attendre que l'animation se termine avant de fermer complètement
    timerRef.current = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      // Rétablir le défilement du body
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    }, 300); // Durée correspondant à la durée de l'animation CSS
  };

  const toggleDrawer = () => {
    if (isOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  return {
    isOpen,
    isClosing,
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
}