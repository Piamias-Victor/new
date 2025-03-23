// src/components/products/stock/ProductStockTab.tsx
import React from 'react';
import { useProductStock } from '@/hooks/useProductStock';
import { LastOrdersCard } from '../LastOrdersCard';
import { ReorderSuggestionCard } from '../ReorderSuggestionCard';
import { StockOverviewCard } from '../StockOverviewCard';
import { StockPredictionsCard } from '../StockPredictionsCard';

interface ProductStockTabProps {
  code13ref: string;
}

export function ProductStockTab({ code13ref }: ProductStockTabProps) {
  const stockData = useProductStock(code13ref);
  const isLoading = stockData.isLoading;
  
  return (
    <div className="space-y-6">
      {/* Graphique d'historique en premier */}      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StockOverviewCard
          currentStock={stockData.currentStock}
          daysOfStock={stockData.daysOfStock}
          monthsOfStock={stockData.monthsOfStock}
          rotationRate={stockData.rotationRate}
          stockValue={stockData.stockValue}
          isLoading={isLoading}
        />
        
        <StockPredictionsCard
          ruptureTreshold={stockData.ruptureTreshold}
          forecastedStockDate={stockData.forecastedStockDate}
          stockoutRisk={stockData.stockoutRisk}
          stockoutRiskDate={stockData.stockoutRiskDate}
          currentStock={stockData.currentStock}
          isLoading={isLoading}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LastOrdersCard
          orders={stockData.lastOrders}
          isLoading={isLoading}
        />
        
        <ReorderSuggestionCard
          optimalStock={stockData.optimalStock}
          currentStock={stockData.currentStock}
          suggestedOrderQuantity={stockData.suggestedOrderQuantity}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}