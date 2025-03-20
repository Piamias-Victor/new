// src/components/header/ProductSelectionButton.tsx
import React from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';

interface ProductSelectionButtonProps {
  openDrawer: () => void;
}

/**
 * Bouton pour ouvrir le drawer de sélection de produits
 * Remplace le "Bonjour Admin" dans le header
 */
export function ProductSelectionButton({ openDrawer }: ProductSelectionButtonProps) {
  return (
    <button
      onClick={openDrawer}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
    >
      <FiPackage className="text-sky-500 dark:text-sky-400" size={18} />
      <span className="font-medium">Sélection produits</span>
      <FiSearch className="text-gray-400" size={16} />
    </button>
  );
}