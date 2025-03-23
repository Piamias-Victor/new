// src/components/dashboard/products/tabs/ProductStockTab.tsx
import React from 'react';
import { useProductStock } from '@/hooks/useProductStock';
import { LastOrdersCard } from '../LastOrdersCard';
import { ReorderSuggestionCard } from '../ReorderSuggestionCard';
import { StockOverviewCard } from '../StockOverviewCard';
import { StockPredictionsCard } from '../StockPredictionsCard';
import { ProductStockEvolutionChart } from '../ProductStockEvolutionChart';

interface ProductStockTabProps {
  code13ref: string;
}

export function ProductStockTab({ code13ref }: ProductStockTabProps) {
  
  return (
    <div className="space-y-6">
      {/* Graphique d'évolution du stock en premier */}
      <ProductStockEvolutionChart code13ref={code13ref} />
    </div>
  );
}