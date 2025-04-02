// src/hooks/useSegments.ts
import { useState, useEffect } from 'react';
import axios from 'axios';

// Types pour les structures de données
export interface UniverseWithCategories {
  universe: string;
  categories: string[];
}

export interface CategoryWithDetails {
  category: string;
  sub_categories: string[];
  families: string[];
}

export interface FamilyWithSubfamilies {
  family: string;
  sub_families: string[];
}

export interface FlatSegments {
  universes: string[];
  categories: string[];
  sub_categories: string[];
  families: string[];
  sub_families: string[];
}

export interface SegmentHierarchies {
  universe_hierarchy: UniverseWithCategories[];
  category_hierarchy: CategoryWithDetails[];
  family_hierarchy: FamilyWithSubfamilies[];
  flat_segments: FlatSegments;
}

export function useSegments() {
  const [segments, setSegments] = useState<SegmentHierarchies | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSegments = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('/api/segment');
        setSegments(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur lors de la récupération des segments:', err);
        setError('Impossible de charger les données de segmentation. Veuillez réessayer plus tard.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegments();
  }, []);

  return { segments, isLoading, error };
}