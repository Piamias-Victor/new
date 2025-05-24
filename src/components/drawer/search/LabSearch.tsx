// src/components/drawer/search/LabSearch.tsx (Version avec debug)
import React, { useState, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { LabSearchResults, Laboratory } from './LabSearchResults';
import { useLabSearch } from '@/hooks/useLabSearch';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

interface LabSearchProps {
  selectedLabs?: Laboratory[];
  onToggleLab?: (lab: Laboratory) => void;
}

/**
 * Composant de recherche par laboratoire
 */
export function LabSearch({ 
  selectedLabs = [], 
  onToggleLab = () => {} 
}: LabSearchProps) {
  console.log('🧪 LabSearch: Composant rendu');
  
  const [searchTerm, setSearchTerm] = useState('');
  const { results, isLoading, error, searchLabs, clearResults } = useLabSearch();
  
  // Récupération des pharmacyIds dans le composant
  const { selectedPharmacyIds } = usePharmacySelection();
  
  // Debug des pharmacyIds
  useEffect(() => {
    console.log('🧪 LabSearch: selectedPharmacyIds changé', { 
      count: selectedPharmacyIds.length,
      ids: selectedPharmacyIds.slice(0, 3) // Afficher seulement les 3 premiers
    });
  }, [selectedPharmacyIds]);
  
  // Debug du searchTerm
  useEffect(() => {
    console.log('🧪 LabSearch: searchTerm changé', searchTerm);
  }, [searchTerm]);
  
  // Debug des résultats
  useEffect(() => {
    console.log('🧪 LabSearch: Résultats changés', { 
      count: results.length,
      isLoading,
      error
    });
  }, [results, isLoading, error]);

  // Gérer la recherche
  const handleSearch = () => {
    console.log('🧪 LabSearch: handleSearch appelé', { 
      searchTerm, 
      termLength: searchTerm.trim().length,
      pharmacyIdsCount: selectedPharmacyIds.length 
    });
    
    if (searchTerm.trim().length >= 2) {
      console.log('🧪 LabSearch: Lancement de la recherche...');
      searchLabs(searchTerm, selectedPharmacyIds);
    } else {
      console.log('🧪 LabSearch: Terme trop court, pas de recherche');
    }
  };

  // Soumettre avec touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('🧪 LabSearch: Touche pressée', e.key);
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      console.log('🧪 LabSearch: Entrée pressée, lancement recherche');
      handleSearch();
    }
  };

  // Effacer la recherche
  const handleClear = () => {
    console.log('🧪 LabSearch: handleClear appelé');
    setSearchTerm('');
    clearResults();
  };
  
  // Debug du onChange
// Dans la fonction handleSearchTermChange
const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  console.log('🧪 LabSearch: Search term changing', { from: searchTerm, to: newValue });
  setSearchTerm(newValue);
  
  // 🔥 APPEL AUTOMATIQUE pour tester
  if (newValue.trim().length >= 2) {
    console.log('🧪 LabSearch: Auto-search triggered');
    searchLabs(newValue, selectedPharmacyIds);
  }
};

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        {/* Champ de recherche */}
        <SearchInput
          placeholder="Rechercher un laboratoire..."
          value={searchTerm}
          onChange={handleSearchTermChange}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Compteur de résultats */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {results.length} laboratoire(s) trouvé(s)
        </p>
        
        {/* 🔥 PANEL DE DEBUG TEMPORAIRE */}
        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div><strong>Debug LabSearch:</strong></div>
          <div>Term: "{searchTerm}" (length: {searchTerm.length})</div>
          <div>PharmacyIds: {selectedPharmacyIds.length}</div>
          <div>Results: {results.length}</div>
          <div>Loading: {isLoading ? 'OUI' : 'NON'}</div>
          <div>Error: {error || 'Aucune'}</div>
        </div>
      </div>

      {/* Affichage des résultats */}
      <div className="flex-1 overflow-y-auto">
        <LabSearchResults 
          results={results} 
          isLoading={isLoading} 
          error={error}
          selectedLabs={selectedLabs}
          onToggleLab={onToggleLab}
        />
      </div>
    </div>
  );
}