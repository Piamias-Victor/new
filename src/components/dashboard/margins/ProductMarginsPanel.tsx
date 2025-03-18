import React, { useState, useMemo } from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import { Product } from '@/services/productService';
import { MarginProductData } from '@/hooks/useProductMargins';
import { MarginSummaryCard } from './MarginSummaryCard';
import { MarginProductsModal } from './MarginProductsModal';

interface ProductMarginsPanelProps {
  products: Product[];
  labData?: any;
  isLoading: boolean;
}

export function ProductMarginsPanel({ 
  products, 
  labData = {}, 
  isLoading 
}: ProductMarginsPanelProps) {
  // État pour la modale
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<MarginProductData[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  // Calculer les marges 
  const marginCategories = useMemo(() => {
    // Utiliser les données du laboratoire si disponibles
    const negativeMargin = labData?.margins?.negativeMargin || [];
    const lowMargin = labData?.margins?.lowMargin || [];
    const mediumMargin = labData?.margins?.mediumMargin || [];
    const goodMargin = labData?.margins?.goodMargin || [];
    const excellentMargin = labData?.margins?.excellentMargin || [];

    // Si les données du laboratoire existent et contiennent des catégories, les utiliser
    if (negativeMargin.length || lowMargin.length || mediumMargin.length || 
        goodMargin.length || excellentMargin.length) {
      return {
        negativeMargin,
        lowMargin,
        mediumMargin,
        goodMargin,
        excellentMargin
      };
    }

    // Consolidation des produits par code_13_ref (identifiant unique du produit)
    const consolidatedProducts = products.reduce((acc, product) => {
      const existingProduct = acc.find(p => p.code_13_ref === product.code_13_ref);
      
      if (!existingProduct) {
        // Premier produit de ce type
        acc.push({
          code_13_ref: product.code_13_ref || '',
          display_name: product.display_name || product.name,
          current_stock: Number(product.current_stock) || 0,
          price_with_tax: Number(product.price_with_tax) || 0,
          weighted_average_price: Number(product.weighted_average_price) || 0,
          tva_rate: Number(product.tva_rate) || 0,
          total_sales: Number(product.total_sales) || 0
        });
      } else {
        // Accumulation des données pour ce produit
        existingProduct.current_stock += Number(product.current_stock) || 0;
        existingProduct.total_sales += Number(product.total_sales) || 0;
        
        // Prendre le prix et le coût du produit avec le plus de ventes
        if (Number(product.total_sales) > existingProduct.total_sales) {
          existingProduct.price_with_tax = Number(product.price_with_tax) || existingProduct.price_with_tax;
          existingProduct.weighted_average_price = Number(product.weighted_average_price) || existingProduct.weighted_average_price;
          existingProduct.tva_rate = Number(product.tva_rate) || existingProduct.tva_rate;
        }
      }
      
      return acc;
    }, [] as Array<{
      code_13_ref: string, 
      display_name: string, 
      current_stock: number,
      price_with_tax: number,
      weighted_average_price: number,
      tva_rate: number,
      total_sales: number
    }>);

    // Conversion en données de marge
    const convertedProducts: MarginProductData[] = consolidatedProducts.map(product => {
      // Calculer le prix HT
      const priceHT = product.price_with_tax / (1 + product.tva_rate / 100);
      
      // Calculer la marge
      const marginAmount = priceHT - product.weighted_average_price;
      const marginPercentage = (marginAmount / product.weighted_average_price) * 100;
      
      return {
        id: product.code_13_ref,
        product_name: product.display_name,
        global_name: product.display_name,
        display_name: product.display_name,
        category: '', // Pourrait être ajouté si nécessaire
        brand_lab: '', // Pourrait être ajouté si nécessaire
        code_13_ref: product.code_13_ref,
        current_stock: product.current_stock,
        price_with_tax: product.price_with_tax,
        weighted_average_price: product.weighted_average_price,
        margin_percentage: marginPercentage,
        margin_amount: marginAmount * product.total_sales,
        total_sales: product.total_sales
      };
    });
    
    // Classifier par catégories de marge
    return {
      negativeMargin: convertedProducts.filter(p => p.margin_percentage < 0),
      lowMargin: convertedProducts.filter(p => p.margin_percentage >= 0 && p.margin_percentage < 10),
      mediumMargin: convertedProducts.filter(p => p.margin_percentage >= 10 && p.margin_percentage < 20),
      goodMargin: convertedProducts.filter(p => p.margin_percentage >= 20 && p.margin_percentage <= 35),
      excellentMargin: convertedProducts.filter(p => p.margin_percentage > 35)
    };
  }, [products, labData]);
  
  // Fonction pour ouvrir la modale avec une catégorie spécifique
  const openModal = (products: MarginProductData[], title: string) => {
    setSelectedProducts(products);
    setModalTitle(title);
    setModalOpen(true);
  };
  
  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full mr-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-6 w-6 bg-gray-200 dark:bg-gray-600 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Si pas de produits, ne rien afficher
  if (!products.length) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FiTrendingUp className="text-gray-500 dark:text-gray-400 mr-2" size={18} />
        <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
          Analyse des marges
        </h2>
      </div>
      
      <div className="space-y-3">
        <MarginSummaryCard
          title="Marge négative"
          description="Produits vendus à perte"
          count={marginCategories.negativeMargin.length}
          colorScheme="red"
          icon="negative"
          onClick={() => openModal(marginCategories.negativeMargin, "Produits vendus à perte")}
        />
        
        <MarginSummaryCard
          title="Marge faible"
          description="Produits avec marge inférieure à 10%"
          count={marginCategories.lowMargin.length}
          colorScheme="amber"
          icon="low"
          onClick={() => openModal(marginCategories.lowMargin, "Produits avec marge inférieure à 10%")}
        />
        
        <MarginSummaryCard
          title="Marge moyenne"
          description="Produits avec marge entre 10% et 20%"
          count={marginCategories.mediumMargin.length}
          colorScheme="blue"
          icon="medium"
          onClick={() => openModal(marginCategories.mediumMargin, "Produits avec marge entre 10% et 20%")}
        />
        
        <MarginSummaryCard
          title="Bonne marge"
          description="Produits avec marge entre 20% et 35%"
          count={marginCategories.goodMargin.length}
          colorScheme="green"
          icon="good"
          onClick={() => openModal(marginCategories.goodMargin, "Produits avec marge entre 20% et 35%")}
        />
        
        <MarginSummaryCard
          title="Marge excellente"
          description="Produits avec marge supérieure à 35%"
          count={marginCategories.excellentMargin.length}
          colorScheme="purple"
          icon="excellent"
          onClick={() => openModal(marginCategories.excellentMargin, "Produits avec marge supérieure à 35%")}
        />
      </div>
      
      {/* Modale pour afficher les produits */}
      <MarginProductsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        products={selectedProducts}
        title={modalTitle}
      />
    </div>
  );
}