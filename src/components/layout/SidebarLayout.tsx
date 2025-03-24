// src/components/layout/SidebarLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import { FilterSidebar } from '../sidebar/FilterSidebar';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - visible uniquement sur desktop */}
      <div className="hidden md:block md:w-80 lg:w-96 flex-shrink-0">
        <div className="sticky top-20 overflow-y-auto h-[calc(100vh-80px)] p-4">
          <FilterSidebar />
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}