// src/components/dashboard/meetings/MeetingsListView.tsx
import React, { useState } from 'react';
import { FiTrash2, FiClock, FiCalendar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Meeting } from '@/hooks/useMeetings';
import { Button } from '@/components/ui/Button';

interface MeetingsListViewProps {
  meetings: Meeting[];
  onDeleteMeeting: (id: string) => Promise<void>;
}

export function MeetingsListView({ meetings, onDeleteMeeting }: MeetingsListViewProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  // Trier les rendez-vous par date et heure
  const sortedMeetings = [...meetings].sort((a, b) => {
    // Comparer les dates
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Regrouper les rendez-vous par mois
  const groupedMeetings: { [key: string]: Meeting[] } = {};
  
  sortedMeetings.forEach(meeting => {
    const date = new Date(meeting.date);
    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!groupedMeetings[monthKey]) {
      groupedMeetings[monthKey] = [];
    }
    
    groupedMeetings[monthKey].push(meeting);
  });

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

  // Formater l'heure
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  // Toggle l'expansion d'un rendez-vous
  const toggleExpand = (id: string) => {
    setExpandedMeeting(expandedMeeting === id ? null : id);
  };

  if (meetings.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <FiCalendar className="mx-auto mb-3" size={32} />
        <p>Aucun rendez-vous trouvé</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      {Object.entries(groupedMeetings).map(([monthKey, monthMeetings]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const monthName = new Date(year, month).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
        
        return (
          <div key={monthKey} className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {monthName}
            </h3>
            
            <div className="space-y-2">
              {monthMeetings.map(meeting => {
                const meetingDate = new Date(meeting.date);
                const isExpanded = expandedMeeting === meeting.id;
                
                return (
                  <div 
                    key={meeting.id} 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div 
                      className="p-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
                      onClick={() => toggleExpand(meeting.id)}
                    >
                      <div className="flex-1">
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                          <FiCalendar className="mr-1" size={14} />
                          <span>
                            {meetingDate.toLocaleDateString('fr-FR', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long' 
                            })}
                          </span>
                          <span className="mx-2">•</span>
                          <FiClock className="mr-1" size={14} />
                          <span>{formatTime(meeting.time)} ({meeting.duration} min)</span>
                        </div>
                        
                        <div className="mt-1 font-medium text-gray-900 dark:text-white">
                          {meeting.laboratoryName}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDelete(meeting.id, e)}
                          isLoading={isDeleting === meeting.id}
                        >
                          <FiTrash2 className="text-red-500" size={16} />
                        </Button>
                        
                        {isExpanded ? (
                          <FiChevronUp className="text-gray-400" size={18} />
                        ) : (
                          <FiChevronDown className="text-gray-400" size={18} />
                        )}
                      </div>
                    </div>
                    
                    {isExpanded && meeting.notes && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md text-sm text-gray-700 dark:text-gray-300">
                          <h4 className="font-medium mb-1 text-gray-900 dark:text-white">Notes:</h4>
                          <p>{meeting.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}