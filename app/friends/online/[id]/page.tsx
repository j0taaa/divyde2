'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDataContext } from '@/components/data-context';

export default function OnlineFriendDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, debtsByFriend, markPaid, removeFriend, isLoading } = useDataContext();
  const friend = useMemo(() => data.friends.find((f) => f.id === id), [data.friends, id]);
  const debts = debtsByFriend(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-md bg-slate-100 px-4 py-3 text-slate-700 animate-pulse">
          Loading friend details...
        </div>
      </main>
    );
  }

  if (!friend) {
    return (
      <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <div className="rounded-md bg-red-100 px-4 py-3 text-red-800">Friend not found.</div>
        <Link href="/friends/online" className="text-slate-700 underline">
          Back to online friends
        </Link>
      </main>
    );
  }

  const handleRemove = async () => {
    const confirmed = confirm('Remove friend and their debts?');
    if (confirmed) {
      try {
        await removeFriend(friend.id);
        router.push('/friends/online');
      } catch (err) {
        console.error('Failed to remove friend:', err);
        alert('Failed to remove friend');
      }
    }
  };

  const handleMarkPaid = async (debtId: string) => {
    try {
      await markPaid(debtId);
    } catch (err) {
      console.error('Failed to mark debt as paid:', err);
      alert('Failed to mark debt as paid');
    }
  };

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600">
            <Link href="/friends/online" className="hover:underline">Online Friends</Link> / Detail
          </p>
          <h1 className="text-3xl font-semibold">{friend.name}</h1>
          {friend.email && (
            <p className="text-sm text-slate-500">{friend.email}</p>
          )}
        </div>
        <button
          className="rounded-md border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50"
          onClick={handleRemove}
        >
          Remove
        </button>
      </div>
      <div className={`rounded-lg p-4 text-xl font-semibold ${friend.balance === 0 ? 'bg-slate-100 text-slate-700' : friend.balance > 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
        Balance: {friend.balance > 0 ? '+' : ''}{friend.balance.toFixed(2)}
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Debt history</h2>
        <Link href={`/debt/add?friend=${friend.id}&mode=online`} className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800">
          Add Another Debt
        </Link>
      </div>
      <div className="space-y-3">
        {debts.map((debt) => (
          <div key={debt.id} className="rounded-md border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{new Date(debt.createdAt).toLocaleString()}</p>
                <p className="text-base font-semibold">{debt.name || 'Debt'}</p>
                {debt.isDivided && debt.dividedAmong.length > 0 && (
                  <p className="text-sm text-slate-600">Divided among {debt.dividedAmong.length} friend(s)</p>
                )}
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${debt.creditorId === friend.id ? 'text-green-700' : 'text-red-700'}`}>
                  {debt.creditorId === friend.id ? '+' : '-'}{debt.amount.toFixed(2)}
                </p>
                {debt.isPaid ? (
                  <p className="text-sm text-green-700 line-through">Paid</p>
                ) : (
                  <button
                    onClick={() => handleMarkPaid(debt.id)}
                    className="mt-2 rounded-md bg-emerald-100 px-3 py-1 text-sm text-emerald-800 hover:bg-emerald-200"
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {debts.length === 0 && (
          <div className="rounded-md bg-slate-100 px-4 py-3 text-slate-700">No debts yet.</div>
        )}
      </div>
    </main>
  );
}
