export interface DailyData {
  giorno: string;
  cpc: number;
  ctr: number;
  spesa: number;
  clic_link: number;
  impression: number;
  conversioni_acquisti: number;
  cpm: number;
  piattaforma: string;
  acquisti: number;
}

export interface Metrics {
  totale_spesa: number;
  totale_clic: number;
  valore_conversione: number;
  totale_impression: number;
  cpc_medio: number;
  cpm_medio: number;
  ctr_medio: number;
  totale_acquisti: number;
}

export interface DailyAggregated {
  [key: string]: DailyData;
}

export interface DashboardData {
  metrics: Metrics;
  daily: DailyData[];
}