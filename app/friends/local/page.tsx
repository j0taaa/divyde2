import Link from 'next/link';
import { FriendList } from '@/components/friend-list';

export default function LocalFriendsPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Local Friends</h1>
        <Link href="/friends" className="text-sm text-slate-600 hover:underline">
          Back to all friends
        </Link>
      </div>
      <FriendList filter="local" />
    </main>
  );
}
