// src/components/dashboard/laboratories/LaboratorySegmentsTable.tsx
import React, { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Segment } from '@/hooks/useLaboratorySegments';

interface LaboratorySegmentsTableProps {
  segments: Segment[];
  onSegmentSelect: (segmentId: string) => void;
  selectedSegmentId: string | null;
}

export function LaboratorySegmentsTable({ 
  segments, 
  onSegmentSelect, 
  selectedSegmentId 
}: LaboratorySegmentsTableProps) {
  const [activeTab, setActiveTab] = useState<string>('universe');
  
  // Fonction pour formatter les montants
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Fonction pour formatter les quantités
  const formatQuantity = (quantity: number): string => {
    return new Intl.NumberFormat('fr-FR').format(quantity);
  };

  // Filtrer les segments selon le type sélectionné
  const filteredSegments = segments.filter(s => s.segment_type === activeTab);

  // Trier les segments par CA
  const sortedSegments = [...filteredSegments].sort((a, b) => b.total_revenue - a.total_revenue);

  // Compter le nombre de segments par type
  const universeCount = segments.filter(s => s.segment_type === 'universe').length;
  const categoryCount = segments.filter(s => s.segment_type === 'category').length;
  const familyCount = segments.filter(s => s.segment_type === 'family').length;

  return (
    <div className="space-y-4">
      {/* Onglets de navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('universe')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'universe'
                ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Univers ({universeCount})
          </button>
          <button
            onClick={() => setActiveTab('category')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'category'
                ? 'border-purple-500 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Catégories ({categoryCount})
          </button>
          <button
            onClick={() => setActiveTab('family')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'family'
                ? 'border-green-500 text-green-600 dark:border-green-400 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Familles ({familyCount})
          </button>
        </nav>
      </div>
      
      {/* Tableau des segments */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {activeTab === 'universe' ? 'Univers' : activeTab === 'category' ? 'Catégorie' : 'Famille'}
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                CA
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PDM (CA)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PDM (Vol.)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Produits
              </th>
              <th scope="col" className="relative px-6 py-3 w-10">
                <span className="sr-only">Analyser</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSegments.length > 0 ? (
              sortedSegments.map((segment) => (
                <tr 
                  key={segment.id} 
                  className={`
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                    ${selectedSegmentId === segment.id ? 'bg-sky-50 dark:bg-sky-900/20' : ''}
                  `}
                  onClick={() => onSegmentSelect(segment.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {segment.name}
                    </div>
                    {/* Ajout d'un sous-titre contextuel si c'est approprié */}
                    {(activeTab === 'family' && segment.category) && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        dans {segment.category}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(segment.total_revenue)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {Number(segment.market_share).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatQuantity(segment.total_quantity)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {Number(segment.volume_share).toFixed(1)}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {segment.product_count}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
                      aria-label="Analyser ce segment"
                    >
                      <FiArrowRight size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  Aucun {activeTab === 'universe' ? 'univers' : activeTab === 'category' ? 'catégorie' : 'famille'} trouvé pour ce laboratoire
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}