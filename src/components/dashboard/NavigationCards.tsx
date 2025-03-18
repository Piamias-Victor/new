import React from 'react';
import Link from 'next/link';
import { FiBox, FiPackage, FiGrid, FiSearch, FiBarChart, FiTrendingUp, FiShoppingBag, FiActivity } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';

// Type pour les données de navigation
interface NavigationCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonIcon: React.ReactNode;
  buttonText: string;
  path: string;
  bgColorClass: string;
  textColorClass: string;
}

// Composant de carte de navigation individuelle
function NavigationCard({ 
  title, 
  description, 
  icon, 
  buttonIcon, 
  buttonText,

  path, 
  bgColorClass, 
  textColorClass 
}: NavigationCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg ${bgColorClass} ${textColorClass} mr-4`}>
            {icon}
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {description}
        </p>
        <Link
          href={path}
          className="inline-flex items-center py-2 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-medium transition-colors"
        >
          {buttonIcon}
          {buttonText}
        </Link>
      </div>     
    </div>
  );
}

export function NavigationCards() {
  const { startDate, endDate } = useDateRange();
  
  // Créer les URL avec les paramètres de date actuels
  const createUrlWithParams = (baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    return url.pathname + url.search;
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Explorer les analyses
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte d'analyse par produit */}
        <NavigationCard
          title="Par produit"
          description="Analysez les performances de chaque produit individuellement avec des recherches par code EAN13 ou nom."
          icon={<FiBox size={22} />}
          buttonIcon={<FiSearch className="mr-2" size={16} />}
          buttonText="Rechercher un produit"
          path={createUrlWithParams("/dashboard/detailed/products")}
          bgColorClass="bg-sky-100 dark:bg-sky-900/30"
          textColorClass="text-sky-600 dark:text-sky-300"
        />
        
        {/* Carte d'analyse par laboratoire */}
        <NavigationCard
          title="Par laboratoire"
          description="Évaluez les performances par fabricant ou laboratoire pour identifier les partenaires stratégiques."
          icon={<FiPackage size={22} />}
          buttonIcon={<FiBarChart className="mr-2" size={16} />}
          buttonText="Explorer les laboratoires"
          path={createUrlWithParams("/dashboard/detailed/laboratories")}
          bgColorClass="bg-teal-100 dark:bg-teal-900/30"
          textColorClass="text-teal-600 dark:text-teal-300"
        />
        
        {/* Carte d'analyse par catégorie */}
        <NavigationCard
          title="Par catégorie"
          description="Analysez les tendances et performances par segment de marché pour optimiser votre offre commerciale."
          icon={<FiGrid size={22} />}
          buttonIcon={<FiTrendingUp className="mr-2" size={16} />}
          buttonText="Analyser les catégories"
          path={createUrlWithParams("/dashboard/detailed/categories")}
          bgColorClass="bg-emerald-100 dark:bg-emerald-900/30"
          textColorClass="text-emerald-600 dark:text-emerald-300"
        />
      </div>
    </div>
  );
}