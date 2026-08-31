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
    const printStatus = searchParams.get('printStatus');
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
    if (printStatus === 'PRINTED') {
      where.isPrinted = true;
    } else if (printStatus === 'NOT_PRINTED') {
      where.isPrinted = false;
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

    let timelineCreate = undefined;
    if (timelineTitle || status) {
      timelineCreate = {
        create: {
          status: status || 'UPDATED',
          title: timelineTitle || `Sipariş Durumu: ${status}`,
          description: timelineDesc || `Yönetici (${admin.email}) tarafından güncellendi.`,
        },
      };
    }

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

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    let orderIds: string[] = [];

    if (id) {
      orderIds = [id];
    } else {
      try {
        const body = await req.json();
        if (Array.isArray(body.orderIds)) {
          orderIds = body.orderIds;
        } else if (body.orderId || body.id) {
          orderIds = [body.orderId || body.id];
        }
      } catch {}
    }

    if (orderIds.length === 0) {
      return NextResponse.json({ success: false, error: 'Silinecek sipariş ID belirtilmedi' }, { status: 400 });
    }

    // Cascade onDelete sayesinde bağlı item, address ve timeline otomatik silinir
    const result = await prisma.order.deleteMany({
      where: {
        id: { in: orderIds },
      },
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} adet sipariş başarıyla silindi.`,
      deletedCount: result.count,
    });
  } catch (error: any) {
    console.error('Delete order error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}