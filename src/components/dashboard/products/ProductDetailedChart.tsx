// src/components/dashboard/products/ProductDetailedChart.tsx
import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FiTrendingUp } from 'react-icons/fi';

interface SalesDataItem {
  period: string;
  quantity: number;
  revenue: number;
  margin: number;
  margin_percentage: number;
}

interface ProductData {
  name: string;
  category: string;
  brand_lab: string;
  data: SalesDataItem[];
}

interface ProductDetailedChartProps {
  data: Record<string, ProductData>;
  isLoading: boolean;
  error: string | null;
  interval: 'day' | 'week' | 'month';
  showMargin: boolean;
}

export function ProductDetailedChart({ 
  data, 
  isLoading, 
  error, 
  interval,
  showMargin 
}: ProductDetailedChartProps) {
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
  
  // Préparer les données pour le graphique
  const chartData = useMemo(() => {
    // Si pas de données, retourner un tableau vide
    if (!data || Object.keys(data).length === 0) return [];
    
    // Créer un dictionnaire pour regrouper les données par période
    const periodMap: Record<string, any> = {};
    
    // Pour chaque produit
    Object.entries(data).forEach(([productId, product]) => {
      // Pour chaque point de données du produit
      product.data.forEach(item => {
        if (!periodMap[item.period]) {
          periodMap[item.period] = { period: item.period };
        }
        
        // Ajouter le revenu du produit pour cette période
        periodMap[item.period][`revenue_${productId}`] = item.revenue;
        
        // Si on montre la marge, l'ajouter aussi
        if (showMargin) {
          periodMap[item.period][`margin_${productId}`] = item.margin;
        }
      });
    });
    
    // Convertir le dictionnaire en tableau trié par période
    return Object.values(periodMap).sort((a, b) => a.period.localeCompare(b.period));
  }, [data, showMargin]);
  
  // Générer des couleurs dynamiques pour les lignes
  const getProductColors = useMemo(() => {
    const baseColors = [
      { revenue: '#0ea5e9', margin: '#10b981' }, // Sky blue, Emerald
      { revenue: '#f97316', margin: '#eab308' }, // Orange, Yellow
      { revenue: '#8b5cf6', margin: '#ec4899' }, // Violet, Pink
      { revenue: '#14b8a6', margin: '#06b6d4' }, // Teal, Cyan
      { revenue: '#ef4444', margin: '#f43f5e' }  // Red, Rose
    ];
    
    const productIds = Object.keys(data);
    const colorMap: Record<string, { revenue: string, margin: string }> = {};
    
    productIds.forEach((id, index) => {
      colorMap[id] = baseColors[index % baseColors.length];
    });
    
    return colorMap;
  }, [data]);
  
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
  
  // Formatter le contenu du tooltip
  // src/components/dashboard/products/ProductDetailedChart.tsx (mise à jour du CustomTooltip)

// À l'intérieur de la fonction ProductDetailedChart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const formattedLabel = formatXAxis(label);
      
      // Regrouper les données par produit pour pouvoir trier par CA
      const productEntries: Record<string, { productId: string, name: string, revenue: number, margin?: number }> = {};
      
      payload.forEach((entry: any) => {
        const dataKey = entry.dataKey;
        const [type, productId] = dataKey.split('_');
        const productName = data[productId]?.name || 'Produit';
        
        if (!productEntries[productId]) {
          productEntries[productId] = { 
            productId, 
            name: productName, 
            revenue: 0 
          };
        }
        
        if (type === 'revenue') {
          productEntries[productId].revenue = entry.value;
        } else if (type === 'margin') {
          productEntries[productId].margin = entry.value;
        }
      });
      
      // Transformer en tableau et trier par CA (revenue) décroissant
      const sortedEntries = Object.values(productEntries)
        .sort((a, b) => b.revenue - a.revenue);
      
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white mb-2">{formattedLabel}</p>
          <div className="space-y-1">
            {sortedEntries.map((product, index) => {
              const revenueColor = getProductColors[product.productId].revenue;
              const marginColor = getProductColors[product.productId].margin;
              
              return (
                <div key={index}>
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: revenueColor }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {product.name}: {formatTooltipValue(product.revenue)}
                    </span>
                  </div>
                  
                  {product.margin !== undefined && (
                    <div className="flex items-center ml-5 mt-1">
                      <div 
                        className="w-2 h-2 rounded-full mr-2" 
                        style={{ backgroundColor: marginColor }}
                      ></div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Marge: {formatTooltipValue(product.margin)} 
                        ({((product.margin / product.revenue) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    return null;
  };

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

  // Vérifier si des données existent
  if (Object.keys(data).length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-80">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune donnée disponible pour la période sélectionnée
        </p>
      </div>
    );
  }

  return (
    <div className="w-full" style={{ height: '400px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
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
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Pas de légende en mode détaillé */}
          
          {/* Lignes de revenu pour chaque produit */}
          {Object.keys(data).map(productId => (
            <Line 
              key={`revenue_${productId}`}
              type="monotone" 
              dataKey={`revenue_${productId}`}
              name={data[productId].name}
              stroke={getProductColors[productId].revenue}
              strokeWidth={2}
              dot={{ stroke: getProductColors[productId].revenue, fill: '#ffffff', strokeWidth: 2, r: 4 }}
              activeDot={{ stroke: getProductColors[productId].revenue, fill: '#ffffff', strokeWidth: 2, r: 6 }}
            />
          ))}
          
          {/* Lignes de marge pour chaque produit si showMargin est true */}
          {showMargin && Object.keys(data).map(productId => (
            <Line 
              key={`margin_${productId}`}
              type="monotone" 
              dataKey={`margin_${productId}`}
              name={`${data[productId].name} (Marge)`}
              stroke={getProductColors[productId].margin}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ stroke: getProductColors[productId].margin, fill: '#ffffff', strokeWidth: 2, r: 4 }}
              activeDot={{ stroke: getProductColors[productId].margin, fill: '#ffffff', strokeWidth: 2, r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}