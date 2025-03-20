import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { LabSearchResults, Laboratory } from './LabSearchResults';
import { useLabSearch } from '@/hooks/useLabSearch';

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
  const [searchTerm, setSearchTerm] = useState('');
  const { results, isLoading, error, searchLabs, clearResults } = useLabSearch();

  // Gérer la recherche
  const handleSearch = () => {
    if (searchTerm.trim().length >= 2) {
      searchLabs(searchTerm);
    }
  };

  // Soumettre avec touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      handleSearch();
    }
  };

  // Effacer la recherche
  const handleClear = () => {
    setSearchTerm('');
    clearResults();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        {/* Champ de recherche */}
        <SearchInput
          placeholder="Rechercher un laboratoire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Compteur de résultats */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {results.length} laboratoire(s) trouvé(s)
        </p>
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