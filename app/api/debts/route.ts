import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET(request: Request) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const friendId = searchParams.get('friendId');

  try {
    const where = friendId
      ? { OR: [{ creditorId: friendId }, { debtorId: friendId }] }
      : {};

    const debts = await (prisma as any).debt.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error('Failed to fetch debts:', error);
    return NextResponse.json({ error: 'Failed to fetch debts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { amount, creditorId, debtorId, name, isDivided, dividedAmong } = body;

    if (typeof amount !== 'number' || !creditorId || !debtorId) {
      return NextResponse.json(
        { error: 'Amount, creditorId, and debtorId are required' },
        { status: 400 }
      );
    }

    const debt = await (prisma as any).debt.create({
      data: {
        amount,
        creditorId,
        debtorId,
        name: name || null,
        isDivided: isDivided || false,
        dividedAmong: dividedAmong || [],
      },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error) {
    console.error('Failed to create debt:', error);
    return NextResponse.json({ error: 'Failed to create debt' }, { status: 500 });
  }
}
