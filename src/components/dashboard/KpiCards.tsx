// src/components/dashboard/KpiCards.tsx
import { useState } from 'react';
import { useRevenue } from "@/hooks/useRevenue";
import { useInventoryValuation } from "@/hooks/useInventoryValuation";
import { useSellIn } from "@/hooks/useSellIn"; // Import du nouveau hook
import { FiBarChart2, FiTrendingUp, FiPackage, FiActivity, FiPercent, FiDollarSign, FiInfo, 
         FiBox, FiShoppingCart, FiShoppingBag, FiAlertTriangle, FiHash, FiRepeat } from "react-icons/fi";

// Types pour les props du composant KpiCard
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  change?: {
    value: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
  alternateView?: {
    title?: string;
    subtitle?: string;
    value: string;
    change?: {
      value: string;
      previousValue?: string;
      isPositive: boolean;
    };
  };
  infoTooltip?: string;
}

// Composant pour une carte KPI individuelle
function KpiCard({ 
  icon, 
  title, 
  subtitle, 
  value, 
  change, 
  isLoading, 
  alternateView, 
  infoTooltip 
}: KpiCardProps) {
  // État local pour suivre quel affichage est actif (pourcentage ou montant)
  const [showAlternate, setShowAlternate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Si chargement, afficher un placeholder
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

  // Si pas de vue alternative, afficher une carte simple
  if (!alternateView) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
              {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
          </div>
          
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {infoTooltip}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </div>
        
        {change && (
          <div className="mt-2 flex items-center text-sm">
            <span className={`font-medium ${
              change.isPositive 
                ? 'text-green-500 dark:text-green-400' 
                : 'text-red-500 dark:text-red-400'
            }`}>
              {change.isPositive ? '+' : ''}{change.value}
            </span>
            
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

  // Avec vue alternative, afficher une carte avec boutons de bascule
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {showAlternate && alternateView.title ? alternateView.title : title}
            </h3>
            {showAlternate && alternateView.subtitle 
              ? <p className="text-xs text-gray-500 dark:text-gray-400">{alternateView.subtitle}</p>
              : subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            }
          </div>
        </div>
        
        {/* Section boutons de basculement et info tooltip */}
        <div className="flex items-center space-x-2">
          {/* Boutons de basculement */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setShowAlternate(false)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                !showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title.includes("Stock") ? "Afficher en montant" : "Afficher en pourcentage"}
            >
              {title.includes("Stock") || title.includes("CA") || title === "Ruptures" ? <FiDollarSign size={14} /> : <FiPercent size={14} />}
            </button>
            
            <button
              onClick={() => setShowAlternate(true)}
              className={`flex items-center justify-center p-1.5 rounded-md transition-colors ${
                showAlternate
                  ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title={title.includes("Stock") || title.includes("CA") || title === "Ruptures" ? "Afficher en unités" : "Afficher en montant"}
            >
              {title.includes("Stock") || title.includes("CA") || title === "Ruptures" ? <FiBox size={14} /> : <FiDollarSign size={14} />}
            </button>
          </div>
          
          {/* Info tooltip */}
          {infoTooltip && (
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {infoTooltip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-3xl font-bold text-gray-900 dark:text-white">
        {showAlternate ? alternateView.value : value}
      </div>
      
      {(showAlternate ? alternateView.change : change) && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`font-medium ${
            (showAlternate ? alternateView.change?.isPositive : change?.isPositive) 
              ? 'text-green-500 dark:text-green-400' 
              : 'text-red-500 dark:text-red-400'
          }`}>
            {showAlternate && alternateView.change
              ? (alternateView.change.isPositive ? '+' : '') + alternateView.change.value
              : change && (change.isPositive ? '+' : '') + change.value
            }
          </span>
          
          {(showAlternate && alternateView.change?.previousValue || !showAlternate && change?.previousValue) && (
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({showAlternate && alternateView.change
                ? alternateView.change.previousValue
                : change?.previousValue})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Composant principal pour afficher toutes les cartes KPI
export function KpiCards() {
  const { 
    totalRevenue, 
    totalMargin, 
    totalQuantity, // Nouvelle propriété ajoutée
    marginPercentage, 
    comparison, 
    isLoading: revenueLoading,
    actualDateRange
  } = useRevenue();
  
  // Utilisation du hook pour les stocks
  const { 
    totalStockValueHT, 
    totalUnits, 
    comparison: stockComparison,
    isLoading: stockLoading 
  } = useInventoryValuation();
  
  // Utilisation du hook pour les données de sell-in
  const { 
    totalPurchaseQuantity,
    totalPurchaseAmount,
    totalOrders,
    totalOrderedQuantity,
    totalStockBreakQuantity,
    totalStockBreakAmount,
    stockBreakRate,
    comparison: sellInComparison,
    isLoading: sellInLoading 
  } = useSellIn();
  
  // Données pour le taux de renouvellement (à implémenter ultérieurement)
  const refreshRate = 0;
  const refreshRateLoading = false;

  
  // Formatter pour la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Formatter pour les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };


  const stockBreakAmountChange = sellInComparison ? {
    value: `${sellInComparison.evolution.stockBreakAmount.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(sellInComparison.totalStockBreakAmount),
    isPositive: !sellInComparison.evolution.stockBreakAmount.isPositive // Inverser car une baisse est positive
  } : undefined;

  const stockBreakRateChange = sellInComparison ? {
    value: `${sellInComparison.evolution.stockBreakRate.percentage.toFixed(1)}%`,
    previousValue: `${sellInComparison.stockBreakRate.toFixed(1)}%`,
    isPositive: !sellInComparison.evolution.stockBreakRate.isPositive // Inverser car une baisse est positive
  } : undefined;

  const stockBreakQuantityView = {
    title: "CA en rupture",
    subtitle: "Manque à gagner estimé",
    value: formatCurrency(totalStockBreakAmount),
    change: stockBreakAmountChange
  };
  
  // CA Sell-out (Ventes) - Données réelles
  const revenueChange = comparison ? {
    value: `${comparison.evolution.revenue.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(comparison.totalRevenue),
    isPositive: comparison.evolution.revenue.isPositive
  } : undefined;
  
  // Quantité Sell-out - Vue alternative pour la carte de CA Sell-out
  // Utilisation des quantités réelles maintenant
  const quantitySellOutView = {
    title: "Qte Sell-out",
    subtitle: "Qte vendue",
    value: formatNumber(totalQuantity),
    change: comparison?.evolution?.quantity ? {
      value: `${comparison.evolution.quantity.percentage.toFixed(1)}%`,
      previousValue: formatNumber(comparison.totalQuantity),
      isPositive: comparison.evolution.quantity.isPositive
    } : undefined
  };
  
  // CA Sell-in - Maintenant avec données réelles
  const sellInAmountChange = sellInComparison ? {
    value: `${sellInComparison.evolution.purchaseAmount.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(sellInComparison.totalPurchaseAmount),
    isPositive: sellInComparison.evolution.purchaseAmount.isPositive
  } : undefined;
  
  // Quantité Sell-in - Vue alternative pour la carte de CA Sell-in
  const quantitySellInView = {
    title: "Qte Sell-in",
    subtitle: "Qte achetée",
    value: formatNumber(totalPurchaseQuantity),
    change: sellInComparison ? {
      value: `${sellInComparison.evolution.purchaseQuantity.percentage.toFixed(1)}%`,
      previousValue: formatNumber(sellInComparison.totalPurchaseQuantity),
      isPositive: sellInComparison.evolution.purchaseQuantity.isPositive
    } : undefined
  };
  
  // Vue alternative pour les ruptures en quantité
  const stockoutsQuantityView = {
    title: "Qte en rupture",
    subtitle: "Quantité indisponible",
    value: formatNumber(0), // À implémenter ultérieurement
    // Pas de comparaison disponible pour le moment
  };
  
  // Vue alternative pour les références vendues
  const soldReferencesWithSalesView = {
    title: "Réferences actives",
    subtitle: "Avec ventes",
    value: formatNumber(0), // À implémenter ultérieurement
    // Pas de comparaison disponible pour le moment
  };
  
  // Vue alternative pour le taux de renouvellement
  const refreshRateDetailView = {
    title: "Taux renouvellement",
    subtitle: "Produits récents vs total",
    value: `${refreshRate.toFixed(1)}%`,
    // Pas de comparaison disponible pour le moment
  };
  
  // Marge (montant) - Vue alternative pour la carte de marge
  const marginMoneyView = {
    title: "Marge",
    value: formatCurrency(totalMargin),
    change: comparison ? {
      value: `${comparison.evolution.margin.percentage.toFixed(1)}%`,
      previousValue: formatCurrency(comparison.totalMargin),
      isPositive: comparison.evolution.margin.isPositive
    } : undefined
  };
  
  // Marge (pourcentage) - Vue principale
  const marginPercentChange = comparison ? {
    value: `${comparison.evolution.marginPercentage.points.toFixed(1)} pts`,
    previousValue: `${comparison.marginPercentage.toFixed(1)}%`,
    isPositive: comparison.evolution.marginPercentage.isPositive
  } : undefined;
  
  // Stock en montant - Vue principale
  const stockChange = stockComparison ? {
    value: `${stockComparison.evolution.stockValue.percentage.toFixed(1)}%`,
    previousValue: formatCurrency(stockComparison.totalStockValueHT),
    isPositive: stockComparison.evolution.stockValue.isPositive
  } : undefined;
  
  // Stock en unités - Vue alternative
  const stockUnitsView = {
    title: "Stock",
    subtitle: "En unités",
    value: formatNumber(totalUnits),
    change: stockComparison ? {
      value: `${stockComparison.evolution.units.percentage.toFixed(1)}%`,
      previousValue: formatNumber(stockComparison.totalUnits),
      isPositive: stockComparison.evolution.units.isPositive
    } : undefined
  };
  
  // Calcul de la rotation du stock
  const daysInPeriod = actualDateRange?.days || 30;
  const dailyRevenue = totalRevenue / daysInPeriod;
  const annualizedRevenue = dailyRevenue * 365;
  const rotation = totalStockValueHT > 0 ? annualizedRevenue / totalStockValueHT : 0;
  
  // Calcul de la rotation précédente si les données sont disponibles
  let previousRotation: number | undefined;
  let rotationChange: {
    value: string;
    previousValue: string;
    isPositive: boolean;
  } | undefined;
  
  if (comparison && stockComparison) {
    const previousDailyRevenue = comparison.totalRevenue / (comparison.actualDateRange?.days || 30);
    const previousAnnualizedRevenue = previousDailyRevenue * 365;
    previousRotation = stockComparison.totalStockValueHT > 0 
      ? previousAnnualizedRevenue / stockComparison.totalStockValueHT 
      : 0;
    
    const rotationDiff = rotation - previousRotation;
    const rotationPerc = previousRotation !== 0 
      ? (rotationDiff / previousRotation) * 100 
      : 0;
    
    rotationChange = {
      value: `${rotationPerc.toFixed(1)}%`,
      previousValue: `${previousRotation.toFixed(1)}x`,
      isPositive: rotationDiff > 0
    };
  }
  
  // Description de la rotation pour l'infobulle
  const rotationTooltip = "La rotation du stock est calculée en divisant le chiffre d'affaires annualisé par la valeur du stock. Elle indique combien de fois le stock est renouvelé en une année.";
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* CA Sell-out */}
      <KpiCard
        icon={<FiShoppingBag size={24} />}
        title="CA Sell-out"
        subtitle="Montant des ventes"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        alternateView={quantitySellOutView}
        isLoading={revenueLoading}
      />
      
      {/* CA Sell-in - Maintenant avec données réelles */}
      <KpiCard
        icon={<FiShoppingCart size={24} />}
        title="CA Sell-in"
        subtitle="Montant d'achats"
        value={formatCurrency(totalPurchaseAmount)}
        change={sellInAmountChange}
        alternateView={quantitySellInView}
        isLoading={sellInLoading}
        infoTooltip="Montant total des achats (produits reçus) sur la période sélectionnée."
      />
      
      {/* Ruptures - À implémenter ultérieurement */}
      <KpiCard
        icon={<FiAlertTriangle size={24} />}
        title="Taux rupture"
        subtitle="% des commandes non satisfaites"
        value={`${stockBreakRate.toFixed(1)}%`}
        change={stockBreakRateChange}
        alternateView={stockBreakQuantityView}
        isLoading={sellInLoading}
        infoTooltip="Pourcentage des produits commandés mais non livrés par les fournisseurs. Le manque à gagner est estimé selon les prix de vente actuels."
      />
      
      {/* Marge */}
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Marge"
        value={`${marginPercentage.toFixed(1)}%`}
        change={marginPercentChange}
        alternateView={marginMoneyView}
        isLoading={revenueLoading}
      />
      
      {/* Stock */}
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock"
        subtitle="Valorisé en PMP HT"
        value={formatCurrency(totalStockValueHT)}
        change={stockChange}
        alternateView={stockUnitsView}
        isLoading={stockLoading}
      />
      
      {/* Rotation */}
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={rotationChange}
        isLoading={revenueLoading || stockLoading}
        infoTooltip={rotationTooltip}
      />
      
      {/* Commandes - Nouvelle carte pour les commandes */}
      <KpiCard
        icon={<FiHash size={24} />}
        title="Commandes"
        subtitle="Nombre de commandes"
        value={formatNumber(totalOrders)}
        change={sellInComparison ? {
          value: `${sellInComparison.evolution.orders.percentage.toFixed(1)}%`,
          previousValue: formatNumber(sellInComparison.totalOrders),
          isPositive: sellInComparison.evolution.orders.isPositive
        } : undefined}
        isLoading={sellInLoading}
        infoTooltip="Nombre total de commandes passées sur la période sélectionnée."
      />
      
      {/* Taux de renouvellement - À implémenter ultérieurement */}
      <KpiCard
        icon={<FiRepeat size={24} />}
        title="Nouveautés"
        subtitle="% du CA des 3 derniers mois"
        value={`${refreshRate.toFixed(1)}%`}
        alternateView={refreshRateDetailView}
        isLoading={refreshRateLoading}
        infoTooltip="Pourcentage du chiffre d'affaires réalisé par des produits introduits dans les 3 derniers mois."
      />
    </div>
  );
}