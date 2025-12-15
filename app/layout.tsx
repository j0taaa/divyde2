import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DataProvider } from '@/components/data-context';
import { ServiceWorkerRegistrar } from '@/components/service-worker';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <DataProvider>
          {children}
          <ServiceWorkerRegistrar />
        </DataProvider>
      </body>
    </html>
  );
}
