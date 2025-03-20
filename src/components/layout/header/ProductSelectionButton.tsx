// src/components/layout/header/ProductSelectionButton.tsx
import React from 'react';
import { FiSearch, FiPackage } from 'react-icons/fi';

interface ProductSelectionButtonProps {
  openDrawer: () => void;
}

/**
 * Bouton pour ouvrir le drawer de sélection de produits
 * Harmonisé avec les autres boutons du header
 */
export function ProductSelectionButton({ openDrawer }: ProductSelectionButtonProps) {
  return (
    <button
      onClick={openDrawer}
      className="flex items-center h-10 pl-4 pr-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:border-purple-300 dark:hover:border-purple-600 transition-colors duration-150 group bg-white dark:bg-gray-800"
    >
      <div className="flex items-center space-x-2">
        <span className="text-purple-500 dark:text-purple-400">
          <FiPackage size={18} />
        </span>
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          Sélection produits
        </span>
      </div>
      <div className="ml-2 text-gray-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-150">
        <FiSearch size={16} />
      </div>
    </button>
  );
}