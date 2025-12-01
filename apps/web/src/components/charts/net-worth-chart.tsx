'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@kapital/utils';

const data = [
  { month: '8월', value: 42000000 },
  { month: '9월', value: 42500000 },
  { month: '10월', value: 43200000 },
  { month: '11월', value: 44100000 },
  { month: '12월', value: 44800000 },
  { month: '1월', value: 45230000 },
];

export function NetWorthChart() {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="month"
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 10000000).toFixed(0)}천만`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="text-sm text-gray-500">{payload[0].payload.month}</p>
                    <p className="text-lg font-bold font-currency">
                      {formatCurrency(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2563EB"
            strokeWidth={2}
            dot={{ fill: '#2563EB', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: '#2563EB' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
