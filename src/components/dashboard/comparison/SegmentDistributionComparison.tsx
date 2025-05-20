// src/components/comparison/SegmentDistributionComparison.tsx
import React, { useState } from 'react';
import { FiGrid } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface SegmentDistributionComparisonProps {
  itemA: any;
  itemB: any;
}

export function SegmentDistributionComparison({ itemA, itemB }: SegmentDistributionComparisonProps) {
  const [selectedSegmentType, setSelectedSegmentType] = useState<'universe' | 'category' | 'family'>('category');
  
  // Données fictives pour la maquette - à remplacer par les données réelles
  const generateMockData = () => {
    let segments = [];
    
    if (selectedSegmentType === 'universe') {
      segments = ['Médicaments', 'Parapharmacie', 'Matériel médical', 'Nutrition'];
    } else if (selectedSegmentType === 'category') {
      segments = ['Douleur', 'Digestion', 'Vitamines', 'Beauté', 'Hygiène', 'Bébé'];
    } else {
      segments = ['Antalgiques', 'Anti-inflammatoires', 'Probiotiques', 'Laxatifs', 'Compléments'];
    }
    
    // Générer des données pour chaque segment
    return segments.map(segment => {
      const revenueA = Math.round(5000 + Math.random() * 20000);
      const revenueB = Math.round(5000 + Math.random() * 20000);
      
      return {
        name: segment,
        [itemA?.name || 'Élément A']: revenueA,
        [itemB?.name || 'Élément B']: revenueB,
        diff: Math.round(((revenueA - revenueB) / revenueB) * 100)
      };
    });
  };

  const data = generateMockData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-300 mr-3">
            <FiGrid size={18} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Distribution par Segment
          </h2>
        </div>
        
        {/* Sélection du type de segment */}
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
              selectedSegmentType === 'universe'
                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedSegmentType('universe')}
          >
            Univers
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium ${
              selectedSegmentType === 'category'
                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedSegmentType('category')}
          >
            Catégorie
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
              selectedSegmentType === 'family'
                ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setSelectedSegmentType('family')}
          >
            Famille
          </button>
        </div>
      </div>
      
      <div className="p-4 h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 75, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              type="number" 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { 
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value)}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              width={70}
            />
            <Tooltip 
              formatter={(value) => new Intl.NumberFormat('fr-FR', { 
                style: 'currency', 
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(value)}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#e5e7eb',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey={itemA?.name || 'Élément A'} fill="#3B82F6" barSize={20} />
            <Bar dataKey={itemB?.name || 'Élément B'} fill="#10B981" barSize={20} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {selectedSegmentType === 'universe' ? 'Univers' : 
                 selectedSegmentType === 'category' ? 'Catégorie' : 'Famille'}
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {itemA?.name || 'Élément A'}
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {itemB?.name || 'Élément B'}
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Différence
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/20' : ''}>
                <td className="px-3 py-2 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                  {item.name}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                  {new Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(item[itemA?.name || 'Élément A'])}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right text-gray-700 dark:text-gray-300">
                  {new Intl.NumberFormat('fr-FR', { 
                    style: 'currency', 
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(item[itemB?.name || 'Élément B'])}
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    item.diff > 0
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : item.diff < 0
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {item.diff > 0 ? '+' : ''}{item.diff}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}