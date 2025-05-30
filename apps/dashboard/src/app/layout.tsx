import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardShell } from './components/dashboard-shell/dashboard-shell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Log Monitor Dashboard',
  description: 'Real-time log monitoring and alerting system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
} 