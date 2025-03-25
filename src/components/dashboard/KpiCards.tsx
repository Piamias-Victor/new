// src/components/dashboard/KpiCards.tsx
import React, { useState } from 'react';
import { FiTrendingUp, FiPackage, FiActivity, FiPercent, FiDollarSign, FiInfo, 
         FiBox, FiShoppingCart, FiShoppingBag, FiAlertTriangle, FiHash, FiRepeat, 
         FiFilter} from "react-icons/fi";
import { useProductFilter } from '@/contexts/ProductFilterContext';
import { FilterBadge } from '@/components/filters/FilterBadge';
import { useRevenueWithFilter } from '@/hooks/useRevenue';
import { useInventoryValuationWithFilter } from '@/hooks/useInventoryValuation';
import { useSellInWithFilter } from '@/hooks/useSellIn';

// Types pour les props du composant KpiCard
interface KpiCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value: string;
  change?: {
    displayValue: string;
    previousValue?: string;
    isPositive: boolean;
  };
  isLoading: boolean;
  alternateView?: {
    title?: string;
    subtitle?: string;
    value: string;
    change?: {
      displayValue: string;
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
  const [showAlternate, setShowAlternate] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const { isFilterActive, selectedCodes } = useProductFilter(); // Ajoutez cette ligne

  console.log('change', change);
  
  // Déterminer la couleur en fonction de isPositive
  const getColorClass = (isPositive: boolean) => {
    return isPositive 
      ? 'text-green-500 dark:text-green-400' 
      : 'text-red-500 dark:text-red-400';
  };

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

  if (!alternateView) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              {icon}
            </div>
            <div>
              <h3 className="font-medium text-sm text-gray-900 dark:text-white">{title}</h3>
              {isFilterActive && <FilterBadge count={selectedCodes.length} size="sm" />}
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
            <span className={`font-medium ${getColorClass(change.isPositive)}`}>
              {change.displayValue}
            </span>
            
            {change?.previousValue && !isNaN(Number(change.previousValue.replace(/[^0-9.-]+/g,''))) && (
              <span className="text-gray-500 dark:text-gray-400 ml-2">
                ({change.previousValue})
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="p-2 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-900 dark:text-white">
              {showAlternate && alternateView.title ? alternateView.title : title}
            </h3>
            {showAlternate && alternateView.subtitle 
              ? <p className="text-xs text-gray-500 dark:text-gray-400">{alternateView.subtitle}</p>
              : subtitle && <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
            }
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setShowAlternate(false)}
              className={`flex text-xs items-center justify-center p-1.5 rounded-md transition-colors ${
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
      
      {/* Partie modifiée pour l'alternateView */}
      {(showAlternate ? alternateView.change : change) && (
        <div className="mt-2 flex items-center text-sm">
          <span className={`font-medium ${
            showAlternate && alternateView.change 
              ? getColorClass(alternateView.change.isPositive)
              : change && getColorClass(change.isPositive)
          }`}>
            {showAlternate && alternateView.change
              ? alternateView.change.displayValue
              : change && change.displayValue
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
  const { isFilterActive, selectedCodes } = useProductFilter(); // Ajoutez cette ligne

  const { 
    totalRevenue, 
    totalMargin, 
    totalQuantity,
    marginPercentage, 
    comparison, 
    uniqueReferences,
    isLoading: revenueLoading,
    actualDateRange
  } = useRevenueWithFilter();
  
  const { 
    totalStockValueHT, 
    totalUnits, 
    comparison: stockComparison,
    stockDays,
    isLoading: stockLoading 
  } = useInventoryValuationWithFilter();
  
  const { 
    totalPurchaseQuantity,
    totalPurchaseAmount,
    totalOrders,
    totalStockBreakQuantity,
    totalStockBreakAmount,
    stockBreakRate,
    comparison: sellInComparison,
    isLoading: sellInLoading 
  } = useSellInWithFilter();

  const tooltips = {
    sellOut: "Montant total des ventes (TTC) réalisées sur la période sélectionnée. Indicateur principal de l'activité commerciale.",
    sellIn: "Montant total des achats (prix d'achat HT) réceptionnés sur la période. Reflète l'approvisionnement réel.",
    stockBreak: "Pourcentage des produits commandés mais non livrés par les fournisseurs. Un taux élevé indique des problèmes d'approvisionnement.",
    margin: "Pourcentage de marge calculé comme (Prix de vente - Prix d'achat) / Prix de vente. Indicateur de rentabilité.",
    stock: "Valeur du stock actuel en prix d'achat HT. Représente l'investissement immobilisé.",
    rotation: "Nombre de fois où le stock est renouvelé par an. Calculé comme (CA annualisé / Valeur du stock). Un ratio élevé indique une gestion efficace.",
    orders: "Nombre total de commandes passées durant la période sélectionnée.",
    references: "Nombre de références produits différentes vendues sur la période. Indicateur de diversité de l'offre."
  };

  
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

  console.log('stockComparison', stockComparison);

  // Préparer les données pour les KPI Cards
  const revenueChange = comparison ? {
    displayValue: comparison.evolution.revenue.displayValue,
    previousValue: formatNumber(comparison.revenue),
    isPositive: comparison.evolution.revenue.isPositive
  } : undefined;
  
  const quantitySellOutView = {
    title: "Qte Sell-out",
    value: formatNumber(totalQuantity),
    change: comparison?.evolution?.quantity ? {
      displayValue: comparison.evolution.quantity.displayValue,
      previousValue: formatNumber(comparison.quantity),
      isPositive: comparison.evolution.quantity.isPositive
    } : undefined
  };
  
  const sellInAmountChange = sellInComparison ? {
    displayValue: sellInComparison.evolution.purchaseAmount.displayValue,
    previousValue: formatCurrency(sellInComparison.purchaseAmount),
    isPositive: sellInComparison.evolution.purchaseAmount.isPositive
  } : undefined;
  
  const quantitySellInView = {
    title: "Qte Sell-in",
    value: formatNumber(totalPurchaseQuantity),
    change: sellInComparison ? {
      displayValue: sellInComparison.evolution.purchaseQuantity.displayValue,
      previousValue: formatNumber(sellInComparison.purchaseQuantity),
      isPositive: sellInComparison.evolution.purchaseQuantity.isPositive
    } : undefined
  };
  
  const stockBreakRateChange = sellInComparison ? {
    displayValue: sellInComparison.evolution.stockBreakRate.displayValue,
    previousValue: `${sellInComparison.stockBreakRate.toFixed(1)}%`,
    isPositive: sellInComparison.evolution.stockBreakRate.isPositive
  } : undefined;

  const stockBreakAmountView = {
    title: "CA en rupture",
    value: formatCurrency(totalStockBreakAmount),
    change: sellInComparison ? {
      displayValue: sellInComparison.evolution.stockBreakAmount.displayValue,
      previousValue: formatCurrency(sellInComparison.stockBreakAmount),
      isPositive: sellInComparison.evolution.stockBreakAmount.isPositive
    } : undefined
  };
  
  const marginPercentChange = comparison ? {
    displayValue: comparison.evolution.marginPercentage.displayValue,
    previousValue: `${comparison.marginPercentage.toFixed(1)}%`,
    isPositive: comparison.evolution.marginPercentage.isPositive
  } : undefined;
  
  const marginMoneyView = {
    title: "Marge €",
    value: formatCurrency(totalMargin),
    change: comparison ? {
      displayValue: comparison.evolution.margin.displayValue,
      previousValue: formatCurrency(comparison.margin),
      isPositive: comparison.evolution.margin.isPositive
    } : undefined
  };
  
  const stockChange = stockComparison ? {
    displayValue: stockComparison.evolution.stockValue.displayValue,
    previousValue: formatCurrency(stockComparison.totalStockValueHT),
    isPositive: stockComparison.evolution.stockValue.isPositive
  } : undefined;
  
  const stockUnitsView = {
    title: "Stock en unités",
    value: formatNumber(totalUnits),
    change: stockComparison ? {
      displayValue: stockComparison.evolution.units.displayValue,
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
  let rotationChange: {
    displayValue: string;
    previousValue: string;
    isPositive: boolean;
  } | undefined;
  
  if (comparison && stockComparison) {
    const previousDailyRevenue = comparison.totalRevenue / (comparison.actualDateRange?.days || 30);
    const previousAnnualizedRevenue = previousDailyRevenue * 365;
    const previousRotation = stockComparison.totalStockValueHT > 0 
      ? previousAnnualizedRevenue / stockComparison.totalStockValueHT 
      : 0;
    
    const rotationDiff = rotation - previousRotation;
    const rotationPerc = previousRotation !== 0 
      ? (rotationDiff / previousRotation) * 100 
      : 0;
    
    rotationChange = {
      displayValue: `${rotationPerc >= 0 ? '+' : ''}${rotationPerc.toFixed(1)}%`,
      previousValue: `${previousRotation.toFixed(1)}x`,
      isPositive: rotationDiff > 0
    };
  }

  const FilterNotification = ({ count }: { count: number }) => {
    return (
      <div className="mb-4 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg p-4">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-800 text-sky-600 dark:text-sky-300 mr-3">
            <FiFilter size={18} />
          </div>
          <div>
            <h3 className="text-base font-medium text-gray-900 dark:text-white">
              Filtre actif sur {count} code{count > 1 ? 's' : ''} EAN
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Les KPIs affichés concernent uniquement les produits sélectionnés.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {isFilterActive && <FilterNotification count={selectedCodes.length} />}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* CA Sell-in */}
      <KpiCard
        icon={<FiShoppingCart size={24} />}
        title="CA Sell-in"
        value={formatCurrency(totalPurchaseAmount)}
        change={sellInAmountChange}
        alternateView={quantitySellInView}
        isLoading={sellInLoading}
        infoTooltip={tooltips.sellIn}
      />

      {/* CA Sell-out */}
      <KpiCard
        icon={<FiShoppingBag size={24} />}
        title="CA Sell-out"
        value={formatCurrency(totalRevenue)}
        change={revenueChange}
        alternateView={quantitySellOutView}
        isLoading={revenueLoading}
        infoTooltip={tooltips.sellOut}
      />
      
      {/* Ruptures */}
      <KpiCard
        icon={<FiAlertTriangle size={24} />}
        title="Taux rupture"
        value={`${stockBreakRate.toFixed(1)}%`}
        change={stockBreakRateChange}
        alternateView={stockBreakAmountView}
        isLoading={sellInLoading}
        infoTooltip={tooltips.stockBreak}
      />
      
      {/* Marge */}
      <KpiCard
        icon={<FiTrendingUp size={24} />}
        title="Taux de marge"
        value={`${marginPercentage.toFixed(1)}%`}
        change={marginPercentChange}
        alternateView={marginMoneyView}
        isLoading={revenueLoading}
        infoTooltip={tooltips.margin}
      />
      
      {/* Stock */}
      <KpiCard
        icon={<FiPackage size={24} />}
        title="Stock €"
        value={formatCurrency(totalStockValueHT)}
        change={stockChange}
        alternateView={stockUnitsView}
        isLoading={stockLoading}
        infoTooltip={tooltips.stock}
      />
      
      {/* Rotation */}
      <KpiCard
        icon={<FiActivity size={24} />}
        title="Rotation"
        value={`${rotation.toFixed(1)}x`}
        change={rotationChange}
        isLoading={revenueLoading || stockLoading}
        infoTooltip={tooltips.rotation}
      />
      
      {/* Commandes */}
      <KpiCard
        icon={<FiHash size={24} />}
        title="Commandes"
        value={formatNumber(totalOrders)}
        change={sellInComparison ? {
          displayValue: sellInComparison.evolution.orders.displayValue,
          previousValue: formatNumber(sellInComparison.totalOrders),
          isPositive: sellInComparison.evolution.orders.isPositive
        } : undefined}
        isLoading={sellInLoading}
        infoTooltip={tooltips.orders}
      />
      
      {/* Références uniques */}
      <KpiCard
        icon={<FiRepeat size={24} />}
        title="Références vendues"
        value={formatNumber(uniqueReferences || 0)}
        change={comparison?.evolution?.uniqueReferences ? {
          displayValue: comparison.evolution.uniqueReferences.displayValue,
          previousValue: formatNumber(comparison.uniqueReferences),
          isPositive: comparison.evolution.uniqueReferences.isPositive
        } : undefined}
        isLoading={revenueLoading}
        infoTooltip={tooltips.references}
      />
    </div>
    </>
    
  );
}