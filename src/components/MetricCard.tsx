import React from 'react';

interface MetricCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  isInteger?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  prefix = '', 
  suffix = '',
  isInteger = false
}) => {
  const formatValue = (val: number): string => {
    if (isInteger) {
      return val.toLocaleString('it-IT');
    }
    return val.toLocaleString('it-IT', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 transition-all duration-200 hover:shadow-md">
      <h3 className="text-gray-600 text-sm font-medium mb-2">{title}</h3>
      <div className="text-2xl font-bold text-gray-900">
        {prefix}
        {formatValue(value)}
        {suffix}
      </div>
    </div>
  );
};