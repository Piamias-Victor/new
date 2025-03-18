// src/components/dashboard/evolution/ProductEvolutionSummary.tsx
import React from 'react';
import { ProductEvolutionPanel } from './ProductEvolutionPanel';
import { GlobalComparisonCard } from '@/components/dashboard/comparison/GlobalComparisonCard';
import { useEvolutionComparison } from '@/hooks/useEvolutionComparison';

export function ProductEvolutionSummary() {
  const { globalComparison, isLoading } = useEvolutionComparison();
  
  return (
    <div className="space-y-6">
      <GlobalComparisonCard 
        currentPeriodRevenue={globalComparison.currentPeriodRevenue}
        previousPeriodRevenue={globalComparison.previousPeriodRevenue}
        evolutionPercentage={globalComparison.evolutionPercentage}
        currentPeriodMargin={globalComparison.currentPeriodMargin || 0}
        previousPeriodMargin={globalComparison.previousPeriodMargin || 0}
        marginEvolutionPercentage={globalComparison.marginEvolutionPercentage || 0}
        isLoading={isLoading}
      />
      
      <ProductEvolutionPanel />
    </div>
  );
}