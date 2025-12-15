import Link from 'next/link';
import { FriendList } from '@/components/friend-list';

export default function OnlineFriendsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Online Friends</h1>
          <p className="text-sm text-slate-600">Requires database connectivity.</p>
        </div>
        <Link href="/friends" className="text-sm text-slate-600 hover:underline">
          Back to all friends
        </Link>
      </div>
      <div className="rounded-md bg-amber-100 px-4 py-3 text-amber-900">
        Online friend management is disabled when the database is offline. Existing online friends would appear here.
      </div>
      <FriendList filter="online" />
    </main>
  );
}
