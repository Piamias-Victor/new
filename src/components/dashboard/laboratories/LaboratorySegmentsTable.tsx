// src/components/dashboard/laboratories/LaboratorySegmentsTable.tsx
import React from 'react';
import { FiChevronRight, FiPieChart } from 'react-icons/fi';
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
  // Fonction pour formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Fonction pour formater les pourcentages
  const formatPercentage = (value: number) => {
    return `${Number(value).toFixed(2)}%`;
  };

  // Si pas de segments disponibles
  if (!segments || segments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>Aucun segment trouvé pour ce laboratoire</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Segment
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Univers
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Produits
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              CA
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Marge
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              PDM
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {segments.map((segment) => (
            <tr 
              key={segment.id} 
              className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                selectedSegmentId === segment.id ? 'bg-sky-50 dark:bg-sky-900/20' : ''
              }`}
              onClick={() => onSegmentSelect(segment.id)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {segment.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {segment.universe}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900 dark:text-white">
                  {segment.product_count}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(segment.total_revenue)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(segment.total_margin)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <FiPieChart className="mr-1" size={12} />
                  {formatPercentage(segment.market_share)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <button
                  className="text-sky-600 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSegmentSelect(segment.id);
                  }}
                >
                  <FiChevronRight size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}