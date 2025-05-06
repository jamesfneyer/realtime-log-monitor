import { Suspense } from 'react';
import { ServiceStats } from './components/service-stats';
import { RecentAlerts } from './components/recent-alerts';
import { LogStream } from './components/log-stream';

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Log Monitor Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Suspense fallback={<div>Loading service stats...</div>}>
          <ServiceStats />
        </Suspense>
        
        <Suspense fallback={<div>Loading recent alerts...</div>}>
          <RecentAlerts />
        </Suspense>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Live Log Stream</h2>
        <Suspense fallback={<div>Loading log stream...</div>}>
          <LogStream />
        </Suspense>
      </div>
    </main>
  );
} 