'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AddFriendModal } from './add-friend-modal';
import { useDataContext } from './data-context';

interface Props {
  filter?: 'local' | 'online';
}

export function FriendList({ filter }: Props) {
  const { data, removeFriend } = useDataContext();
  const [showModal, setShowModal] = useState(false);

  const friends = useMemo(() => {
    if (!filter) return data.friends;
    return data.friends.filter((friend) => friend.type === filter);
  }, [data.friends, filter]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Friends</h1>
          <p className="text-sm text-slate-600">Unified list across modes with balances.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white shadow hover:bg-slate-800"
          aria-label="Add friend"
        >
          +
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {friends.map((friend) => (
          <div key={friend.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Link href={`/friends/${friend.id}`} className="text-lg font-semibold hover:underline">
                {friend.name}
              </Link>
              <span
                className={`text-sm font-medium ${
                  friend.balance >= 0 ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {friend.balance >= 0 ? '+' : ''}{friend.balance.toFixed(2)}
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm">
              <Link
                href={`/debt/add?friend=${friend.id}`}
                className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
              >
                Add Debt
              </Link>
              <button
                className="rounded-md border border-red-200 px-3 py-2 text-red-700 hover:bg-red-50"
                onClick={() => {
                  const confirmed = confirm('Remove friend and associated debts?');
                  if (confirmed) removeFriend(friend.id);
                }}
              >
                Remove Friend
              </button>
            </div>
          </div>
        ))}
      </div>
      {friends.length === 0 && (
        <div className="rounded-md bg-slate-100 px-4 py-3 text-slate-700">No friends yet.</div>
      )}
      {showModal && <AddFriendModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
