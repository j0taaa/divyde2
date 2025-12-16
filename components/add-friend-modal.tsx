'use client';

import { useState } from 'react';
import { useDataContext } from './data-context';

interface AddFriendModalProps {
  onClose: () => void;
  forceMode?: 'local' | 'online';
}

export function AddFriendModal({ onClose, forceMode }: AddFriendModalProps) {
  const { addFriend, mode } = useDataContext();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const effectiveMode = forceMode ?? mode;
  const isOnline = effectiveMode === 'online';
  const canSubmit = name.trim().length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await addFriend(name.trim(), isOnline ? email.trim() || undefined : undefined);
      onClose();
    } catch (err) {
      console.error('Failed to add friend:', err);
      setError('Failed to add friend. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              disabled={isSubmitting}
            />
          </div>
          {isOnline && (
            <div className="space-y-2">
              <label className="block text-sm font-medium">Email (optional)</label>
              <input
                type="email"
                className="w-full rounded-md border border-slate-300 px-3 py-2"
                placeholder="ada@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div className={`rounded-md px-3 py-2 text-sm ${isOnline ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700'}`}>
            {isOnline 
              ? 'This friend will be stored in the online database and synced across devices.'
              : 'This friend will be stored locally on this device only.'}
          </div>
          {error && (
            <div className="rounded-md bg-red-100 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-3">
            <button 
              className="rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={`rounded-md px-4 py-2 text-white shadow ${
                canSubmit ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
