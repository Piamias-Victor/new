// src/components/comparison/PerformanceRadarChart.tsx
import React from 'react';
import { FiActivity } from 'react-icons/fi';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PerformanceRadarChartProps {
  itemA: any;
  itemB: any;
}

export function PerformanceRadarChart({ itemA, itemB }: PerformanceRadarChartProps) {
  // Données fictives pour la maquette - à remplacer par les données réelles
  const generateMockData = () => {
    return [
      {
        metric: 'CA',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      },
      {
        metric: 'Marge',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      },
      {
        metric: 'Croissance',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      },
      {
        metric: 'PDM',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      },
      {
        metric: 'Rotation',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      },
      {
        metric: 'Stock',
        A: Math.random() * 100,
        B: Math.random() * 100,
        fullMark: 100
      }
    ];
  };

  const data = generateMockData();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
            <FiActivity size={18} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Performance Comparative
          </h2>
        </div>
      </div>
      
      <div className="p-2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius="80%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
            />
            <PolarRadiusAxis 
              angle={30} 
              domain={[0, 100]} 
              tick={{ fill: '#6b7280' }}
              stroke="#e5e7eb"
            />
            <Radar
              name={itemA?.name || "Élément A"}
              dataKey="A"
              stroke="#3B82F6"
              fill="#3B82F6"
              fillOpacity={0.3}
            />
            <Radar
              name={itemB?.name || "Élément B"}
              dataKey="B"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2">
          {data.map((item, index) => (
            <div key={index} className="text-xs">
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {item.metric}
              </div>
              <div className="flex justify-between mt-1">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-1"></div>
                  <span className={`${item.A > item.B ? 'font-bold' : ''} text-gray-600 dark:text-gray-400`}>
                    {item.A.toFixed(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1"></div>
                  <span className={`${item.B > item.A ? 'font-bold' : ''} text-gray-600 dark:text-gray-400`}>
                    {item.B.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Indice de performance normalisé sur 100 pour chaque métrique
        </p>
      </div>
    </div>
  );
}