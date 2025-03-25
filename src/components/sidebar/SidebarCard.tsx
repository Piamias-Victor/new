// src/components/sidebar/SidebarCard.tsx
import React, { ReactNode } from 'react';

interface SidebarCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SidebarCard({ title, icon, children, className = '' }: SidebarCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 ${className}`}>
      <div className="flex items-center mb-3">
        {icon && <span className="mr-2">{icon}</span>}
        <h3 className="font-medium text-gray-800 dark:text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
}