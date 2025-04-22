// src/components/dashboard/meetings/MeetingPlannerModal.tsx
import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiMessageSquare } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { LabSearch } from '@/components/drawer/search/LabSearch';
import { Laboratory } from '@/components/drawer/search/LabSearchResults';

interface MeetingPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (meetingData: any) => Promise<void>;
}

export function MeetingPlannerModal({ 
  isOpen, 
  onClose, 
  onSchedule
}: MeetingPlannerModalProps) {
  const [selectedLabs, setSelectedLabs] = useState<Laboratory[]>([]);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  // Fonction pour gérer la sélection d'un laboratoire
  const handleToggleLab = (lab: Laboratory) => {
    // Comme on ne veut sélectionner qu'un seul laboratoire, on remplace la sélection
    setSelectedLabs([lab]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedLabs.length === 0 || !date || !time || !duration) {
      return;
    }
    
    setIsSubmitting(true);
    
    const meetingData = {
      laboratoryName: selectedLabs[0].name,
      date,
      time,
      duration: parseInt(duration),
      notes
    };
    
    try {
      await onSchedule(meetingData);
      // Réinitialiser le formulaire
      setSelectedLabs([]);
      setDate('');
      setTime('');
      setDuration('60');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Erreur lors de la planification du rendez-vous:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl flex flex-col md:flex-row h-[80vh]">
        {/* Section gauche - Recherche de laboratoires */}
        <div className="md:w-1/3 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Sélectionner un laboratoire
          </h3>
          
          {/* Composant de recherche de laboratoires */}
          <div className="flex-1 overflow-hidden">
            <LabSearch 
              selectedLabs={selectedLabs} 
              onToggleLab={handleToggleLab} 
            />
          </div>
        </div>
        
        {/* Section droite - Formulaire de rendez-vous */}
        <div className="md:w-2/3 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
              <FiCalendar className="mr-2 text-purple-500" size={20} />
              Planifier un rendez-vous
              {selectedLabs.length > 0 && ` - ${selectedLabs[0].name}`}
            </h3>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Formulaire de planification */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
            <div className="space-y-5">
              {/* Date et heure en ligne */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Heure *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiClock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      required
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
              
              {/* Durée */}
              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Durée *
                </label>
                <select
                  id="duration"
                  name="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 heure</option>
                  <option value="90">1 heure 30</option>
                  <option value="120">2 heures</option>
                </select>
              </div>
              
              {/* Notes et agenda */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes / Agenda
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <FiMessageSquare className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Points à discuter, objectifs, sujets à aborder..."
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="secondary"
                type="button"
                onClick={onClose}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={selectedLabs.length === 0}
                className="bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                Planifier
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}