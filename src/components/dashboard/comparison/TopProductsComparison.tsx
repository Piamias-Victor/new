// src/components/comparison/TopProductsComparison.tsx
import React, { useState } from 'react';
import { FiPackage, FiTrendingUp, FiShoppingBag } from 'react-icons/fi';
import { MdEuro } from 'react-icons/md';

interface TopProductsComparisonProps {
  itemA: any;
  itemB: any;
}

export function TopProductsComparison({ itemA, itemB }: TopProductsComparisonProps) {
  const [sortCriteria, setSortCriteria] = useState<'revenue' | 'quantity' | 'margin'>('revenue');
  
  // Données fictives pour la maquette - à remplacer par les données réelles
  const generateMockTopProducts = (prefix: string) => {
    const mockProducts = [];
    
    for (let i = 1; i <= 5; i++) {
      mockProducts.push({
        id: `${prefix}-${i}`,
        name: `${prefix} Produit ${i}`,
        code_ean: `${Math.floor(Math.random() * 10000000000000)}`,
        revenue: Math.round(1000 + Math.random() * 5000),
        quantity: Math.round(10 + Math.random() * 100),
        margin: Math.round(15 + Math.random() * 25),
        margin_amount: Math.round(200 + Math.random() * 800),
      });
    }
    
    return mockProducts;
  };

  const productsA = generateMockTopProducts(itemA?.name || 'A');
  const productsB = generateMockTopProducts(itemB?.name || 'B');
  
  // Trier les produits selon le critère sélectionné
  const sortProducts = (products: any[]) => {
    return [...products].sort((a, b) => {
      if (sortCriteria === 'revenue') {
        return b.revenue - a.revenue;
      } else if (sortCriteria === 'quantity') {
        return b.quantity - a.quantity;
      } else {
        return b.margin - a.margin;
      }
    });
  };

  const sortedProductsA = sortProducts(productsA);
  const sortedProductsB = sortProducts(productsB);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 mr-3">
            <FiPackage size={18} />
          </div>
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Top Produits
          </h2>
        </div>
        
        {/* Sélection du critère de tri */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1">
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              sortCriteria === 'revenue'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => setSortCriteria('revenue')}
          >
            <MdEuro className="mr-1" size={14} />
            CA
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              sortCriteria === 'quantity'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => setSortCriteria('quantity')}
          >
            <FiShoppingBag className="mr-1" size={14} />
            Quantité
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${
              sortCriteria === 'margin'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => setSortCriteria('margin')}
          >
            <FiTrendingUp className="mr-1" size={14} />
            Marge
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
        {/* Top produits A */}
        <div>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mr-2 text-xs font-bold">
                A
              </span>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {itemA?.name || 'Élément A'}
              </h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProductsA.map((product, index) => (
              <div key={product.id} className="p-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-2 text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      EAN: {product.code_ean}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {sortCriteria === 'revenue' && (
                        new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(product.revenue)
                      )}
                      {sortCriteria === 'quantity' && (
                        `${new Intl.NumberFormat('fr-FR').format(product.quantity)} u.`
                      )}
                      {sortCriteria === 'margin' && (
                        `${product.margin}%`
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {sortCriteria !== 'margin' && `Marge: ${product.margin}%`}
                      {sortCriteria === 'margin' && (
                        new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(product.margin_amount)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top produits B */}
        <div>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 mr-2 text-xs font-bold">
                B
              </span>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {itemB?.name || 'Élément B'}
              </h3>
            </div>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedProductsB.map((product, index) => (
              <div key={product.id} className="p-3">
                <div className="flex items-start">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 mr-2 text-xs">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      EAN: {product.code_ean}
                    </p>
                  </div>
                  <div className="ml-2 flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {sortCriteria === 'revenue' && (
                        new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(product.revenue)
                      )}
                      {sortCriteria === 'quantity' && (
                        `${new Intl.NumberFormat('fr-FR').format(product.quantity)} u.`
                      )}
                      {sortCriteria === 'margin' && (
                        `${product.margin}%`
                      )}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {sortCriteria !== 'margin' && `Marge: ${product.margin}%`}
                      {sortCriteria === 'margin' && (
                        new Intl.NumberFormat('fr-FR', { 
                          style: 'currency', 
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(product.margin_amount)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Top 5 produits par {sortCriteria === 'revenue' ? 'chiffre d\'affaires' : sortCriteria === 'quantity' ? 'quantité vendue' : 'taux de marge'}
        </p>
      </div>
    </div>
  );
}