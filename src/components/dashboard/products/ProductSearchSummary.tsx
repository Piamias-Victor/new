import React, { useState } from 'react';
import { FiBox, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp, FiShoppingBag, FiTruck, FiInfo, FiActivity, FiBarChart2 } from 'react-icons/fi';
import { Product } from '@/services/productService';

// Fonction pour formater les grands nombres de manière lisible
function formatLargeNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}G`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return num.toFixed(0);
}

interface ProductEnhancedSummaryProps {
  products: Product[];
  labData?: {
    summary?: {
      total_products?: number;
    };
    sales?: {
      total_revenue?: number;
      total_margin?: number;
      margin_percentage?: number;
      total_quantity_sold?: number;
    };
    // Nouvelles propriétés pour les données d'achat
    purchases?: {
      total_purchase_amount?: number;
      total_purchase_quantity?: number;
      average_purchase_price?: number;
      last_purchase_date?: string;
    };
  };
  // Données d'achat directement au niveau du composant
  purchaseData?: {
    totalPurchaseAmount: number;
    totalPurchaseQuantity: number;
    averagePurchasePrice: number;
    lastPurchaseDate: string;
  };
}

export function ProductEnhancedSummary({ products, labData, purchaseData }: ProductEnhancedSummaryProps) {
  // États pour l'affichage des tooltips
  const [showRotationTooltip, setShowRotationTooltip] = useState(false);
  const [showRatioTooltip, setShowRatioTooltip] = useState(false);
  const [showPriceTooltip, setShowPriceTooltip] = useState(false);
  // Calcul des statistiques
  const calculateSummary = () => {
    // Nombre total de produits - préférer le nombre issu des données du laboratoire
    const totalProducts = labData?.summary?.total_products || products.length;
    
    // Calcul du stock total avec conversion explicite
    const totalStock = products.reduce((sum, product) => 
      sum + (Number(product.current_stock) || 0), 0);
    
    // --- SELL-OUT (VENTES) ---
    // Calcul des ventes totales - préférer les ventes totales du laboratoire si disponibles
    const totalSales = labData?.sales?.total_quantity_sold || 
      products.reduce((sum, product) => sum + (Number(product.total_sales) || 0), 0);
    
    // Chiffre d'affaires total - préférer le CA total du laboratoire si disponible
    const totalRevenue = labData?.sales?.total_revenue || 
      products.reduce((sum, product) => {
        if (product.total_sales && product.price_with_tax) {
          return sum + (Number(product.total_sales) * Number(product.price_with_tax));
        }
        if (product.revenue) {
          return sum + Number(product.revenue);
        }
        return sum;
      }, 0);
    
    // Marge totale - préférer la marge totale du laboratoire si disponible
    const totalMargin = labData?.sales?.total_margin || 
      products.reduce((sum, product) => {
        if (product.margin) {
          return sum + Number(product.margin);
        }
        
        if (product.total_sales && product.price_with_tax && product.weighted_average_price && product.tva_rate) {
          const prixHT = Number(product.price_with_tax) / (1 + Number(product.tva_rate) / 100);
          const coutHT = Number(product.weighted_average_price);
          const margeUnitaire = prixHT - coutHT;
          return sum + (Number(product.total_sales) * margeUnitaire);
        }
        
        return sum;
      }, 0);
  
    // Pourcentage de marge - préférer le pourcentage calculé par l'API si disponible
    const marginPercentage = labData?.sales?.margin_percentage || 
      (totalRevenue > 0 ? (totalMargin / totalRevenue) * 100 : 0);

    // --- SELL-IN (ACHATS) ---
    // Utiliser les données d'achat fournies directement ou via labData, sinon utiliser des valeurs par défaut
    const totalPurchaseAmount = 
      purchaseData?.totalPurchaseAmount || 
      labData?.purchases?.total_purchase_amount || 
      // Calculer une estimation basée sur le coût moyen pondéré si aucune donnée n'est disponible
      products.reduce((sum, product) => sum + (Number(product.current_stock) * Number(product.weighted_average_price || 0)), 0);
      
    const totalPurchaseQuantity = 
      purchaseData?.totalPurchaseQuantity || 
      labData?.purchases?.total_purchase_quantity || 
      totalStock * 1.2; // Estimation: stock actuel + 20% (vendu)
    
    const averagePurchasePrice = 
      purchaseData?.averagePurchasePrice || 
      labData?.purchases?.average_purchase_price || 
      (totalPurchaseQuantity > 0 ? totalPurchaseAmount / totalPurchaseQuantity : 0);
    
    const lastPurchaseDate = 
      purchaseData?.lastPurchaseDate || 
      labData?.purchases?.last_purchase_date || 
      "Non disponible";

    // Calcul de la rotation du stock (nombre de jours pour écouler le stock au rythme actuel)
    // Formule: (Stock actuel / Ventes quotidiennes moyennes)
    const stockRotationDays = totalSales > 0 ? Math.round((totalStock / (totalSales / 30)) * 100) / 100 : 0;
    
    return {
      totalProducts,
      totalStock,
      // Sell-out
      totalSales,
      totalRevenue,
      totalMargin,
      marginPercentage,
      // Sell-in
      totalPurchaseAmount,
      totalPurchaseQuantity,
      averagePurchasePrice,
      lastPurchaseDate,
      // Métriques dérivées
      stockRotationDays
    };
  };

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    // Pour les grands montants, utiliser le formatage simplifié
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M €`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(1)}k €`;
    }
    
    // Pour les petits montants, utiliser le format complet
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Formater la date
  const formatDate = (dateStr: string) => {
    if (dateStr === "Non disponible") return dateStr;
    
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR');
    } catch (e) {
      return dateStr;
    }
  };

  const summary = calculateSummary();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Synthèse des résultats
      </h3>
      
      {/* Onglets pour basculer entre Sell-Out (Ventes) et Sell-In (Achats) */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button className="py-2 px-4 border-b-2 border-sky-500 dark:border-sky-400 text-sky-600 dark:text-sky-400 font-medium">
          Vue d'ensemble
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Produits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiBox size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Produits</h3>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalProducts)}
          </div>
        </div>
        
        {/* Stock total */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiPackage size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Stock</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total des unités</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalStock)}
          </div>
        </div>
        
        {/* Montant Achats (Sell-In) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Achats</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Montant total (Sell-In)</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalPurchaseAmount)}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Quantité: {formatLargeNumber(summary.totalPurchaseQuantity)} unités
          </div>
        </div>

        {/* CA Total (Sell-Out) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiBarChart2 size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ventes</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Chiffre d'affaires (Sell-Out)</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalRevenue)}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Quantité: {formatLargeNumber(summary.totalSales)} unités
          </div>
        </div>
        
        {/* Marge (Sell-Out) */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Marge</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Montant et taux</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.totalMargin)}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Taux: {summary.marginPercentage.toFixed(1)}% du CA
          </div>
        </div>
        
        
        {/* Prix Achat Moyen */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
                <FiDollarSign size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Prix d'achat</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Moyenne pondérée</p>
              </div>
            </div>
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowPriceTooltip(true)}
                onMouseLeave={() => setShowPriceTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showPriceTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Le prix d'achat moyen est calculé en pondérant le prix de chaque achat par la quantité achetée, représentant ainsi le coût moyen réel d'acquisition des produits.
                </div>
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(summary.averagePurchasePrice)}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Dernier achat: {formatDate(summary.lastPurchaseDate)}
          </div>
        </div>
        
        {/* Rotation du stock */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
                <FiActivity size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rotation</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Durée d'écoulement</p>
              </div>
            </div>
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowRotationTooltip(true)}
                onMouseLeave={() => setShowRotationTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showRotationTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  La rotation du stock indique le nombre de jours nécessaires pour écouler le stock actuel, calculée en divisant la quantité en stock par les ventes quotidiennes moyennes.
                </div>
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary.stockRotationDays.toFixed(2)} jours
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Temps pour écouler le stock actuel
          </div>
        </div>
        
        {/* Ratio Ventes/Achats */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-300 mr-3">
                <FiTrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ratio Ventes/Achats</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Performance commerciale</p>
              </div>
            </div>
            <div className="relative">
              <button 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onMouseEnter={() => setShowRatioTooltip(true)}
                onMouseLeave={() => setShowRatioTooltip(false)}
              >
                <FiInfo size={16} />
              </button>
              
              {showRatioTooltip && (
                <div className="absolute right-0 z-10 w-64 p-3 text-xs bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  Le Ratio Ventes/Achats mesure l'efficacité commerciale en comparant le chiffre d'affaires réalisé (sell-out) par rapport au montant des achats (sell-in). Un ratio élevé indique une bonne valorisation des achats.
                </div>
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {summary.totalPurchaseAmount > 0 
              ? `${((summary.totalRevenue / summary.totalPurchaseAmount) * 100).toFixed(1)}%` 
              : 'N/A'}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            CA généré par unité d'achat
          </div>
        </div>
      </div>
    </div>
  );
}