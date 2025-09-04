// File: /components/dashboard/PaymentPie.jsx
import React from 'react';
import dynamic from 'next/dynamic';

const PieChart = dynamic(() => import('recharts').then((m) => m.PieChart), {
  ssr: false,
});
const Pie = dynamic(() => import('recharts').then((m) => m.Pie), {
  ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), {
  ssr: false,
});
const Cell = dynamic(() => import('recharts').then((m) => m.Cell), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

const COLORS = [
  '#4ade80',
  '#60a5fa',
  '#f97316',
  '#f43f5e',
  '#a78bfa',
  '#34d399',
];

export default function PaymentPie({ data }) {
  if (!data || !data.length)
    return <div className="h-48 flex items-center justify-center">No data</div>;
  return (
    <div style={{ width: '100%', height: 240 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="method"
            innerRadius={40}
            outerRadius={80}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
