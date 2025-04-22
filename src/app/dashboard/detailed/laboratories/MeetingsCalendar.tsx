// src/components/dashboard/laboratories/MeetingsCalendar.tsx
import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiTrash2 } from 'react-icons/fi';
import { Meeting } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/Button';

interface MeetingsCalendarProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: string) => Promise<void>;
}

export function MeetingsCalendar({ meetings, onDeleteMeeting }: MeetingsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Fonctions de navigation dans le calendrier
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const resetToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Obtenir le nom du mois
  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  // Filtrer les rendez-vous pour le mois courant
  const currentMonthMeetings = meetings.filter(meeting => {
    const meetingDate = new Date(meeting.date);
    return meetingDate.getMonth() === currentMonth.getMonth() && 
           meetingDate.getFullYear() === currentMonth.getFullYear();
  });
  
  // Trier les rendez-vous par date
  const sortedMeetings = [...currentMonthMeetings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Regrouper les rendez-vous par jour
  const meetingsByDay: Record<string, Meeting[]> = {};
  
  sortedMeetings.forEach(meeting => {
    if (!meetingsByDay[meeting.date]) {
      meetingsByDay[meeting.date] = [];
    }
    meetingsByDay[meeting.date].push(meeting);
  });

  // Gérer la suppression d'un rendez-vous
  const handleDelete = async (id: string) => {
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

  // Formater l'heure pour l'affichage
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <FiCalendar className="mr-2 text-purple-500" size={20} />
          Agenda des rendez-vous
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
            variant="ghost"
            size="sm"
            onClick={resetToCurrentMonth}
          >
            {monthName}
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
      
      <div className="p-4">
        {Object.keys(meetingsByDay).length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiCalendar className="mx-auto mb-3" size={32} />
            <p>Aucun rendez-vous planifié pour {monthName}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(meetingsByDay).map(([date, dayMeetings]) => (
              <div key={date} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 font-medium text-gray-700 dark:text-gray-300">
                  {new Date(date).toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
                
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {dayMeetings.map(meeting => (
                    <div key={meeting.id} className="px-4 py-3 flex items-start justify-between hover:bg-gray-50 dark:hover:bg-gray-750">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <FiClock className="text-gray-400 mr-2" size={16} />
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatTime(meeting.time)} - {meeting.duration} min
                          </span>
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-800 dark:text-gray-200">
                          {meeting.laboratoryName}
                        </div>
                        
                        {meeting.notes && (
                          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                            {meeting.notes}
                          </div>
                        )}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(meeting.id)}
                        isLoading={isDeleting === meeting.id}
                      >
                        <FiTrash2 className="text-red-500" size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}