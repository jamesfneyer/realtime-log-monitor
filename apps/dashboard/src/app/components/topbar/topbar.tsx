import React from 'react';

export function Topbar() {
  return (
    <header className="h-14 bg-gray-950 border-b border-gray-800 flex items-center px-6 justify-between">
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-900 text-gray-100 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="bg-gray-800 hover:bg-gray-700 text-gray-100 px-3 py-1 rounded">⚙️</button>
        <span className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold">U</span>
      </div>
    </header>
  );
}
