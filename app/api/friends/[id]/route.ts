import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { id } = await params;

  try {
    const friend = await (prisma as any).friend.findUnique({
      where: { id },
    });

    if (!friend) {
      return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error('Failed to fetch friend:', error);
    return NextResponse.json({ error: 'Failed to fetch friend' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { id } = await params;

  try {
    // Delete associated debts first
    await (prisma as any).debt.deleteMany({
      where: {
        OR: [{ creditorId: id }, { debtorId: id }],
      },
    });

    // Delete the friend
    await (prisma as any).friend.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete friend:', error);
    return NextResponse.json({ error: 'Failed to delete friend' }, { status: 500 });
  }
}
