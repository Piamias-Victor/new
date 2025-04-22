// src/hooks/useMeetings.ts
import { useState, useEffect } from 'react';

export interface Meeting {
  id: string;
  laboratoryName: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  createdAt: string;
}

// Cette fonction utilise le localStorage pour persistance locale
// Dans une application réelle, ce serait remplacé par des appels API
const saveMeetingToLocalStorage = (meeting: Omit<Meeting, 'id' | 'createdAt'>) => {
  try {
    const existingMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    const newMeeting = {
      ...meeting,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('meetings', JSON.stringify([...existingMeetings, newMeeting]));
    return newMeeting;
  } catch (err) {
    console.error('Erreur lors de l\'enregistrement du rendez-vous:', err);
    throw err;
  }
};

const loadMeetingsFromLocalStorage = () => {
  try {
    return JSON.parse(localStorage.getItem('meetings') || '[]');
  } catch (err) {
    console.error('Erreur lors du chargement des rendez-vous:', err);
    return [];
  }
};

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les rendez-vous au montage du composant
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const loadedMeetings = loadMeetingsFromLocalStorage();
        setMeetings(loadedMeetings);
      }
    } catch (err) {
      setError('Impossible de charger les rendez-vous.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Créer un nouveau rendez-vous
  const createMeeting = async (meetingData: Omit<Meeting, 'id' | 'createdAt'>) => {
    try {
      const newMeeting = saveMeetingToLocalStorage(meetingData);
      setMeetings(prev => [...prev, newMeeting]);
      return newMeeting;
    } catch (err) {
      setError('Impossible de créer le rendez-vous.');
      throw err;
    }
  };

  // Supprimer un rendez-vous
  const deleteMeeting = async (meetingId: string) => {
    try {
      const updatedMeetings = meetings.filter(m => m.id !== meetingId);
      localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
      setMeetings(updatedMeetings);
    } catch (err) {
      setError('Impossible de supprimer le rendez-vous.');
      throw err;
    }
  };

  return {
    meetings,
    isLoading,
    error,
    createMeeting,
    deleteMeeting
  };
}