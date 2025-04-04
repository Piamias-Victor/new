// src/components/sidebar/FilterSidebar.tsx
import React from 'react';
import { DateFilterSummary } from './DateFilterSummary';
import { PharmacyFilterSummary } from './PharmacyFilterSummary';
import { ProductFilterSummary } from './ProductFilterSummary';

export function FilterSidebar() {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 px-1">
        Filtres appliqués
      </h2>
      
      <DateFilterSummary />
      <PharmacyFilterSummary />
      <ProductFilterSummary />
    </div>
  );
}