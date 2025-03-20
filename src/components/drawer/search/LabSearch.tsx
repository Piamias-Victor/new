// src/components/drawer/search/LabSearch.tsx

import { useState, useEffect } from "react";
import { SearchInput } from "./SearchInput";
import { LabSearchResults } from "./LabSearchResults";



interface Laboratory {
  id: string;
  name: string;
  productCount: number;
}

/**
 * Composant de recherche par laboratoire
 */
export function LabSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Laboratory[]>([]);
  const [allLabs, setAllLabs] = useState<Laboratory[]>([]);

  // Chargement initial des laboratoires
  useEffect(() => {
    const fetchLaboratories = async () => {
      setIsLoading(true);
      try {
        // Simulation de chargement - à remplacer par un appel API réel
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Données fictives pour l'exemple
        const demoLabs: Laboratory[] = [
          { id: '1', name: 'SANOFI', productCount: 245 },
          { id: '2', name: 'BAYER', productCount: 180 },
          { id: '3', name: 'PFIZER', productCount: 210 },
          { id: '4', name: 'MERCK', productCount: 175 },
          { id: '5', name: 'NOVARTIS', productCount: 165 },
          { id: '6', name: 'GSK', productCount: 200 },
          { id: '7', name: 'ROCHE', productCount: 185 },
          { id: '8', name: 'JOHNSON & JOHNSON', productCount: 220 },
          { id: '9', name: 'ASTRAZENECA', productCount: 195 },
          { id: '10', name: 'ABBOTT', productCount: 150 }
        ];
        
        setAllLabs(demoLabs);
        setResults(demoLabs);
      } catch (err) {
        setError("Erreur lors du chargement des laboratoires");
        console.error("Erreur lors du chargement des laboratoires:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaboratories();
  }, []);

  // Filtrer les résultats selon le terme de recherche
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setResults(allLabs);
      return;
    }
    
    const filtered = allLabs.filter(lab => 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Rechercher un laboratoire..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onSearch={handleSearch}
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
        />
      </div>
    </div>
  );
}