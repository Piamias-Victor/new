// src/components/drawer/search/UnifiedSegmentSearch.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { FiLayers, FiFilter, FiTag, FiCheck } from 'react-icons/fi';
import { useSegmentSearch } from '@/hooks/useSegmentSearch';

export interface UnifiedSegment {
  id: string;
  name: string;
  type: 'universe' | 'category' | 'subcategory' | 'family' | 'subfamily';
  parent?: string;
  level: number;
  productCount: number;
  breadcrumb: string[];
  code_13_refs?: string[];
}

interface UnifiedSegmentSearchProps {
  selectedSegments: UnifiedSegment[];
  onToggleSegment: (segment: UnifiedSegment) => void;
}

export function UnifiedSegmentSearch({ 
  selectedSegments = [], 
  onToggleSegment 
}: UnifiedSegmentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const { results, isLoading, error, searchUnifiedSegments, clearResults } = useSegmentSearch();
  
  // État pour les résultats filtrés
  const [filteredResults, setFilteredResults] = useState<UnifiedSegment[]>([]);
  
  // Filtres disponibles
  const filters = [
    { id: 'universe', label: 'Univers', icon: <FiLayers size={14} /> },
    { id: 'category', label: 'Catégories', icon: <FiFilter size={14} /> },
    { id: 'family', label: 'Familles', icon: <FiTag size={14} /> }
  ];
  
  // Appliquer les filtres aux résultats
  useEffect(() => {
    if (activeFilters.length === 0) {
      setFilteredResults(results);
      return;
    }
    
    const filtered = results.filter(segment => {
      // Filtrer par type
      if (activeFilters.includes('universe') && segment.type === 'universe') return true;
      if (activeFilters.includes('category') && (segment.type === 'category' || segment.type === 'subcategory')) return true;
      if (activeFilters.includes('family') && (segment.type === 'family' || segment.type === 'subfamily')) return true;
      
      return false;
    });
    
    setFilteredResults(filtered);
  }, [results, activeFilters]);
  
  // Gérer les filtres
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };
  
  // Recherche de segments
  const handleSearch = useCallback(() => {
    if (searchTerm.trim().length >= 2) {
      searchUnifiedSegments(searchTerm);
    }
  }, [searchTerm, searchUnifiedSegments]);
  
  // Soumettre avec touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim().length >= 2) {
      handleSearch();
    }
  };
  
  // Vérifier si un segment est sélectionné
  const isSelected = (segment: UnifiedSegment) => {
    return selectedSegments.some(s => s.id === segment.id);
  };
  
  // Effacer la recherche
  const handleClear = () => {
    setSearchTerm('');
    clearResults();
  };
  
  // Grouper les résultats par hiérarchie pour un affichage plus clair
  const groupedResults = useCallback(() => {
    const groupedMap = new Map<string, { segment?: UnifiedSegment, children: UnifiedSegment[] }>();
    
    filteredResults.forEach(segment => {
      // Pour les segments de niveau 1 (univers et familles principales)
      if (segment.level === 1 || !segment.parent) {
        if (!groupedMap.has(segment.id)) {
          groupedMap.set(segment.id, { segment, children: [] });
        } else {
          groupedMap.get(segment.id)!.segment = segment;
        }
      } 
      // Pour les segments enfants (catégories, sous-catégories, sous-familles)
      else if (segment.parent) {
        if (!groupedMap.has(segment.parent)) {
          groupedMap.set(segment.parent, { children: [segment] });
        } else {
          groupedMap.get(segment.parent)!.children.push(segment);
        }
      }
    });
    
    return Array.from(groupedMap.values());
  }, [filteredResults]);
  
  return (
    <div className="flex flex-col h-full">
      <div className="space-y-4 mb-4">
        {/* Champ de recherche */}
        <SearchInput
          placeholder="Rechercher un univers, une catégorie ou une famille..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
          onClear={handleClear}
        />
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-2">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                activeFilters.includes(filter.id)
                  ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="mr-1.5">{filter.icon}</span>
              {filter.label}
            </button>
          ))}
        </div>
        
        {/* Compteur de résultats */}
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {filteredResults.length} segment(s) trouvé(s)
        </p>
      </div>
      
      {/* Affichage des résultats */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 dark:text-red-400 p-4">
            {error}
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            Aucun résultat trouvé. Essayez d'autres termes ou filtres.
          </div>
        ) : (
          groupedResults().map((group, groupIndex) => (
            <div key={group.segment?.id || `group-${groupIndex}`} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {/* Parent segment (si existe) */}
              {group.segment && (
                <div 
                  className={`p-3 cursor-pointer transition-colors ${
                    isSelected(group.segment)
                      ? 'bg-sky-50 dark:bg-sky-900/20 border-b border-sky-200 dark:border-sky-800'
                      : 'bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-750'
                  }`}
                  onClick={() => onToggleSegment(group.segment!)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`mr-3 p-1 rounded-full ${
                        isSelected(group.segment)
                          ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        <FiCheck size={14} />
                      </div>
                      
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                          {group.segment.type === 'universe' && <FiLayers className="mr-1.5 text-blue-500" size={14} />}
                          {group.segment.type === 'family' && <FiTag className="mr-1.5 text-green-500" size={14} />}
                          {group.segment.name}
                        </h3>
                        
                        {group.segment.breadcrumb.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {group.segment.breadcrumb.join(' > ')}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                      {group.segment.productCount} produits
                    </span>
                  </div>
                </div>
              )}
              
              {/* Segments enfants */}
              {group.children.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {group.children.map(child => (
                    <div 
                      key={child.id}
                      className={`p-3 pl-8 cursor-pointer transition-colors ${
                        isSelected(child)
                          ? 'bg-sky-50 dark:bg-sky-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                      onClick={() => onToggleSegment(child)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`mr-3 p-1 rounded-full ${
                            isSelected(child)
                              ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                          }`}>
                            <FiCheck size={14} />
                          </div>
                          
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                              {child.type === 'category' && <FiFilter className="mr-1.5 text-purple-500" size={14} />}
                              {child.type === 'subcategory' && <FiFilter className="mr-1.5 text-indigo-500" size={14} />}
                              {child.type === 'subfamily' && <FiTag className="mr-1.5 text-teal-500" size={14} />}
                              {child.name}
                            </h3>
                            
                            {child.breadcrumb.length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {child.breadcrumb.join(' > ')}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {child.productCount} produits
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}