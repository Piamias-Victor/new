// src/components/dashboard/evolution/EvolutionSummaryCard.tsx
import React from 'react';
import { 
  FiTrendingDown, 
  FiTrendingUp, 
  FiArrowDown, 
  FiArrowUp, 
  FiMinus,
  FiExternalLink 
} from 'react-icons/fi';

// Types de schémas de couleur disponibles
type ColorScheme = 'red' | 'amber' | 'blue' | 'green' | 'purple';

interface EvolutionSummaryCardProps {
  title: string;
  description: string;
  count: number;
  colorScheme: ColorScheme;
  icon: 'strong-decrease' | 'slight-decrease' | 'stable' | 'slight-increase' | 'strong-increase';
  onClick: () => void;
}

export function EvolutionSummaryCard({ 
  title, 
  description, 
  count, 
  colorScheme,
  icon,
  onClick
}: EvolutionSummaryCardProps) {
  // Couleurs de fond et texte par schéma de couleur
  const bgColors = {
    red: 'bg-red-50 dark:bg-red-900/20',
    amber: 'bg-amber-50 dark:bg-amber-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    purple: 'bg-purple-50 dark:bg-purple-900/20'
  };
  
  const iconBgColors = {
    red: 'bg-red-100 dark:bg-red-900/30',
    amber: 'bg-amber-100 dark:bg-amber-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30'
  };
  
  const textColors = {
    red: 'text-red-600 dark:text-red-400',
    amber: 'text-amber-600 dark:text-amber-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    purple: 'text-purple-600 dark:text-purple-400'
  };

  // Choix de l'icône
  const getIcon = () => {
    switch (icon) {
      case 'strong-decrease':
        return <FiTrendingDown size={20} />;
      case 'slight-decrease':
        return <FiArrowDown size={20} />;
      case 'stable':
        return <FiMinus size={20} />;
      case 'slight-increase':
        return <FiArrowUp size={20} />;
      case 'strong-increase':
        return <FiTrendingUp size={20} />;
      default:
        return <FiMinus size={20} />;
    }
  };

  return (
    <div 
      className={`flex items-center justify-between p-3 ${bgColors[colorScheme]} rounded-lg cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`w-8 h-8 flex items-center justify-center ${iconBgColors[colorScheme]} ${textColors[colorScheme]} rounded-full mr-3`}>
          {getIcon()}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">{title}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{description}</div>
        </div>
      </div>
      <div className="flex items-center">
        <div className={`text-xl font-bold ${textColors[colorScheme]}`}>
          {count}
        </div>
        {count > 0 && (
          <FiExternalLink className={`ml-1.5 ${textColors[colorScheme]}`} size={16} />
        )}
      </div>
    </div>
  );
}