'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Debt, Friend, LocalData } from './types';

const initialData: LocalData = { friends: [], debts: [] };

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

interface DbFriend {
  id: string;
  name: string;
  email?: string | null;
  createdAt: string;
}

interface DbDebt {
  id: string;
  amount: number;
  creditorId: string;
  debtorId: string;
  name?: string | null;
  isPaid: boolean;
  createdAt: string;
  paidAt?: string | null;
  isDivided: boolean;
  dividedAmong: string[];
}

function mapDbFriendToFriend(dbFriend: DbFriend): Friend {
  return {
    id: dbFriend.id,
    name: dbFriend.name,
    type: 'online',
    email: dbFriend.email || undefined,
    createdAt: dbFriend.createdAt,
    balance: 0, // Will be calculated
  };
}

function mapDbDebtToDebt(dbDebt: DbDebt): Debt {
  return {
    id: dbDebt.id,
    amount: dbDebt.amount,
    creditorId: dbDebt.creditorId,
    debtorId: dbDebt.debtorId,
    name: dbDebt.name || undefined,
    isPaid: dbDebt.isPaid,
    createdAt: dbDebt.createdAt,
    paidAt: dbDebt.paidAt || undefined,
    isDivided: dbDebt.isDivided,
    dividedAmong: dbDebt.dividedAmong,
  };
}

export function useOnlineData() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [friendsRes, debtsRes] = await Promise.all([
        fetchApi<DbFriend[]>('/api/friends'),
        fetchApi<DbDebt[]>('/api/debts'),
      ]);
      setFriends(friendsRes.map(mapDbFriendToFriend));
      setDebts(debtsRes.map(mapDbDebtToDebt));
    } catch (err) {
      console.error('Failed to fetch online data:', err);
      setError('Failed to load data from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const helpers = useMemo(() => ({
    addFriend: async (name: string, email?: string): Promise<Friend> => {
      const dbFriend = await fetchApi<DbFriend>('/api/friends', {
        method: 'POST',
        body: JSON.stringify({ name, email }),
      });
      const friend = mapDbFriendToFriend(dbFriend);
      setFriends((current) => [friend, ...current]);
      return friend;
    },
    removeFriend: async (id: string): Promise<void> => {
      await fetchApi(`/api/friends/${id}`, { method: 'DELETE' });
      setFriends((current) => current.filter((f) => f.id !== id));
      setDebts((current) => current.filter((d) => d.creditorId !== id && d.debtorId !== id));
    },
    addDebt: async (debt: Omit<Debt, 'id' | 'createdAt' | 'isPaid' | 'paidAt'> & { createdAt?: string }): Promise<Debt> => {
      const dbDebt = await fetchApi<DbDebt>('/api/debts', {
        method: 'POST',
        body: JSON.stringify({
          amount: debt.amount,
          creditorId: debt.creditorId,
          debtorId: debt.debtorId,
          name: debt.name,
          isDivided: debt.isDivided,
          dividedAmong: debt.dividedAmong,
        }),
      });
      const newDebt = mapDbDebtToDebt(dbDebt);
      setDebts((current) => [newDebt, ...current]);
      return newDebt;
    },
    markPaid: async (id: string): Promise<void> => {
      const dbDebt = await fetchApi<DbDebt>(`/api/debts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isPaid: true }),
      });
      setDebts((current) =>
        current.map((debt) =>
          debt.id === id ? mapDbDebtToDebt(dbDebt) : debt
        )
      );
    },
    refresh: fetchData,
  }), [fetchData]);

  const balances = useMemo(() => {
    const map = new Map<string, number>();
    debts
      .filter((debt) => !debt.isPaid)
      .forEach((debt) => {
        const amount = debt.amount;
        map.set(debt.creditorId, (map.get(debt.creditorId) || 0) + amount);
        map.set(debt.debtorId, (map.get(debt.debtorId) || 0) - amount);
      });
    return map;
  }, [debts]);

  const friendsWithBalance: Friend[] = useMemo(() =>
    friends.map((friend) => ({
      ...friend,
      balance: balances.get(friend.id) || 0,
    })),
  [friends, balances]);

  const debtsByFriend = useCallback(
    (id: string) => debts.filter((debt) => debt.creditorId === id || debt.debtorId === id),
    [debts]
  );

  const data: LocalData & { friends: Friend[] } = {
    friends: friendsWithBalance,
    debts,
  };

  return { data, helpers, debtsByFriend, isLoading, error };
}
