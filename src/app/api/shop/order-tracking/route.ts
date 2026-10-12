import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber } = await req.json();

    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { success: false, error: 'Sipariş numarası zorunludur' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanOrderNumber,
      },
      include: {
        items: true,
        addresses: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Belirtilen sipariş numarası ile eşleşen sipariş bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}