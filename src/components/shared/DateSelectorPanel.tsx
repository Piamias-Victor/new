'use client';

import React, { useState } from 'react';
import { FiCalendar, FiClock, FiArrowRightCircle } from 'react-icons/fi';
import { ComparisonSelector } from './ComparisonSelector';
import { TabButton } from './TabButton';
import { PeriodSelector } from './PeriodSelector';
import { Button, GhostButton } from '@/components/ui/Button';
import { useDateRange } from '@/contexts/DateRangeContext';

interface DateSelectorPanelProps {
  onClose: () => void;
}

export function DateSelectorPanel({ onClose }: DateSelectorPanelProps) {
  const [tab, setTab] = useState<'primary' | 'comparison'>('primary');
  const { applyChanges } = useDateRange();
  
  // Handler pour appliquer les changements et fermer le panneau
  const handleApply = () => {
    applyChanges(); // Appliquer les changements
    onClose();
  };
  
  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <TabButton 
          label="Période d'analyse" 
          icon={<FiCalendar size={16} />} 
          isActive={tab === 'primary'} 
          onClick={() => setTab('primary')} 
        />
        <TabButton 
          label="Comparaison" 
          icon={<FiClock size={16} />} 
          isActive={tab === 'comparison'} 
          onClick={() => setTab('comparison')} 
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        {tab === 'primary' ? (
          <PeriodSelector />
        ) : (
          <ComparisonSelector />
        )}
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-200 dark:border-gray-700">
        <GhostButton
          size="sm"
          onClick={onClose}
        >
          Annuler
        </GhostButton>
        
        <Button
          size="sm"
          rightIcon={<FiArrowRightCircle />}
          onClick={handleApply}
        >
          Appliquer
        </Button>
      </div>
    </div>
  );
}