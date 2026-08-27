import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { triggerOrderNotification } from '@/lib/notification-service';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    if (id) {
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          addresses: true,
          timeline: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!order) {
        return NextResponse.json({ success: false, error: 'Sipariş bulunamadı' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: order });
    }

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerSurname: { contains: search } },
        { customerPhone: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        addresses: true,
      },
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, paymentStatus, adminNote, timelineTitle, timelineDesc } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Sipariş ID gerekli' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNote !== undefined) updateData.adminNote = adminNote;

    const timelineCreate = status
      ? {
          create: {
            status,
            title: timelineTitle || `Sipariş Durumu: ${status}`,
            description: timelineDesc || `Yönetici (${admin.email}) tarafından güncellendi.`,
          },
        }
      : undefined;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...updateData,
        timeline: timelineCreate,
      },
      include: {
        items: true,
        addresses: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Durum Değişikliğinde Asenkron Bildirim Tetikleme
    if (status) {
      let eventCode: any = null;
      if (status === 'CONFIRMED') eventCode = 'PAYMENT_RECEIVED';
      else if (status === 'IN_PRODUCTION') eventCode = 'IN_PRODUCTION';
      else if (status === 'SHIPPED') eventCode = 'SHIPPED';
      else if (status === 'DELIVERED') eventCode = 'DELIVERED';
      else if (status === 'CANCELLED') eventCode = 'CANCELLED';

      if (eventCode) {
        triggerOrderNotification({
          eventCode,
          customerName: `${updated.customerName} ${updated.customerSurname}`,
          customerPhone: updated.customerPhone,
          customerEmail: updated.customerEmail,
          orderNumber: updated.orderNumber,
          grandTotal: updated.grandTotal,
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}