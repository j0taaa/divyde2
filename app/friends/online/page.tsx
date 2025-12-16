import Link from 'next/link';
import { FriendList } from '@/components/friend-list';
import { isDatabaseAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function OnlineFriendsPage() {
  const dbAvailable = await isDatabaseAvailable();

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-end">
        <Link href="/friends" className="text-sm text-slate-600 hover:underline">
          ← Back to all friends
        </Link>
      </div>
      {!dbAvailable && (
        <div className="rounded-md bg-amber-100 px-4 py-3 text-amber-900">
          Database is currently unavailable. Please check your connection.
        </div>
      )}
      {dbAvailable && (
        <div className="rounded-md bg-green-100 px-4 py-3 text-green-900">
          ✓ Database connected - Online mode is active
        </div>
      )}
      <FriendList filter="online" />
    </main>
  );
}
