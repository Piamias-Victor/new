// src/components/dashboard/laboratories/LaboratorySearch.tsx
import React, { useEffect, useState } from 'react';
import { FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi';

interface LaboratorySearchProps {
  onSearch: (selectedLab: string) => Promise<void>;
  isLoading?: boolean;
}

export function LaboratorySearch({ onSearch, isLoading = false }: LaboratorySearchProps) {
  const [selectedLab, setSelectedLab] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [laboratories, setLaboratories] = useState<string[]>([]);
  const [isLabsLoading, setIsLabsLoading] = useState<boolean>(true);

  // Filtrer les laboratoires selon le terme de recherche
  const filteredLabs = laboratories.filter(lab => 
    lab.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Récupérer la liste des laboratoires depuis l'API
  useEffect(() => {
    const fetchLaboratories = async () => {
      try {
        setIsLabsLoading(true);
        const response = await fetch('/api/laboratories/list');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des laboratoires');
        }
        
        const data = await response.json();
        setLaboratories(data.laboratories || []);
      } catch (error) {
        console.error('Erreur de chargement des laboratoires:', error);
      } finally {
        setIsLabsLoading(false);
      }
    };

    fetchLaboratories();
  }, []);

  // Gérer la sélection d'un laboratoire
  const handleLabSelect = (lab: string) => {
    setSelectedLab(lab);
    setSearchTerm('');
    setDropdownOpen(false);
  };

  // Réinitialiser la recherche
  const clearSearch = () => {
    setSelectedLab('');
    setSearchTerm('');
  };

  // Soumettre la recherche
  const handleSubmit = async () => {
    if (selectedLab) {
      await onSearch(selectedLab);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* En-tête avec titre et options */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiSearch size={20} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recherche par laboratoire
          </h3>
        </div>
      </div>
      
      {/* Corps avec le champ de recherche */}
      <div className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="laboratory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Sélectionnez un laboratoire
            </label>
            
                          <div className="relative">
                {/* Affichage du laboratoire sélectionné OU champ de recherche */}
                <div className="relative flex w-full">
                  {selectedLab ? (
                    <div className="flex items-center justify-between w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                      <span className="text-gray-900 dark:text-white font-medium">{selectedLab}</span>
                      <div className="flex items-center ml-2">
                        <button 
                          onClick={clearSearch}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 mr-1"
                          title="Effacer la sélection"
                        >
                          <FiX size={18} />
                        </button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
                        <button 
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="Afficher la liste des laboratoires"
                        >
                          <FiChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FiSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            if (!dropdownOpen) setDropdownOpen(true);
                          }}
                          onClick={() => setDropdownOpen(true)}
                          placeholder="Rechercher un laboratoire..."
                          className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500 shadow-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <button 
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none"
                          >
                            <FiChevronDown size={18} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Dropdown des laboratoires */}
              {dropdownOpen && (
                <div className="absolute z-10 mt-2 left-0 right-0 bg-white dark:bg-gray-800 shadow-xl rounded-lg border border-gray-200 dark:border-gray-700 max-h-72 overflow-y-auto">
                  {/* Entête du dropdown */}
                  <div className="sticky top-0 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isLabsLoading ? 'Chargement...' : `${filteredLabs.length} laboratoires trouvés`}
                    </p>
                  </div>

                  {isLabsLoading ? (
                    <div className="p-6 flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
                      <span className="ml-3 text-gray-500 dark:text-gray-400">Chargement des laboratoires...</span>
                    </div>
                  ) : filteredLabs.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      <span className="block mb-1 text-xl">😕</span>
                      Aucun laboratoire trouvé
                    </div>
                  ) : (
                    <ul className="py-2">
                      {filteredLabs.map((lab) => (
                        <li 
                          key={lab}
                          onClick={() => handleLabSelect(lab)}
                          className="px-4 py-2.5 hover:bg-sky-50 dark:hover:bg-sky-900/20 cursor-pointer text-gray-900 dark:text-white transition-colors"
                        >
                          <div className="flex items-center">
                            <span className="font-medium">{lab}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Description et conseils */}
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <p>Sélectionnez un laboratoire pour analyser ses performances commerciales, évolution des ventes et stock.</p>
          </div>

          {/* Bouton de recherche */}
          <div className="mt-6">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !selectedLab}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyse en cours...
                </>
              ) : (
                <>
                  <FiSearch className="mr-2" size={18} />
                  Analyser ce laboratoire
                </>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}