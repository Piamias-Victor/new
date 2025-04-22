// src/components/dashboard/laboratories/MeetingPlannerModal.tsx
import React, { useState } from 'react';
import { FiX, FiCalendar, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi';
import { Button } from '@/components/ui/Button';

interface Meeting {
  id: string;
  laboratoryName: string;
  laboratoryId?: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  createdAt: string;
}

interface MeetingPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  laboratoryName?: string;
  onSchedule: (meetingData: Omit<Meeting, 'id' | 'createdAt'>) => Promise<void>;
}

export function MeetingPlannerModal({ 
  isOpen, 
  onClose, 
  laboratoryName,
  onSchedule
}: MeetingPlannerModalProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !time || !duration) {
      return;
    }
    
    setIsSubmitting(true);
    
    const meetingData = {
      laboratoryName: laboratoryName || '',
      date,
      time,
      duration: parseInt(duration),
      notes
    };
    
    try {
      await onSchedule(meetingData);
      // Réinitialiser le formulaire
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Planifier un rendez-vous {laboratoryName ? `- ${laboratoryName}` : ''}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            {!laboratoryName && (
              <div>
                <label htmlFor="laboratoryName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Laboratoire
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="laboratoryName"
                    name="laboratoryName"
                    type="text"
                    required
                    value={laboratoryName || ''}
                    onChange={(e) => {}}
                    className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500"
                    placeholder="Nom du laboratoire"
                  />
                </div>
              </div>
            )}
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
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
                  className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heure
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
                  className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durée (minutes)
              </label>
              <select
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="90">1 heure 30</option>
                <option value="120">2 heures</option>
              </select>
            </div>
            
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
                  className="pl-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 text-gray-900 dark:text-white shadow-sm focus:border-sky-500 focus:ring-sky-500"
                  placeholder="Points à discuter, objectifs, etc."
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
            >
              Planifier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}