// src/components/docs/DocSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
export interface DocItem {
  slug: string;
  title: string;
}

export interface DocSection {
  title: string;
  items: DocItem[];
}

// Structure statique pour éviter les appels côté client
const structure: DocSection[] = [
  {
    title: 'Prise en main',
    items: [
      { slug: 'getting-started', title: 'Premiers pas' }
    ]
  },
  {
    title: 'Data',
    items: [
      { slug: 'data/collection', title: 'Collecte des données' },
    ]
  },
  {
    title: 'Fonctionnalités',
    items: [
      { slug: 'features/segment-filter', title: 'Filtre de produits' },
      { slug: 'features/date-filter', title: 'Filtre de dates' },
      { slug: 'features/dashboard', title: 'Page globale' },
      { slug: 'features/product-page', title: 'Page Produit' },
      { slug: 'features/laboratory-page', title: 'Page Labo' }
    ]
  }
];

export function DocSidebar() {
  const pathname = usePathname();
  
  return (
    <div className="sticky top-4">
      <div className="mb-6">
        <Link href="/docs" className="flex items-center">
          <span className="text-xl font-bold text-sky-600">ApoData</span>
          <span className="text-gray-800 ml-1">Docs</span>
        </Link>
      </div>
      
      <nav>
        <ul className="space-y-1">
          {/* Accueil */}
          <li>
            <Link 
              href="/docs" 
              className={`block px-3 py-2 rounded-md text-sm ${
                pathname === '/docs' 
                  ? 'bg-sky-50 text-sky-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Accueil
            </Link>
          </li>
          
          {/* Sections */}
          {structure.map(section => (
            <li key={section.title} className="mt-6">
              <h3 className="font-medium text-xs uppercase tracking-wider text-gray-500 px-3 py-2">
                {section.title}
              </h3>
              <ul className="mt-1">
                {section.items.map(item => {
                  const itemPath = `/docs/${item.slug}`;
                  const isActive = pathname === itemPath;
                  
                  return (
                    <li key={item.slug}>
                      <Link 
                        href={itemPath} 
                        className={`block px-3 py-2 rounded-md text-sm ${
                          isActive 
                            ? 'bg-sky-50 text-sky-700 font-medium' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}