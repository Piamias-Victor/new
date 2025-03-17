// src/components/dashboard/products/ProductSalesChart.tsx
import React, { useMemo } from 'react';
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
import { FiTrendingUp } from 'react-icons/fi';

interface TotalDataItem {
  period: string;
  total_quantity: number;
  total_revenue: number;
  total_margin: number;
  margin_percentage: number;
}

interface ProductSalesChartProps {
  data: TotalDataItem[];
  isLoading: boolean;
  error: string | null;
  interval: 'day' | 'week' | 'month';
  showMargin: boolean;
}

export function ProductSalesChart({ 
  data, 
  isLoading, 
  error, 
  interval,
  showMargin 
}: ProductSalesChartProps) {
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
  
  // Calculer les bornes du domaine Y pour s'assurer que toutes les valeurs sont visibles
  const yDomain = useMemo(() => {
    if (!data || data.length === 0) return [0, 0];
    
    // Trouver la valeur maximale pour déterminer le domaine Y
    const maxRevenue = Math.max(...data.map(item => item.total_revenue || 0));
    const maxMargin = showMargin ? Math.max(...data.map(item => item.total_margin || 0)) : 0;
    const maxValue = Math.max(maxRevenue, maxMargin);
    
    // Ajouter une marge de 10% au-dessus du maximum pour éviter les coupures
    const topMargin = maxValue * 0.1;
    
    return [0, maxValue + topMargin];
  }, [data, showMargin]);

  // Composant de chargement
  if (isLoading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse h-80"></div>
    );
  }

  // Composant d'erreur
  if (error) {
    return (
      <div className="flex items-center p-4 mb-4 text-red-500 dark:text-red-400">
        <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
          <FiTrendingUp size={20} />
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '400px' }}>
      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            Aucune donnée disponible pour la période sélectionnée
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
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
              domain={yDomain}
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
              dataKey="total_revenue" 
              name="CA" 
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
                dataKey="total_margin" 
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
  );
}