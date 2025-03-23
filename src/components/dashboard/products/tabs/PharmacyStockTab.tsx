// src/components/dashboard/pharmacies/tabs/PharmacyStockTab.tsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter
} from 'recharts';
import { FiBox } from 'react-icons/fi';
import { usePharmacyStockEvolution } from '@/hooks/usePharmacyStockEvolution';

type IntervalType = 'day' | 'week' | 'month';

interface PharmacyStockTabProps {
  pharmacyId: string;
}

export function PharmacyStockTab({ pharmacyId }: PharmacyStockTabProps) {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showValue, setShowValue] = useState(true);
  const [showRuptures, setShowRuptures] = useState(true);
  
  // Utiliser un hook personnalisé pour récupérer les données d'évolution des stocks
  const { data: stockData, isLoading, error } = usePharmacyStockEvolution(pharmacyId, interval);
  
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
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'stockValue') {
      return new Intl.NumberFormat('fr-FR', { 
        style: 'currency', 
        currency: 'EUR',
        maximumFractionDigits: 0
      }).format(value);
    }
    return `${value} unités`;
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

  // Calculer le domaine de l'axe Y en fonction des données
  const calculateYDomain = () => {
    if (!stockData || stockData.length === 0) return [0, 1000];
    
    // Trouver la valeur maximale pour les données affichées
    let maxStock = Math.max(...stockData.map(item => item.stockQuantity || 0));
    let maxRupture = showRuptures ? Math.max(...stockData.map(item => item.ruptureQuantity || 0)) : 0;
    
    // Prendre la valeur max et ajouter 50% pour s'assurer qu'il y a assez d'espace
    const maxY = Math.max(maxStock, maxRupture);
    return [0, maxY * 1.5];
  };

  // Calculer le domaine de l'axe Y pour la valeur du stock
  const calculateValueDomain = () => {
    if (!stockData || stockData.length === 0 || !showValue) return [0, 1000];
    
    // Trouver la valeur maximale pour les données de valeur
    let maxValue = Math.max(...stockData.map(item => item.stockValue || 0));
    
    // Ajouter 50% pour s'assurer qu'il y a assez d'espace
    return [0, maxValue * 1.5];
  };

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
            <FiBox size={20} />
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
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
            <FiBox size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Évolution du stock
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Suivi des niveaux de stocks
            </p>
          </div>
        </div>

        {/* Options du graphique */}
        <div className="flex flex-wrap gap-3">
          {/* Sélection des séries à afficher */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowValue(!showValue)}
              className={`flex items-center px-3 py-1.5 text-xs rounded ${
                showValue 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 mr-1"></span>
              Valeur Stock
            </button>
            
            {/* Bouton pour les ruptures */}
            <button
              onClick={() => setShowRuptures(!showRuptures)}
              className={`flex items-center px-3 py-1.5 text-xs rounded ${
                showRuptures 
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 mr-1"></span>
              Ruptures
            </button>
          </div>
          
          {/* Sélection de l'intervalle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setInterval('day')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'day' 
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setInterval('week')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'week' 
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setInterval('month')}
              className={`px-3 py-1 text-xs rounded ${
                interval === 'month' 
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm' 
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
          <span className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 mr-1"></span>
          <span className="text-gray-600 dark:text-gray-300">Quantité en stock</span>
        </div>
        {showValue && (
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">Valeur du stock</span>
          </div>
        )}
        {showRuptures && (
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 dark:bg-red-400 mr-1"></span>
            <span className="text-gray-600 dark:text-gray-300">Ruptures</span>
          </div>
        )}
      </div>

      {/* Conteneur du graphique avec une hauteur fixe */}
      <div className="w-full" style={{ height: '400px' }}>
        {!stockData || stockData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée disponible pour la période sélectionnée
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stockData}
              margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
              isAnimationActive={false}
            >
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorStockValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRupture" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
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
                yAxisId="left"
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                width={65}
                axisLine={false}
                tickLine={false}
                domain={calculateYDomain()}
                allowDataOverflow={false}
                label={{ value: 'Unités', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 12 } }}
              />
              {showValue && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(value) => formatYAxis(value)}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  width={65}
                  axisLine={false}
                  tickLine={false}
                  domain={calculateValueDomain()}
                  allowDataOverflow={false}
                  label={{ value: 'Valeur', angle: 90, position: 'insideRight', offset: 5, style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 12 } }}
                />
              )}
              <Tooltip 
                formatter={formatTooltipValue}
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
                dataKey="stockQuantity" 
                name="Quantité en stock" 
                stroke="#8b5cf6" 
                fillOpacity={1}
                fill="url(#colorStock)" 
                strokeWidth={2}
                yAxisId="left"
                dot={{ stroke: '#8b5cf6', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#8b5cf6', fill: '#ffffff', strokeWidth: 2, r: 6 }}
              />
              {showValue && (
                <Area 
                  type="monotone" 
                  dataKey="stockValue" 
                  name="Valeur du stock" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#colorStockValue)" 
                  strokeWidth={2}
                  yAxisId="right"
                  dot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                />
              )}
              {showRuptures && (
                <Area 
                  type="monotone" 
                  dataKey="ruptureQuantity" 
                  name="Quantité en rupture" 
                  stroke="#ef4444" 
                  fillOpacity={1}
                  fill="url(#colorRupture)" 
                  strokeWidth={2}
                  yAxisId="left"
                  dot={{ stroke: '#ef4444', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#ef4444', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                />
              )}
              
              {/* Points pour marquer les ruptures */}
              {showRuptures && (
                <Scatter
                  data={stockData.filter(item => item.isRupture)}
                  dataKey="ruptureQuantity"
                  fill="#ef4444"
                  yAxisId="left"
                  shape={(props) => {
                    const { cx, cy } = props;
                    return (
                      <svg x={cx - 8} y={cy - 8} width={16} height={16} fill="red" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                      </svg>
                    );
                  }}
                  name="Alerte rupture"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}