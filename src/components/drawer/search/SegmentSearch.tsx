// src/components/drawer/search/SegmentSearch.tsx
import React, { useState, useEffect } from 'react';
import { SearchInput } from './SearchInput';
import { SegmentSearchResults } from './SegmentSearchResults';


interface Segment {
  id: string;
  name: string;
  parentCategory?: string;
  productCount: number;
}

/**
 * Composant de recherche par segment (catégorie/segment)
 */
export function SegmentSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Segment[]>([]);
  const [allSegments, setAllSegments] = useState<Segment[]>([]);

  // Chargement initial des segments
  useEffect(() => {
    const fetchSegments = async () => {
      setIsLoading(true);
      try {
        // Simulation de chargement - à remplacer par un appel API réel
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives pour l'exemple
        const demoSegments: Segment[] = [
          { id: '1', name: 'ANTIBIOTIQUES', parentCategory: 'MÉDICAMENTS', productCount: 120 },
          { id: '2', name: 'ANTALGIQUES', parentCategory: 'MÉDICAMENTS', productCount: 95 },
          { id: '3', name: 'ANTIHISTAMINIQUES', parentCategory: 'MÉDICAMENTS', productCount: 85 },
          { id: '4', name: 'SOINS VISAGE', parentCategory: 'DERMOCOSMÉTIQUE', productCount: 150 },
          { id: '5', name: 'SOINS CORPS', parentCategory: 'DERMOCOSMÉTIQUE', productCount: 130 },
          { id: '6', name: 'SOLAIRES', parentCategory: 'DERMOCOSMÉTIQUE', productCount: 75 },
          { id: '7', name: 'COMPLÉMENTS ALIMENTAIRES', parentCategory: 'NATUREL', productCount: 110 },
          { id: '8', name: 'PHYTOTHÉRAPIE', parentCategory: 'NATUREL', productCount: 95 },
          { id: '9', name: 'MATÉRIEL MÉDICAL', productCount: 60 },
          { id: '10', name: 'ORTHOPÉDIE', productCount: 45 }
        ];
        
        setAllSegments(demoSegments);
        setResults(demoSegments);
      } catch (err) {
        setError("Erreur lors du chargement des segments");
        console.error("Erreur lors du chargement des segments:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegments();
  }, []);

  // Filtrer les résultats selon le terme de recherche
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setResults(allSegments);
      return;
    }
    
    const filtered = allSegments.filter(segment => 
      segment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (segment.parentCategory && segment.parentCategory.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    setResults(filtered);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
        />
      </div>
    </div>
  );
}