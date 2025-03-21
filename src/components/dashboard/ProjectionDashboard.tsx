// src/components/dashboard/ProjectionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { SalesProjection } from '@/components/dashboard/SalesProjection';
import { AnnualProgress } from '@/components/dashboard/AnnualProgress';
import { useAnnualData } from '@/hooks/useAnnualData';

export function ProjectionDashboard() {
  const annualData = useAnnualData();
  const [sellOutGoal, setSellOutGoal] = useState(0);
  const [sellInGoal, setSellInGoal] = useState(0);
  
  // Initialiser les objectifs lorsque les données sont chargées
  useEffect(() => {
    if (!annualData.isLoading) {
      // Extrapolation initiale pour le sell-out
      const projectedSellOut = (annualData.sellOutRevenue / annualData.yearProgressPercentage) * 100;
      setSellOutGoal(projectedSellOut);
      
      // Extrapolation initiale pour le sell-in
      const projectedSellIn = (annualData.sellInRevenue / annualData.yearProgressPercentage) * 100;
      setSellInGoal(projectedSellIn);
    }
  }, [annualData]);
  
  // Gestionnaire pour mettre à jour les objectifs depuis les projections
  const handleGoalsUpdate = (sellOutAmount: number, sellInAmount: number) => {
    setSellOutGoal(sellOutAmount);
    setSellInGoal(sellInAmount);
  };

  return (
    <div className="space-y-6">
      <SalesProjection onGoalsUpdate={handleGoalsUpdate} />
      <AnnualProgress sellOutGoal={sellOutGoal} sellInGoal={sellInGoal} />
    </div>
  );
}