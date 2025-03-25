// src/components/dashboard/StockEvolutionChart.tsx
import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Scatter
} from 'recharts';
import { FiBox, FiArrowUpRight, FiArrowDownRight, FiAlertTriangle } from 'react-icons/fi';
import { MdEuro } from "react-icons/md";
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { useStockEvolutionWithFilter } from '@/hooks/useStockEvolutionWithFilter';

type IntervalType = 'day' | 'week' | 'month';

export function StockEvolutionChart() {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showValue, setShowValue] = useState(true);
  const [showRuptures, setShowRuptures] = useState(true);
  
  const { data: stockData, isLoading, error } = useStockEvolutionWithFilter(interval);
  const { isFilterActive, selectedCodes } = useProductFilter();
  
  // Format dates based on interval
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
  
  // Format currency values for tooltips
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format Y-axis values
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    }
    return value;
  };
  
  // Calculate Y-axis domain for stock quantities and ruptures
  const calculateYDomain = () => {
    if (!stockData || stockData.length === 0) return [0, 1000];
    
    // Find maximum values for the displayed data
    let maxStock = Math.max(...stockData.map(item => item.stockQuantity || 0));
    let maxRupture = showRuptures ? Math.max(...stockData.map(item => item.ruptureQuantity || 0)) : 0;
    
    // Take the max value and add 50% to ensure enough space
    const maxY = Math.max(maxStock, maxRupture);
    return [0, maxY * 1.5];
  };

  // Calculate Y-axis domain for stock value
  const calculateValueDomain = () => {
    if (!stockData || stockData.length === 0 || !showValue) return [0, 1000];
    
    // Find maximum value for the stock value data
    let maxValue = Math.max(...stockData.map(item => item.stockValue || 0));
    
    // Add 50% to ensure enough space
    return [0, maxValue * 1.5];
  };
  
  // Calculate stock trend
  const calculateTrend = () => {
    if (!stockData || stockData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = stockData[0]?.stockQuantity || 0;
    const lastValue = stockData[stockData.length - 1]?.stockQuantity || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
    };
  };
  
  const trend = calculateTrend();

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 animate-pulse">
        <div className="flex justify-between mb-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
        <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center text-red-500 dark:text-red-400 mb-4">
          <FiAlertTriangle size={20} className="mr-2" />
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
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Évolution des stocks
              </h2>
              {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
            </div>
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

        {/* Chart options */}
        <div className="flex flex-wrap gap-3">
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
              Valeur
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
          
          {/* Interval selection */}
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

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center">
          <FiBox className="mr-1 text-purple-500" /> 
          <span className="text-gray-600 dark:text-gray-300">Quantité en stock</span>
        </div>
        {showValue && (
          <div className="flex items-center">
            <MdEuro className="mr-1 text-amber-500" /> 
            <span className="text-gray-600 dark:text-gray-300">Valeur du stock</span>
          </div>
        )}
        {showRuptures && (
          <div className="flex items-center">
            <FiAlertTriangle className="mr-1 text-red-500" /> 
            <span className="text-gray-600 dark:text-gray-300">Ruptures</span>
          </div>
        )}
      </div>

      {/* Chart container */}
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
                formatter={(value: number, name: string) => {
                  if (name === 'stockValue') return [formatCurrency(value), 'Valeur'];
                  if (name === 'ruptureQuantity') return [value, 'Ruptures'];
                  return [value, 'Quantité'];
                }}
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
                name="stockQuantity" 
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
                  dataKey="stockValue" 
                  name="stockValue" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#colorValue)" 
                  strokeWidth={2}
                  dot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                  yAxisId="right"
                />
              )}
              {showRuptures && (
                <Area 
                  type="monotone" 
                  dataKey="ruptureQuantity" 
                  name="ruptureQuantity" 
                  stroke="#ef4444" 
                  fillOpacity={1}
                  fill="url(#colorRupture)" 
                  strokeWidth={2}
                  dot={{ stroke: '#ef4444', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#ef4444', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                  yAxisId="left"
                />
              )}
              
              {/* Points to mark ruptures */}
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