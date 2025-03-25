// src/components/shared/PharmacySelector.tsx
'use client';

import { usePharmacySelection } from '@/providers/PharmacyProvider';
import React, { useState, useRef, useEffect } from 'react';
import { FiHome, FiChevronDown, FiChevronUp, FiMap, FiMaximize } from 'react-icons/fi';
import { PharmacyDropdownMenu } from './PharmacyDropdownMenu';
import { MdEuro } from "react-icons/md";

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
    // Si la liste des pharmacies est vide (données pas encore chargées)
    if (pharmacies.length === 0) {
      return 'Chargement...';
    }
    
    // Si aucune pharmacie n'est sélectionnée
    if (selectedPharmacyIds.length === 0) {
      return 'Aucune pharmacie';
    } 
    
    // Si toutes les pharmacies sont sélectionnées
    if (selectedPharmacyIds.length === pharmacies.length) {
      return 'Toutes les pharmacies';
    } 
    
    // Si une seule pharmacie est sélectionnée
    if (selectedPharmacyIds.length === 1) {
      const selected = pharmacies.find(p => p.id === selectedPharmacyIds[0]);
      return selected ? selected.name : 'Une pharmacie';
    } 
    
    // Si plusieurs pharmacies sont sélectionnées avec un filtre
    if (lastFilterType !== 'none' && selectedFilter) {
      switch (lastFilterType) {
        case 'region': return `${selectedPharmacyIds.length} pharmacies · ${selectedFilter}`;
        case 'revenue': return `${selectedPharmacyIds.length} pharmacies · CA: ${selectedFilter}`;
        case 'size': return `${selectedPharmacyIds.length} pharmacies · ${selectedFilter}`;
        default: return `${selectedPharmacyIds.length} pharmacies`;
      }
    }
    
    // Par défaut, si plusieurs pharmacies sont sélectionnées sans filtre
    return `${selectedPharmacyIds.length} pharmacies`;
  };

  // Obtenir l'icône en fonction du type de filtre actif
  const getFilterIcon = () => {
    switch (lastFilterType) {
      case 'region': return <FiMap className="mr-2 text-teal-600" size={16} />;
      case 'revenue': return <MdEuro className="mr-2 text-teal-600" size={16} />;
      case 'size': return <FiMaximize className="mr-2 text-teal-600" size={16} />;
      default: return <FiHome className="mr-2 text-teal-600" size={16} />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center h-10 pl-4 pr-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:border-teal-300 dark:hover:border-teal-600 transition-colors duration-150 group bg-white dark:bg-gray-800"
      >
        <div className="flex items-center min-w-0 flex-1">
          {getFilterIcon()}
          <span className={`truncate text-sm font-medium ${lastFilterType !== 'none' ? "text-teal-600 dark:text-teal-400" : "text-gray-700 dark:text-gray-300"}`}>
            {getDisplayText()}
          </span>
        </div>
        <div className="flex-shrink-0 ml-2 text-gray-400 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors duration-150">
          {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-150 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <PharmacyDropdownMenu onClose={() => setIsOpen(false)} />
        </div>
      )}
    </div>
  );
}