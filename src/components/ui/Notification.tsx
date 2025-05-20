// src/components/ui/Notification.tsx
import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiX } from 'react-icons/fi';

interface NotificationProps {
  type: 'success' | 'error';
  message: string;
  onClose?: () => void;
}

export const Notification: React.FC<NotificationProps> = ({
  type,
  message,
  onClose
}) => {
  const bgColor = type === 'success' 
    ? 'bg-green-50 dark:bg-green-900/20' 
    : 'bg-red-50 dark:bg-red-900/20';
  
  const textColor = type === 'success' 
    ? 'text-green-700 dark:text-green-400' 
    : 'text-red-700 dark:text-red-400';
  
  const Icon = type === 'success' ? FiCheckCircle : FiAlertCircle;
  
  return (
    <div className={`mb-6 p-4 ${bgColor} ${textColor} rounded-md flex items-start`}>
      <Icon className="h-5 w-5 mr-3 mt-0.5" />
      <div className="flex-1">{message}</div>
      
      {onClose && (
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <FiX className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};