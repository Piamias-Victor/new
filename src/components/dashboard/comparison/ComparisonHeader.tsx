// src/components/comparison/ComparisonHeader.tsx
import React, { useState } from 'react';
import { FiRefreshCw, FiBarChart2, FiPackage, FiGrid } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { LaboratorySearchCombobox } from './LaboratorySearchCombobox';
import { ProductSearchCombobox } from './ProductSearchCombobox';
import { SegmentSearchCombobox } from './SegmentSearchCombobox';

interface ComparisonHeaderProps {
  selectedItems: {
    itemA: any;
    itemB: any;
    type: 'product' | 'laboratory' | 'segment';
  };
  onItemsChange: (itemA: any, itemB: any, type: 'product' | 'laboratory' | 'segment') => void;
  onSwapItems: () => void;
}

export function ComparisonHeader({ 
  selectedItems, 
  onItemsChange, 
  onSwapItems 
}: ComparisonHeaderProps) {
  const [selectedType, setSelectedType] = useState<'product' | 'laboratory' | 'segment'>(selectedItems.type || 'product');
  const [itemA, setItemA] = useState(selectedItems.itemA);
  const [itemB, setItemB] = useState(selectedItems.itemB);

  const handleTypeChange = (type: 'product' | 'laboratory' | 'segment') => {
    setSelectedType(type);
    setItemA(null);
    setItemB(null);
    onItemsChange(null, null, type);
  };

  const handleItemAChange = (item: any) => {
    setItemA(item);
    onItemsChange(item, itemB, selectedType);
  };

  const handleItemBChange = (item: any) => {
    setItemB(item);
    onItemsChange(itemA, item, selectedType);
  };

  const handleSwap = () => {
    setItemA(itemB);
    setItemB(itemA);
    onSwapItems();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      {/* Type selector tabs */}
      <div className="flex flex-wrap items-center mb-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-4">
          Comparer :
        </span>
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-1 flex space-x-1">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              selectedType === 'product'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => handleTypeChange('product')}
          >
            <div className="flex items-center">
              <FiBarChart2 className="mr-1.5" size={16} />
              Produits
            </div>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              selectedType === 'laboratory'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => handleTypeChange('laboratory')}
          >
            <div className="flex items-center">
              <FiPackage className="mr-1.5" size={16} />
              Laboratoires
            </div>
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              selectedType === 'segment'
                ? 'bg-white dark:bg-gray-600 text-sky-600 dark:text-sky-400 shadow-sm' 
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
            }`}
            onClick={() => handleTypeChange('segment')}
          >
            <div className="flex items-center">
              <FiGrid className="mr-1.5" size={16} />
              Segments
            </div>
          </button>
        </div>
      </div>

      {/* Comparison selectors */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              A
            </span>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Premier élément
            </span>
          </div>
          
          {selectedType === 'product' && (
            <ProductSearchCombobox 
              selectedItem={itemA} 
              onChange={handleItemAChange} 
            />
          )}
          
          {selectedType === 'laboratory' && (
            <LaboratorySearchCombobox 
              selectedItem={itemA} 
              onChange={handleItemAChange} 
            />
          )}
          
          {selectedType === 'segment' && (
            <SegmentSearchCombobox 
              selectedItem={itemA} 
              onChange={handleItemAChange} 
            />
          )}
        </div>

        <div className="flex justify-center md:col-span-2">
          <Button
            variant="outline"
            onClick={handleSwap}
            disabled={!itemA || !itemB}
            className="p-2 h-10 w-10 rounded-full"
          >
            <FiRefreshCw size={18} />
          </Button>
        </div>

        <div className="md:col-span-5">
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
              B
            </span>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Second élément
            </span>
          </div>
          
          {selectedType === 'product' && (
            <ProductSearchCombobox 
              selectedItem={itemB} 
              onChange={handleItemBChange} 
            />
          )}
          
          {selectedType === 'laboratory' && (
            <LaboratorySearchCombobox 
              selectedItem={itemB} 
              onChange={handleItemBChange} 
            />
          )}
          
          {selectedType === 'segment' && (
            <SegmentSearchCombobox 
              selectedItem={itemB} 
              onChange={handleItemBChange} 
            />
          )}
        </div>
      </div>
    </div>
  );
}