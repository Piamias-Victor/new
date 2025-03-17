import React from 'react';
import Link from 'next/link';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface TopItem {
  name: string;
  value: string;
  change: string;
}

interface AnalysisCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonIcon: React.ReactNode;
  buttonText: string;
  linkPath: string;
  topItems: TopItem[];
  topTitle: string;
  bgColorClass: string;
  textColorClass: string;
}

export function AnalysisCategoryCard({
  title,
  description,
  icon,
  buttonIcon,
  buttonText,
  linkPath,
  topItems,
  topTitle,
  bgColorClass,
  textColorClass
}: AnalysisCategoryCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
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
          href={linkPath}
          className="inline-flex items-center py-2 px-4 rounded-lg bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-medium transition-colors"
        >
          {buttonIcon}
          {buttonText}
        </Link>
      </div>     
    </div>
  );
}