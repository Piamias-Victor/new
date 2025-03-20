// src/components/dashboard/SalesEvolutionChart.tsx
import { useState, useMemo } from 'react';
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
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiShoppingCart, FiShoppingBag } from 'react-icons/fi';
import { useSalesEvolution } from '@/hooks/useSalesEvolution';
import { useSellInEvolution } from '@/hooks/useSellInEvolution';
import { SalesInsights } from './SalesInsights';

type IntervalType = 'day' | 'week' | 'month';

export function SalesEvolutionChart() {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showMargin, setShowMargin] = useState(true);
  const [showSellIn, setShowSellIn] = useState(true);
  
  // Récupérer les données sell-out (ventes)
  const { data: sellOutData, isLoading: isSellOutLoading, error: sellOutError } = useSalesEvolution(interval);
  
  // Récupérer les données sell-in (achats)
  const { data: sellInData, isLoading: isSellInLoading, error: sellInError } = useSellInEvolution(interval);
  
  // État de chargement global
  const isLoading = isSellOutLoading || isSellInLoading;
  const error = sellOutError || sellInError;
  
  // Combiner les données pour l'affichage sur le même graphique
  const combinedData = useMemo(() => {
    if (!sellOutData || sellOutData.length === 0) return [];
    
    return sellOutData.map(sellOutItem => {
      // Trouver l'entrée correspondante dans les données sell-in
      const sellInItem = sellInData?.find(item => item.period === sellOutItem.period);
      
      return {
        ...sellOutItem,
        // Ajouter les données sell-in (si disponibles)
        sellInAmount: sellInItem?.amount || 0
      };
    });
  }, [sellOutData, sellInData]);
  
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
    if (!combinedData || combinedData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = combinedData[0]?.revenue || 0;
    const lastValue = combinedData[combinedData.length - 1]?.revenue || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
    };
  };
  
  // Calculer les bornes du domaine Y pour s'assurer que toutes les valeurs sont visibles
  const yDomain = useMemo(() => {
    if (!combinedData || combinedData.length === 0) return [0, 0];
    
    // Trouver la valeur maximale pour déterminer le domaine Y
    const maxRevenue = Math.max(...combinedData.map(item => item.revenue || 0));
    const maxMargin = showMargin ? Math.max(...combinedData.map(item => item.margin || 0)) : 0;
    const maxSellIn = showSellIn ? Math.max(...combinedData.map(item => item.sellInAmount || 0)) : 0;
    
    const maxValue = Math.max(maxRevenue, maxMargin, maxSellIn);
    
    // Ajouter une marge de 10% au-dessus du maximum pour éviter les coupures
    const topMargin = maxValue * 0.1;
    
    return [0, maxValue + topMargin];
  }, [combinedData, showMargin, showSellIn]);
  
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
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
            
            <button
              onClick={() => setShowSellIn(!showSellIn)}
              className={`flex items-center px-3 py-1.5 text-xs rounded ${
                showSellIn 
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-amber-500 dark:bg-amber-400 mr-1"></span>
              Sell-in
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
          <FiShoppingBag className="mr-1 text-sky-500" /> 
          <span className="text-gray-600 dark:text-gray-300">Sell-out (ventes)</span>
        </div>
        {showSellIn && (
          <div className="flex items-center">
            <FiShoppingCart className="mr-1 text-amber-500" /> 
            <span className="text-gray-600 dark:text-gray-300">Sell-in (achats)</span>
          </div>
        )}
      </div>

      {/* Conteneur du graphique avec une hauteur fixe */}
      <div className="w-full" style={{ height: '400px' }}>
        {!combinedData || combinedData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée disponible pour la période sélectionnée
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={combinedData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
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
                <linearGradient id="colorSellIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
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
                width={60}
                axisLine={false}
                tickLine={false}
                domain={yDomain} // Définir explicitement les limites de l'axe Y
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
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                name="CA Sell-out" 
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
              {showSellIn && (
                <Area 
                  type="monotone" 
                  dataKey="sellInAmount" 
                  name="CA Sell-in" 
                  stroke="#f59e0b" 
                  fillOpacity={1}
                  fill="url(#colorSellIn)" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                  activeDot={{ stroke: '#f59e0b', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      {sellOutData && sellOutData.length > 0 && (
        <SalesInsights data={sellOutData} interval={interval} />
      )}
    </div>
  );
}