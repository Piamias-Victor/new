// src/components/ui/ProgressBar.tsx
import React from 'react';

interface ProgressBarProps {
  value: number;
  maxValue: number;
  label?: string;
  colorClass?: string;
  showPercentage?: boolean;
  height?: string;
}

export function ProgressBar({
  value,
  maxValue,
  label,
  colorClass = 'bg-sky-500',
  showPercentage = true,
  height = 'h-2'
}: ProgressBarProps) {
  // Calcul du pourcentage
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);
  
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
          {showPercentage && (
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full ${height} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${colorClass} ${height} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}