// src/components/segments/SegmentRelationshipChart.tsx
import React from 'react';
import { FiLink2 } from 'react-icons/fi';
import { SegmentHierarchies } from '@/hooks/useSegments';

interface SegmentRelationshipChartProps {
  segments: SegmentHierarchies;
}

export const SegmentRelationshipChart: React.FC<SegmentRelationshipChartProps> = ({ segments }) => {
  // Trouver un exemple d'univers qui a des catégories
  const exampleUniverse = segments.universe_hierarchy.find(u => u.categories && u.categories.length > 0);
  
  // Si nous avons un exemple d'univers, trouver une catégorie associée
  const exampleCategory = exampleUniverse 
    ? exampleUniverse.categories[0] 
    : null;
  
  // Trouver les détails de la catégorie exemple
  const exampleCategoryDetails = exampleCategory 
    ? segments.category_hierarchy.find(c => c.category === exampleCategory)
    : null;
  
  // Trouver un exemple de famille
  const exampleFamily = exampleCategoryDetails?.families && exampleCategoryDetails.families.length > 0
    ? exampleCategoryDetails.families[0]
    : null;
  
  // Trouver les détails de la famille exemple
  const exampleFamilyDetails = exampleFamily
    ? segments.family_hierarchy.find(f => f.family === exampleFamily)
    : null;
  
  // Trouver un exemple de sous-catégorie
  const exampleSubCategory = exampleCategoryDetails?.sub_categories && exampleCategoryDetails.sub_categories.length > 0
    ? exampleCategoryDetails.sub_categories[0]
    : null;
  
  // Trouver un exemple de sous-famille
  const exampleSubFamily = exampleFamilyDetails?.sub_families && exampleFamilyDetails.sub_families.length > 0
    ? exampleFamilyDetails.sub_families[0]
    : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center mb-4">
        <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mr-3">
          <FiLink2 size={20} />
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">Relations Entre Segments</h2>
      </div>
      
      <div className="relative py-8">
        {/* Ligne de connexion centrale */}
        <div className="absolute top-0 bottom-0 left-1/2 -ml-px w-0.5 bg-gray-200 dark:bg-gray-700"></div>
        
        {/* Représentation de la hiérarchie */}
        <div className="relative z-10">
          {/* Univers */}
          <div className="mb-8 flex items-center">
            <div className="flex flex-col items-center w-1/2 pr-4 text-right">
              <div className="text-blue-600 dark:text-blue-400 font-medium">Univers</div>
              <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {exampleUniverse ? exampleUniverse.universe : "Pas d'exemple"}
                </span>
              </div>
            </div>
            
            <div className="relative flex h-6 w-6 bg-blue-600 dark:bg-blue-500 rounded-full justify-center items-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            
            <div className="w-1/2 pl-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {segments.universe_hierarchy.length} univers identifiés
                </span>
              </div>
            </div>
          </div>
          
          {/* Flèche */}
          <div className="mb-2 flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </div>
          
          {/* Catégorie */}
          <div className="mb-8 flex items-center">
            <div className="flex flex-col items-center w-1/2 pr-4 text-right">
              <div className="text-green-600 dark:text-green-400 font-medium">Catégorie</div>
              <div className="mt-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {exampleCategory || "Pas d'exemple"}
                </span>
              </div>
            </div>
            
            <div className="relative flex h-6 w-6 bg-green-600 dark:bg-green-500 rounded-full justify-center items-center">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            
            <div className="w-1/2 pl-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="text-gray-600 dark:text-gray-300">
                  {segments.category_hierarchy.length} catégories identifiées
                </span>
              </div>
            </div>
          </div>
          
          {/* Connexion multi-branche */}
          <div className="mb-4 flex justify-center">
            <div className="w-40 h-8 relative">
              <div className="absolute left-0 right-0 top-0 h-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div className="absolute left-0 top-0 h-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
              <div className="absolute right-0 top-0 h-8 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
          
          {/* Sous-catégorie et Famille (parallèles) */}
          <div className="mb-8 flex justify-center">
            <div className="flex flex-col mr-8">
              <div className="flex items-center mb-2">
                <div className="relative flex h-6 w-6 bg-teal-600 dark:bg-teal-500 rounded-full justify-center items-center">
                  <span className="text-white text-sm font-bold">3A</span>
                </div>
                <span className="ml-2 text-teal-600 dark:text-teal-400 font-medium">Sous-catégorie</span>
              </div>
              <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {exampleSubCategory || "Pas d'exemple"}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col ml-8">
              <div className="flex items-center mb-2">
                <div className="relative flex h-6 w-6 bg-amber-600 dark:bg-amber-500 rounded-full justify-center items-center">
                  <span className="text-white text-sm font-bold">3B</span>
                </div>
                <span className="ml-2 text-amber-600 dark:text-amber-400 font-medium">Famille</span>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {exampleFamily || "Pas d'exemple"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Flèche vers sous-famille (seulement à partir de Famille) */}
          <div className="mb-2 flex justify-center">
            <div className="flex flex-col items-center ml-16"> {/* Décalé vers Famille */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </div>
          </div>
          
          {/* Sous-famille */}
          <div className="flex justify-center">
            <div className="flex flex-col items-center ml-16"> {/* Aligné avec Famille */}
              <div className="flex items-center mb-2">
                <div className="relative flex h-6 w-6 bg-purple-600 dark:bg-purple-500 rounded-full justify-center items-center">
                  <span className="text-white text-sm font-bold">4</span>
                </div>
                <span className="ml-2 text-purple-600 dark:text-purple-400 font-medium">Sous-famille</span>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 max-w-xs text-sm">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {exampleSubFamily || "Pas d'exemple"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        <p className="text-center">Ce schéma illustre la relation hiérarchique entre les différents segments de produits.</p>
      </div>
    </div>
  );
};