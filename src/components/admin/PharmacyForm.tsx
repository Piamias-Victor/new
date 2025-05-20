// src/components/admin/PharmacyForm.tsx
import React from 'react';
import { FiSave, FiX } from 'react-icons/fi';

interface PharmacyFormProps {
  formData: {
    name: string;
    ca: string;
    area: string;
    employees_count: string;
    address: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const PharmacyForm: React.FC<PharmacyFormProps> = ({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSaving
}) => {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Informations modifiables
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nom de la pharmacie
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="ca" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chiffre d'affaires (€)
          </label>
          <input
            id="ca"
            name="ca"
            type="number"
            step="0.01"
            value={formData.ca}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Saisir le montant en euros sans les centimes (ex: 1500000)
          </p>
        </div>
        
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Zone
          </label>
          <input
            id="area"
            name="area"
            type="text"
            value={formData.area}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Par exemple: Urbaine, Rurale, Centre-ville, etc.
          </p>
        </div>
        
        <div>
          <label htmlFor="employees_count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre d'employés
          </label>
          <input
            id="employees_count"
            name="employees_count"
            type="number"
            min="0"
            value={formData.employees_count}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
        
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Adresse
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            value={formData.address}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="mr-3 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
        >
          <FiX className="inline mr-2" />
          Annuler
        </button>
        
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <span className="inline-block animate-spin mr-2">⌛</span>
              Enregistrement...
            </>
          ) : (
            <>
              <FiSave className="inline mr-2" />
              Enregistrer
            </>
          )}
        </button>
      </div>
    </form>
  );
};