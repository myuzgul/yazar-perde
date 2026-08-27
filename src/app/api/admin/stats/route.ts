import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: 'PENDING' } });
    const inProductionOrders = await prisma.order.count({ where: { status: 'IN_PRODUCTION' } });
    const shippedOrders = await prisma.order.count({ where: { status: 'SHIPPED' } });
    const completedOrders = await prisma.order.count({ where: { status: 'COMPLETED' } });

    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await prisma.product.count();

    const orders = await prisma.order.findMany({
      select: {
        grandTotal: true,
        createdAt: true,
        status: true,
        items: {
          select: {
            calculatedArea: true,
            curtainType: true,
            productName: true,
            quantity: true,
          },
        },
      },
    });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'CANCELLED' ? o.grandTotal : 0), 0);
    
    let totalMeters = 0;
    orders.forEach(o => {
      o.items.forEach(i => {
        totalMeters += (i.calculatedArea * i.quantity);
      });
    });

    // Kategori bazlı ve son siparişler simülasyonu
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        inProductionOrders,
        shippedOrders,
        completedOrders,
        totalCustomers,
        totalProducts,
        totalMeters: Number(totalMeters.toFixed(2)),
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, message: 'İstatistik hatası' }, { status: 500 });
  }
}
