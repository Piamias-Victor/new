// src/components/dashboard/WelcomeScreen.tsx
import React from 'react';
import { FiPlay, FiCalendar, FiUsers, FiFilter, FiBarChart } from 'react-icons/fi';
import { ApplyButton } from '@/components/shared/ApplyButton';

export function WelcomeScreen() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Icône principale */}
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 dark:from-sky-900/30 dark:to-teal-900/30 flex items-center justify-center">
            <FiBarChart className="w-12 h-12 text-sky-600 dark:text-sky-400" />
          </div>
        </div>
        
        {/* Titre principal */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Prêt à analyser vos données ?
        </h2>
        
        {/* Description */}
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Personnalisez votre analyse en sélectionnant vos paramètres dans le header, 
          puis cliquez sur <span className="font-medium text-sky-600 dark:text-sky-400">"Appliquer"</span> pour 
          charger vos données.
        </p>
        
        {/* Étapes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          
          {/* Étape 1 : Période */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center mx-auto">
                <FiCalendar className="w-6 h-6 text-sky-600 dark:text-sky-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              1. Période d'analyse
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sélectionnez la période à analyser via le sélecteur de dates
            </p>
          </div>
          
          {/* Étape 2 : Pharmacies */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center mx-auto">
                <FiUsers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              2. Pharmacies
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choisissez les pharmacies à inclure dans l'analyse
            </p>
          </div>
          
          {/* Étape 3 : Produits (optionnel) */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto">
                <FiFilter className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              3. Filtres (optionnel)
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filtrez par produits, laboratoires ou segments spécifiques
            </p>
          </div>
        </div>
        
        {/* Call to action */}
        <div className="bg-gradient-to-r from-sky-50 to-teal-50 dark:from-sky-900/20 dark:to-teal-900/20 rounded-xl p-8 border border-sky-200 dark:border-sky-800/50">
          <div className="mb-6">
            <ApplyButton 
              variant="primary" 
              size="lg"
              className="shadow-lg hover:shadow-xl transition-shadow"
            />
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium text-sky-700 dark:text-sky-300">Conseil :</span> Si vous n'appliquez aucun filtre, 
            vous obtiendrez les données globales de toutes vos pharmacies pour la période sélectionnée.
          </p>
        </div>
        
      </div>
    </div>
  );
}