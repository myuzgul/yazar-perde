import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    let orderIds: string[] = [];

    if (Array.isArray(body.orderIds)) {
      orderIds = body.orderIds;
    } else if (body.orderId) {
      orderIds = [body.orderId];
    } else if (body.id) {
      orderIds = [body.id];
    }

    if (orderIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    const now = new Date();

    // 1. Seçilen siparişleri çek (mevcut durumlarını ve müşteri bilgilerini almak için)
    const existingOrders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
    });

    for (const order of existingOrders) {
      // Eğer sipariş henüz kargoya verilmemiş veya teslim edilmemişse durumunu 'IN_PRODUCTION' (Üretimde) yap
      const newStatus = ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)
        ? order.status
        : 'IN_PRODUCTION';

      const timelineEntry = newStatus === 'IN_PRODUCTION' && order.status !== 'IN_PRODUCTION'
        ? {
            create: {
              status: 'IN_PRODUCTION',
              title: 'Sipariş Durumu: Atölyede Üretimde',
              description: 'Atölye iş fişi yazdırıldı, perde dikim ve imalat sürecine alındı.',
            },
          }
        : undefined;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          isPrinted: true,
          printedAt: now,
          printCount: { increment: 1 },
          status: newStatus,
          timeline: timelineEntry,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} sipariş yazdırıldı ve durumu 'Üretimde' olarak güncellendi.`,
      updatedCount: orderIds.length,
      printedAt: now,
    });
  } catch (error: any) {
    console.error('Mark printed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}