// src/utils/dateUtils.ts

/**
 * Formate une date au format ISO (YYYY-MM-DD) pour l'affichage (DD/MM/YYYY)
 */
export function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return '';
  
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return dateStr;
  }
}

/**
 * Transforme une date affichable (DD/MM/YYYY) en format ISO (YYYY-MM-DD)
 */
export function parseDisplayDate(displayDate: string): string {
  if (!displayDate) return '';
  
  try {
    const [day, month, year] = displayDate.split('/');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erreur lors du parsing de la date:', error);
    return displayDate;
  }
}

/**
 * Obtient la date actuelle au format ISO (YYYY-MM-DD)
 */
export function getCurrentDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Calcule le premier jour du mois courant
 */
export function getFirstDayOfMonth(date: Date = new Date()): string {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return firstDay.toISOString().split('T')[0];
}

/**
 * Calcule le dernier jour du mois courant
 */
export function getLastDayOfMonth(date: Date = new Date()): string {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return lastDay.toISOString().split('T')[0];
}

/**
 * Ajoute ou soustrait des jours à une date donnée
 */
export function addDays(date: string | Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}

/**
 * Ajoute ou soustrait des mois à une date donnée
 */
export function addMonths(date: string | Date, months: number): string {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result.toISOString().split('T')[0];
}

/**
 * Ajoute ou soustrait des années à une date donnée
 */
export function addYears(date: string | Date, years: number): string {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result.toISOString().split('T')[0];
}

/**
 * Types de plages de dates supportés
 */
export type DateRangeType = 
  | 'today' 
  | 'thisWeek' 
  | 'thisMonth' 
  | 'lastMonth'
  | 'last3Months' 
  | 'last6Months' 
  | 'thisYear'
  | 'custom';

/**
 * Types de plages de comparaison supportés
 */
export type ComparisonRangeType = 
  | 'previousYear' 
  | 'previousPeriod' 
  | 'sameLastYear' 
  | 'sameLastTwoYears'
  | 'custom'
  | null;

/**
 * Calcule la plage de dates en fonction du type choisi
 */
export function calculateDateRange(rangeType: DateRangeType): { 
  start: string, 
  end: string, 
  label: string 
} {
  const now = new Date();
  let start: Date;
  let end: Date;
  let label: string;

  switch (rangeType) {
    case 'today':
      start = new Date(now);
      end = new Date(now);
      label = "Aujourd'hui";
      break;
      
    case 'thisWeek':
      // Trouver le lundi de la semaine courante
      start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
      // Dimanche de la semaine courante
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      label = "Cette semaine";
      break;
      
    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now);
      label = "Ce mois-ci";
      break;
      
    case 'lastMonth':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      label = "Mois dernier";
      break;
      
    case 'last3Months':
      end = new Date(now);
      start = new Date(now);
      start.setMonth(start.getMonth() - 2, 1);
      label = "Les 3 derniers mois";
      break;
      
    case 'last6Months':
      end = new Date(now);
      start = new Date(now);
      start.setMonth(start.getMonth() - 5, 1);
      label = "Les 6 derniers mois";
      break;
      
    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      label = "Cette année";
      break;
      
    case 'custom':
    default:
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      label = "Période personnalisée";
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    label
  };
}

/**
 * Calcule la plage de dates de comparaison en fonction du type choisi
 */
export function calculateComparisonDateRange(
  rangeType: ComparisonRangeType, 
  primaryRange: { start: string, end: string }
): { 
  start: string, 
  end: string, 
  label: string 
} | null {
  if (rangeType === null) {
    return null;
  }

  const primaryStart = new Date(primaryRange.start);
  const primaryEnd = new Date(primaryRange.end);
  
  // Calcule la durée en jours entre les deux dates
  const durationInDays = Math.floor(
    (primaryEnd.getTime() - primaryStart.getTime()) / (1000 * 60 * 60 * 24)
  );
  
  let start: Date;
  let end: Date;
  let label: string;

  switch (rangeType) {
    case 'previousYear':
      start = new Date(primaryStart);
      start.setFullYear(start.getFullYear() - 1);
      end = new Date(primaryEnd);
      end.setFullYear(end.getFullYear() - 1);
      label = "Année précédente";
      break;
      
    case 'previousPeriod':
      // Période précédente de même durée
      end = new Date(primaryStart);
      end.setDate(end.getDate() - 1);
      start = new Date(end);
      start.setDate(start.getDate() - durationInDays);
      label = "Période précédente";
      break;
      
    case 'sameLastYear':
      start = new Date(primaryStart);
      start.setFullYear(start.getFullYear() - 1);
      end = new Date(primaryEnd);
      end.setFullYear(end.getFullYear() - 1);
      label = "Même période N-1";
      break;
      
    case 'sameLastTwoYears':
      start = new Date(primaryStart);
      start.setFullYear(start.getFullYear() - 2);
      end = new Date(primaryEnd);
      end.setFullYear(end.getFullYear() - 2);
      label = "Même période N-2";
      break;
      
    case 'custom':
    default:
      start = new Date(primaryStart);
      start.setFullYear(start.getFullYear() - 1);
      end = new Date(primaryEnd);
      end.setFullYear(end.getFullYear() - 1);
      label = "Comparaison personnalisée";
  }

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
    label
  };
}

/**
 * Vérifie si une date est antérieure à une autre
 */
export function isDateBefore(date1: string, date2: string): boolean {
  return new Date(date1) < new Date(date2);
}

/**
 * Calcule la différence en jours entre deux dates
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}