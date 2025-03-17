// src/components/dashboard/products/ProductSalesEvolutionChart.tsx
import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FiTrendingUp, FiArrowUpRight, FiArrowDownRight, FiBarChart2, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { Product } from '@/services/productService';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

type IntervalType = 'day' | 'week' | 'month';

interface ProductSalesEvolutionChartProps {
  products: Product[];
  isLoading?: boolean;
}

// Interface pour les données d'un point dans le graphique
interface ChartDataPoint {
  period: string;
  totalRevenue: number;
  totalMargin: number;
  [key: string]: any; // Pour les ventes individuelles par produit
}

export function ProductSalesEvolutionChart({ products, isLoading = false }: ProductSalesEvolutionChartProps) {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showDetailMode, setShowDetailMode] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [dataIsLoading, setDataIsLoading] = useState(false);
  
  // Accéder au contexte de date et de sélection de pharmacie
  const { startDate, endDate } = useDateRange();
  const { selectedPharmacyIds } = usePharmacySelection();

  // Récupérer les données d'évolution des ventes
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!products || products.length === 0 || !startDate || !endDate) {
        return;
      }

      setDataIsLoading(true);
      
      try {
        // Construction des paramètres pour l'API
        const params = new URLSearchParams({
          startDate,
          endDate,
          interval
        });
        
        // Ajouter les IDs de pharmacies sélectionnées
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Récupérer les données d'évolution globales via l'API
        const response = await fetch(`/api/sales/evolution?${params}`);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Transformer les données pour notre graphique
        const formattedData = result.data.map((item: any) => {
          // Point de données de base avec le total
          const dataPoint: ChartDataPoint = {
            period: item.period,
            totalRevenue: Number(item.revenue) || 0,
            totalMargin: Number(item.margin) || 0
          };
          
          // Simuler des données individuelles pour chaque produit
          // Dans une implémentation réelle, ces données viendraient d'une API spécifique
          products.forEach((product, index) => {
            const productId = product.id || product.product_id;
            if (!productId) return;
            
            // Calculer un facteur de proportion pour ce produit
            // Basé sur le prix relatif du produit par rapport aux autres
            const price = Number(product.price_with_tax) || 50;
            const totalPrice = products.reduce((sum, p) => sum + (Number(p.price_with_tax) || 50), 0);
            const priceFactor = price / (totalPrice / products.length);
            
            // Simuler le revenu pour ce produit (proportionnel au prix avec un peu d'aléatoire)
            const productShare = priceFactor * (0.5 + Math.random() * 0.5);
            const individualRevenue = dataPoint.totalRevenue * productShare / products.length;
            
            // Simuler la marge (entre 20% et 40% du revenu selon le produit)
            const marginRate = 0.2 + (index % 3) * 0.1;
            const individualMargin = individualRevenue * marginRate;
            
            // Ajouter au point de données
            dataPoint[`revenue_${productId}`] = Math.round(individualRevenue);
            dataPoint[`margin_${productId}`] = Math.round(individualMargin);
          });
          
          return dataPoint;
        });
        
        setChartData(formattedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'évolution:', error);
      } finally {
        setDataIsLoading(false);
      }
    };

    fetchSalesData();
  }, [products, interval, startDate, endDate, selectedPharmacyIds]);

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
        // Format YYYY-MM -> MM
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
  
  // Générer des couleurs distinctes pour chaque produit
  const getProductColor = (index: number) => {
    const colors = [
      '#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', 
      '#ec4899', '#06b6d4', '#14b8a6', '#a855f7', '#d97706'
    ];
    return colors[index % colors.length];
  };
  
  // Personnaliser le tooltip du graphique
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const formattedLabel = formatXAxis(label);
    
    return (
      <div className="p-3 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
        <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">{formattedLabel}</h5>
        
        <div className="space-y-1.5">
          {!showDetailMode && (
            <>
              {payload.map((entry: any, index: number) => {
                const { name, value, color } = entry;
                
                // Déterminer si c'est le revenu ou la marge
                const isRevenue = name === 'CA';
                const isMargin = name === 'Marge';
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{name}</span>
                    </div>
                    <span className={`text-sm font-medium ${
                      isMargin ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-800 dark:text-gray-200'
                    }`}>
                      {formatTooltipValue(value)}
                    </span>
                  </div>
                );
              })}
            </>
          )}
          
          {showDetailMode && (
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {payload.map((entry: any, index: number) => {
                const { name, value, color, dataKey } = entry;
                
                // Ne traiter que les entrées de revenus des produits individuels
                if (!dataKey.startsWith('revenue_')) return null;
                
                // Extraire l'ID du produit depuis dataKey
                const productId = dataKey.replace('revenue_', '');
                
                // Trouver les données de marge correspondantes
                const marginEntry = payload.find((p: any) => p.dataKey === `margin_${productId}`);
                const marginValue = marginEntry ? marginEntry.value : 0;
                
                // Trouver le produit correspondant
                const product = products.find(p => (p.id || p.product_id) === productId);
                if (!product) return null;
                
                const displayName = product.display_name || product.name || 'Produit';
                
                return (
                  <div key={index} className="flex flex-col pb-1.5 border-b border-gray-200 dark:border-gray-700 last:border-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center">
                        <div 
                          className="w-2.5 h-2.5 rounded-full mr-2" 
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium truncate max-w-44">
                          {displayName}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs ml-4">
                      <span className="text-gray-500 dark:text-gray-400">CA:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {formatTooltipValue(value)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs ml-4">
                      <span className="text-gray-500 dark:text-gray-400">Marge:</span>
                      <span className="text-emerald-500 dark:text-emerald-400 font-medium">
                        {formatTooltipValue(marginValue)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Calculer des statistiques sur les données du graphique
  const salesStats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return {
        trend: { value: '0.0', isPositive: true },
        bestPeriod: null,
        worstPeriod: null,
        avgRevenue: 0
      };
    }
    
    // Calculer la tendance
    const firstValue = chartData[0]?.totalRevenue || 0;
    const lastValue = chartData[chartData.length - 1]?.totalRevenue || 0;
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    // Trouver la meilleure et la pire période
    let bestPeriod = chartData[0];
    let worstPeriod = chartData[0];
    let totalRevenue = 0;
    
    chartData.forEach(item => {
      totalRevenue += item.totalRevenue;
      
      if (item.totalRevenue > bestPeriod.totalRevenue) {
        bestPeriod = item;
      }
      
      if (item.totalRevenue < worstPeriod.totalRevenue) {
        worstPeriod = item;
      }
    });
    
    // Calculer la moyenne
    const avgRevenue = totalRevenue / chartData.length;
    
    return {
      trend: {
        value: Math.abs(percentChange).toFixed(1),
        isPositive: percentChange >= 0
      },
      bestPeriod,
      worstPeriod,
      avgRevenue
    };
  }, [chartData]);

  // État de chargement combiné (chargement initial + chargement des données)
  const showLoading = isLoading || dataIsLoading;

  // Composant de chargement
  if (showLoading) {
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

  // Si aucun produit n'est sélectionné
  if (!products || products.length === 0) {
    return null;
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
              {products.length} produit(s) · Tendance : 
              <span className={`font-medium ml-1 flex items-center ${
                salesStats.trend.isPositive 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {salesStats.trend.isPositive ? <FiArrowUpRight className="mr-1" /> : <FiArrowDownRight className="mr-1" />}
                {salesStats.trend.value}%
              </span>
            </div>
          </div>
        </div>

        {/* Options du graphique */}
        <div className="flex flex-wrap gap-3">
          {/* Toggle pour afficher le détail */}
          <button
            onClick={() => setShowDetailMode(!showDetailMode)}
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              showDetailMode 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 mr-1"></span>
            Détail par produit
          </button>
          
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

      {/* Conteneur du graphique avec une hauteur fixe */}
      <div className="w-full" style={{ height: '400px' }}>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">
              Aucune donnée disponible pour les produits sélectionnés
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
            >
              <defs>
                {/* Gradients pour les totaux */}
                <linearGradient id="colorTotalRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorTotalMargin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                
                {/* Gradients pour les produits individuels */}
                {products.map((product, index) => {
                  const productId = product.id || product.product_id;
                  if (!productId) return null;
                  
                  return (
                    <linearGradient 
                      key={`gradient-revenue-${productId}`} 
                      id={`colorRevenue${productId}`} 
                      x1="0" 
                      y1="0" 
                      x2="0" 
                      y2="1"
                    >
                      <stop offset="5%" stopColor={getProductColor(index)} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={getProductColor(index)} stopOpacity={0.1}/>
                    </linearGradient>
                  );
                })}
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
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              {/* Afficher le total ou les produits individuels selon le mode */}
              {!showDetailMode ? (
                // Mode totaux
                <>
                  <Area 
                    type="monotone" 
                    dataKey="totalRevenue" 
                    name="CA" 
                    stroke="#0ea5e9" 
                    fillOpacity={0.6}
                    fill="url(#colorTotalRevenue)" 
                    strokeWidth={2}
                    dot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalMargin" 
                    name="Marge" 
                    stroke="#10b981" 
                    fillOpacity={0.6}
                    fill="url(#colorTotalMargin)" 
                    strokeWidth={2}
                    dot={{ stroke: '#10b981', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ stroke: '#10b981', fill: '#ffffff', strokeWidth: 2, r: 6 }}
                  />
                </>
              ) : (
                // Mode détail par produit - pas de légende
                products.map((product, index) => {
                  const productId = product.id || product.product_id;
                  if (!productId) return null;
                  
                  const displayName = product.display_name || product.name || `Produit ${index + 1}`;
                  
                  return (
                    <Area 
                      key={`revenue-${productId}`}
                      type="monotone" 
                      dataKey={`revenue_${productId}`} 
                      name={displayName}
                      stroke={getProductColor(index)} 
                      fillOpacity={0.5}
                      fill={`url(#colorRevenue${productId})`} 
                      strokeWidth={1.5}
                      legendType="none" // Cacher de la légende
                      dot={false}
                      activeDot={{ stroke: getProductColor(index), fill: '#ffffff', strokeWidth: 2, r: 5 }}
                    />
                  );
                })
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistiques d'analyse des ventes */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Meilleure période */}
          {salesStats.bestPeriod && (
            <div className="bg-white dark:bg-gray-800/70 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mr-2">
                  <FiTrendingUp size={16} />
                </div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Meilleure {interval === 'day' ? 'journée' : interval === 'week' ? 'semaine' : 'mois'}
                </h3>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {formatTooltipValue(salesStats.bestPeriod.totalRevenue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <FiCalendar size={12} className="inline mr-1" />
                {formatXAxis(salesStats.bestPeriod.period)}
              </div>
            </div>
          )}
          
          {/* Période la moins performante */}
          {salesStats.worstPeriod && (
            <div className="bg-white dark:bg-gray-800/70 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-2">
                <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mr-2">
                  <FiTrendingDown size={16} />
                </div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {interval === 'day' ? 'Journée' : interval === 'week' ? 'Semaine' : 'mois'} la moins performante
                </h3>
              </div>
              <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {formatTooltipValue(salesStats.worstPeriod.totalRevenue)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <FiCalendar size={12} className="inline mr-1" />
                {formatXAxis(salesStats.worstPeriod.period)}
              </div>
            </div>
          )}
          
          {/* Moyennes */}
          <div className="bg-white dark:bg-gray-800/70 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-2">
              <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400 mr-2">
                <FiBarChart2 size={16} />
              </div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Moyennes sur la période
              </h3>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              {formatTooltipValue(salesStats.avgRevenue)}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">CA moyen</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {formatTooltipValue(
                  chartData.reduce((sum, item) => sum + item.totalMargin, 0) / chartData.length
                )}
                <span className="ml-1 text-xs font-normal">marge moyenne</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {products.length} produit(s)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}