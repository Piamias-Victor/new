// src/components/dashboard/rdv/RdvLabosWelcomeScreen.tsx
import React from 'react';
import { FiPackage, FiCalendar, FiUsers, FiFilter, FiBarChart, FiTrendingUp, FiCoffee } from 'react-icons/fi';
import { ApplyButton } from '@/components/shared/ApplyButton';

export function RdvLabosWelcomeScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Icône principale */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center">
            <FiCoffee className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        
        {/* Titre principal */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Préparez vos rendez-vous laboratoires
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Analysez les performances avant vos rendez-vous. Configurez vos paramètres 
          puis cliquez sur <span className="font-medium text-amber-600 dark:text-amber-400">"Appliquer"</span> 
          pour préparer votre argumentaire.
        </p>
        
        {/* Étapes spécifiques aux RDV */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Étape 1 : Sélection laboratoires */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto">
                <FiFilter className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Laboratoire cible
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez le laboratoire pour votre RDV
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
              2. Période de référence
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choisissez la période à analyser pour vos arguments
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
              3. Périmètre d'analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Définissez quelles pharmacies inclure
            </p>
          </div>
        </div>
        
        {/* Aperçu des analyses pour RDV */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-6 mb-8 border border-orange-200 dark:border-orange-800/50">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Données pour votre RDV
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-orange-500" size={16} />
              CA Laboratoire
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-orange-500" size={16} />
              Évolutions
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiBarChart className="mr-2 text-orange-500" size={16} />
              Parts de marché
            </div>
            <div className="flex items-center text-gray-700 dark:text-gray-300">
              <FiTrendingUp className="mr-2 text-orange-500" size={16} />
              Opportunités
            </div>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-8 border border-amber-200 dark:border-amber-800/50">
          <div className="mb-6">
            <ApplyButton 
              variant="primary" 
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-amber-700 dark:text-amber-300">Astuce :</span> Analysez d'abord globalement, 
            puis filtrez par laboratoire spécifique pour préparer vos arguments de négociation.
          </p>
        </div>
        
      </div>
    </div>
  );
}