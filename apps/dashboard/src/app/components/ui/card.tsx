import React from 'react';

interface CardProps {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, actions, children, className = '' }: CardProps) {
  return (
    <section className={`bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-700 ${className}`}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-6">
          {title && <h2 className="text-2xl font-bold text-white">{title}</h2>}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
} 