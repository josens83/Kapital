'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency, formatPercent } from '@kapital/utils';

interface ExpenseData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface ExpenseCategoryChartProps {
  data: ExpenseData[];
}

export function ExpenseCategoryChart({ data }: ExpenseCategoryChartProps) {
  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ExpenseData;
                return (
                  <div className="bg-white p-3 rounded-lg shadow-lg border">
                    <p className="text-sm font-medium">{item.category}</p>
                    <p className="text-lg font-bold font-currency">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatPercent(item.percentage, { decimals: 1 })}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value, entry) => {
              const item = data.find(d => d.category === value);
              return (
                <span className="text-sm">
                  {value} ({formatPercent(item?.percentage || 0, { decimals: 0 })})
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
