'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Debt, Friend, LocalData } from '@/lib/types';
import { v4 as uuid } from 'uuid';

type Mode = 'local' | 'online';

interface DataContextValue {
  data: LocalData & { friends: Friend[] };
  mode: Mode;
  isLoading: boolean;
  error: string | null;
  debtsByFriend: (id: string) => Debt[];
  addFriend: (name: string, email?: string) => Promise<Friend>;
  removeFriend: (id: string) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'isPaid' | 'paidAt'> & { createdAt?: string }) => Promise<Debt>;
  markPaid: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

const STORAGE_KEY = 'debt-tracker-data';
const initialData: LocalData = { friends: [], debts: [] };

function loadLocalData(): LocalData {
  if (typeof window === 'undefined') return initialData;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return initialData;
  try {
    const parsed = JSON.parse(raw) as LocalData;
    return {
      friends: parsed.friends || [],
      debts: parsed.debts || [],
    };
  } catch (err) {
    console.error('Failed to parse local storage', err);
    return initialData;
  }
}

function persistLocal(data: LocalData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface DataProviderProps {
  children: React.ReactNode;
  mode?: Mode;
}

export function DataProvider({ children, mode = 'local' }: DataProviderProps) {
  const [data, setData] = useState<LocalData>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch data based on mode
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (mode === 'online') {
        const [friendsRes, debtsRes] = await Promise.all([
          fetch('/api/friends'),
          fetch('/api/debts'),
        ]);
        
        if (!friendsRes.ok || !debtsRes.ok) {
          throw new Error('Failed to fetch data from server');
        }
        
        const friendsRaw = await friendsRes.json();
        const debtsRaw = await debtsRes.json();
        
        // Transform API response to match our types
        const friends: Friend[] = friendsRaw.map((f: any) => ({
          id: f.id,
          name: f.name,
          email: f.email || undefined,
          type: 'online' as const,
          createdAt: f.createdAt,
          balance: 0, // Will be calculated
        }));
        
        const debts: Debt[] = debtsRaw.map((d: any) => ({
          id: d.id,
          amount: d.amount,
          creditorId: d.creditorId,
          debtorId: d.debtorId,
          name: d.name || undefined,
          isPaid: d.isPaid,
          createdAt: d.createdAt,
          paidAt: d.paidAt || undefined,
          isDivided: d.isDivided,
          dividedAmong: d.dividedAmong || [],
        }));
        
        setData({ friends, debts });
      } else {
        const loadedData = loadLocalData();
        setData(loadedData);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      if (mode === 'local') {
        setData(loadLocalData());
      }
    } finally {
      setIsLoading(false);
      setIsHydrated(true);
    }
  }, [mode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Persist local data
  useEffect(() => {
    if (isHydrated && mode === 'local') {
      persistLocal(data);
    }
  }, [data, isHydrated, mode]);

  // Calculate balances
  const balances = useMemo(() => {
    const map = new Map<string, number>();
    data.debts
      .filter((debt) => !debt.isPaid)
      .forEach((debt) => {
        const amount = debt.amount;
        map.set(debt.creditorId, (map.get(debt.creditorId) || 0) + amount);
        map.set(debt.debtorId, (map.get(debt.debtorId) || 0) - amount);
      });
    return map;
  }, [data.debts]);

  const friendsWithBalance: Friend[] = useMemo(() =>
    data.friends.map((friend) => ({
      ...friend,
      balance: balances.get(friend.id) || 0,
    })),
  [data.friends, balances]);

  const debtsByFriend = useCallback((id: string) =>
    data.debts.filter((debt) => debt.creditorId === id || debt.debtorId === id),
  [data.debts]);

  // Add friend
  const addFriend = useCallback(async (name: string, email?: string): Promise<Friend> => {
    if (mode === 'online') {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to add friend');
      }
      
      const created = await res.json();
      const friend: Friend = {
        id: created.id,
        name: created.name,
        email: created.email || undefined,
        type: 'online',
        createdAt: created.createdAt,
        balance: 0,
      };
      
      setData((current) => ({
        ...current,
        friends: [...current.friends, friend],
      }));
      
      return friend;
    } else {
      const friend: Friend = {
        id: uuid(),
        name,
        email,
        type: 'local',
        createdAt: new Date().toISOString(),
        balance: 0,
      };
      setData((current) => ({ ...current, friends: [...current.friends, friend] }));
      return friend;
    }
  }, [mode]);

  // Remove friend
  const removeFriend = useCallback(async (id: string): Promise<void> => {
    if (mode === 'online') {
      const res = await fetch(`/api/friends/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Failed to remove friend');
      }
    }
    
    setData((current) => ({
      friends: current.friends.filter((f) => f.id !== id),
      debts: current.debts.filter((d) => d.creditorId !== id && d.debtorId !== id),
    }));
  }, [mode]);

  // Add debt
  const addDebt = useCallback(async (
    debt: Omit<Debt, 'id' | 'createdAt' | 'isPaid' | 'paidAt'> & { createdAt?: string }
  ): Promise<Debt> => {
    if (mode === 'online') {
      const res = await fetch('/api/debts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: debt.amount,
          creditorId: debt.creditorId,
          debtorId: debt.debtorId,
          name: debt.name,
          isDivided: debt.isDivided,
          dividedAmong: debt.dividedAmong,
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to add debt');
      }
      
      const created = await res.json();
      const newDebt: Debt = {
        id: created.id,
        amount: created.amount,
        creditorId: created.creditorId,
        debtorId: created.debtorId,
        name: created.name || undefined,
        isPaid: created.isPaid,
        createdAt: created.createdAt,
        paidAt: created.paidAt || undefined,
        isDivided: created.isDivided,
        dividedAmong: created.dividedAmong || [],
      };
      
      setData((current) => ({ ...current, debts: [newDebt, ...current.debts] }));
      return newDebt;
    } else {
      const payload: Debt = {
        ...debt,
        id: uuid(),
        createdAt: debt.createdAt ?? new Date().toISOString(),
        isPaid: false,
        paidAt: undefined,
      };
      setData((current) => ({ ...current, debts: [payload, ...current.debts] }));
      return payload;
    }
  }, [mode]);

  // Mark debt as paid
  const markPaid = useCallback(async (id: string): Promise<void> => {
    if (mode === 'online') {
      const res = await fetch(`/api/debts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaid: true }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to mark debt as paid');
      }
    }
    
    setData((current) => ({
      ...current,
      debts: current.debts.map((debt) =>
        debt.id === id ? { ...debt, isPaid: true, paidAt: new Date().toISOString() } : debt
      ),
    }));
  }, [mode]);

  const value: DataContextValue = {
    data: { ...data, friends: friendsWithBalance },
    mode,
    isLoading,
    error,
    debtsByFriend,
    addFriend,
    removeFriend,
    addDebt,
    markPaid,
    refresh: fetchData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('Data context missing');
  return ctx;
}
