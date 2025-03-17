// src/components/dashboard/products/ProductSalesEvolution.tsx
import { useState, useEffect, useMemo } from 'react';
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
import { Product } from '@/services/productService';
import { useDateRange } from '@/contexts/DateRangeContext';
import { usePharmacySelection } from '@/providers/PharmacyProvider';

type IntervalType = 'day' | 'week' | 'month';

interface ProductSalesEvolutionProps {
  products: Product[];
  isLoading?: boolean;
}

// Interface pour les données d'un point dans le graphique
interface ChartDataPoint {
  period: string;
  total: number;
  [key: string]: any; // Pour les ventes individuelles par produit
}

export function ProductSalesEvolution({ products, isLoading = false }: ProductSalesEvolutionProps) {
  const [interval, setInterval] = useState<IntervalType>('day');
  const [showIndividualProducts, setShowIndividualProducts] = useState(false);
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
        
        // Ajouter les IDs de produits
        const productIds = products.map(p => p.id || p.product_id);
        productIds.forEach(id => {
          if (id) params.append('productIds', id);
        });
        
        // Ajouter les IDs de pharmacies sélectionnées
        if (selectedPharmacyIds.length > 0) {
          selectedPharmacyIds.forEach(id => {
            params.append('pharmacyIds', id);
          });
        }
        
        // Dans un environnement réel, vous feriez un appel API ici:
        // const response = await fetch(`/api/products/sales-evolution?${params}`);
        // const data = await response.json();
        
        // Simulons une réponse d'API avec des données fictives
        const simulatedData = generateSimulatedData(products, interval, startDate, endDate);
        
        setChartData(simulatedData);
      } catch (error) {
        console.error('Erreur lors de la récupération des données d\'évolution:', error);
        // En cas d'erreur, garder les données précédentes
      } finally {
        setDataIsLoading(false);
      }
    };

    fetchSalesData();
  }, [products, interval, startDate, endDate, selectedPharmacyIds]);

  // Générer des données simulées (à remplacer par l'appel API réel)
  const generateSimulatedData = (
    products: Product[],
    interval: IntervalType,
    startDateStr: string,
    endDateStr: string
  ): ChartDataPoint[] => {
    const result: ChartDataPoint[] = [];
    
    // Parse des dates
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    
    // Générer les périodes en fonction de l'intervalle
    const periods: string[] = [];
    
    if (interval === 'day') {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        periods.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else if (interval === 'week') {
      // Simplification: considère une semaine comme 7 jours à partir du début
      let currentDate = new Date(startDate);
      let weekIndex = 1;
      while (currentDate <= endDate) {
        periods.push(`${currentDate.getFullYear()}-${String(weekIndex).padStart(2, '0')}`);
        currentDate.setDate(currentDate.getDate() + 7);
        weekIndex++;
      }
    } else { // month
      const startMonth = startDate.getMonth();
      const startYear = startDate.getFullYear();
      const endMonth = endDate.getMonth();
      const endYear = endDate.getFullYear();
      
      let year = startYear;
      let month = startMonth;
      
      while (year < endYear || (year === endYear && month <= endMonth)) {
        periods.push(`${year}-${String(month + 1).padStart(2, '0')}`);
        month++;
        if (month > 11) {
          month = 0;
          year++;
        }
      }
    }
    
    // Générer des données pour chaque période
    periods.forEach((period, periodIndex) => {
      const dataPoint: ChartDataPoint = { period, total: 0 };
      
      // Valeur de base pour cette période (croissance linéaire + un peu d'aléatoire)
      const baseTrend = 1000 + (periodIndex * 100) + (Math.random() * 200 - 100);
      
      // Générer des données pour chaque produit
      products.forEach(product => {
        const productId = product.id || product.product_id;
        if (!productId) return;
        
        // Simuler une valeur unique pour ce produit et cette période
        // basée sur le prix et la popularité (quantité en stock comme proxy)
        const price = product.price_with_tax || 50;
        const popularity = Math.min(product.current_stock || 10, 100) / 100;
        
        // Valeur de vente simulée: prix × popularité × facteur périodique avec variation aléatoire
        const sales = price * popularity * (0.8 + (periodIndex * 0.05)) * (0.9 + Math.random() * 0.4);
        const roundedSales = Math.round(sales * 10) / 10;
        
        // Stocker la valeur individuelle du produit
        dataPoint[productId] = roundedSales;
        
        // Ajouter au total
        dataPoint.total += roundedSales;
      });
      
      // Arrondir le total
      dataPoint.total = Math.round(dataPoint.total);
      
      result.push(dataPoint);
    });
    
    return result;
  };

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
    const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#14b8a6', '#a855f7', '#d97706'];
    return colors[index % colors.length];
  };
  
  // Calculer la tendance (% d'évolution)
  const trend = useMemo(() => {
    if (chartData.length < 2) {
      return { value: '0.0', isPositive: true };
    }
    
    const firstValue = chartData[0]?.total || 0;
    const lastValue = chartData[chartData.length - 1]?.total || 0;
    
    const change = lastValue - firstValue;
    const percentChange = firstValue !== 0 ? (change / firstValue) * 100 : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      isPositive: percentChange >= 0
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
              {products.length} produit(s) sélectionné(s) · Tendance : 
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
          {/* Toggle pour afficher les produits individuellement */}
          <button
            onClick={() => setShowIndividualProducts(!showIndividualProducts)}
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              showIndividualProducts 
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            <span className="w-3 h-3 rounded-full bg-purple-500 dark:bg-purple-400 mr-1"></span>
            Détails par produit
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
                {/* Gradient pour le total */}
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                </linearGradient>
                
                {/* Gradients pour les produits individuels */}
                {showIndividualProducts && products.slice(0, 10).map((product, index) => {
                  const productId = product.id || product.product_id;
                  if (!productId) return null;
                  
                  return (
                    <linearGradient 
                      key={productId} 
                      id={`color${productId}`} 
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
              
              {/* Afficher les produits individuels si l'option est activée */}
              {showIndividualProducts && products.slice(0, 10).map((product, index) => {
                const productId = product.id || product.product_id;
                if (!productId) return null;
                
                return (
                  <Area 
                    key={productId}
                    type="monotone" 
                    dataKey={productId} 
                    name={product.display_name || product.name || `Produit ${index + 1}`} 
                    stroke={getProductColor(index)} 
                    fillOpacity={0.4}
                    fill={`url(#color${productId})`} 
                    strokeWidth={1.5}
                    dot={{ stroke: getProductColor(index), fill: '#ffffff', strokeWidth: 2, r: 3 }}
                    activeDot={{ stroke: getProductColor(index), fill: '#ffffff', strokeWidth: 2, r: 5 }}
                  />
                );
              })}
              
              {/* Toujours afficher le total */}
              <Area 
                type="monotone" 
                dataKey="total" 
                name="Total" 
                stroke="#0ea5e9" 
                fillOpacity={0.6}
                fill="url(#colorTotal)" 
                strokeWidth={2}
                dot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 4 }}
                activeDot={{ stroke: '#0ea5e9', fill: '#ffffff', strokeWidth: 2, r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Statistiques récapitulatives */}
      {chartData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total des ventes</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatTooltipValue(chartData.reduce((sum, item) => sum + item.total, 0))}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Moyenne par période</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {formatTooltipValue(chartData.reduce((sum, item) => sum + item.total, 0) / chartData.length)}
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Évolution</div>
            <div className={`text-xl font-bold ${
              trend.isPositive 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-red-500 dark:text-red-400'
            }`}>
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}