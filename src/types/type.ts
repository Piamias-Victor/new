// src/components/dashboard/products/comparison/types.ts

export interface PharmacyRadarData {
    name: string;
    price: number;
    margin: number;
    rotation: number;
    stock: number;
    sales: number;
  }
  
  export interface MetricDetailData {
    yourValue: number;
    groupAvg: number;
    groupMax: number;
    groupMin: number;
    percentage: number;
  }
  
  export interface PharmacyComparisonData {
    pharmacyData: PharmacyRadarData[];
    metricDetails: Record<string, MetricDetailData>;
  }