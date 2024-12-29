import React from 'react';
import type { InsightAnalysis } from '../types/insights';

type InsightCardProps = InsightAnalysis;

export const InsightCard: React.FC<InsightCardProps> = ({
  title,
  description,
  trend,
  value
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'positive':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
          </svg>
        );
      case 'negative':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 8.586V5a1 1 0 112 0v3.586l1.293-1.293a1 1 0 011.414 1.414z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-start">
        <div className={`rounded-full p-3 ${getTrendColor()}`}>
          {getTrendIcon()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {value && (
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
          )}
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
};