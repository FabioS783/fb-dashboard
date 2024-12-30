import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Menu } from '@headlessui/react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { it } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

const predefinedRanges = [
  {
    label: 'Ultimi 7 giorni',
    getValue: () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date()
    })
  },
  {
    label: 'Ultimi 30 giorni',
    getValue: () => ({
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    })
  },
  {
    label: 'Ultimi 3 mesi',
    getValue: () => ({
      startDate: subMonths(new Date(), 3),
      endDate: new Date()
    })
  },
  {
    label: 'Mese corrente',
    getValue: () => ({
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    })
  }
];

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onApply: () => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onDateRangeChange,
  onApply
}) => {
  const [startDate, setStartDate] = useState(parseISO(dateRange.startDate));
  const [endDate, setEndDate] = useState(parseISO(dateRange.endDate));

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    if (start) {
      setStartDate(start);
      onDateRangeChange({
        ...dateRange,
        startDate: format(start, 'yyyy-MM-dd')
      });
    }
    if (end) {
      setEndDate(end);
      onDateRangeChange({
        ...dateRange,
        endDate: format(end, 'yyyy-MM-dd')
      });
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-xl font-semibold mb-4">Periodo di analisi</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        <div className="md:col-span-3">
          <Menu as="div" className="relative w-full">
            <Menu.Button className="w-full px-4 py-2.5 text-left border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
              <span className="block text-sm font-medium text-gray-700">
                Periodi predefiniti
              </span>
            </Menu.Button>
            <Menu.Items className="absolute z-50 mt-1 w-full bg-white rounded-lg shadow-lg border border-gray-200 focus:outline-none">
              <div className="py-1">
                {predefinedRanges.map((range, index) => (
                  <Menu.Item key={index}>
                    {({ active }) => (
                      <button
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } w-full px-4 py-2 text-left text-sm`}
                        onClick={() => {
                          const newRange = range.getValue();
                          setStartDate(newRange.startDate);
                          setEndDate(newRange.endDate);
                          onDateRangeChange({
                            startDate: format(newRange.startDate, 'yyyy-MM-dd'),
                            endDate: format(newRange.endDate, 'yyyy-MM-dd')
                          });
                        }}
                      >
                        {range.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Menu>
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Inizio
          </label>
          <DatePicker
            selected={startDate}
            onChange={(date) => handleDateChange([date, endDate])}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            dateFormat="dd/MM/yyyy"
            locale={it}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data Fine
          </label>
          <DatePicker
            selected={endDate}
            onChange={(date) => handleDateChange([startDate, date])}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            dateFormat="dd/MM/yyyy"
            locale={it}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="md:col-span-1">
          <button
            onClick={onApply}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Aggiorna
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangePicker;