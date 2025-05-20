// src/components/comparison/ProductSearchCombobox.tsx
import React, { useState, useEffect } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface Product {
  id: string;
  name: string;
  code_ean: string;
  brand_lab?: string;
  category?: string;
}

interface ProductSearchComboboxProps {
  selectedItem: Product | null;
  onChange: (product: Product | null) => void;
}

export function ProductSearchCombobox({ selectedItem, onChange }: ProductSearchComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulation de chargement de produits - à remplacer par un appel API réel
  useEffect(() => {
    if (query.length < 2) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setIsLoading(true);
      
      // Pour la maquette, on simule un délai et génère des données fictives
      setTimeout(() => {
        // Création de données fictives
        const mockProducts: Product[] = [];
        
        for (let i = 1; i <= 10; i++) {
          mockProducts.push({
            id: `prod-${i}`,
            name: `${query.toUpperCase()} Produit ${i}`,
            code_ean: `${Math.floor(Math.random() * 10000000000000)}`,
            brand_lab: ['Sanofi', 'Pfizer', 'Bayer', 'Novartis', 'Roche'][Math.floor(Math.random() * 5)],
            category: ['Douleur', 'Digestion', 'Vitamines', 'Hygiène', 'Beauté'][Math.floor(Math.random() * 5)]
          });
        }
        
        setProducts(mockProducts);
        setIsLoading(false);
      }, 500);
    };

    fetchProducts();
  }, [query]);

  // Gestion de la sélection d'un produit
  const handleSelect = (product: Product) => {
    onChange(product);
    setIsOpen(false);
    setQuery('');
  };

  // Effacer la sélection
  const handleClear = () => {
    onChange(null);
    setQuery('');
  };

  return (
    <div className="relative">
      {selectedItem ? (
        <div className="flex items-center justify-between w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700">
          <div className="flex items-center overflow-hidden">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                {selectedItem.name.substring(0, 2)}
              </span>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedItem.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {selectedItem.brand_lab && `${selectedItem.brand_lab} • `}
                {selectedItem.code_ean}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            onClick={handleClear}
          >
            <FiX size={18} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length >= 2) {
                setIsOpen(true);
              } else {
                setIsOpen(false);
              }
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:text-white sm:text-sm"
            placeholder="Rechercher un produit..."
          />
        </div>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">
              {isLoading ? 'Chargement...' : `${products.length} produits trouvés`}
            </p>
          </div>

          {isLoading ? (
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : products.length > 0 ? (
            <ul className="py-1">
              {products.map((product) => (
                <li 
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.name.substring(0, 2)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {product.brand_lab && `${product.brand_lab} • `}
                        {product.code_ean}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Aucun produit trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}