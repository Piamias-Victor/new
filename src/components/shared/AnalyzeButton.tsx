// src/components/shared/AnalyzeButton.tsx
import React from 'react';
import { FiPlay, FiLoader } from 'react-icons/fi';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface AnalyzeButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AnalyzeButton({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: AnalyzeButtonProps) {
  const { triggerDataLoad, isGlobalLoading, activeRequestsCount } = useDataLoading();
  
  // Classes CSS en fonction des props
  const baseClasses = 'inline-flex items-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 text-white',
    secondary: 'bg-white hover:bg-gray-50 focus:ring-sky-500 text-gray-900 border border-gray-300'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18
  };
  
  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant]} 
    ${sizeClasses[size]}
    ${isGlobalLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();
  
  return (
    <button
      onClick={triggerDataLoad}
      disabled={isGlobalLoading}
      className={buttonClasses}
      title={isGlobalLoading ? `Chargement en cours... (${activeRequestsCount} requêtes)` : 'Lancer l\'analyse des données'}
    >
      {isGlobalLoading ? (
        <>
          <FiLoader 
            className="animate-spin mr-2" 
            size={iconSizes[size]} 
          />
          <span>Analyse...</span>
          {activeRequestsCount > 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({activeRequestsCount})
            </span>
          )}
        </>
      ) : (
        <>
          <FiPlay className="mr-2" size={iconSizes[size]} />
          <span>Analyser</span>
        </>
      )}
    </button>
  );
}