import React from 'react';
import { FiGrid, FiAlertCircle, FiLoader, FiCheck } from 'react-icons/fi';

export interface Segment {
  id: string;
  name: string;
  universe?: string;
  parentCategory?: string;
  family?: string;
  subFamily?: string;
  productCount: number;
  code_13_refs?: string[];
  segmentType?: 'universe' | 'category' | 'subcategory' | 'family' | 'subfamily' | 'other';
}

interface SegmentSearchResultsProps {
  results: Segment[];
  isLoading: boolean;
  error: string | null;
  selectedSegments: Segment[];
  onToggleSegment: (segment: Segment) => void;
  mode?: 'categories' | 'families';
}

export function SegmentSearchResults({ 
  results, 
  isLoading, 
  error, 
  selectedSegments,
  onToggleSegment,
  mode = 'categories'
}: SegmentSearchResultsProps) {
  // Vérifier si un segment est sélectionné
  const isSelected = (segment: Segment) => {
    return selectedSegments.some(s => s.id === segment.id);
  };

  // État de chargement
  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiLoader className="animate-spin mb-3" size={24} />
        <p>Chargement des segments...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-red-500 dark:text-red-400">
        <FiAlertCircle className="mb-3" size={24} />
        <p>{error}</p>
      </div>
    );
  }

  // Aucun résultat
  if (results.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <FiGrid className="mb-3" size={24} />
        <p>Aucun segment trouvé</p>
        <p className="text-sm">Essayez de modifier votre recherche</p>
      </div>
    );
  }

  // Dédupliquer les résultats pour éviter les clés dupliquées
  const uniqueResults = results.reduce((acc: Segment[], curr) => {
    // Vérifier si cet élément est déjà présent (basé sur l'ID)
    const isDuplicate = acc.some(item => item.id === curr.id);
    if (!isDuplicate) {
      acc.push(curr);
    }
    return acc;
  }, []);

  // Affichage par mode
  if (mode === 'categories') {
    // Logique d'organisation pour les univers et catégories
    const universeMap: Record<string, Segment> = {};
    const categoryMap: Record<string, Segment[]> = {};
    
    // Organiser par univers et catégories
    uniqueResults.forEach(segment => {
      // Pour les univers
      if (segment.universe) {
        if (segment.segmentType === 'universe') {
          universeMap[segment.universe] = segment;
        }
        
        // Pour les catégories
        if (segment.parentCategory && 
           (segment.segmentType === 'category' || segment.segmentType === 'subcategory')) {
          if (!categoryMap[segment.universe]) {
            categoryMap[segment.universe] = [];
          }
          categoryMap[segment.universe].push(segment);
        }
      }
    });
    
    // Créer la liste des univers à afficher
    const universes = Object.keys(universeMap).length > 0 
      ? Object.keys(universeMap) 
      : [...new Set(uniqueResults
          .filter(s => s.universe)
          .map(s => s.universe) as string[])];
    
    // Si aucun univers trouvé, afficher un message
    if (universes.length === 0) {
      return (
        <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <FiGrid className="mb-3" size={24} />
          <p>Aucun univers ou catégorie trouvé</p>
        </div>
      );
    }
    
    // Rendu pour le mode catégories
    return (
      <div className="space-y-6">
        {universes.map(universe => {
          const universeSegment = universeMap[universe];
          const categories = categoryMap[universe] || [];
          
          return (
            <div key={`universe-${universe}`} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                {universe}
              </h3>
              
              {/* Univers lui-même */}
              {universeSegment && (
                <RenderSegmentCard 
                  segment={universeSegment} 
                  isSelected={isSelected(universeSegment)}
                  onToggle={onToggleSegment}
                  label={`Tout l'univers ${universe}`}
                />
              )}
              
              {/* Catégories */}
              {categories.length > 0 && (
                <div className="space-y-2 ml-3">
                  <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Catégories
                  </h4>
                  
                  {categories.map(category => (
                    <RenderSegmentCard 
                      key={`cat-${category.id}-${Math.random().toString(36).substr(2, 9)}`}
                      segment={category} 
                      isSelected={isSelected(category)}
                      onToggle={onToggleSegment}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } 
  else {
    // Logique d'organisation pour les familles
    const familyGroups: Record<string, Segment[]> = {};
    
    // Organiser par familles principales
    uniqueResults.forEach(segment => {
      if (segment.family) {
        const key = segment.family;
        if (!familyGroups[key]) {
          familyGroups[key] = [];
        }
        familyGroups[key].push(segment);
      } else if (segment.segmentType === 'family' || segment.segmentType === 'subfamily') {
        const key = 'Autres';
        if (!familyGroups[key]) {
          familyGroups[key] = [];
        }
        familyGroups[key].push(segment);
      }
    });
    
    // Si aucune famille trouvée, afficher un message
    if (Object.keys(familyGroups).length === 0) {
      return (
        <div className="py-8 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
          <FiGrid className="mb-3" size={24} />
          <p>Aucune famille ou sous-famille trouvée</p>
        </div>
      );
    }
    
    // Rendu pour le mode familles
    return (
      <div className="space-y-6">
        {Object.entries(familyGroups).map(([familyName, segments]) => (
          <div key={`family-group-${familyName}`} className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              {familyName}
            </h3>
            
            <div className="space-y-2">
              {segments.map(segment => (
                <RenderSegmentCard 
                  key={`fam-${segment.id}-${Math.random().toString(36).substr(2, 9)}`}
                  segment={segment} 
                  isSelected={isSelected(segment)}
                  onToggle={onToggleSegment}
                  showUniverse={true}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

// Composant pour rendre une carte de segment individuelle
function RenderSegmentCard({ 
  segment, 
  isSelected, 
  onToggle, 
  label,
  showUniverse = false
}: { 
  segment: Segment; 
  isSelected: boolean; 
  onToggle: (segment: Segment) => void;
  label?: string;
  showUniverse?: boolean;
}) {
  return (
    <div 
      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
        isSelected 
          ? 'border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
      }`}
      onClick={() => onToggle(segment)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className={`mr-3 p-1 rounded-full ${
            isSelected 
              ? 'bg-sky-100 text-sky-500 dark:bg-sky-900/30 dark:text-sky-400' 
              : 'bg-gray-100 text-gray-400 dark:bg-gray-700/50 dark:text-gray-500'
          }`}>
            <FiCheck size={14} />
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {label || segment.name}
            </h3>
            
            {showUniverse && segment.universe && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Univers: {segment.universe}
              </p>
            )}
            
            {segment.parentCategory && segment.parentCategory !== segment.name && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {segment.segmentType === 'subcategory' 
                  ? 'Sous-catégorie de' 
                  : segment.segmentType === 'subfamily'
                    ? 'Sous-famille de'
                    : 'Parent'}: {segment.parentCategory}
              </p>
            )}
            
            {segment.code_13_refs && segment.code_13_refs.length > 0 && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {segment.code_13_refs.length} codes EAN associés
              </div>
            )}
          </div>
        </div>
        
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
          {segment.productCount} produits
        </span>
      </div>
    </div>
  );
}