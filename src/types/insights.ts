export interface InsightAnalysis {
    title: string;
    description: string;
    descriptionFormat?: 'plain' | 'markdown' | 'html';
    trend: 'positive' | 'negative' | 'neutral';
    value: string;
  }