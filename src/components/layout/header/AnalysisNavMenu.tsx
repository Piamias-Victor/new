'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiChevronDown, FiBox, FiPackage, FiGrid, FiBarChart2, FiArrowRight, FiCopy, FiTruck } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext';

export function AnalysisNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { startDate, endDate } = useDateRange();
  const pathname = usePathname();
  
  // Obtenir le nom actuel de l'analyse à partir du chemin
  const getCurrentAnalysisName = () => {
    if (pathname.includes('/products')) return 'Produit';
    if (pathname.includes('/laboratories')) return 'Laboratoire';
    if (pathname.includes('/categories')) return 'Catégorie';
    if (pathname.includes('/generics')) return 'Générique';
    if (pathname.includes('/wholesalers')) return 'Grossiste';
    return 'Global';
  };

  // Obtenir l'icône de l'analyse actuelle
  const getCurrentAnalysisIcon = () => {
    if (pathname.includes('/products')) return <FiBox size={16} className="text-sky-600 dark:text-sky-400" />;
    if (pathname.includes('/laboratories')) return <FiPackage size={16} className="text-teal-600 dark:text-teal-400" />;
    if (pathname.includes('/categories')) return <FiGrid size={16} className="text-emerald-600 dark:text-emerald-400" />;
    if (pathname.includes('/generics')) return <FiCopy size={16} className="text-purple-600 dark:text-purple-400" />;
    if (pathname.includes('/wholesalers')) return <FiTruck size={16} className="text-amber-600 dark:text-amber-400" />;
    return <FiBarChart2 size={16} className="text-sky-600 dark:text-sky-400" />;
  };

  // Fermer le menu lors d'un clic à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Créer des URL avec les paramètres de date actuels
  const createUrlWithParams = (baseUrl: string) => {
    const url = new URL(baseUrl, window.location.origin);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    return url.pathname + url.search;
  };

  return (
    <div className="relative z-10" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-gray-800 flex items-center h-10 pl-4 pr-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-sm hover:border-sky-300 dark:hover:border-sky-600 transition-colors duration-150 group"
      >
        <div className="flex items-center space-x-2">
          <span className="flex items-center">
            {getCurrentAnalysisIcon()}
            <span className="ml-2 text-sm font-medium text-gray-800 dark:text-gray-200">
              {getCurrentAnalysisName()}
            </span>
          </span>
        </div>
        <div className="ml-2 text-gray-400 group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors duration-150">
          <FiChevronDown size={16} className={isOpen ? "transform rotate-180" : ""} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-1">
            <Link
              href={createUrlWithParams("/dashboard/detailed/products")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-sky-50 dark:hover:bg-sky-900/20 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiBox className="mr-3 text-sky-500 dark:text-sky-400" size={16} />
                <span>Analyse par Produit</span>
              </div>
              {pathname.includes('/products') && (
                <FiArrowRight className="text-sky-500 dark:text-sky-400" size={14} />
              )}
            </Link>
            
            <Link
              href={createUrlWithParams("/dashboard/detailed/laboratories")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-teal-50 dark:hover:bg-teal-900/20 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiPackage className="mr-3 text-teal-500 dark:text-teal-400" size={16} />
                <span>Analyse par Laboratoire</span>
              </div>
              {pathname.includes('/laboratories') && (
                <FiArrowRight className="text-teal-500 dark:text-teal-400" size={14} />
              )}
            </Link>
            
            <Link
              href={createUrlWithParams("/dashboard/detailed/categories")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiGrid className="mr-3 text-emerald-500 dark:text-emerald-400" size={16} />
                <span>Analyse par Catégorie</span>
              </div>
              {pathname.includes('/categories') && (
                <FiArrowRight className="text-emerald-500 dark:text-emerald-400" size={14} />
              )}
            </Link>
            
            <Link
              href={createUrlWithParams("/dashboard/detailed/generics")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiCopy className="mr-3 text-purple-500 dark:text-purple-400" size={16} />
                <span>Analyse par Générique</span>
              </div>
              {pathname.includes('/generics') && (
                <FiArrowRight className="text-purple-500 dark:text-purple-400" size={14} />
              )}
            </Link>
            
            <Link
              href={createUrlWithParams("/dashboard/detailed/wholesalers")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiTruck className="mr-3 text-amber-500 dark:text-amber-400" size={16} />
                <span>Analyse par Grossiste</span>
              </div>
              {pathname.includes('/wholesalers') && (
                <FiArrowRight className="text-amber-500 dark:text-amber-400" size={14} />
              )}
            </Link>
            
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
            
            <Link
              href={createUrlWithParams("/dashboard/detailed")}
              className="flex items-center justify-between px-4 py-2.5 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center">
                <FiBarChart2 className="mr-3 text-sky-500 dark:text-sky-400" size={16} />
                <span>Global</span>
              </div>
              {pathname === '/dashboard/detailed' && (
                <FiArrowRight className="text-sky-500 dark:text-sky-400" size={14} />
              )}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}