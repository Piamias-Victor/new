// src/components/dashboard/pharmacies/PharmaciesList.tsx
import React, { useState, useMemo } from 'react';
import { usePharmaciesData } from '@/hooks/usePharmaciesData';
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { 
  FiHome, 
  FiSearch, 
  FiArrowUp, 
  FiArrowDown, 
  FiInfo,
  FiChevronDown,
  FiPackage,
  FiPercent
} from 'react-icons/fi';

type SortField = 'name' | 'sell_out_price_ttc' | 'sell_in_price_ht' | 'margin_percentage' | 
                'stock_value_ht' | 'sales_quantity' | 'references' | 'selection_weight';

export function PharmaciesList() {
  const { pharmacies, isLoading, error } = usePharmaciesData();
  const { selectedCodes } = useProductFilter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showUnitPrices, setShowUnitPrices] = useState(false);
  const [expandedPharmacyId, setExpandedPharmacyId] = useState<string | null>(null);
  
  // Fonction pour formatter les valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2 
    }).format(amount);
  };
  
  // Fonction pour formatter les pourcentages
  const formatPercentage = (value: number) => {
    return `${Number(value).toFixed(1)} %`;
  };
  
  // Gestion du tri
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Gestion de l'affichage des détails
  const toggleDetails = (pharmacyId: string) => {
    setExpandedPharmacyId(expandedPharmacyId === pharmacyId ? null : pharmacyId);
  };
  
  // Filtrage des pharmacies en fonction de la recherche
  const filteredPharmacies = useMemo(() => {
    if (!searchTerm.trim() || !pharmacies) return pharmacies || [];
    
    const term = searchTerm.toLowerCase();
    return pharmacies.filter(pharmacy => 
      (pharmacy?.name || '').toLowerCase().includes(term)
    );
  }, [pharmacies, searchTerm]);
  
  // Tri des pharmacies
  const sortedPharmacies = useMemo(() => {
    if (!filteredPharmacies) return [];
    
    return [...filteredPharmacies].sort((a, b) => {
      let compareResult;
      
      switch (sortField) {
        case 'name':
          compareResult = (a?.name || '').localeCompare(b?.name || '');
          break;
        case 'sell_out_price_ttc':
          compareResult = (a?.sell_out_price_ttc || 0) - (b?.sell_out_price_ttc || 0);
          break;
        case 'sell_in_price_ht':
          compareResult = (a?.sell_in_price_ht || 0) - (b?.sell_in_price_ht || 0);
          break;
        case 'margin_percentage':
          compareResult = (a?.margin_percentage || 0) - (b?.margin_percentage || 0);
          break;
        case 'stock_value_ht':
          compareResult = (a?.stock_value_ht || 0) - (b?.stock_value_ht || 0);
          break;
        case 'sales_quantity':
          compareResult = (a?.sales_quantity || 0) - (b?.sales_quantity || 0);
          break;
        case 'references':
          compareResult = (a?.product_count || 0) - (b?.product_count || 0);
          break;
        case 'selection_weight':
          compareResult = (a?.selection_weight || 0) - (b?.selection_weight || 0);
          break;
        default:
          compareResult = 0;
      }
      
      return sortDirection === 'asc' ? compareResult : -compareResult;
    });
  }, [filteredPharmacies, sortField, sortDirection]);
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-red-500 dark:text-red-400">
          Erreur: {error}
        </div>
      </div>
    );
  }
  
  // Aucune pharmacie trouvée
  if (!pharmacies || pharmacies.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <div className="text-center p-6">
          <FiHome className="mx-auto text-gray-400 mb-3" size={24} />
          <p className="text-gray-500 dark:text-gray-400">
            Aucune pharmacie trouvée
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center">
            <FiHome className="text-gray-500 dark:text-gray-400 mr-2" size={20} />
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Pharmacies ({filteredPharmacies.length})
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Rechercher une pharmacie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-grow">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0 z-10">
              <tr>
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Pharmacie
                    {sortField === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sell_out_price_ttc')}
                >
                  <div className="flex items-center">
                    CA TTC sell-out
                    {sortField === 'sell_out_price_ttc' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sell_in_price_ht')}
                >
                  <div className="flex items-center">
                    CA HT sell-in
                    {sortField === 'sell_in_price_ht' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('margin_percentage')}
                >
                  <div className="flex items-center">
                    Taux de Marge
                    {sortField === 'margin_percentage' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('stock_value_ht')}
                >
                  <div className="flex items-center">
                    Stock EUROS HT
                    {sortField === 'stock_value_ht' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('sales_quantity')}
                >
                  <div className="flex items-center">
                    Quantité Vendue
                    {sortField === 'sales_quantity' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>

                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('references')}
                >
                  <div className="flex items-center">
                    Références
                    {sortField === 'references' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                
                <th scope="col" 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('selection_weight')}
                >
                  <div className="flex items-center">
                    Poids
                    {sortField === 'selection_weight' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? <FiArrowUp size={14} /> : <FiArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                

                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Détail
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedPharmacies.map((pharmacy) => (
                <React.Fragment key={pharmacy?.id}>
                  <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${expandedPharmacyId === pharmacy?.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{pharmacy?.name || 'N/A'}</div>
                    </td>
                    
                    {/* CA Sell-out */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(pharmacy?.sell_out_price_ttc || 0)}
                      </div>
                    </td>
                    
                    {/* CA Sell-in */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(pharmacy?.sell_in_price_ht || 0)}
                      </div>
                    </td>
                    
                    {/* Taux de marge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatPercentage(pharmacy?.margin_percentage || 0)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(pharmacy?.margin_amount || 0)}</div>
                    </td>
                    
                    {/* Stock */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(pharmacy?.stock_value_ht || 0)}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{pharmacy?.stock_quantity || 0} unités</div>
                    </td>
                    
                    {/* Quantité vendue */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{pharmacy?.sales_quantity || 0}</div>
                    </td>
                    
                    {/* Références actives */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <FiPackage className="text-gray-400 mr-1" size={14} />
                        <span>{pharmacy?.product_count || 0}/{selectedCodes.length || 0}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {((pharmacy?.product_count || 0) / (selectedCodes.length || 1) * 100).toFixed(1)}% des produits
                      </div>
                    </td>
                    
                    {/* Poids de la sélection */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white flex items-center">
                        <FiPercent className="text-gray-400 mr-1" size={14} />
                        <span>{formatPercentage((pharmacy?.selection_weight || 0) * 100)}</span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        du CA total
                      </div>
                    </td>
                    
                    {/* Bouton détail */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={() => toggleDetails(pharmacy?.id || '')}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <FiInfo className="mr-1" size={14} />
                        {expandedPharmacyId === pharmacy?.id ? 'Fermer' : 'Détail'}
                        <FiChevronDown 
                          className={`ml-1 transition-transform ${expandedPharmacyId === pharmacy?.id ? 'rotate-180' : ''}`} 
                          size={14} 
                        />
                      </button>
                    </td>
                  </tr>
                  
                  {/* Section détaillée lorsque la pharmacie est développée */}
                  {expandedPharmacyId === pharmacy?.id && (
                    <tr>
                      <td colSpan={9} className="px-0 py-0 bg-gray-50 dark:bg-gray-700">
                        <div className="p-4">
                          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                              Détails de la pharmacie {pharmacy?.name}
                            </h3>
                            
                            <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
                              Plus de détails seront disponibles prochainement...
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}