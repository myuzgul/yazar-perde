import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    // Kayıtlı müşteriler
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      include: {
        orders: { select: { id: true, grandTotal: true, createdAt: true } },
        addresses: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Üyeliksiz sipariş vermiş benzersiz e-posta/telefonlar
    const guestOrders = await prisma.order.findMany({
      where: { userId: null },
      select: {
        customerName: true,
        customerSurname: true,
        customerEmail: true,
        customerPhone: true,
        grandTotal: true,
        createdAt: true,
        id: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: {
        registeredUsers: users,
        guestOrders,
      },
    });
  } catch (error) {
    console.error('Customer API error:', error);
    return NextResponse.json({ success: false, message: 'Müşteri listeleme hatası' }, { status: 500 });
  }
}
