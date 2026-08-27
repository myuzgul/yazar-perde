import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    // 1. Tüm Kayıtlı Müşteriler
    const users = await prisma.user.findMany({
      where: { role: { not: 'ADMIN' } },
      include: {
        orders: { select: { id: true, grandTotal: true, createdAt: true } },
        addresses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Her kullanıcının e-postasıyla eşleşen tüm siparişleri de hesaba kat
    const allOrders = await prisma.order.findMany({
      select: {
        id: true,
        userId: true,
        customerName: true,
        customerSurname: true,
        customerEmail: true,
        customerPhone: true,
        grandTotal: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const registeredUserEmails = new Set(users.map((u) => u.email.toLowerCase()));

    const enrichedUsers = users.map((u) => {
      const userOrders = allOrders.filter(
        (o) => o.userId === u.id || o.customerEmail.toLowerCase() === u.email.toLowerCase()
      );
      return {
        ...u,
        orders: userOrders,
      };
    });

    // 2. Üyeliksiz Siparişler (E-postası kayıtlı üyeler arasında olmayanlar)
    const guestOrders = allOrders.filter(
      (o) => !o.userId && !registeredUserEmails.has(o.customerEmail.toLowerCase())
    );

    return NextResponse.json({
      success: true,
      data: {
        registeredUsers: enrichedUsers,
        guestOrders,
      },
    });
  } catch (error) {
    console.error('Customer API error:', error);
    return NextResponse.json({ success: false, message: 'Müşteri listeleme hatası' }, { status: 500 });
  }
}