// src/components/dashboard/meetings/MeetingsCalendarView.tsx
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiClock, FiTrash2 } from 'react-icons/fi';
import { Meeting } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/Button';

interface MeetingsCalendarViewProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: string) => Promise<void>;
}

export function MeetingsCalendarView({ meetings, onDeleteMeeting }: MeetingsCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Navigation dans le calendrier
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(new Date());
  };

  // Construire le calendrier du mois
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    
    // Déterminer le premier jour à afficher (peut être dans le mois précédent)
    let start = new Date(firstDay);
    start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1)); // Commence par lundi
    
    const days = [];
    let currentDay = new Date(start);
    
    // Remplir 6 semaines complètes (42 jours)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    return days;
  };
  
  const days = getDaysInMonth();
  
  // Vérifier si une date est aujourd'hui
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };
  
  // Vérifier si une date est sélectionnée
  const isSelected = (date: Date) => {
    if (!selectedDay) return false;
    return date.getDate() === selectedDay.getDate() &&
           date.getMonth() === selectedDay.getMonth() &&
           date.getFullYear() === selectedDay.getFullYear();
  };
  
  // Vérifier si une date est dans le mois courant
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };
  
  // Vérifier si une date a des rendez-vous
  const hasMeetings = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetings.some(meeting => meeting.date === dateString);
  };
  
  // Obtenir les rendez-vous pour une journée spécifique
  const getMeetingsForDay = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return meetings
      .filter(meeting => meeting.date === dateString)
      .sort((a, b) => a.time.localeCompare(b.time));
  };
  
  // Formater l'heure
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };
  
  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rendez-vous ?')) {
      setIsDeleting(id);
      try {
        await onDeleteMeeting(id);
      } catch (error) {
        console.error('Erreur lors de la suppression du rendez-vous:', error);
      } finally {
        setIsDeleting(null);
      }
    }
  };
  
  // Noms des jours de la semaine
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  
  // Nom du mois et année actuels
  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  const selectedDayMeetings = selectedDay ? getMeetingsForDay(selectedDay) : [];

  return (
    <div className="flex flex-col md:flex-row">
      {/* Calendrier principal */}
      <div className="md:w-2/3 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {monthName}
          </h3>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevMonth}
            >
              <FiChevronLeft size={16} />
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Aujourd'hui
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextMonth}
            >
              <FiChevronRight size={16} />
            </Button>
          </div>
        </div>
        
        {/* Grille des jours */}
        <div className="grid grid-cols-7 gap-1">
          {/* En-têtes des jours de la semaine */}
          {weekDays.map((day, index) => (
            <div key={index} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
          
          {/* Jours du calendrier */}
          {days.map((day, index) => (
            <div 
              key={index}
              onClick={() => setSelectedDay(day)}
              className={`h-24 p-1 rounded-md border ${
                isCurrentMonth(day)
                  ? 'border-gray-200 dark:border-gray-700'
                  : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30'
              } ${
                isSelected(day)
                  ? 'border-purple-500 dark:border-purple-400'
                  : ''
              } ${
                isToday(day)
                  ? 'bg-purple-50 dark:bg-purple-900/20'
                  : ''
              } ${
                hasMeetings(day) && !isSelected(day) && !isToday(day)
                  ? 'bg-gray-100 dark:bg-gray-800'
                  : ''
              } hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-colors overflow-hidden flex flex-col`}
            >
              <div className={`text-right p-1 font-medium text-sm ${
                isCurrentMonth(day)
                  ? isToday(day)
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {day.getDate()}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {getMeetingsForDay(day).slice(0, 2).map((meeting, idx) => (
                  <div 
                    key={meeting.id}
                    className="text-xs px-1 py-0.5 mb-0.5 truncate bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded"
                  >
                    {formatTime(meeting.time)} - {meeting.laboratoryName}
                  </div>
                ))}
                
                {getMeetingsForDay(day).length > 2 && (
                  <div className="text-xs px-1 py-0.5 text-gray-500 dark:text-gray-400">
                    +{getMeetingsForDay(day).length - 2} autres
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Détails du jour sélectionné */}
      <div className="md:w-1/3 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg">
        {selectedDay ? (
          <>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {selectedDay.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h3>
            
            {selectedDayMeetings.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Aucun rendez-vous pour cette journée
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayMeetings.map(meeting => (
                  <div key={meeting.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <FiClock className="text-gray-400 mr-2" size={14} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(meeting.time)} - {meeting.duration} min
                          </span>
                        </div>
                        
                        <h4 className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                          {meeting.laboratoryName}
                        </h4>
                        
                        {meeting.notes && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {meeting.notes}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(meeting.id, e)}
                        isLoading={isDeleting === meeting.id}
                      >
                        <FiTrash2 className="text-red-500" size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p>Sélectionnez une date pour voir les détails</p>
          </div>
        )}
      </div>
    </div>
  );
}