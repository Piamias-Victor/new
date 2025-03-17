import React from 'react';
import Link from 'next/link';
import { FiBarChart2, FiActivity } from 'react-icons/fi';

// Type pour les données de navigation
interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

// Composant de carte de navigation individuelle
function NavigationCard({ title, description, icon, path }: NavigationCardProps) {
  return (
    <Link 
      href={path}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start">
        <div className="p-3 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 text-white mr-4 flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function NavigationCards() {
  // Données des cartes de navigation
  const navigationItems = [
    {
      title: "Analyse Détaillée",
      description: "Explorez les données spécifiques par produit, catégorie ou laboratoire",
      path: "/dashboard/detailed",
      icon: <FiBarChart2 size={24} />
    },
    {
      title: "Analyse Comparative",
      description: "Comparez les performances entre différentes périodes ou pharmacies",
      path: "/dashboard/comparative",
      icon: <FiActivity size={24} />
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Explorer les analyses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {navigationItems.map((item, index) => (
          <NavigationCard
            key={index}
            title={item.title}
            description={item.description}
            icon={item.icon}
            path={item.path}
          />
        ))}
      </div>
    </div>
  );
}