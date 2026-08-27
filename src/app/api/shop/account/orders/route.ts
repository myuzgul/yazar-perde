import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Giriş yapmalısınız' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { userId: session.userId },
          { customerEmail: session.email },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: { take: 1, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
        },
        addresses: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error('Account orders error:', error);
    return NextResponse.json({ success: false, message: 'Siparişler getirilemedi' }, { status: 500 });
  }
}