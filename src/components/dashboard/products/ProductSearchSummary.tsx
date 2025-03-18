import React from 'react';
import { FiBox, FiPackage, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
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

interface ProductSearchSummaryProps {
  products: Product[];
}

export function ProductSearchSummary({ products }: ProductSearchSummaryProps) {
  // Calcul des statistiques
  const calculateSummary = () => {
    // Calcul du stock total avec conversion explicite
    const totalStock = products.reduce((sum, product) => 
      sum + (Number(product.current_stock) || 0), 0);
    
    // Calcul des ventes totales en utilisant les ventes réelles
    const totalSales = products.reduce((sum, product) => 
      sum + (Number(product.total_sales) || 0), 0);
    
    // Utilisation directe du chiffre d'affaires global du laboratoire si disponible
    // Ce chiffre devrait être fourni par l'API des détails du laboratoire
    const labTotalRevenue = window.labData?.sales?.total_revenue;
    const totalRevenue = labTotalRevenue ? Number(labTotalRevenue) : products.reduce((sum, product) => {
      // Si le produit a des ventes et un prix, l'utiliser pour le CA
      if (product.total_sales && product.price_with_tax) {
        return sum + (Number(product.total_sales) * Number(product.price_with_tax));
      }
      // Si la propriété revenue existe déjà (fournie par l'API)
      if (product.revenue) {
        return sum + Number(product.revenue);
      }
      return sum;
    }, 0);
    
    // Utilisation directe de la marge globale du laboratoire si disponible
    // Ce chiffre devrait être fourni par l'API des détails du laboratoire
    const labTotalMargin = window.labData?.sales?.total_margin;
    const totalMargin = labTotalMargin ? Number(labTotalMargin) : products.reduce((sum, product) => {
      // Si la propriété margin existe déjà (fournie par l'API)
      if (product.margin) {
        return sum + Number(product.margin);
      }
      
      // Calcul basé sur les ventes et les coûts
      if (product.total_sales && product.price_with_tax && product.weighted_average_price && product.tva_rate) {
        const prixHT = Number(product.price_with_tax) / (1 + Number(product.tva_rate) / 100);
        const coutHT = Number(product.weighted_average_price);
        const margeUnitaire = prixHT - coutHT;
        return sum + (Number(product.total_sales) * margeUnitaire);
      }
      
      return sum;
    }, 0);
  
    const marginPercentage = totalRevenue > 0 
      ? (totalMargin / totalRevenue) * 100 
      : 0;
  
    return {
      totalProducts: products.length,
      totalStock,
      totalSales,
      totalRevenue,
      totalMargin,
      marginPercentage
    };
  };

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency: 'EUR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  const summary = calculateSummary();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Synthèse des résultats
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg border border-sky-100 dark:border-sky-800/50">
          <div className="flex items-center mb-2">
            <FiBox className="mr-2 text-sky-600 dark:text-sky-400" size={20} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Produits</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalProducts)}
          </div>
        </div>
        
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
          <div className="flex items-center mb-2">
            <FiPackage className="mr-2 text-emerald-600 dark:text-emerald-400" size={20} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Stock total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalStock)}
          </div>
        </div>
        
        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/50">
          <div className="flex items-center mb-2">
            <FiShoppingCart className="mr-2 text-amber-600 dark:text-amber-400" size={20} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Ventes totales</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalSales)}
          </div>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/50">
          <div className="flex items-center mb-2">
            <FiDollarSign className="mr-2 text-blue-600 dark:text-blue-400" size={20} />
            <span className="text-xs text-gray-600 dark:text-gray-400">CA Total</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatLargeNumber(summary.totalRevenue)}
          </div>
        </div>
        
        <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border border-teal-100 dark:border-teal-800/50">
          <div className="flex items-center mb-2">
            <FiTrendingUp className="mr-2 text-teal-600 dark:text-teal-400" size={20} />
            <span className="text-xs text-gray-600 dark:text-gray-400">Marge Totale</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatLargeNumber(summary.totalMargin)}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({summary.marginPercentage.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}