// src/components/dashboard/KpiCards.tsx - version mise à jour
import { useRevenue } from "@/hooks/useRevenue";
import { FiBarChart2, FiTrendingUp, FiPackage, FiActivity } from "react-icons/fi";

function KpiCard({ icon, title, value, change, isLoading }: KpiCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center mb-4">
        <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </div>
      {change && (
        <div className="mt-2 flex items-center text-sm">
          {/* Affichage du pourcentage d'évolution */}
          <span className={`font-medium ${
            change.isPositive 
              ? 'text-green-500 dark:text-green-400' 
              : 'text-red-500 dark:text-red-400'
          }`}>
            {change.isPositive ? '+' : ''}{change.value}
          </span>
          
          {/* Affichage du montant de la période précédente */}
          {change.previousValue && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({change.previousValue})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Mise à jour de l'interface pour inclure la valeur précédente
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: {
    value: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
}

// Mise à jour de KpiCards pour passer les valeurs de période précédente
export function KpiCards() {
  const { 
    totalRevenue, 
    totalMargin, 
    marginPercentage, 
    comparison, 
    isLoading 
  } = useRevenue();
  
  // Formatter pour la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // CA - Données réelles
  const revenueChange = comparison ? {
    value: `${comparison.evolution.revenue.percentage}%`,
    previousValue: formatCurrency(comparison.totalRevenue),
    isPositive: comparison.evolution.revenue.isPositive
  } : undefined;
  
  // Marge - Maintenant avec des données réelles
  const marginChange = comparison ? {
    value: `${comparison.evolution.marginPercentage.percentage}%`,
    previousValue: `${comparison.marginPercentage}%`,
    isPositive: comparison.evolution.marginPercentage.isPositive
  } : undefined;
  
  // Stock - Simulation complète (pas encore de données réelles)
  const stock = 45000; // valeur simulée  
  const stockPrevious = stock * 1.021; // simulation: 2.1% de plus
  const stockChange = {
    value: `${((stock / stockPrevious - 1) * 100).toFixed(1)}%`,
    previousValue: formatCurrency(stockPrevious),
    isPositive: stock < stockPrevious // Moins de stock est positif (moins d'immobilisation)
  };
  
  // Rotation - Simulation complète (pas encore de données réelles)
  const rotation = 6.8; // valeur simulée
  const rotationPrevious = rotation - 0.5; // simulation: 0.5 de moins
  const rotationChange = {
    value: `${(rotation - rotationPrevious).toFixed(1)}x`,
    previousValue: `${rotationPrevious.toFixed(1)}x`,
    isPositive: rotation > rotationPrevious
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KpiCard
        icon={<FiBarChart2 size={24} />}
        title="Ventes"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Marge"
        value={`${marginPercentage.toFixed(1)}%`}
        change={marginChange}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock"
        value={formatCurrency(stock)}
        change={stockChange}
        isLoading={isLoading}
      />
      
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={rotationChange}
        isLoading={isLoading}
      />
    </div>
  );
}