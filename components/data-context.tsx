'use client';

import { createContext, useContext } from 'react';
import { Debt, Friend, LocalData } from '@/lib/types';
import { useLocalData } from '@/lib/local-data';

interface DataContextValue {
  data: LocalData & { friends: Friend[] };
  debtsByFriend: (id: string) => Debt[];
  addFriend: (name: string) => Friend;
  removeFriend: (id: string) => void;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'isPaid' | 'paidAt'> & { createdAt?: string }) => Debt;
  markPaid: (id: string) => void;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { data, helpers, debtsByFriend } = useLocalData();
  const value: DataContextValue = {
    data,
    debtsByFriend,
    addFriend: helpers.addFriend,
    removeFriend: helpers.removeFriend,
    addDebt: helpers.addDebt,
    markPaid: helpers.markPaid,
  };
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('Data context missing');
  return ctx;
}
