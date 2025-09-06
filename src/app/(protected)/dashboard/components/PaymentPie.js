// File: /components/dashboard/PaymentPie.jsx
'use client';
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
import { Cell } from 'recharts';

const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

const COLORS = [
  '#f97316', // orange
  '#22C85FFF', // green
  '#60a5fa', // blue
  '#34d399', // teal
  '#f43f5e', // red
  '#a78bfa', // purple
];

export default function PaymentPie({ data }) {
  if (!data || !data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500">
        No data
      </div>
    );
  }

  return (
    <div className="w-full h-[240px]">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="method"
            innerRadius={20}
            outerRadius={60}
            paddingAngle={2}
            label={({ value }) => `Rs. ${value}`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(val, name) => [`Rs. ${val}`, name.toUpperCase()]}
            contentStyle={{
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
