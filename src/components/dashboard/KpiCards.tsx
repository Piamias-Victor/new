// src/components/dashboard/KpiCards.tsx
'use client';

import React from 'react';
import { FiBarChart2, FiTrendingUp, FiPackage, FiActivity } from 'react-icons/fi';
import { useRevenue } from '@/hooks/useRevenue';

interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: {
    value: string;
    isPositive: boolean;
  };
  isLoading: boolean;
}

// Composant pour une carte KPI individuelle
function KpiCard({ icon, title, value, change, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {change && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`font-medium mr-1 ${
            change.isPositive 
              ? 'text-green-500 dark:text-green-400' 
              : 'text-red-500 dark:text-red-400'
          }`}>
            {change.value}
          </span>
          <span className="text-gray-500 dark:text-gray-400">vs période précédente</span>
        </div>
      )}
    </div>
  );
}

// Composant principal pour les KPIs
export function KpiCards() {
  const { totalRevenue, isLoading } = useRevenue();
  
  // Formatter pour la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Pour le moment, nous n'avons que les données de CA réelles
  // Les autres valeurs sont simulées (à remplacer par des hooks réels plus tard)
  const margin = totalRevenue * 0.324; // simulation: 32.4% de marge
  const stock = 45000; // valeur simulée
  const rotation = 6.8; // valeur simulée
  
  // Données de comparaison simulées (à remplacer par des données réelles)
  const revenuePrevious = totalRevenue * 0.95; // simulation: 5% de moins
  const marginPrevious = margin * 0.988; // simulation: 1.2% de moins
  const stockPrevious = stock * 1.021; // simulation: 2.1% de plus
  const rotationPrevious = rotation - 0.5; // simulation: 0.5 de moins
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        icon={<FiBarChart2 size={24} />}
        title="Ventes"
        value={formatCurrency(totalRevenue)}
        change={{
          value: `${((totalRevenue / revenuePrevious - 1) * 100).toFixed(1)}%`,
          isPositive: totalRevenue > revenuePrevious
        }}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Marge"
        value={`${((margin / totalRevenue) * 100).toFixed(1)}%`}
        change={{
          value: `${((margin / marginPrevious - 1) * 100).toFixed(1)}%`,
          isPositive: margin > marginPrevious
        }}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock"
        value={formatCurrency(stock)}
        change={{
          value: `${((stock / stockPrevious - 1) * 100).toFixed(1)}%`,
          isPositive: stock < stockPrevious
        }}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={{
          value: `+${(rotation - rotationPrevious).toFixed(1)}x`,
          isPositive: rotation > rotationPrevious
        }}
        isLoading={isLoading}
      />
    </div>
  );
}
