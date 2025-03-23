import React, { useState, useEffect } from 'react';
import { FiPackage, FiGrid, FiLayers, FiFolder, FiDatabase, FiCalendar, FiRotateCw, FiCode } from 'react-icons/fi';
import { useDateRange } from '@/contexts/DateRangeContext'; // Ajout de l'import

// Interface pour les données du produit
interface ProductData {
  id: string;
  name: string;
  code_13_ref: string;
  universe?: string;
  category?: string;
  family?: string;
  sub_family?: string;
  brand_lab?: string;
  range_name?: string;
  first_seen_date?: string;
  avg_monthly_rotation?: number;
}

// Nouvelles props - on attend seulement le code EAN
interface ProductInfoTabProps {
  code13ref: string;
}

export function ProductInfoTab({ code13ref }: ProductInfoTabProps) {
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Récupération des dates sélectionnées à partir du contexte
  const { startDate, endDate } = useDateRange();

  // Appel à l'API pour charger les données du produit
  useEffect(() => {
    async function fetchProductData() {
      if (!code13ref) {
        setIsLoading(false);
        setError("Code EAN manquant");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Ajouter les paramètres de date à la requête si disponibles
        let url = `/api/products/${code13ref}/information`;
        if (startDate && endDate) {
          url += `?startDate=${startDate}&endDate=${endDate}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données du produit:", err);
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductData();
  }, [code13ref, startDate, endDate]); // Ajout des dépendances startDate et endDate

  // Formater la date en format français (DD/MM/YYYY)
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Si chargement en cours, afficher un placeholder élégant
  if (isLoading) {
    return (
      <div className="animate-pulse p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-md w-1/3 mb-8"></div>
        <div className="grid grid-cols-2 gap-8">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Si erreur, afficher le message
  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-600 dark:text-red-400">
          <h3 className="text-lg font-medium mb-2">Erreur de chargement</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Si pas de produit, afficher un message
  if (!product) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="text-center">
          <FiPackage className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">Pas de données</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Aucune information disponible pour ce produit.
          </p>
        </div>
      </div>
    );
  }

  // Structuration des informations avec icônes appropriées
  const infoSections = [
    {
      title: "Identification",
      items: [
        { icon: <FiPackage className="text-sky-500" />, label: 'Nom', value: product.name },
        { icon: <FiCode className="text-sky-500" />, label: 'Code EAN', value: product.code_13_ref }
      ]
    },
    {
      title: "Classification",
      items: [
        { icon: <FiGrid className="text-emerald-500" />, label: 'Univers', value: product.universe || 'Non catégorisé' },
        { icon: <FiLayers className="text-emerald-500" />, label: 'Catégorie', value: product.category || 'Non catégorisé' },
        { icon: <FiFolder className="text-emerald-500" />, label: 'Famille', value: product.family || 'Non catégorisé' },
        { icon: <FiFolder className="text-emerald-500" />, label: 'Sous-famille', value: product.sub_family || 'Non catégorisé' }
      ]
    },
    {
      title: "Commercial",
      items: [
        { icon: <FiDatabase className="text-amber-500" />, label: 'Laboratoire', value: product.brand_lab || 'Non spécifié' },
        { icon: <FiDatabase className="text-amber-500" />, label: 'Gamme', value: product.range_name || 'Non spécifié' }
      ]
    },
    {
      title: "Performance",
      items: [
        { 
          icon: <FiCalendar className="text-purple-500" />, 
          label: 'Première trace', 
          value: formatDate(product.first_seen_date) 
        }
      ]
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b pb-2 border-gray-200 dark:border-gray-700">
        Informations du produit
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
        {infoSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {section.title}
            </h3>
            
            <div className="space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              {section.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}