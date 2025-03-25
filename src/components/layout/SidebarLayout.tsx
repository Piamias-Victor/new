// src/components/layout/SidebarLayout.tsx
'use client';

import React, { useState, ReactNode } from 'react';
import { FilterSidebar } from '../sidebar/FilterSidebar';
import { SidebarNavigation } from '../sidebar/SidebarNavigation';
import { FiCalendar, FiHome, FiPackage, FiBarChart2 } from 'react-icons/fi';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const expandSidebar = () => {
    setIsCollapsed(false);
  };

  const collapseSidebar = () => {
    setIsCollapsed(true);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visible uniquement sur desktop */}
      <div 
        className={`hidden md:flex flex-col ${isCollapsed ? 'w-16' : 'w-60'} flex-shrink-0 transition-all duration-300 ease-in-out relative group z-10`}
        onMouseEnter={expandSidebar}
        onMouseLeave={collapseSidebar}
      >
        <div className="sticky top-20 h-[calc(100vh-80px)] overflow-y-auto py-4 flex flex-col">
          {/* Contenu de la sidebar déplié */}
          <div className={`px-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 invisible absolute' : 'opacity-100 visible'}`}>
            <SidebarNavigation />
            <div className="mt-4">
              <FilterSidebar />
            </div>
          </div>
          
          {/* Version réduite de la sidebar */}
          <div className={`flex flex-col items-center space-y-6 py-4 transition-opacity duration-300 ${isCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible absolute'}`}>
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300" title="Analyse">
              <FiBarChart2 size={18} />
            </div>              
            <div className="p-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400" title="Période">
              <FiCalendar size={18} />
            </div>
            
            <div className="p-2 rounded-full bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" title="Pharmacies">
              <FiHome size={18} />
            </div>
            
            <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" title="Produits">
              <FiPackage size={18} />
            </div>
        
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}