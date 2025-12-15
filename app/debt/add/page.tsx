'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDataContext } from '@/components/data-context';

function AddDebtForm() {
  const search = useSearchParams();
  const router = useRouter();
  const { data, addDebt } = useDataContext();
  const defaultFriend = search.get('friend');
  const [friendId, setFriendId] = useState(defaultFriend || (data.friends[0]?.id ?? ''));
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'debtor' | 'creditor'>('debtor');
  const [name, setName] = useState('');
  const [divide, setDivide] = useState(false);
  const [dividedAmong, setDividedAmong] = useState<string[]>([]);

  const friends = data.friends;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (!friendId || isNaN(numericAmount)) return;
    const targetId = friendId;
    const meId = 'me';
    const creditorId = direction === 'creditor' ? meId : targetId;
    const debtorId = direction === 'creditor' ? targetId : meId;

    addDebt({
      amount: numericAmount,
      creditorId,
      debtorId,
      name: name.trim() || undefined,
      isDivided: divide,
      dividedAmong: divide ? dividedAmong : [],
    });

    router.push(`/friends/${targetId}`);
  };

  const handleDivideSelection = (id: string) => {
    setDividedAmong((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id]
    );
  };

  if (friends.length === 0) {
    return (
      <main className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-semibold">Add Debt</h1>
          <p className="text-slate-700">Add at least one friend before creating debts.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-slate-50 px-4 py-10">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Add Debt</h1>
          <p className="text-sm text-slate-600">Single-column form focused on clarity.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Direction</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDirection('debtor')}
              className={`flex-1 rounded-md border px-3 py-2 ${direction === 'debtor' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}
            >
              I owe them
            </button>
            <button
              type="button"
              onClick={() => setDirection('creditor')}
              className={`flex-1 rounded-md border px-3 py-2 ${direction === 'creditor' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200'}`}
            >
              They owe me
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Friend</label>
          <select
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
          >
            <option value="" disabled>
              Select friend
            </option>
            {friends.map((friend) => (
              <option key={friend.id} value={friend.id}>
                {friend.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Debt name (optional)</label>
          <input
            className="w-full rounded-md border border-slate-300 px-3 py-2"
            placeholder="Dinner"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {direction === 'creditor' && (
          <div className="space-y-2 rounded-md border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Divide debt</label>
              <input
                type="checkbox"
                checked={divide}
                onChange={(e) => setDivide(e.target.checked)}
                className="h-4 w-4"
              />
            </div>
            {divide && (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <label key={friend.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={dividedAmong.includes(friend.id)}
                      onChange={() => handleDivideSelection(friend.id)}
                    />
                    {friend.name}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
          >
            Save Debt
          </button>
        </div>
      </form>
    </main>
  );
}

function LoadingForm() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="rounded-lg bg-white px-4 py-3 text-slate-700 shadow">Loading form...</div>
    </main>
  );
}

export default function AddDebtPage() {
  return (
    <Suspense fallback={<LoadingForm />}>
      <AddDebtForm />
    </Suspense>
  );
}
