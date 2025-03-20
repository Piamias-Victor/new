import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { SegmentSearchResults, Segment } from './SegmentSearchResults';
import { useSegmentSearch } from '@/hooks/useSegmentSearch';

interface SegmentSearchProps {
  selectedSegments?: Segment[];
  onToggleSegment?: (segment: Segment) => void;
}

export function SegmentSearch({ 
  selectedSegments = [], 
  onToggleSegment = () => {} 
}: SegmentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { results, isLoading, error, searchSegments, clearResults } = useSegmentSearch();

  console.log('Résultats de recherche de segments:', { results, isLoading, error });

  // Gérer la recherche
  const handleSearch = () => {
    console.log('Déclenchement de la recherche de segments');
    if (searchTerm.trim().length >= 2) {
      searchSegments(searchTerm);
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
          placeholder="Rechercher un segment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Compteur de résultats */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {results.length} segment(s) trouvé(s)
        </p>
      </div>

      {/* Affichage des résultats */}
      <div className="flex-1 overflow-y-auto">
        <SegmentSearchResults 
          results={results} 
          isLoading={isLoading} 
          error={error}
          selectedSegments={selectedSegments}
          onToggleSegment={onToggleSegment}
        />
      </div>
    </div>
  );
}