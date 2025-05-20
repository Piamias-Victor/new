// src/components/admin/PharmacyInfoCard.tsx
import React from 'react';

interface PharmacyInfoCardProps {
  id: string;
  id_nat: string | null;
  title: string;
}

export const PharmacyInfoCard: React.FC<PharmacyInfoCardProps> = ({
  id,
  id_nat,
  title
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {title}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID
          </label>
          <input
            type="text"
            value={id || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            ID National
          </label>
          <input
            type="text"
            value={id_nat || ''}
            disabled
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
};