// src/components/comparison/LaboratorySearchCombobox.tsx
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX, FiPackage } from 'react-icons/fi';

interface Laboratory {
  id: string;
  name: string;
  productCount?: number;
}

interface LaboratorySearchComboboxProps {
  selectedItem: Laboratory | null;
  onChange: (laboratory: Laboratory | null) => void;
}

export function LaboratorySearchCombobox({ selectedItem, onChange }: LaboratorySearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [laboratories, setLaboratories] = useState<Laboratory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulation de chargement de laboratoires - à remplacer par un appel API réel
  useEffect(() => {
    if (query.length < 2) {
      setLaboratories([]);
      return;
    }

    const fetchLaboratories = async () => {
      setIsLoading(true);
      
      // Pour la maquette, on simule un délai et génère des données fictives
      setTimeout(() => {
        // Création de données fictives
        const mockLaboratories: Laboratory[] = [
          { id: 'lab-1', name: 'Sanofi', productCount: 120 },
          { id: 'lab-2', name: 'Pfizer', productCount: 98 },
          { id: 'lab-3', name: 'Bayer', productCount: 85 },
          { id: 'lab-4', name: 'Novartis', productCount: 76 },
          { id: 'lab-5', name: 'Roche', productCount: 64 },
          { id: 'lab-6', name: 'Pierre Fabre', productCount: 58 },
          { id: 'lab-7', name: 'Servier', productCount: 52 },
          { id: 'lab-8', name: 'GSK', productCount: 47 },
          { id: 'lab-9', name: 'Merck', productCount: 42 },
          { id: 'lab-10', name: 'Boiron', productCount: 38 },
        ].filter(lab => 
          lab.name.toLowerCase().includes(query.toLowerCase())
        );
        
        setLaboratories(mockLaboratories);
        setIsLoading(false);
      }, 500);
    };

    fetchLaboratories();
  }, [query]);

  // Gestion de la sélection d'un laboratoire
  const handleSelect = (laboratory: Laboratory) => {
    onChange(laboratory);
    setIsOpen(false);
    setQuery('');
  };

  // Effacer la sélection
  const handleClear = () => {
    onChange(null);
    setQuery('');
  };

  return (
    <div className="relative">
      {selectedItem ? (
        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <div className="flex items-center overflow-hidden">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                <FiPackage size={16} />
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedItem.name}
              </p>
              {selectedItem.productCount && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedItem.productCount} produits
                </p>
              )}
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
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 dark:text-white sm:text-sm"
            placeholder="Rechercher un laboratoire..."
          />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isLoading ? 'Chargement...' : `${laboratories.length} laboratoires trouvés`}
            </p>
          </div>

          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-teal-500"></div>
            </div>
          ) : laboratories.length > 0 ? (
            <ul className="py-1">
              {laboratories.map((laboratory) => (
                <li 
                  key={laboratory.id}
                  onClick={() => handleSelect(laboratory)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300">
                        <FiPackage size={16} />
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {laboratory.name}
                      </p>
                      {laboratory.productCount && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {laboratory.productCount} produits
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun laboratoire trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}