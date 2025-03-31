// src/components/sidebar/SidebarNavigation.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiBox, FiPackage, FiGrid, FiBarChart2, FiCopy, FiTruck } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';
import { SidebarCard } from './SidebarCard';

export function SidebarNavigation() {
  const { startDate, endDate } = useDateRange();
  const pathname = usePathname();
  
  // Créer des URL avec les paramètres de date actuels
  const createUrlWithParams = (baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    return url.pathname + url.search;
  };

  // Vérifier si un lien est actif
  const isActive = (path: string) => {
    return pathname?.includes(path);
  };

  return (
    <SidebarCard title="Navigation" icon={<FiBarChart2 size={16} className="text-sky-500" />}>
      <nav className="flex flex-col space-y-1">
        <Link
          href={createUrlWithParams("/dashboard")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            pathname === '/dashboard'
              ? 'bg-gray-100 dark:bg-gray-700 text-sky-600 dark:text-sky-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiBarChart2 className="mr-2 text-sky-500 dark:text-sky-400" size={16} />
          <span>Tableau de bord</span>
        </Link>
        
        <Link
          href={createUrlWithParams("/dashboard/detailed/products")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            isActive('/products')
              ? 'bg-gray-100 dark:bg-gray-700 text-sky-600 dark:text-sky-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiBox className="mr-2 text-sky-500 dark:text-sky-400" size={16} />
          <span>Par produit</span>
        </Link>
        
        <Link
          href={createUrlWithParams("/dashboard/detailed/laboratories")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            isActive('/laboratories')
              ? 'bg-gray-100 dark:bg-gray-700 text-teal-600 dark:text-teal-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiPackage className="mr-2 text-teal-500 dark:text-teal-400" size={16} />
          <span>Par laboratoire</span>
        </Link>
        
        {/* <Link
          href={createUrlWithParams("/dashboard/detailed/categories")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            isActive('/categories')
              ? 'bg-gray-100 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiGrid className="mr-2 text-emerald-500 dark:text-emerald-400" size={16} />
          <span>Par catégorie</span>
        </Link> */}
        
        {/* <Link
          href={createUrlWithParams("/dashboard/detailed/generics")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            isActive('/generics')
              ? 'bg-gray-100 dark:bg-gray-700 text-purple-600 dark:text-purple-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiCopy className="mr-2 text-purple-500 dark:text-purple-400" size={16} />
          <span>Par générique</span>
        </Link> */}
        
        {/* <Link
          href={createUrlWithParams("/dashboard/detailed/wholesalers")}
          className={`flex items-center px-2 py-1.5 text-sm rounded-md transition-colors ${
            isActive('/wholesalers')
              ? 'bg-gray-100 dark:bg-gray-700 text-amber-600 dark:text-amber-400'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <FiTruck className="mr-2 text-amber-500 dark:text-amber-400" size={16} />
          <span>Par grossiste</span>
        </Link> */}
      </nav>
    </SidebarCard>
  );
}