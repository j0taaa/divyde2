import Link from 'next/link';
import { isDatabaseAvailable } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const databaseAvailable = await isDatabaseAvailable();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6 text-center">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold">Debt Tracker</h1>
        <p className="text-lg text-slate-700">
          Track debts with friends in local-only or online mode. Works offline and falls back to local storage if the database
          is unreachable.
        </p>
        {!databaseAvailable && (
          <div className="rounded-lg bg-amber-100 px-4 py-3 text-amber-900">
            Online mode unavailable - using local storage
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/friends"
            className="rounded-lg bg-slate-900 px-6 py-3 text-white shadow hover:bg-slate-800"
          >
            Use Locally
          </Link>
          <Link
            href="/friends/online"
            className={`rounded-lg px-6 py-3 shadow ${databaseAvailable ? 'bg-green-600 text-white hover:bg-green-500' : 'bg-slate-200 text-slate-500 cursor-not-allowed'}`}
          >
            Use Online
          </Link>
        </div>
      </div>
    </main>
  );
}
