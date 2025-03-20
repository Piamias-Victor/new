// src/contexts/ProductFilterContext.tsx
'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { Product } from '@/components/drawer/search/ProductSearchResults';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';
import { UnifiedSegment } from '@/components/drawer/search/SegmentSearch';

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
  
  // Calcul des codes uniques
  const selectedCodes = useMemo(() => {
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
  }, [selectedProducts, selectedLabs, selectedSegments]);
  
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
    totalSelectedCount
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
    totalSelectedCount
  ]);
  
  return (
    <ProductFilterContext.Provider value={value}>
      {children}
    </ProductFilterContext.Provider>
  );
}