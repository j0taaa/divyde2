# Debt Tracker

A minimalist debt tracking web application for friends built with Next.js 14+, Tailwind CSS, and shadcn/ui defaults. The app runs fully offline in local mode while supporting an optional PostgreSQL-backed online mode. If the database is unreachable, the UI gracefully falls back to local storage.

## Features
- Local mode using `localStorage` plus in-memory state.
- Optional online mode backed by PostgreSQL and server actions (disabled automatically when `DATABASE_URL` is missing or unhealthy).
- PWA ready with service worker and manifest; installable and usable offline.
- Routes: landing (`/`), unified friends list (`/friends`), filtered lists (`/friends/local`, `/friends/online`), add debt form (`/debt/add`), friend details (`/friends/[id]`), health endpoint (`/api/health`).
- Add/remove friends, add debts (with optional division when friends owe you), mark debts as paid, and view running balances (green=owed to you, red=you owe).

## Data models
```ts
// Local + online friend shape
{
  id: string; // UUID
  name: string;
  type: 'local' | 'online';
  email?: string;
  createdAt: Date;
  balance: number; // derived
}

// Debt
{
  id: string;
  amount: number;
  creditorId: string; // who is owed
  debtorId: string; // who owes
  name?: string;
  isPaid: boolean;
  createdAt: Date;
  paidAt?: Date;
  isDivided: boolean;
  dividedAmong: string[]; // friend ids
}
```

Local storage persists the following structure:
```ts
const localData = {
  friends: Friend[],
  debts: Debt[],
};
```

## Optional database (Prisma + PostgreSQL)
- Prisma schema lives in `prisma/schema.prisma` and models `Friend` and `Debt`.
- Presence of a valid `DATABASE_URL` enables online mode; absence keeps the app in local-only mode.
- Health check at `/api/health` reports whether the database is reachable.

## Getting started
```bash
npm install
npm run dev
```
The app runs at http://localhost:3000. With no database configured, the UI displays the local-only warning and disables online actions.

### Enabling PostgreSQL
1. Copy `.env.template` to `.env` and adjust `DATABASE_URL` if needed.
2. Run `npx prisma generate` (and `npx prisma migrate dev` when you have a database).
3. Start the dev server; `/api/health` should report `{ database: true }` once the DB is reachable.

### Docker
Build and run with Docker Compose (PostgreSQL optional):
```bash
docker-compose up --build
```
- `app` listens on port 3000
- `db` runs PostgreSQL 16 on port 5432
- The app still boots if the database is unhealthy or `DATABASE_URL` is missing.

## PWA
- Manifest at `/manifest.json` and service worker at `/sw.js`.
- Offline caching for landing and friends pages; local data persists via `localStorage`.

## Notes
- No authentication and no debt editing (create, mark paid, delete only).
- Layouts favor single-column, centered content using Tailwind defaults/shadcn styles.
