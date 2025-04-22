// src/app/dashboard/rdv-agenda/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiCalendar, FiSearch } from 'react-icons/fi';

import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { Button } from '@/components/ui/Button';
import { MeetingPlannerModal } from '@/components/dashboard/meetings/MeetingPlannerModal';
import { MeetingsCalendarView } from '@/components/dashboard/meetings/MeetingsCalendarView';
import { MeetingsListView } from '@/components/dashboard/meetings/MeetingsListView';
import { useMeetings } from '@/hooks/useMeetings';

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { meetings, isLoading: meetingsLoading, createMeeting, deleteMeeting } = useMeetings();

  // Redirection si non authentifié
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Afficher un état de chargement si la session est en cours de chargement
  if (status === 'loading' || meetingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  // Si pas de session, ne rien afficher (la redirection se fera via useEffect)
  if (!session) {
    return null;
  }

  // Filtrer les réunions selon la recherche
  const filteredMeetings = meetings.filter(meeting => 
    meeting.laboratoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (meeting.notes && meeting.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Gérer la planification d'un nouveau rendez-vous
  const handleScheduleMeeting = async (meetingData: any) => {
    await createMeeting(meetingData);
  };

  return (
    <SidebarLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* En-tête de la page */}
          <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Agenda des Rendez-vous
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Planifiez et gérez vos rendez-vous avec les laboratoires
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-2 pr-3 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="flex space-x-2">
                <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm p-1 flex">
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      viewMode === 'calendar'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Calendrier
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                      viewMode === 'list'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Liste
                  </button>
                </div>
                
                <Button 
                  leftIcon={<FiPlus />}
                  onClick={() => setIsMeetingModalOpen(true)}
                >
                  Nouveau RDV
                </Button>
              </div>
            </div>
          </div>
          
          {/* Contenu principal - Vue calendrier ou liste */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
            {viewMode === 'calendar' ? (
              <MeetingsCalendarView 
                meetings={filteredMeetings} 
                onDeleteMeeting={deleteMeeting}
              />
            ) : (
              <MeetingsListView 
                meetings={filteredMeetings}
                onDeleteMeeting={deleteMeeting}
              />
            )}
          </div>
          
          {/* Statistiques et information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Total RDV planifiés</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{meetings.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">RDV à venir</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {meetings.filter(m => new Date(`${m.date}T${m.time}`) > new Date()).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Laboratoires différents</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {new Set(meetings.map(m => m.laboratoryName)).size}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Prochains rendez-vous
              </h3>
              
              {meetings.filter(m => new Date(`${m.date}T${m.time}`) > new Date())
                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                .slice(0, 3)
                .map(meeting => (
                  <div key={meeting.id} className="flex items-start space-x-4 p-3 mb-2 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex-shrink-0 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                      <FiCalendar size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {meeting.laboratoryName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(`${meeting.date}T${meeting.time}`).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              
              {meetings.filter(m => new Date(`${m.date}T${m.time}`) > new Date()).length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  Aucun rendez-vous à venir
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal pour planifier un rendez-vous avec recherche de laboratoire */}
      <MeetingPlannerModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        onSchedule={handleScheduleMeeting}
      />
    </SidebarLayout>
  );
}