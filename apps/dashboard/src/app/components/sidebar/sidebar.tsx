import React from 'react';

export function Sidebar() {
  return (
    <aside className="w-20 md:w-56 bg-gray-950 border-r border-gray-800 flex flex-col items-center py-4">
      <div className="mb-8 flex flex-col items-center">
        <span className="text-2xl font-bold text-orange-400">🟧</span>
        <span className="hidden md:block text-lg font-semibold mt-2">Grafana UI</span>
      </div>
      <nav className="flex flex-col gap-6 w-full items-center md:items-start">
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 w-full">
          <span>🏠</span>
          <span className="hidden md:inline">Home</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 w-full">
          <span>📊</span>
          <span className="hidden md:inline">Dashboards</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 w-full">
          <span>🔍</span>
          <span className="hidden md:inline">Explore</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-4 py-2 rounded hover:bg-gray-800 w-full">
          <span>🚨</span>
          <span className="hidden md:inline">Alerts</span>
        </a>
      </nav>
    </aside>
  );
}
