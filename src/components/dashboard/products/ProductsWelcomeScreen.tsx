// src/components/dashboard/products/ProductsWelcomeScreen.tsx
import React from 'react';
import { FiPackage, FiCalendar, FiUsers, FiFilter, FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { ApplyButton } from '@/components/shared/ApplyButton';

export function ProductsWelcomeScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Icône principale */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-purple-100 dark:from-sky-900/30 dark:to-purple-900/30 flex items-center justify-center">
            <FiPackage className="w-12 h-12 text-sky-600 dark:text-sky-400" />
          </div>
        </div>
        
        {/* Titre principal */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Analysez vos performances produits
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Configurez vos filtres pour analyser le stock, les marges et l'évolution 
          de vos produits, puis cliquez sur <span className="font-medium text-sky-600 dark:text-sky-400">"Appliquer"</span>.
        </p>
        
        {/* Étapes spécifiques aux produits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Étape 1 : Sélection produits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                <FiFilter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Sélection produits
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filtrez par produits, laboratoires ou segments spécifiques
            </p>
          </div>
          
          {/* Étape 2 : Période */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto">
                <FiCalendar className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              2. Période d'analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Définissez la période pour analyser l'évolution
            </p>
          </div>
          
          {/* Étape 3 : Pharmacies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
                <FiUsers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              3. Périmètre pharmacies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez les pharmacies à analyser
            </p>
          </div>
        </div>
        
        {/* Aperçu des analyses disponibles */}
        <div className="bg-gradient-to-r from-purple-50 to-sky-50 dark:from-purple-900/20 dark:to-sky-900/20 rounded-xl p-6 mb-8 border border-purple-200 dark:border-purple-800/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analyses disponibles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-purple-500" size={16} />
              KPI Stocks
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-purple-500" size={16} />
              Marges
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-purple-500" size={16} />
              Évolution
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-purple-500" size={16} />
              Prix
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="bg-gradient-to-r from-sky-50 to-purple-50 dark:from-sky-900/20 dark:to-purple-900/20 rounded-xl p-8 border border-sky-200 dark:border-sky-800/50">
          <div className="mb-6">
            <ApplyButton 
              variant="primary" 
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-purple-700 dark:text-purple-300">Note :</span> Sans filtre produit, 
            vous obtiendrez l'analyse de tous vos produits pour la période sélectionnée.
          </p>
        </div>
        
      </div>
    </div>
  );
}