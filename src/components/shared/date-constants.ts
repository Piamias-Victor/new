// src/components/shared/date-selector/date-constants.ts

// Options pour la période principale
export const PERIOD_OPTIONS = [
    { label: 'Ce mois-ci', value: 'thisMonth' },
    { label: 'Mois derniers', value: 'lastMonth' },
    { label: '3 derniers mois', value: 'last3Months' },
    { label: '6 derniers mois', value: 'last6Months' },
    { label: 'Cette année', value: 'thisYear' },
    { label: 'Personnalisé', value: 'custom' }
  ];
  
  // Options pour la période de comparaison
  export const COMPARISON_OPTIONS = [
    { label: 'Année précédente', value: 'previousYear' },
    { label: 'Période précédente', value: 'previousPeriod' },
    { label: 'Personnalisé', value: 'custom' }
  ];