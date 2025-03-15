// src/components/shared/PharmacySelector.tsx
'use client';

import { usePharmacySelection } from '@/providers/PharmacyProvider';
import React, { useState, useRef, useEffect } from 'react';
import { FiHome, FiChevronDown, FiChevronUp, FiMap, FiDollarSign, FiMaximize } from 'react-icons/fi';
import { PharmacyDropdownMenu } from './PharmacyDropdownMenu';

export function PharmacySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    pharmacies,
    selectedPharmacyIds, 
    lastFilterType, 
    selectedFilter 
  } = usePharmacySelection();

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Formater le texte d'affichage du bouton
  const getDisplayText = () => {
    if (selectedPharmacyIds.length === 0) {
      return 'Aucune pharmacie';
    } else if (selectedPharmacyIds.length === pharmacies.length) {
      return 'Toutes les pharmacies';
    } else if (selectedPharmacyIds.length === 1) {
      const selected = pharmacies.find(p => p.id === selectedPharmacyIds[0]);
      return selected ? selected.name : 'Une pharmacie';
    } else {
      // Afficher un texte basé sur le filtre si disponible
      if (lastFilterType !== 'none' && selectedFilter) {
        switch (lastFilterType) {
          case 'region': return `${selectedPharmacyIds.length} pharmacies · ${selectedFilter}`;
          case 'revenue': return `${selectedPharmacyIds.length} pharmacies · CA: ${selectedFilter}`;
          case 'size': return `${selectedPharmacyIds.length} pharmacies · ${selectedFilter}`;
        }
      }
      return `${selectedPharmacyIds.length} pharmacies`;
    }
  };

  // Obtenir l'icône en fonction du type de filtre actif
  const getFilterIcon = () => {
    switch (lastFilterType) {
      case 'region': return <FiMap className="mr-2" size={16} />;
      case 'revenue': return <FiDollarSign className="mr-2" size={16} />;
      case 'size': return <FiMaximize className="mr-2" size={16} />;
      default: return <FiHome className="mr-2" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-3 py-2 w-56 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
      >
        <div className="flex items-center min-w-0 flex-1">
          {getFilterIcon()}
          <span className={`truncate ${lastFilterType !== 'none' ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"}`}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-150 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <PharmacyDropdownMenu onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}