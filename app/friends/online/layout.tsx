'use client';

import { DataProvider } from '@/components/data-context';

export default function OnlineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DataProvider mode="online">{children}</DataProvider>;
}
