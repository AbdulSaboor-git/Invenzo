// File: /components/dashboard/SalesTrendChart.jsx
import React from 'react';
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('recharts').then((m) => m.LineChart), {
  ssr: false,
});
const Line = dynamic(() => import('recharts').then((m) => m.Line), {
  ssr: false,
});
const XAxis = dynamic(() => import('recharts').then((m) => m.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import('recharts').then((m) => m.YAxis), {
  ssr: false,
});
const Tooltip = dynamic(() => import('recharts').then((m) => m.Tooltip), {
  ssr: false,
});
const ResponsiveContainer = dynamic(
  () => import('recharts').then((m) => m.ResponsiveContainer),
  { ssr: false }
);

export default function SalesTrendChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    day: new Date(d.day).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    }),
  }));

  if (!data || !data.length)
    return <div className="h-72 flex items-center justify-center">No data</div>;
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={formatted}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip
            formatter={(val, name) => [`Rs. ${val}`, name]}
            contentStyle={{
              borderRadius: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#8884d8"
            strokeWidth={2}
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
