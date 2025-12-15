'use client';

import { useEffect, useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Debt, Friend, LocalData } from './types';

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

function persist(data: LocalData) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useLocalData() {
  const [data, setData] = useState<LocalData>(() => loadLocalData());

  useEffect(() => {
    persist(data);
  }, [data]);

  const helpers = useMemo(() => ({
    addFriend: (name: string) => {
      const friend: Friend = {
        id: uuid(),
        name,
        type: 'local',
        createdAt: new Date().toISOString(),
        balance: 0,
      };
      setData((current) => ({ ...current, friends: [...current.friends, friend] }));
      return friend;
    },
    removeFriend: (id: string) => {
      setData((current) => ({
        friends: current.friends.filter((f) => f.id !== id),
        debts: current.debts.filter((d) => d.creditorId !== id && d.debtorId !== id),
      }));
    },
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'isPaid' | 'paidAt'> & { createdAt?: string }) => {
      const payload: Debt = {
        ...debt,
        id: uuid(),
        createdAt: debt.createdAt ?? new Date().toISOString(),
        isPaid: false,
        paidAt: undefined,
      };
      setData((current) => ({ ...current, debts: [payload, ...current.debts] }));
      return payload;
    },
    markPaid: (id: string) => {
      setData((current) => ({
        ...current,
        debts: current.debts.map((debt) =>
          debt.id === id ? { ...debt, isPaid: true, paidAt: new Date().toISOString() } : debt
        ),
      }));
    },
  }), []);

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    data.debts.forEach((debt) => {
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

  const debtsByFriend = (id: string) =>
    data.debts.filter((debt) => debt.creditorId === id || debt.debtorId === id);

  return { data: { ...data, friends: friendsWithBalance }, helpers, debtsByFriend };
}
