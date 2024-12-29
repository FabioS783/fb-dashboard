import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { MetricCard } from './MetricCard';
import { InsightCard } from './InsightCard';
import PlatformChart from './PlatformChart';
import { analyzeData } from '../utils/insightsHelper';
import type { DashboardData, DailyData, Metrics } from '../types/dashboard';
import { config } from '../config/env';

const initialMetrics: Metrics = {
  totale_spesa: 0,
  totale_clic: 0,
  valore_conversione: 0,
  totale_impression: 0,
  cpc_medio: 0,
  cpm_medio: 0,
  ctr_medio: 0,
  totale_acquisti: 0
};

interface APIResponse {
  success: boolean;
  error?: string;
  metrics: Record<string, number>;
  daily: Array<{
    giorno: string;
    spesa: number;
    clic_link: number;
    impression: number;
    conversioni_acquisti: number;
    cpc: number;
    ctr: number;
    cpm: number;
    piattaforma: string;
    acquisti: number;
  }>;
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    metrics: initialMetrics,
    daily: []
  });

  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const url = new URL(config.API_URL);
      url.searchParams.append('start_date', dateRange.startDate);
      url.searchParams.append('end_date', dateRange.endDate);
      url.searchParams.append('client_id', config.CLIENT_ID.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as APIResponse;

      if (!result.success) {
        throw new Error(result.error || 'Errore sconosciuto');
      }

      // Processa le metriche generali
      const metrics: Metrics = {
        totale_spesa: Number(result.metrics.totale_spesa) || 0,
        totale_clic: Number(result.metrics.totale_clic) || 0,
        valore_conversione: Number(result.metrics.valore_conversione) || 0,
        totale_impression: Number(result.metrics.totale_impression) || 0,
        cpc_medio: Number(result.metrics.cpc_medio) || 0,
        cpm_medio: Number(result.metrics.cpm_medio) || 0,
        ctr_medio: Number(result.metrics.ctr_medio) || 0,
        totale_acquisti: Number(result.metrics.totale_acquisti) || 0
      };

      // Converti i dati giornalieri assicurandoti che tutti i valori numerici siano numeri
      const processedDaily = result.daily.map(day => ({
        ...day,
        spesa: Number(day.spesa) || 0,
        clic_link: Number(day.clic_link) || 0,
        impression: Number(day.impression) || 0,
        conversioni_acquisti: Number(day.conversioni_acquisti) || 0,
        cpc: Number(day.cpc) || 0,
        ctr: Number(day.ctr) || 0,
        cpm: Number(day.cpm) || 0,
        acquisti: Number(day.acquisti) || 0
      }));

      setData({ metrics, daily: processedDaily });
    } catch (error) {
      console.error('Full error:', error);
      setError(error instanceof Error ? error.message : 'Errore sconosciuto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Facebook Ads</h1>
        {isLoading && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
        )}
      </div>

      {/* Filtri data */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Periodo di analisi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col">
            <label htmlFor="startDate" className="text-sm font-medium text-gray-600 mb-1">
              Data Inizio
            </label>
            <input
              id="startDate"
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="rounded-lg border p-2"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="endDate" className="text-sm font-medium text-gray-600 mb-1">
              Data Fine
            </label>
            <input
              id="endDate"
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="rounded-lg border p-2"
            />
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Caricamento...' : 'Aggiorna'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Errore!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {/* Metriche principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Spesa Totale" 
          value={data.metrics.totale_spesa}
          prefix="€ "
        />
        <MetricCard 
          title="Valore Conversioni" 
          value={data.metrics.valore_conversione}
          prefix="€ "
        />
        <MetricCard 
          title="CTR Medio" 
          value={data.metrics.ctr_medio}
          suffix="%"
        />
        <MetricCard 
          title="Totale Clic" 
          value={data.metrics.totale_clic}
          isInteger={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard 
          title="Impression Totali" 
          value={data.metrics.totale_impression}
          isInteger={true}
        />
        <MetricCard 
          title="CPC Medio" 
          value={data.metrics.cpc_medio}
          prefix="€ "
        />
        <MetricCard 
          title="CPM Medio" 
          value={data.metrics.cpm_medio}
          prefix="€ "
        />
        <MetricCard 
          title="Totale Acquisti" 
          value={data.metrics.totale_acquisti}
          isInteger={true}
        />
      </div>

      {/* Insights Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Insights del periodo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyzeData(data).map((insight, index) => (
            <InsightCard
              key={index}
              title={insight.title}
              description={insight.description}
              trend={insight.trend}
              value={insight.value}
            />
          ))}
        </div>
      </div>

      {/* Grafici con filtro piattaforma */}
      {data.daily.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <PlatformChart
            data={data.daily}
            title="Andamento CPC"
            dataKey="cpc"
            valuePrefix="€"
            lineColor="#8884d8"
          />

          <PlatformChart
            data={data.daily}
            title="Andamento CTR"
            dataKey="ctr"
            valueSuffix="%"
            lineColor="#82ca9d"
          />

          <PlatformChart
            data={data.daily}
            title="Andamento CPM"
            dataKey="cpm"
            valuePrefix="€"
            lineColor="#ffa726"
          />

          <PlatformChart
            data={data.daily}
            title="Andamento Valore Conversioni"
            dataKey="conversioni_acquisti"
            valuePrefix="€"
            lineColor="#e57373"
          />

          <PlatformChart
            data={data.daily}
            title="Andamento Clic"
            dataKey="clic_link"
            lineColor="#64b5f6"
            isInteger={true}
          />

          <PlatformChart
            data={data.daily}
            title="Andamento Impression"
            dataKey="impression"
            lineColor="#81c784"
            isInteger={true}
          />

          <PlatformChart
            data={data.daily}
            title="Andamento Spesa"
            dataKey="spesa"
            valuePrefix="€"
            lineColor="#9575cd"
          />

          <PlatformChart
            data={data.daily}
            title="Andamento Acquisti"
            dataKey="acquisti"
            lineColor="#4db6ac"
            isInteger={true}
          />
        </div>
      )}
    </div>
  );
};