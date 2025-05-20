// src/components/comparison/SegmentSearchCombobox.tsx
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiGrid } from 'react-icons/fi';

interface Segment {
  id: string;
  name: string;
  type: 'universe' | 'category' | 'family';
  parentName?: string;
  productCount?: number;
}

interface SegmentSearchComboboxProps {
  selectedItem: Segment | null;
  onChange: (segment: Segment | null) => void;
}

export function SegmentSearchCombobox({ selectedItem, onChange }: SegmentSearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulation de chargement de segments - à remplacer par un appel API réel
  useEffect(() => {
    if (query.length < 2) {
      setSegments([]);
      return;
    }

    const fetchSegments = async () => {
      setIsLoading(true);
      
      // Pour la maquette, on simule un délai et génère des données fictives
      setTimeout(() => {
        // Création de données fictives
        const mockSegments: Segment[] = [
          // Univers
          { id: 'univ-1', name: 'Médicaments', type: 'universe', productCount: 350 },
          { id: 'univ-2', name: 'Parapharmacie', type: 'universe', productCount: 280 },
          { id: 'univ-3', name: 'Matériel médical', type: 'universe', productCount: 120 },
          
          // Catégories
          { id: 'cat-1', name: 'Douleur et Fièvre', type: 'category', parentName: 'Médicaments', productCount: 85 },
          { id: 'cat-2', name: 'Digestion', type: 'category', parentName: 'Médicaments', productCount: 65 },
          { id: 'cat-3', name: 'Vitamines', type: 'category', parentName: 'Parapharmacie', productCount: 45 },
          { id: 'cat-4', name: 'Hygiène', type: 'category', parentName: 'Parapharmacie', productCount: 120 },
          { id: 'cat-5', name: 'Orthopédie', type: 'category', parentName: 'Matériel médical', productCount: 40 },
          
          // Familles
          { id: 'fam-1', name: 'Antalgiques', type: 'family', parentName: 'Douleur et Fièvre', productCount: 30 },
          { id: 'fam-2', name: 'Anti-inflammatoires', type: 'family', parentName: 'Douleur et Fièvre', productCount: 25 },
          { id: 'fam-3', name: 'Laxatifs', type: 'family', parentName: 'Digestion', productCount: 15 },
          { id: 'fam-4', name: 'Antiacides', type: 'family', parentName: 'Digestion', productCount: 20 },
          { id: 'fam-5', name: 'Multivitamines', type: 'family', parentName: 'Vitamines', productCount: 18 },
          { id: 'fam-6', name: 'Dentaire', type: 'family', parentName: 'Hygiène', productCount: 40 },
          { id: 'fam-7', name: 'Genouillères', type: 'family', parentName: 'Orthopédie', productCount: 15 },
        ].filter(segment => 
          segment.name.toLowerCase().includes(query.toLowerCase()) ||
          (segment.parentName && segment.parentName.toLowerCase().includes(query.toLowerCase()))
        );
        
        setSegments(mockSegments);
        setIsLoading(false);
      }, 500);
    };

    fetchSegments();
  }, [query]);

  // Gestion de la sélection d'un segment
  const handleSelect = (segment: Segment) => {
    onChange(segment);
    setIsOpen(false);
    setQuery('');
  };

  // Effacer la sélection
  const handleClear = () => {
    onChange(null);
    setQuery('');
  };
  
  // Obtenir la couleur de fond selon le type de segment
  const getSegmentTypeColor = (type: 'universe' | 'category' | 'family') => {
    switch (type) {
      case 'universe':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-600 dark:text-blue-300'
        };
      case 'category':
        return {
          bg: 'bg-purple-100 dark:bg-purple-900/30',
          text: 'text-purple-600 dark:text-purple-300'
        };
      case 'family':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-600 dark:text-emerald-300'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-600 dark:text-gray-300'
        };
    }
  };
  
  // Obtenir le nom du type de segment
  const getSegmentTypeName = (type: 'universe' | 'category' | 'family') => {
    switch (type) {
      case 'universe':
        return 'Univers';
      case 'category':
        return 'Catégorie';
      case 'family':
        return 'Famille';
      default:
        return 'Segment';
    }
  };

  return (
    <div className="relative">
      {selectedItem ? (
        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <div className="flex items-center overflow-hidden">
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${getSegmentTypeColor(selectedItem.type).bg} ${getSegmentTypeColor(selectedItem.type).text}`}>
                <FiGrid size={16} />
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedItem.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {getSegmentTypeName(selectedItem.type)}
                {selectedItem.parentName && ` • ${selectedItem.parentName}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={handleClear}
          >
            <FiX size={18} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 dark:text-white sm:text-sm"
            placeholder="Rechercher un segment..."
          />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isLoading ? 'Chargement...' : `${segments.length} segments trouvés`}
            </p>
          </div>

          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : segments.length > 0 ? (
            <ul className="py-1">
              {segments.map((segment) => (
                <li 
                  key={segment.id}
                  onClick={() => handleSelect(segment)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full ${getSegmentTypeColor(segment.type).bg} ${getSegmentTypeColor(segment.type).text}`}>
                        <FiGrid size={16} />
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {segment.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {getSegmentTypeName(segment.type)}
                        {segment.parentName && ` • ${segment.parentName}`}
                        {segment.productCount && ` • ${segment.productCount} produits`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun segment trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}