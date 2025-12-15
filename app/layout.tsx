import type { Metadata } from 'next';
import './globals.css';
import { DataProvider } from '@/components/data-context';
import { ServiceWorkerRegistrar } from '@/components/service-worker';

export const metadata: Metadata = {
  title: 'Debt Tracker',
  description: 'Minimalist debt tracking for friends with offline-first design.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans">
        <DataProvider>
          {children}
          <ServiceWorkerRegistrar />
        </DataProvider>
      </body>
    </html>
  );
}
