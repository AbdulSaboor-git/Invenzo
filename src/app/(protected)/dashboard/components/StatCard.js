// File: /components/dashboard/StatCard.jsx
import React from 'react';

export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="bg-white/60 backdrop-blur p-4 rounded-2xl shadow-sm flex flex-col">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && <div className="mt-1 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
}
