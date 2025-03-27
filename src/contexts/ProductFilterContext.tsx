// src/contexts/ProductFilterContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product } from '@/components/drawer/search/ProductSearchResults';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';
import { UnifiedSegment } from '@/components/drawer/search/SegmentSearch';

// Type pour le mode de filtrage
type FilterMode = 'AND' | 'OR';

// Types pour le contexte
interface ProductFilterContextType {
  // Éléments sélectionnés
  selectedProducts: Product[];
  selectedLabs: Laboratory[];
  selectedSegments: UnifiedSegment[];
  
  // Codes EAN13 dédupliqués
  selectedCodes: string[];
  
  // Actions
  toggleProduct: (product: Product) => void;
  toggleLab: (lab: Laboratory) => void;
  toggleSegment: (segment: UnifiedSegment) => void;
  clearFilters: () => void;
  
  // État du filtre
  isFilterActive: boolean;
  totalSelectedCount: number;
  
  // Mode de filtrage
  filterMode: FilterMode;
  toggleFilterMode: () => void;
}

// Création du contexte
const ProductFilterContext = createContext<ProductFilterContextType | undefined>(undefined);

// Hook pour utiliser le contexte
export function useProductFilter() {
  const context = useContext(ProductFilterContext);
  if (!context) {
    throw new Error('useProductFilter doit être utilisé à l\'intérieur d\'un ProductFilterProvider');
  }
  return context;
}

// Provider du contexte
export function ProductFilterProvider({ children }: { children: React.ReactNode }) {
  // États pour les éléments sélectionnés
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<Laboratory[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<UnifiedSegment[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('AND'); // Par défaut en mode "ET"
  
  // Fonction pour basculer entre les modes
  const toggleFilterMode = useCallback(() => {
    setFilterMode(prev => prev === 'AND' ? 'OR' : 'AND');
  }, []);
  
  // Calcul des codes uniques
  const selectedCodes = useMemo(() => {
    if (filterMode === 'OR') {
      // Comportement "OU": union des codes
      const codes = new Set<string>();
      
      // Ajouter les codes des produits
      selectedProducts.forEach(product => {
        if (product.code_13_ref) codes.add(product.code_13_ref);
      });
      
      // Ajouter les codes des laboratoires
      selectedLabs.forEach(lab => {
        if (lab.code_13_refs) {
          lab.code_13_refs.forEach(code => codes.add(code));
        }
      });
      
      // Ajouter les codes des segments
      selectedSegments.forEach(segment => {
        if (segment.code_13_refs) {
          segment.code_13_refs.forEach(code => codes.add(code));
        }
      });
      
      return Array.from(codes);
    } else {
      // Comportement "ET": intersection des codes
      let allSets: Set<string>[] = [];
      
      // Ajouter les codes des produits
      if (selectedProducts.length > 0) {
        const productCodesSet = new Set<string>();
        selectedProducts.forEach(product => {
          if (product.code_13_ref) productCodesSet.add(product.code_13_ref);
        });
        if (productCodesSet.size > 0) {
          allSets.push(productCodesSet);
        }
      }
      
      // Ajouter les codes des laboratoires
      if (selectedLabs.length > 0) {
        const labCodesSet = new Set<string>();
        selectedLabs.forEach(lab => {
          if (lab.code_13_refs) {
            lab.code_13_refs.forEach(code => labCodesSet.add(code));
          }
        });
        if (labCodesSet.size > 0) {
          allSets.push(labCodesSet);
        }
      }
      
      // Ajouter les codes des segments
      if (selectedSegments.length > 0) {
        const segmentCodesSet = new Set<string>();
        selectedSegments.forEach(segment => {
          if (segment.code_13_refs) {
            segment.code_13_refs.forEach(code => segmentCodesSet.add(code));
          }
        });
        if (segmentCodesSet.size > 0) {
          allSets.push(segmentCodesSet);
        }
      }
      
      // Si aucun filtre n'est appliqué, retourner un tableau vide
      if (allSets.length === 0) {
        return [];
      }
      
      // Si un seul type de filtre est appliqué, retourner ses codes
      if (allSets.length === 1) {
        return Array.from(allSets[0]);
      }
      
      // Calculer l'intersection de tous les ensembles
      const intersection = new Set(allSets[0]);
      for (let i = 1; i < allSets.length; i++) {
        const currentSet = allSets[i];
        const toRemove: string[] = [];
        
        intersection.forEach(code => {
          if (!currentSet.has(code)) {
            toRemove.push(code);
          }
        });
        
        toRemove.forEach(code => intersection.delete(code));
      }
      
      return Array.from(intersection);
    }
  }, [selectedProducts, selectedLabs, selectedSegments, filterMode]);
  
  // Compteurs
  const totalSelectedCount = selectedProducts.length + selectedLabs.length + selectedSegments.length;
  const isFilterActive = totalSelectedCount > 0;
  
  // Actions de toggle
  const toggleProduct = useCallback((product: Product) => {
    setSelectedProducts(prev => {
      const exists = prev.some(p => p.id === product.id);
      return exists 
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product];
    });
  }, []);
  
  const toggleLab = useCallback((lab: Laboratory) => {
    setSelectedLabs(prev => {
      const exists = prev.some(l => l.name === lab.name);
      return exists 
        ? prev.filter(l => l.name !== lab.name)
        : [...prev, lab];
    });
  }, []);
  
  const toggleSegment = useCallback((segment: UnifiedSegment) => {
    setSelectedSegments(prev => {
      const exists = prev.some(s => s.id === segment.id);
      return exists 
        ? prev.filter(s => s.id !== segment.id)
        : [...prev, segment];
    });
  }, []);
  
  // Réinitialiser tous les filtres
  const clearFilters = useCallback(() => {
    setSelectedProducts([]);
    setSelectedLabs([]);
    setSelectedSegments([]);
  }, []);
  
  // Valeur du contexte
  const value = useMemo(() => ({
    selectedProducts,
    selectedLabs,
    selectedSegments,
    selectedCodes,
    toggleProduct,
    toggleLab,
    toggleSegment,
    clearFilters,
    isFilterActive,
    totalSelectedCount,
    filterMode,
    toggleFilterMode
  }), [
    selectedProducts, 
    selectedLabs, 
    selectedSegments, 
    selectedCodes, 
    toggleProduct, 
    toggleLab, 
    toggleSegment, 
    clearFilters, 
    isFilterActive, 
    totalSelectedCount,
    filterMode,
    toggleFilterMode
  ]);
  
  return (
    <ProductFilterContext.Provider value={value}>
      {children}
    </ProductFilterContext.Provider>
  );
}