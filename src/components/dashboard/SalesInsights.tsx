// src/components/dashboard/SalesInsights.tsx - version corrigée pour l'addition
import React, { useMemo } from 'react';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiBarChart2 } from 'react-icons/fi';

interface SalesInsightsProps {
  data: Array<{
    period: string;
    revenue: number;
    margin: number;
    margin_percentage: number;
  }>;
  interval: 'day' | 'week' | 'month';
}

export function SalesInsights({ data, interval }: SalesInsightsProps) {
  // Formater les montants en euros
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formater les dates selon l'intervalle
  const formatPeriodLabel = (period: string, intervalType: 'day' | 'week' | 'month') => {
    if (!period) return '';
    
    try {
      const parts = period.split('-');
      
      if (intervalType === 'day') {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      } else if (intervalType === 'week') {
        return `Semaine ${parts[1]} de ${parts[0]}`;
      } else if (intervalType === 'month') {
        const monthNames = [
          'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
          'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];
        const monthIndex = parseInt(parts[1]) - 1;
        return `${monthNames[monthIndex]} ${parts[0]}`;
      }
      
      return period;
    } catch (e) {
      return period;
    }
  };

  // Calculer les insights de façon fiable
  const insights = useMemo(() => {
    // Vérifier que les données existent et sont un tableau non vide
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }
    
    try {
      // Copier les données pour ne pas altérer l'original
      const dataPoints = [...data];
      
      // Trouver meilleure et pire période en termes de CA
      const sortedByRevenue = [...dataPoints].sort((a, b) => Number(b.revenue) - Number(a.revenue));
      const bestPeriod = sortedByRevenue[0];
      const worstPeriod = sortedByRevenue[sortedByRevenue.length - 1];
      
      // Calculer totaux et moyennes
      // Initialiser les totaux à 0 avec des nombres explicites
      let totalRevenue = 0; 
      let totalMargin = 0;
      
      for (const point of dataPoints) {
        // Forcer la conversion en nombre avant d'additionner
        totalRevenue = totalRevenue + Number(point.revenue);
        totalMargin = totalMargin + Number(point.margin);
      }

      console.log('totalRevenue:', totalRevenue);
      console.log('totalMargin:', totalMargin);
      
      const count = dataPoints.length;
      const avgRevenue = totalRevenue / count;
      const avgMargin = totalMargin / count;
      
      // Calculer le taux de marge moyen global (en pourcentage)
      const avgMarginPercent = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
      
      return {
        bestPeriod,
        worstPeriod,
        avgRevenue,
        avgMargin,
        avgMarginPercent
      };
    } catch (error) {
      console.error("Erreur lors du calcul des insights:", error);
      return null;
    }
  }, [data]);

  // Si pas d'insights valides, ne rien afficher
  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {/* Meilleure période */}
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
          {formatCurrency(Number(insights.bestPeriod.revenue))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <FiCalendar size={12} className="inline mr-1" />
          {formatPeriodLabel(insights.bestPeriod.period, interval)}
        </div>
      </div>
      
      {/* Période la moins performante */}
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
          {formatCurrency(Number(insights.worstPeriod.revenue))}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <FiCalendar size={12} className="inline mr-1" />
          {formatPeriodLabel(insights.worstPeriod.period, interval)}
        </div>
      </div>
      
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
          {formatCurrency(insights.avgRevenue)}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">CA moyen</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
            {formatCurrency(insights.avgMargin)}
            <span className="ml-1 text-xs font-normal">marge moyenne</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {insights.avgMarginPercent.toFixed(1)}% du CA
          </div>
        </div>
      </div>
    </div>
  );
}