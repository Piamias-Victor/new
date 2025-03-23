// src/components/dashboard/products/ProductStockEvolutionChart.tsx
import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Scatter
} from 'recharts';
import { FiBox, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useProductStockEvolution } from '@/hooks/useProductStockEvolution';

type IntervalType = 'day' | 'week' | 'month';

// Props pour le composant
interface ProductStockEvolutionChartProps {
  code13ref: string;
}

export function ProductStockEvolutionChart({ code13ref }: ProductStockEvolutionChartProps) {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showValue, setShowValue] = useState(true);
  const [showRuptures, setShowRuptures] = useState(true);
  
  // Utiliser notre hook personnalisé
  const { data: stockData, isLoading, error } = useProductStockEvolution(code13ref, interval);
  
  // Formatter les dates selon l'intervalle choisi
  const formatXAxis = (tickItem: string) => {
    if (!tickItem) return '';
    
    try {
      const parts = tickItem.split('-');
      
      if (interval === 'day') {
        // Format YYYY-MM-DD -> JJ/MM
        return `${parts[2]}/${parts[1]}`;
      } else if (interval === 'week') {
        // Format YYYY-WW -> S${WW}
        return `S${parts[1]}`;
      } else if (interval === 'month') {
        // Format YYYY-MM -> MM/YYYY
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthIndex = parseInt(parts[1]) - 1;
        return monthNames[monthIndex];
      }
      
      return tickItem;
    } catch (e) {
      return tickItem;
    }
  };
  
  // Formater les valeurs monétaires
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formater les valeurs pour le tooltip
  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'value') {
      return formatCurrency(value);
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
  
  // Calculer la tendance (% d'évolution)
  const calculateTrend = () => {
    if (stockData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = stockData[0]?.stock || 0;
    const lastValue = stockData[stockData.length - 1]?.stock || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
    };
  };
  
  // Calculer les valeurs min et max pour les axes Y
  const calculateAxisDomains = () => {
    if (!stockData || stockData.length === 0) return { stockDomain: [0, 10], valueDomain: [0, 100] };
    
    // Trouver les valeurs max pour stock et value
    let maxStock = 0;
    let maxValue = 0;
    
    stockData.forEach(item => {
      maxStock = Math.max(maxStock, item.stock || 0);
      maxValue = Math.max(maxValue, item.value || 0);
    });
    
    // Ajouter 10% pour l'espace
    const stockCeiling = maxStock * 1.1;
    const valueCeiling = maxValue * 1.1;
    
    return { 
      stockDomain: [0, stockCeiling],
      valueDomain: [0, valueCeiling]
    };
  };
  
  const trend = calculateTrend();
  const { stockDomain, valueDomain } = calculateAxisDomains();

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300 mr-3">
            <FiBox size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Évolution du stock
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tendance : 
              <span className={`font-medium ml-1 flex items-center ${
                trend.isPositive 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {trend.isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
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

      <div className="flex gap-4 mb-4 text-sm flex-wrap">
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
            <span className="text-gray-600 dark:text-gray-300">Quantité en rupture</span>
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
            >
              <defs>
                <linearGradient id="colorStock" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
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
                domain={stockDomain}
                tickFormatter={formatYAxis} 
                tick={{ fontSize: 12 }}
                stroke="#9CA3AF"
                width={65}
                axisLine={false}
                tickLine={false}
                padding={{ top: 20 }} 
                allowDataOverflow={false}
                label={{ value: 'Unités', angle: -90, position: 'insideLeft', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF', fontSize: 12 } }}
              />
              {showValue && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  domain={valueDomain}
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  stroke="#9CA3AF"
                  width={80}
                  axisLine={false}
                  tickLine={false}
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
              <Area 
                type="monotone" 
                dataKey="stock" 
                name="stock" 
                stroke="#8b5cf6" 
                fillOpacity={1}
                fill="url(#colorStock)" 
                strokeWidth={2}
                dot={{ stroke: '#8b5cf6', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#8b5cf6', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                yAxisId="left"
              />
              {showValue && (
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  name="value" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                  dot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                  yAxisId="right"
                />
              )}
              
              {/* Points de rupture */}
              <Scatter
                data={stockData.filter(item => item.is_rupture)}
                dataKey="stock"
                fill="#ef4444"
                yAxisId="left"
                shape={props => {
                  const { cx, cy } = props;
                  return (
                    <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="red" viewBox="0 0 1024 1024">
                      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z" />
                    </svg>
                  );
                }}
                name="Rupture"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}