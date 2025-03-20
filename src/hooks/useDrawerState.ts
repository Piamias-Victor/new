// src/hooks/useDrawerState.ts
import { useState } from 'react';

/**
 * Hook personnalisé pour gérer l'état d'ouverture/fermeture du drawer
 * @returns Un objet contenant l'état du drawer et les méthodes pour le manipuler
 */
export function useDrawerState() {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = () => {
    setIsOpen(true);
    // Bloquer le défilement du body lorsque le drawer est ouvert
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeDrawer = () => {
    setIsOpen(false);
    // Rétablir le défilement du body lorsque le drawer est fermé
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
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
    openDrawer,
    closeDrawer,
    toggleDrawer
  };
}