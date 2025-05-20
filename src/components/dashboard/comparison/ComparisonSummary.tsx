// src/components/comparison/ComparisonSummary.tsx
import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';

interface ComparisonSummaryProps {
  itemA: any;
  itemB: any;
}

export function ComparisonSummary({ itemA, itemB }: ComparisonSummaryProps) {
  // Générer des insights fictifs pour la maquette - à remplacer par la logique réelle
  const generateMockInsights = () => {
    const nameA = itemA?.name || 'Élément A';
    const nameB = itemB?.name || 'Élément B';
    
    // Insights pour A
    const strengthsA = [
      `${nameA} a une meilleure marge moyenne (+3.4 points)`,
      `${nameA} présente une croissance plus forte sur les 3 derniers mois (+8.2%)`,
      `${nameA} possède un meilleur taux de rotation de stock (×4.2 vs ×3.1)`
    ];
    
    const weaknessesA = [
      `${nameA} a un CA total inférieur de 15.3%`,
      `${nameA} présente plus de références en rupture (4 vs 1)`
    ];
    
    // Insights pour B
    const strengthsB = [
      `${nameB} génère un CA plus élevé (+15.3%)`,
      `${nameB} a une meilleure répartition des ventes par segment`,
      `${nameB} présente moins de références en rupture (1 vs 4)`
    ];
    
    const weaknessesB = [
      `${nameB} a une marge inférieure (-3.4 points)`,
      `${nameB} montre une croissance plus faible (-8.2%)`
    ];
    
    // Recommandations générales
    const recommendations = [
      `Optimiser la gestion de stock pour ${nameA}`,
      `Analyser la stratégie de prix de ${nameB} pour améliorer les marges`,
      `Envisager un rééquilibrage du portefeuille produits de ${nameA} pour mieux couvrir les segments porteurs`
    ];
    
    return {
      strengthsA,
      weaknessesA,
      strengthsB,
      weaknessesB,
      recommendations
    };
  };

  const insights = generateMockInsights();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Synthèse et Recommandations
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Analyse comparative des forces et faiblesses, avec recommandations
        </p>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Élément A */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 mr-2 text-xs font-bold">
                  A
                </span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {itemA?.name || 'Élément A'}
                </h3>
              </div>
            </div>
            
            <div className="p-4">
              {/* Forces */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <FiTrendingUp className="text-green-500 dark:text-green-400 mr-2" size={16} />
                  Forces
                </h4>
                <ul className="space-y-2">
                  {insights.strengthsA.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Faiblesses */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <FiTrendingDown className="text-red-500 dark:text-red-400 mr-2" size={16} />
                  Faiblesses
                </h4>
                <ul className="space-y-2">
                  {insights.weaknessesA.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <FiAlertCircle className="text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          {/* Élément B */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-green-50 dark:bg-green-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 mr-2 text-xs font-bold">
                  B
                </span>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {itemB?.name || 'Élément B'}
                </h3>
              </div>
            </div>
            
            <div className="p-4">
              {/* Forces */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <FiTrendingUp className="text-green-500 dark:text-green-400 mr-2" size={16} />
                  Forces
                </h4>
                <ul className="space-y-2">
                  {insights.strengthsB.map((strength, index) => (
                    <li key={index} className="flex items-start">
                      <FiCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 mr-2 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Faiblesses */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-2">
                  <FiTrendingDown className="text-red-500 dark:text-red-400 mr-2" size={16} />
                  Faiblesses
                </h4>
                <ul className="space-y-2">
                  {insights.weaknessesB.map((weakness, index) => (
                    <li key={index} className="flex items-start">
                      <FiAlertCircle className="text-red-500 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0" size={14} />
                      <span className="text-sm text-gray-600 dark:text-gray-300">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Recommandations */}
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white flex items-center mb-3">
            <FiInfo className="text-indigo-500 dark:text-indigo-400 mr-2" size={16} />
            Recommandations
          </h4>
          <ul className="space-y-2">
            {insights.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 mr-2 text-xs font-bold flex-shrink-0">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-800 dark:text-gray-200">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Ces insights et recommandations sont générés automatiquement selon les données disponibles et sont à affiner par une analyse humaine.
        </p>
      </div>
    </div>
  );
}