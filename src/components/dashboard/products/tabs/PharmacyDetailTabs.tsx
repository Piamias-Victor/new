// src/components/dashboard/pharmacies/tabs/PharmacyDetailTabs.tsx
import React, { useState } from 'react';
import { PharmacyInfoTab } from './PharmacyInfoTab';
import { PharmacySalesTab } from './PharmacySalesTab';
import { PharmacyStockTab } from './PharmacyStockTab';


interface PharmacyDetailTabsProps {
  pharmacyId: string;
}

type TabKey = 'info' | 'sales' | 'stock';

export function PharmacyDetailTabs({ pharmacyId }: PharmacyDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  
  return (
    <div className="p-4">
      <div className="border-b border-gray-200 dark:border-gray-600">
        <nav className="flex space-x-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'info' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'sales' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Ventes
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3 py-2 text-sm font-medium rounded-t-lg ${
              activeTab === 'stock' 
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-500' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Stock
          </button>
        </nav>
      </div>
      
      <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        {activeTab === 'info' && <PharmacyInfoTab pharmacyId={pharmacyId} />}
        {activeTab === 'sales' && <PharmacySalesTab pharmacyId={pharmacyId} />}
        {activeTab === 'stock' && <PharmacyStockTab pharmacyId={pharmacyId} />}
      </div>
    </div>
  );
}