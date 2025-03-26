// src/components/dashboard/laboratories/LaboratorySegmentsTable.tsx
import React from 'react';
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

  // Trier les segments par CA
  const sortedSegments = [...segments].sort((a, b) => b.total_revenue - a.total_revenue);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {segments.length} segments trouvés
        </h4>
      </div>
      
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
                CA Sell Out
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PDM (CA)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Volume Sell Out
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                PDM (Vol.)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ref Vendues
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Analyser</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedSegments.map((segment) => (
              <tr 
                key={segment.id} 
                className={`
                  hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer
                  ${selectedSegmentId === segment.id ? 'bg-sky-50 dark:bg-sky-900/20' : ''}
                `}
                onClick={() => onSegmentSelect(segment.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{segment.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{segment.category}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{segment.universe}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900 dark:text-white">{formatCurrency(segment.total_revenue)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                    {Number(segment.market_share).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900 dark:text-white">{formatQuantity(segment.total_quantity)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                    {Number(segment.volume_share).toFixed(1)}%
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900 dark:text-white">{segment.product_count}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    className={`text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300 ${selectedSegmentId === segment.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <FiArrowRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}