// src/components/comparison/SalesEvolutionComparison.tsx
import React, { useState } from 'react';
import { FiCalendar, FiBarChart2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesEvolutionComparisonProps {
  itemA: any;
  itemB: any;
}

export function SalesEvolutionComparison({ itemA, itemB }: SalesEvolutionComparisonProps) {
  const [timeUnit, setTimeUnit] = useState<'day' | 'week' | 'month'>('month');
  
  // Données fictives pour la maquette - à remplacer par les données réelles
  const generateMockData = () => {
    // Générer des données de ventes pour les 6 derniers mois
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    
    // Générer des données légèrement différentes pour chaque élément
    return months.map((month, index) => {
      const baseValue = 10000 + Math.random() * 5000;
      // Item A a une tendance à la hausse
      const valueA = baseValue + (index * 1000) + (Math.random() * 2000);
      // Item B fluctue davantage
      const valueB = baseValue - (index * 300) + (Math.random() * 3000);
      
      return {
        name: month,
        [itemA?.name || 'Élément A']: Math.round(valueA),
        [itemB?.name || 'Élément B']: Math.round(valueB),
      };
    });
  };

  const data = generateMockData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiBarChart2 size={18} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Évolution des ventes
          </h2>
        </div>
        
        {/* Sélection de l'unité de temps */}
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-l-md ${
              timeUnit === 'day'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeUnit('day')}
          >
            Jour
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium ${
              timeUnit === 'week'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeUnit('week')}
          >
            Semaine
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-xs font-medium rounded-r-md ${
              timeUnit === 'month'
                ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            onClick={() => setTimeUnit('month')}
          >
            Mois
          </button>
        </div>
      </div>
      
      <div className="p-2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280' }}
              tickLine={{ stroke: '#6b7280' }}
              tickFormatter={(value) => new Intl.NumberFormat('fr-FR', { 
                notation: 'compact',
                compactDisplay: 'short'
              }).format(value)}
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
            <Line 
              type="monotone" 
              dataKey={itemA?.name || 'Élément A'} 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
            <Line 
              type="monotone" 
              dataKey={itemB?.name || 'Élément B'} 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981', r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <FiCalendar className="text-gray-400 mr-2" size={16} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Période: derniers 6 mois
            </span>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {itemA?.name || 'Élément A'}
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></div>
              <span className="text-xs text-gray-700 dark:text-gray-300">
                {itemB?.name || 'Élément B'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}