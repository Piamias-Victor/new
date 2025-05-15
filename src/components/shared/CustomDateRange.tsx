// src/components/shared/date-selector/CustomDateRange.tsx
import React from 'react';

interface CustomDateRangeProps {
  startDate: string;
  endDate: string;
  onStartDateChange?: (value: string) => void;
  onEndDateChange?: (value: string) => void;
}

export function CustomDateRange({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: CustomDateRangeProps) {
  // Cette fonction gère les entrées vides et retourne une chaîne vide en cas de date invalide
  const formatDateForInput = (dateStr: string): string => {
    if (!dateStr) return '';
    
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      
      // Format YYYY-MM-DD requis pour l'input date
      return dateStr;
    } catch (e) {
      console.warn("Date invalide pour l'input:", dateStr);
      return '';
    }
  };
  
  return (
    <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/30 rounded border border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Du
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={formatDateForInput(startDate)}
            onChange={e => {
              const newDate = e.target.value;
              // Ne pas logger les erreurs si le champ est vide - c'est un état valide pendant la saisie
              if (newDate === '') {
                console.log("Champ date de début vidé");
                // Vous pouvez choisir de ne pas appeler onStartDateChange ici,
                // ou de l'appeler avec une date par défaut, selon votre logique
                return;
              }
              
              // Vérifier que la date est valide
              try {
                const date = new Date(newDate);
                if (!isNaN(date.getTime())) {
                  console.log("Date de début valide choisie:", newDate);
                  onStartDateChange && onStartDateChange(newDate);
                } else {
                  console.warn("Format de date non valide:", newDate);
                }
              } catch (error) {
                console.warn("Erreur lors du traitement de la date:", error);
              }
            }}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Au
          </label>
          <input
            type="date"
            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            value={formatDateForInput(endDate)}
            onChange={e => {
              const newDate = e.target.value;
              // Ne pas logger les erreurs si le champ est vide
              if (newDate === '') {
                console.log("Champ date de fin vidé");
                return;
              }
              
              // Vérifier que la date est valide
              try {
                const date = new Date(newDate);
                if (!isNaN(date.getTime())) {
                  console.log("Date de fin valide choisie:", newDate);
                  onEndDateChange && onEndDateChange(newDate);
                } else {
                  console.warn("Format de date non valide:", newDate);
                }
              } catch (error) {
                console.warn("Erreur lors du traitement de la date:", error);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}