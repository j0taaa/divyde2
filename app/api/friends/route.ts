import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET() {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const friends = await (prisma as any).friend.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(friends);
  } catch (error) {
    console.error('Failed to fetch friends:', error);
    return NextResponse.json({ error: 'Failed to fetch friends' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { name, email } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const friend = await (prisma as any).friend.create({
      data: {
        name: name.trim(),
        email: email?.trim() || null,
      },
    });

    return NextResponse.json(friend, { status: 201 });
  } catch (error) {
    console.error('Failed to create friend:', error);
    return NextResponse.json({ error: 'Failed to create friend' }, { status: 500 });
  }
}
