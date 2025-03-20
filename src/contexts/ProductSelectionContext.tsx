// src/contexts/ProductSelectionContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/components/drawer/search/ProductSearchResults';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';
import { UnifiedSegment } from '@/components/drawer/search/SegmentSearch';

interface ProductSelectionContextType {
  // Objets sélectionnés
  selectedProducts: Product[];
  selectedLabs: Laboratory[];
  selectedSegments: UnifiedSegment[];
  
  // Tous les codes EAN13 uniques sélectionnés
  selectedCodes: string[];
  
  // Méthodes pour gérer la sélection
  toggleProduct: (product: Product) => void;
  toggleLab: (lab: Laboratory) => void;
  toggleSegment: (segment: UnifiedSegment) => void;
  
  // Méthodes utilitaires
  clearSelection: () => void;
  
  // Pour interface utilisateur
  selectionCount: number;
}

export const ProductSelectionContext = createContext<ProductSelectionContextType | undefined>(undefined);

export function useProductSelection() {
  const context = useContext(ProductSelectionContext);
  if (!context) {
    throw new Error('useProductSelection doit être utilisé dans un ProductSelectionProvider');
  }
  return context;
}

export function ProductSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<Laboratory[]>([]);
  const [selectedSegments, setSelectedSegments] = useState<UnifiedSegment[]>([]);
  
  // Codes EAN13 extraits de toutes les sélections
  const selectedCodes = React.useMemo(() => {
    const productCodes = selectedProducts.map(p => p.code_13_ref);
    const labCodes = selectedLabs.flatMap(lab => lab.code_13_refs || []);
    const segmentCodes = selectedSegments.flatMap(segment => segment.code_13_refs || []);
    
    // Utiliser un Set pour dédupliquer
    return [...new Set([...productCodes, ...labCodes, ...segmentCodes])];
  }, [selectedProducts, selectedLabs, selectedSegments]);
  
  // Nombre total d'éléments sélectionnés
  const selectionCount = selectedProducts.length + selectedLabs.length + selectedSegments.length;
  
  // Fonctions pour gérer la sélection
  const toggleProduct = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };
  
  const toggleLab = (lab: Laboratory) => {
    setSelectedLabs(prev => {
      const isSelected = prev.some(l => l.name === lab.name);
      if (isSelected) {
        return prev.filter(l => l.name !== lab.name);
      } else {
        return [...prev, lab];
      }
    });
  };
  
  const toggleSegment = (segment: UnifiedSegment) => {
    setSelectedSegments(prev => {
      const isSelected = prev.some(s => s.id === segment.id);
      if (isSelected) {
        return prev.filter(s => s.id !== segment.id);
      } else {
        return [...prev, segment];
      }
    });
  };
  
  const clearSelection = () => {
    setSelectedProducts([]);
    setSelectedLabs([]);
    setSelectedSegments([]);
  };
  
  return (
    <ProductSelectionContext.Provider
      value={{
        selectedProducts,
        selectedLabs,
        selectedSegments,
        selectedCodes,
        toggleProduct,
        toggleLab,
        toggleSegment,
        clearSelection,
        selectionCount
      }}
    >
      {children}
    </ProductSelectionContext.Provider>
  );
}