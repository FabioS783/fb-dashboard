import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import _ from 'lodash';

interface DailyData {
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
  [key: string]: any;
}

interface PlatformChartProps {
  data: DailyData[];
  title: string;
  dataKey: string;
  valuePrefix?: string;
  valueSuffix?: string;
  lineColor?: string;
  height?: string;
  isInteger?: boolean;
}

const PlatformChart: React.FC<PlatformChartProps> = ({ 
  data, 
  title, 
  dataKey, 
  valuePrefix = '', 
  valueSuffix = '', 
  lineColor = '#8884d8',
  height = "h-80",
  isInteger = false
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  // Estrai e ordina le piattaforme secondo l'ordine specificato
  const platforms = useMemo(() => {
    const platformOrder = ['all', 'facebook', 'instagram', 'audience_network', 'messenger'];
    const availablePlatforms = new Set(data.map(item => item.piattaforma));
    
    // Filtra le piattaforme disponibili escludendo 'unknown' e mantiene l'ordine specificato
    return platformOrder.filter(platform => 
      platform === 'all' || (availablePlatforms.has(platform) && platform !== 'unknown')
    );
  }, [data]);

  // Determina se la metrica deve essere sommata o mediata
  const shouldSum = (metric: string): boolean => {
    return ['spesa', 'clic_link', 'impression', 'conversioni_acquisti', 'acquisti'].includes(metric);
  };

  // Calcola i dati aggregati
  const calculateAggregatedData = (dailyData: DailyData[]) => {
    // Per metriche da sommare
    const spesa = _.sumBy(dailyData, 'spesa');
    const clic_link = _.sumBy(dailyData, 'clic_link');
    const impression = _.sumBy(dailyData, 'impression');
    const conversioni_acquisti = _.sumBy(dailyData, 'conversioni_acquisti');
    const acquisti = _.sumBy(dailyData, 'acquisti');

    // Per metriche da calcolare
    const cpc = clic_link > 0 ? spesa / clic_link : 0;
    const ctr = impression > 0 ? (clic_link / impression) * 100 : 0;
    const cpm = impression > 0 ? (spesa / impression) * 1000 : 0;

    return {
      spesa,
      clic_link,
      impression,
      conversioni_acquisti,
      acquisti,
      cpc,
      ctr,
      cpm
    };
  };

  // Filtra e aggrega i dati in base alla piattaforma selezionata
  const chartData = useMemo(() => {
    const filteredData = data.filter(item => item.piattaforma !== 'unknown');

    if (selectedPlatform === 'all') {
      // Aggrega i dati per giorno attraverso tutte le piattaforme
      const groupedData = _.groupBy(filteredData, 'giorno');
      
      return Object.entries(groupedData)
        .map(([giorno, group]) => {
          const aggregatedMetrics = calculateAggregatedData(group);
          return {
            giorno,
            [dataKey]: aggregatedMetrics[dataKey as keyof typeof aggregatedMetrics]
          };
        })
        .sort((a, b) => new Date(a.giorno).getTime() - new Date(b.giorno).getTime());
    }
    
    // Filtra per la piattaforma selezionata
    return filteredData
      .filter(item => item.piattaforma === selectedPlatform)
      .map(item => ({
        giorno: item.giorno,
        [dataKey]: Number(item[dataKey]) || 0
      }))
      .sort((a, b) => new Date(a.giorno).getTime() - new Date(b.giorno).getTime());
  }, [data, selectedPlatform, dataKey]);

  const formatValue = (value: number): string => {
    if (typeof value !== 'number' || isNaN(value)) return '0';

    if (isInteger) {
      return `${valuePrefix}${Math.round(value).toLocaleString('it-IT')}${valueSuffix}`;
    }

    // Arrotonda per eccesso a 2 decimali per i valori monetari
    const roundedValue = Math.ceil(value * 100) / 100;
    return `${valuePrefix}${roundedValue.toLocaleString('it-IT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}${valueSuffix}`;
  };

  // Funzione per ottenere il nome visualizzato della piattaforma
  const getPlatformDisplayName = (platform: string): string => {
    if (platform === 'all') return 'Tutte le piattaforme';
    if (platform === 'audience_network') return 'Audience Network';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  // Calcola il dominio dell'asse Y
  const yDomain = useMemo(() => {
    if (!chartData.length) return [0, 1];
    
    const values = chartData.map(item => Number(item[dataKey])).filter(val => !isNaN(val));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    // Aggiungi un po' di margine sopra e sotto
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding];
  }, [chartData, dataKey]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform}
              onClick={() => setSelectedPlatform(platform)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedPlatform === platform
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getPlatformDisplayName(platform)}
            </button>
          ))}
        </div>
      </div>
      <div className={height}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="giorno"
              tickFormatter={(value) => format(new Date(value), 'dd/MM', { locale: it })}
              interval="preserveEnd"
              minTickGap={50}
            />
            <YAxis 
              tickFormatter={formatValue}
              domain={yDomain}
              allowDecimals={!isInteger}
            />
            <Tooltip
              formatter={(value: number) => [formatValue(value), title]}
              labelFormatter={(label) => format(new Date(label), 'dd/MM/yyyy', { locale: it })}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={lineColor}
              name={title}
              dot={false}
              strokeWidth={2}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PlatformChart;