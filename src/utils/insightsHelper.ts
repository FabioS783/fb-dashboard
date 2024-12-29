import { InsightAnalysis } from '../types/insights';
import { DashboardData, DailyData } from '../types/dashboard';
import _ from 'lodash';

interface DailyROI {
  giorno: string;
  spesa: number;
  roiMonetario: number;
  ctr: number;
}

interface NetworkPerformance {
  network: string;
  value: number;
}

const validNetworks = ['facebook', 'instagram', 'audience_network'];

const formatNetworkName = (network: string): string => {
  if (network === 'audience_network') return 'Audience Network';
  return network.charAt(0).toUpperCase() + network.slice(1);
};

const getNetworkPerformance = (data: DailyData[], metric: string): { best: NetworkPerformance, worst: NetworkPerformance } => {
  // Raggruppa per network e calcola la media del metric
  const networkStats = _(data)
    .filter(item => validNetworks.includes(item.piattaforma)) // Filtra solo i network validi
    .groupBy('piattaforma')
    .map((group, network) => {
      let value: number;
      if (metric === 'acquisti') {
        // Per gli acquisti, somma i valori
        value = _.sumBy(group, metric);
      } else {
        // Per CTR e CPC, calcola la media ponderata
        const totalImpressions = _.sumBy(group, 'impression');
        const totalClicks = _.sumBy(group, 'clic_link');
        
        if (metric === 'ctr') {
          value = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
        } else if (metric === 'cpc') {
          const totalSpesa = _.sumBy(group, 'spesa');
          value = totalClicks > 0 ? totalSpesa / totalClicks : 0;
        } else {
          value = _.meanBy(group, metric);
        }
      }

      return {
        network,
        value: Number(value) || 0
      };
    })
    .compact() // Rimuove i null values
    .value();

  // Trova il migliore e il peggiore
  const sorted = _.orderBy(networkStats, ['value'], metric === 'cpc' ? ['asc'] : ['desc']);
  return {
    best: sorted[0] || { network: '-', value: 0 },
    worst: sorted[sorted.length - 1] || { network: '-', value: 0 }
  };
};

export const analyzeData = (data: DashboardData): InsightAnalysis[] => {
  const insights: InsightAnalysis[] = [];
  
  // ROI Analysis
  const totalSpent = data.metrics.totale_spesa;
  const totalConversions = data.metrics.valore_conversione;
  if (totalSpent > 0 && totalConversions > 0) {
    const roi = ((totalConversions - totalSpent) / totalSpent) * 100;
    insights.push({
      title: 'ROI Complessivo',
      description: roi > 0 
        ? `Ottimo ritorno sull'investimento! Ogni euro speso ha generato un ritorno netto di €${(roi/100).toFixed(2)}.`
        : `Il ROI è negativo. Potrebbe essere necessario variare il tipo di offerta.`,
      trend: roi > 0 ? 'positive' : 'negative',
      value: `${roi.toFixed(2)}%`
    });
  }

  // CTR Analysis - mostra solo se ci sono impression
  const ctrMedio = data.metrics.ctr_medio;
  if (data.metrics.totale_impression > 0 && ctrMedio > 0) {
    insights.push({
      title: 'Performance CTR',
      description: ctrMedio > 1 
        ? 'Il CTR è sopra la media del settore, le tue inserzioni sono efficaci nel catturare l\'attenzione.'
        : 'Il CTR potrebbe essere migliorato.',
      trend: ctrMedio > 1 ? 'positive' : 'negative',
      value: `${ctrMedio.toFixed(2)}%`
    });
  }

  // Cost per Acquisition Analysis
  if (data.metrics.totale_acquisti > 0 && totalSpent > 0) {
    const cpa = totalSpent / data.metrics.totale_acquisti;
    const cpaThreshold = totalConversions / data.metrics.totale_acquisti * 0.3; // 30% del valore medio conversione
    insights.push({
      title: 'Costo per Acquisizione',
      description: cpa < cpaThreshold
        ? 'Il costo per acquisizione è ottimo rispetto al valore medio delle conversioni.'
        : 'Il costo per acquisizione è alto rispetto al valore delle conversioni.',
      trend: cpa < cpaThreshold ? 'positive' : 'negative',
      value: `€${cpa.toFixed(2)}`
    });
  }

  // Conversion Rate Analysis
  if (data.metrics.totale_clic > 0 && data.metrics.totale_acquisti > 0) {
    const conversionRate = (data.metrics.totale_acquisti / data.metrics.totale_clic) * 100;
    insights.push({
      title: 'Tasso di Conversione',
      description: conversionRate > 1.80
        ? 'Ottimo tasso di conversione! Il traffico è di qualità.'
        : 'Il tasso di conversione potrebbe essere migliorato.',
      trend: conversionRate > 1.80 ? 'positive' : 'negative',
      value: `${conversionRate.toFixed(2)}%`
    });
  }

  // Recent Trend Analysis
  if (data.daily.length > 7) {
    const recentDays = data.daily.slice(-7);
    const recentSpend = recentDays.reduce((sum: number, day: DailyData) => sum + Number(day.spesa || 0), 0);
    const recentConversions = recentDays.reduce((sum: number, day: DailyData) => sum + Number(day.conversioni_acquisti || 0), 0);
    
    if (recentSpend > 0 && recentConversions > 0) {
      const recentCpa = recentSpend / recentConversions;
      const overallCpa = totalSpent / (data.metrics.totale_acquisti || 1);

      insights.push({
        title: 'Trend Recente',
        description: recentCpa < overallCpa
          ? 'Le performance degli ultimi 7 giorni sono migliori della media del periodo.'
          : 'Le performance recenti sono sotto la media del periodo. Monitora attentamente i prossimi giorni.',
        trend: recentCpa < overallCpa ? 'positive' : 'negative',
        value: `CPA: €${recentCpa.toFixed(2)}`
      });
    }
  }

  // Miglior Giorno per Investimento
  if (data.daily.length > 1) {
    const dailyRoi: DailyROI[] = data.daily.map(day => {
      const spesa = Number(day.spesa) || 0;
      const valoreConversioneGiornaliero = data.metrics.valore_conversione / data.daily.length;
      const roiMonetario = spesa > 0 ? valoreConversioneGiornaliero - spesa : 0;
  
      return {
        giorno: new Date(day.giorno).toLocaleDateString('it-IT', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        }),
        spesa,
        roiMonetario,
        ctr: Number(day.ctr) || 0
      };
    });
  
    const bestDayRoi = dailyRoi.reduce((prev, current) => 
      (prev.roiMonetario > current.roiMonetario) ? prev : current
    );
  
    insights.push({
      title: 'Miglior Giorno per Investimento',
      description: bestDayRoi.roiMonetario > 0
        ? `Il giorno ${bestDayRoi.giorno} ha generato il miglior ritorno sull'investimento.`
        : 'Nessun giorno ha generato un ROI positivo durante il periodo analizzato.',
      trend: bestDayRoi.roiMonetario > 0 ? 'positive' : 'negative',
      value: `ROI: €${bestDayRoi.roiMonetario.toFixed(2)} | Spesa: €${bestDayRoi.spesa.toFixed(2)}`
    });
  }

  // CTR Network Analysis
  const ctrPerformance = getNetworkPerformance(data.daily, 'ctr');
  insights.push({
    title: 'Performance CTR per Network',
    description: `${formatNetworkName(ctrPerformance.best.network)} ha il CTR più alto, mentre ${formatNetworkName(ctrPerformance.worst.network)} mostra il CTR più basso.`,
    trend: 'neutral',
    value: `Migliore: ${ctrPerformance.best.value.toFixed(2)}% | Peggiore: ${ctrPerformance.worst.value.toFixed(2)}%`
  });

  // CPC Network Analysis
  const cpcPerformance = getNetworkPerformance(data.daily, 'cpc');
  insights.push({
    title: 'Performance CPC per Network',
    description: `${formatNetworkName(cpcPerformance.best.network)} ha il CPC più basso, mentre ${formatNetworkName(cpcPerformance.worst.network)} mostra il CPC più alto.`,
    trend: 'neutral',
    value: `Migliore: €${cpcPerformance.best.value.toFixed(2)} | Peggiore: €${cpcPerformance.worst.value.toFixed(2)}`
  });

  // Acquisti Network Analysis
  const acquistiPerformance = getNetworkPerformance(data.daily, 'acquisti');
  insights.push({
    title: 'Performance Acquisti per Network',
    description: `${formatNetworkName(acquistiPerformance.best.network)} ha generato più acquisti, mentre ${formatNetworkName(acquistiPerformance.worst.network)} ha generato meno acquisti.`,
    trend: 'neutral',
    value: `Migliore: ${acquistiPerformance.best.value} | Peggiore: ${acquistiPerformance.worst.value}`
  });

  return insights;
};