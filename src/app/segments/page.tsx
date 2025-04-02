// src/app/segments/page.tsx
'use client';

import React, { useState } from 'react';
import { useSegments } from '@/hooks/useSegments';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { SegmentCard } from '@/components/segments/SegmentCard';
import { HierarchyView } from '@/components/segments/HierarchyView';
import { SegmentStatistics } from '@/components/segments/SegmentStatistics';
import { SegmentRelationshipChart } from '@/components/segments/SegmentRelationshipChart';
import { FiGrid, FiLayers, FiActivity, FiBox, FiPackage } from 'react-icons/fi';

export default function SegmentsDashboardPage() {
  const { segments, isLoading, error } = useSegments();
  const [selectedTab, setSelectedTab] = useState<'flat' | 'hierarchical'>('hierarchical');

  // Transformer les données de hiérarchie pour le composant HierarchyView
  const transformUniverseHierarchy = () => {
    if (!segments?.universe_hierarchy) return [];
    
    return segments.universe_hierarchy.map(universe => ({
      name: universe.universe,
      type: 'universe' as const,
      count: universe.categories.length,
      children: universe.categories.map(category => {
        // Trouver les détails de cette catégorie
        const categoryDetails = segments.category_hierarchy.find(c => c.category === category);
        return {
          name: category,
          type: 'category' as const,
          count: (categoryDetails?.sub_categories?.length || 0) + (categoryDetails?.families?.length || 0),
          children: [
            ...(categoryDetails?.sub_categories?.map(subCat => ({
              name: subCat,
              type: 'subcategory' as const,
              count: 0
            })) || []),
            ...(categoryDetails?.families?.map(family => {
              // Trouver les détails de cette famille
              const familyDetails = segments.family_hierarchy.find(f => f.family === family);
              return {
                name: family,
                type: 'family' as const,
                count: familyDetails?.sub_families?.length || 0,
                children: familyDetails?.sub_families?.map(subFam => ({
                  name: subFam,
                  type: 'subfamily' as const,
                  count: 0
                }))
              };
            }) || [])
          ]
        };
      })
    }));
  };

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 h-64">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
                    <div className="space-y-3">
                      {[...Array(5)].map((_, j) => (
                        <div key={j} className="h-8 bg-gray-100 dark:bg-gray-700 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <SidebarLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Structure de Segmentation
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Visualisez la hiérarchie complète des segments de produits
            </p>
          </div>

          {/* Statistiques de segmentation */}
          {segments?.flat_segments && (
            <SegmentStatistics segments={segments.flat_segments} />
          )}
          
          {/* Onglets pour basculer entre les vues */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 border-b border-gray-200 dark:border-gray-700">
              <button
                className={`py-3 px-4 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'hierarchical'
                    ? 'text-sky-600 border-sky-600 dark:text-sky-400 dark:border-sky-400'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedTab('hierarchical')}
              >
                Vue Hiérarchique
              </button>
            </div>
          </div>

          {/* Vue en catégories (cartes plates) */}
          {selectedTab === 'flat' && segments?.flat_segments && (
            <div className="space-y-6">
              {/* Schéma des relations entre segments */}
              <SegmentRelationshipChart segments={segments} />
              
              {/* Grille des cartes de segments */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SegmentCard
                  title="Univers"
                  items={segments.flat_segments.universes}
                  color="bg-blue-50"
                  darkColor="bg-blue-900/20"
                  onItemClick={(item) => console.log('Univers sélectionné:', item)}
                />
                <SegmentCard
                  title="Catégories"
                  items={segments.flat_segments.categories}
                  color="bg-green-50"
                  darkColor="bg-green-900/20"
                  onItemClick={(item) => console.log('Catégorie sélectionnée:', item)}
                />
                <SegmentCard
                  title="Sous-catégories"
                  items={segments.flat_segments.sub_categories}
                  color="bg-teal-50"
                  darkColor="bg-teal-900/20"
                  onItemClick={(item) => console.log('Sous-catégorie sélectionnée:', item)}
                />
                <SegmentCard
                  title="Familles"
                  items={segments.flat_segments.families}
                  color="bg-amber-50"
                  darkColor="bg-amber-900/20"
                  onItemClick={(item) => console.log('Famille sélectionnée:', item)}
                />
                <SegmentCard
                  title="Sous-familles"
                  items={segments.flat_segments.sub_families}
                  color="bg-purple-50"
                  darkColor="bg-purple-900/20"
                  onItemClick={(item) => console.log('Sous-famille sélectionnée:', item)}
                />
              </div>
            </div>
          )}

          {/* Vue hiérarchique */}
          {selectedTab === 'hierarchical' && segments && (
            <div className="space-y-6">
              <HierarchyView
                title="Hiérarchie des Segments"
                icon={<FiLayers size={20} />}
                items={transformUniverseHierarchy()}
                expandedByDefault={false}
              />
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}