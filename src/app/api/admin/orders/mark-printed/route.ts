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

    // Seçilen tüm siparişleri yazdırıldı olarak işaretle
    await prisma.order.updateMany({
      where: { id: { in: orderIds } },
      data: {
        isPrinted: true,
        printedAt: now,
        printCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} sipariş başarıyla yazdırıldı olarak işaretlendi.`,
      updatedCount: orderIds.length,
      printedAt: now,
    });
  } catch (error: any) {
    console.error('Mark printed error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}