// src/components/products/stock/LastOrdersCard.tsx
import React from 'react';
import { FiShoppingCart, FiCheck, FiClock, FiSend } from 'react-icons/fi';

interface Order {
  orderId: string;
  date: string;
  quantity: number;
  receivedQuantity: number;
  status: string;
}

interface LastOrdersCardProps {
  orders: Order[];
  isLoading?: boolean;
}

export function LastOrdersCard({
  orders,
  isLoading = false
}: LastOrdersCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Formatage de la date pour affichage
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR');
  };
  
  // Obtenir l'icône en fonction du statut
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reçue':
        return <FiCheck className="text-green-500" />;
      case 'envoyée':
        return <FiSend className="text-blue-500" />;
      case 'en cours':
        return <FiClock className="text-amber-500" />;
      default:
        return <FiClock className="text-gray-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
      <div className="flex items-center mb-4">
        <FiShoppingCart className="text-gray-500 dark:text-gray-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Dernières commandes
        </h3>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          Aucune commande récente pour ce produit
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {orders.map((order) => (
            <div key={order.orderId} className="py-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="mr-2">
                    {getStatusIcon(order.status)}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      Commande #{order.orderId.substring(0, 8)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(order.date)}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-gray-800 dark:text-gray-200 font-medium">
                    {order.receivedQuantity}/{order.quantity} unités
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}