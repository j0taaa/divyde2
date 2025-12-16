import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const prisma = await getPrismaClient();
  if (!prisma) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { isPaid } = body;

    const updateData: any = {};
    if (typeof isPaid === 'boolean') {
      updateData.isPaid = isPaid;
      if (isPaid) {
        updateData.paidAt = new Date();
      } else {
        updateData.paidAt = null;
      }
    }

    const debt = await (prisma as any).debt.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error('Failed to update debt:', error);
    return NextResponse.json({ error: 'Failed to update debt' }, { status: 500 });
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
    await (prisma as any).debt.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete debt:', error);
    return NextResponse.json({ error: 'Failed to delete debt' }, { status: 500 });
  }
}
