// src/components/shared/ApplyButton.tsx (Version toujours active)
import React from 'react';
import { FiPlay, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { useDataLoading } from '@/contexts/DataLoadingContext';

interface ApplyButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ApplyButton({ 
  variant = 'primary', 
  size = 'md',
  className = '' 
}: ApplyButtonProps) {
  const { triggerDataLoad, isGlobalLoading, activeRequestsCount } = useDataLoading();
  
  // Classes CSS en fonction des props
  const baseClasses = 'inline-flex items-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
  
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
    ${className}
  `.trim();
  
  // Fonction pour gérer le clic
  const handleClick = () => {
    console.log('🔄 ApplyButton: Déclenchement de l\'application');
    triggerDataLoad();
  };
  
  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      title={isGlobalLoading 
        ? `Rechargement en cours... (${activeRequestsCount} requêtes) - Cliquer pour relancer` 
        : 'Appliquer les paramètres et charger les données'
      }
    >
      {isGlobalLoading ? (
        <>
          <FiRefreshCw 
            className="animate-spin mr-2" 
            size={iconSizes[size]} 
          />
          <span>Rechargement...</span>
          {activeRequestsCount > 0 && (
            <span className="ml-1 text-xs opacity-75">
              ({activeRequestsCount})
            </span>
          )}
        </>
      ) : (
        <>
          <FiPlay className="mr-2" size={iconSizes[size]} />
          <span>Appliquer</span>
        </>
      )}
    </button>
  );
}