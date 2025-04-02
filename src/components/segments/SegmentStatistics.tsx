// src/components/segments/SegmentStatistics.tsx
import React from 'react';
import { FlatSegments } from '@/hooks/useSegments';
import { FiBarChart2, FiPieChart, FiActivity } from 'react-icons/fi';

interface SegmentStatisticsProps {
  segments: FlatSegments;
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  darkColor: string;
  textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, darkColor, textColor }) => (
  <div className={`${color} dark:${darkColor} rounded-lg p-4`}>
    <div className="flex items-center mb-2">
      <div className={`${textColor} mr-2`}>{icon}</div>
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{title}</h3>
    </div>
    <div className={`text-2xl font-bold ${textColor}`}>{value}</div>
  </div>
);

export const SegmentStatistics: React.FC<SegmentStatisticsProps> = ({ segments }) => {
  // Calculer quelques statistiques
  const totalSegments = 
    segments.universes.length + 
    segments.categories.length + 
    segments.sub_categories.length + 
    segments.families.length + 
    segments.sub_families.length;
    
  const averageCategoriesPerUniverse = segments.universes.length > 0 
    ? (segments.categories.length / segments.universes.length).toFixed(1) 
    : '0';
    
  const averageSubcategoriesPerCategory = segments.categories.length > 0 
    ? (segments.sub_categories.length / segments.categories.length).toFixed(1) 
    : '0';
    
  const averageSubfamiliesPerFamily = segments.families.length > 0 
    ? (segments.sub_families.length / segments.families.length).toFixed(1) 
    : '0';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mr-3">
          <FiActivity size={20} />
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Statistiques de Segmentation</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<FiBarChart2 size={16} />}
          title="Segments Total"
          value={totalSegments.toString()}
          color="bg-blue-50"
          darkColor="bg-blue-900/20"
          textColor="text-blue-600 dark:text-blue-400"
        />
        
        <StatCard 
          icon={<FiPieChart size={16} />}
          title="Catégories / Univers"
          value={averageCategoriesPerUniverse}
          color="bg-green-50"
          darkColor="bg-green-900/20"
          textColor="text-green-600 dark:text-green-400"
        />
        
        <StatCard 
          icon={<FiPieChart size={16} />}
          title="Sous-catégories / Catégorie"
          value={averageSubcategoriesPerCategory}
          color="bg-teal-50"
          darkColor="bg-teal-900/20"
          textColor="text-teal-600 dark:text-teal-400"
        />
        
        <StatCard 
          icon={<FiPieChart size={16} />}
          title="Sous-familles / Famille"
          value={averageSubfamiliesPerFamily}
          color="bg-amber-50"
          darkColor="bg-amber-900/20"
          textColor="text-amber-600 dark:text-amber-400"
        />
      </div>
      
      <div className="mt-4 grid grid-cols-5 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="text-xl font-semibold text-blue-600 dark:text-blue-400">
            {segments.universes.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Univers</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-green-600 dark:text-green-400">
            {segments.categories.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Catégories</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-teal-600 dark:text-teal-400">
            {segments.sub_categories.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sous-catégories</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-amber-600 dark:text-amber-400">
            {segments.families.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Familles</div>
        </div>
        
        <div className="text-center">
          <div className="text-xl font-semibold text-purple-600 dark:text-purple-400">
            {segments.sub_families.length}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Sous-familles</div>
        </div>
      </div>
    </div>
  );
};