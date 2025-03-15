// src/components/dashboard/SalesDistribution.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { FiBarChart2, FiHeart, FiPackage } from 'react-icons/fi';
import { useSalesDistribution } from '@/hooks/useSalesDistribution';

// Couleurs pour le graphique
const COLORS = {
  medicaments: '#0088FE',
  parapharmacie: '#10B981'
};

// Formatage des nombres
const formatNumber = (num: number) => {
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('fr-FR').format(Math.round(num));
};

// Formatage des grands nombres avec suffixes (k, M, etc)
const formatLargeNumber = (num: number) => {
  if (isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mrd`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} k`;
  } else {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
  }
};


// Formatage des pourcentages
const formatPercent = (num: number) => {
  if (isNaN(num)) return '0,0%';
  return `${new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(num)}%`;
};

export function SalesDistribution() {
  const { distributions, isLoading, error } = useSalesDistribution();
  
  // État de chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-red-500 dark:text-red-400">
          <div className="p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <h3 className="text-lg font-medium">Erreur de chargement des données</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">{error}</p>
      </div>
    );
  }

  // Vérifier que les données existent
  if (!distributions || distributions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4 text-yellow-500">
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-300 mr-3">
            <FiBarChart2 size={20} />
          </div>
          <h3 className="text-lg font-medium">Aucune donnée disponible</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300">Aucune donnée de répartition des ventes n'est disponible pour la période sélectionnée.</p>
      </div>
    );
  }

  // Trouver les données pour médicaments et parapharmacie
  const medicamentsData = distributions.find(d => d.category === 'Médicaments') || {
    category: 'Médicaments',
    total_revenue: 0,
    total_margin: 0,
    margin_percentage: 0,
    total_quantity: 0,
    revenue_percentage: 0
  };
  
  const parapharmacieData = distributions.find(d => d.category === 'Parapharmacie') || {
    category: 'Parapharmacie',
    total_revenue: 0,
    total_margin: 0,
    margin_percentage: 0,
    total_quantity: 0,
    revenue_percentage: 0
  };

  // Calcul du total pour les KPIs - en utilisant des valeurs numériques, pas des chaînes
  const totalRevenue = Number(medicamentsData.total_revenue) + Number(parapharmacieData.total_revenue);
  const totalMargin = Number(medicamentsData.total_margin) + Number(parapharmacieData.total_margin);
  const totalMarginPercentage = totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0;
  const totalQuantity = Number(medicamentsData.total_quantity) + Number(parapharmacieData.total_quantity);

  // Formatage des données pour les graphiques à barres
  const barData = [
    {
      name: 'Médicaments',
      value: Number(medicamentsData.revenue_percentage),
      revenue: Number(medicamentsData.total_revenue),
      quantity: Number(medicamentsData.total_quantity),
      margin: Number(medicamentsData.total_margin),
      marginPercentage: Number(medicamentsData.margin_percentage),
      fill: COLORS.medicaments
    },
    {
      name: 'Parapharmacie',
      value: Number(parapharmacieData.revenue_percentage),
      revenue: Number(parapharmacieData.total_revenue),
      quantity: Number(parapharmacieData.total_quantity),
      margin: Number(parapharmacieData.total_margin),
      marginPercentage: Number(parapharmacieData.margin_percentage),
      fill: COLORS.parapharmacie
    }
  ];

  // Personnalisation du tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="font-medium text-gray-900 dark:text-white mb-1">{data.name}</div>
          <div className="text-gray-600 dark:text-gray-300">CA: {formatLargeNumber(data.revenue)}</div>
          <div className="text-gray-600 dark:text-gray-300">Marge: {formatLargeNumber(data.margin)} ({formatPercent(data.marginPercentage)})</div>
          <div className="text-gray-600 dark:text-gray-300">Quantité: {formatLargeNumber(data.quantity)} unités</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
          <FiBarChart2 size={20} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Répartition des ventes
        </h2>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">CA Total</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatLargeNumber(totalRevenue)}</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Marge Totale</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatLargeNumber(totalMargin)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(totalMarginPercentage)} du CA</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantité Totale</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{formatLargeNumber(totalQuantity)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">unités</div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Catégories</div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">2</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Méd. / Parapharmacie</div>
        </div>
      </div>

      {/* Graphique à barres */}
      <div className="mb-6">
        <div style={{ width: '100%', height: 100 }}>
          <ResponsiveContainer>
            <BarChart
              layout="vertical"
              data={barData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
              <YAxis type="category" dataKey="name" width={110} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" nameKey="name" barSize={30} radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <LabelList 
                    key={`label-${index}`}
                    dataKey="value" 
                    position="insideRight" 
                    formatter={(value: number) => formatPercent(value)} 
                    fill="#FFFFFF" 
                    fontSize={12} 
                    fontWeight="bold" 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Détails des catégories - Cartes plus compactes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center mb-3">
            <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-300 mr-2">
              <FiHeart size={16} />
            </div>
            <h3 className="text-base font-medium text-blue-700 dark:text-blue-300">Médicaments</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">CA:</span>{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formatLargeNumber(Number(medicamentsData.total_revenue))}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(Number(medicamentsData.revenue_percentage))} du total</div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Marge:</span>{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatLargeNumber(Number(medicamentsData.total_margin))}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(Number(medicamentsData.margin_percentage))} du CA</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Quantité:</span>{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formatLargeNumber(Number(medicamentsData.total_quantity))} unités</span>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center mb-3">
            <div className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-300 mr-2">
              <FiPackage size={16} />
            </div>
            <h3 className="text-base font-medium text-emerald-700 dark:text-emerald-300">Parapharmacie</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">CA:</span>{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formatLargeNumber(Number(parapharmacieData.total_revenue))}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(Number(parapharmacieData.revenue_percentage))} du total</div>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Marge:</span>{' '}
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatLargeNumber(Number(parapharmacieData.total_margin))}</span>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatPercent(Number(parapharmacieData.margin_percentage))} du CA</div>
            </div>
            <div className="col-span-2">
              <span className="text-gray-500 dark:text-gray-400">Quantité:</span>{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{formatLargeNumber(Number(parapharmacieData.total_quantity))} unités</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}