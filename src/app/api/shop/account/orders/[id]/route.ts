import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCustomerSession } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                curtainType: true,
                images: { orderBy: { sortOrder: 'asc' }, take: 1 },
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

    if (!order) {
      return NextResponse.json({ success: false, message: 'Sipariş bulunamadı' }, { status: 404 });
    }

    // Güvenlik yetki kontrolü: Müşteri yalnızca kendi siparişini görebilir
    const isOwner = order.userId === session.userId || order.customerEmail.toLowerCase() === session.email.toLowerCase();
    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Bu siparişi görüntüleme yetkiniz bulunmamaktadır.' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Account order detail error:', error);
    return NextResponse.json({ success: false, message: 'Sipariş detayı alınamadı' }, { status: 500 });
  }
}