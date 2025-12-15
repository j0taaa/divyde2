'use client';

import { useState } from 'react';
import { useDataContext } from './data-context';

export function AddFriendModal({ onClose }: { onClose: () => void }) {
  const { addFriend } = useDataContext();
  const [name, setName] = useState('');
  const canSubmit = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-xl font-semibold">Add Friend</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Friend name</label>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2"
              placeholder="Ada Lovelace"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-700">
            Online friends are disabled until a database connection is available. This friend will be stored locally.
          </div>
          <div className="flex justify-end gap-3">
            <button className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100" onClick={onClose}>
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                addFriend(name.trim());
                onClose();
              }}
              className={`rounded-md px-4 py-2 text-white shadow ${
                canSubmit ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
