// src/components/dashboard/laboratories/LaboratoriesWelcomeScreen.tsx
import React from 'react';
import { FiPackage, FiCalendar, FiUsers, FiFilter, FiBarChart, FiTrendingUp } from 'react-icons/fi';
import { ApplyButton } from '@/components/shared/ApplyButton';

export function LaboratoriesWelcomeScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Icône principale */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30 flex items-center justify-center">
            <FiPackage className="w-12 h-12 text-teal-600 dark:text-teal-400" />
          </div>
        </div>
        
        {/* Titre principal */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Analysez vos laboratoires et marques
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Configurez vos paramètres pour analyser les performances commerciales 
          par laboratoire, puis cliquez sur <span className="font-medium text-teal-600 dark:text-teal-400">"Appliquer"</span>.
        </p>
        
        {/* Étapes spécifiques aux laboratoires */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Étape 1 : Sélection laboratoires */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                <FiFilter className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Sélection laboratoires
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filtrez par laboratoires ou marques spécifiques
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
              Définissez la période pour comparer les performances
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
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-6 mb-8 border border-emerald-200 dark:border-emerald-800/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analyses disponibles
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-emerald-500" size={16} />
              CA & Volumes
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-emerald-500" size={16} />
              Évolution
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-emerald-500" size={16} />
              Stocks
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-emerald-500" size={16} />
              Projections
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl p-8 border border-teal-200 dark:border-teal-800/50">
          <div className="mb-6">
            <ApplyButton 
              variant="primary" 
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-emerald-700 dark:text-emerald-300">Note :</span> Sans filtre laboratoire, 
            vous obtiendrez l'analyse de tous vos laboratoires pour la période sélectionnée.
          </p>
        </div>
        
      </div>
    </div>
  );
}