// src/components/drawer/search/SegmentSearch.tsx
import React, { useState } from 'react';
import { SearchInput } from './SearchInput';
import { SegmentSearchResults, Segment } from './SegmentSearchResults';
import { useSegmentSearch } from '@/hooks/useSegmentSearch';
import { FiLayers, FiFolder } from 'react-icons/fi';

interface SegmentSearchProps {
  selectedSegments?: Segment[];
  onToggleSegment?: (segment: Segment) => void;
}

type SearchMode = 'categories' | 'families';

export function SegmentSearch({ 
  selectedSegments = [], 
  onToggleSegment = () => {} 
}: SegmentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('categories');
  const { results, isLoading, error, searchSegments, clearResults } = useSegmentSearch();

  // Filtrer les résultats selon le mode de recherche actif
  const filteredResults = results.filter(segment => {
    if (searchMode === 'categories') {
      // Mode catégories: Afficher univers, catégories et sous-catégories
      return segment.segmentType === 'universe' || 
             segment.segmentType === 'category' || 
             segment.segmentType === 'subcategory';
    } else {
      // Mode familles: Afficher familles et sous-familles
      return segment.segmentType === 'family' || 
             segment.segmentType === 'subfamily';
    }
  });

  // Gérer la recherche
  const handleSearch = () => {
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
      {/* Choix du mode de recherche */}
      <div className="mb-4">
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex">
          <button
            onClick={() => setSearchMode('categories')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
              searchMode === 'categories' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiLayers size={16} />
            <span>Univers & Catégories</span>
          </button>
          <button
            onClick={() => setSearchMode('families')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium flex items-center justify-center gap-2 ${
              searchMode === 'families' 
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiFolder size={16} />
            <span>Familles & Sous-familles</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-4">
        {/* Champ de recherche */}
        <SearchInput
          placeholder={searchMode === 'categories' 
            ? "Rechercher un univers ou une catégorie..." 
            : "Rechercher une famille ou sous-famille..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />

        {/* Compteur de résultats */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {filteredResults.length} élément(s) trouvé(s)
        </p>
      </div>

      {/* Affichage des résultats filtrés selon le mode */}
      <div className="flex-1 overflow-y-auto">
        <SegmentSearchResults 
          results={filteredResults} 
          isLoading={isLoading} 
          error={error}
          selectedSegments={selectedSegments}
          onToggleSegment={onToggleSegment}
          mode={searchMode}
        />
      </div>
    </div>
  );
}