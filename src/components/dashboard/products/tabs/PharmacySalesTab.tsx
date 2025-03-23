// src/components/dashboard/pharmacies/tabs/PharmacySalesTab.tsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import { usePharmacySalesEvolution } from '@/hooks/usePharmacySalesEvolution';

type IntervalType = 'day' | 'week' | 'month';

// Props pour le composant
interface PharmacySalesTabProps {
  pharmacyId: string;
}

export function PharmacySalesTab({ pharmacyId }: PharmacySalesTabProps) {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showMargin, setShowMargin] = useState(true);
  
  // Utiliser un hook personnalisé pour récupérer les données d'évolution des ventes
  const { data: salesData, isLoading, error } = usePharmacySalesEvolution(pharmacyId, interval);
  
  // Formatter les dates selon l'intervalle choisi
  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    
    try {
      const parts = tickItem.split('-');
      
      if (interval === 'day') {
        return `${parts[2]}/${parts[1]}`;
      } else if (interval === 'week') {
        return `S${parts[1]}`;
      } else if (interval === 'month') {
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthIndex = parseInt(parts[1]) - 1;
        return monthNames[monthIndex];
      }
      
      return tickItem;
    } catch (e) {
      return tickItem;
    }
  };
  
  // Formater les valeurs pour le tooltip
  const formatTooltipValue = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Formater les valeurs sur l'axe Y
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };
  
  // Calculer la tendance (% d'évolution)
  const calculateTrend = () => {
    if (salesData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = salesData[0]?.revenue || 0;
    const lastValue = salesData[salesData.length - 1]?.revenue || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
    };
  };
  
  const trend = calculateTrend();

  // Composant de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="bg-gray-200 dark:bg-gray-700 rounded h-80"></div>
      </div>
    );
  }

  // Composant d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiTrendingUp size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            <FiTrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Évolution des ventes
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tendance : 
              <span className={`font-medium ml-1 flex items-center ${
                trend.isPositive 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {trend.isPositive ? <FiArrowUpRight className="mr-1" /> : <FiArrowDownRight className="mr-1" />}
                {trend.value}%
              </span>
            </div>
          </div>
        </div>

        {/* Options du graphique */}
        <div className="flex flex-wrap gap-3">
          {/* Sélection des séries à afficher */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMargin(!showMargin)}
              className={`flex items-center px-3 py-1.5 text-xs rounded ${
                showMargin 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1"></span>
              Marge
            </button>
          </div>
          
          {/* Sélection de l'intervalle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setInterval('day')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'day' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setInterval('week')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setInterval('month')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Mois
            </button>
          </div>
        </div>
      </div>

      {/* Légende */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <span className="w-3 h-3 rounded-full bg-sky-500 dark:bg-sky-400 mr-1"></span>
          <span className="text-gray-600 dark:text-gray-300">Chiffre d'affaires</span>
        </div>
        {showMargin && (
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">Marge</span>
          </div>
        )}
      </div>

      {/* Conteneur du graphique avec une hauteur fixe */}
      <div className="w-full" style={{ height: '400px' }}>
        {!salesData || salesData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée disponible pour la période sélectionnée
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={salesData}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatXAxis} 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                tickMargin={10}
                axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
              />
              <YAxis 
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                width={65}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                formatter={(value: number) => [formatTooltipValue(value)]}
                labelFormatter={formatXAxis}
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  backgroundColor: '#FFFFFF'
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="Chiffre d'affaires" 
                stroke="#0ea5e9" 
                fillOpacity={1}
                fill="url(#colorRevenue)" 
                strokeWidth={2}
                dot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 6 }}
              />
              {showMargin && (
                <Area 
                  type="monotone" 
                  dataKey="margin" 
                  name="Marge" 
                  stroke="#10b981" 
                  fillOpacity={1}
                  fill="url(#colorMargin)" 
                  strokeWidth={2}
                  dot={{ stroke: '#10b981', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#10b981', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}