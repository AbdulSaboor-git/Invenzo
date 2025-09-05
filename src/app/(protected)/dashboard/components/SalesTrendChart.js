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
  if (!data || !data.length)
    return <div className="h-72 flex items-center justify-center">No data</div>;
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
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
