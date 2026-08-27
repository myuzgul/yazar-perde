import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, phoneOrEmail } = await req.json();

    if (!orderNumber || !phoneOrEmail) {
      return NextResponse.json(
        { success: false, error: 'Sipariş numarası ve telefon/e-posta zorunludur' },
        { status: 400 }
      );
    }

    const cleanOrderNumber = orderNumber.trim().toUpperCase();
    const cleanQuery = phoneOrEmail.trim().toLowerCase();

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: cleanOrderNumber,
        OR: [
          { customerPhone: { contains: cleanQuery } },
          { customerEmail: { equals: cleanQuery } },
        ],
      },
      include: {
        items: true,
        addresses: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Belirtilen bilgilerle eşleşen sipariş bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}