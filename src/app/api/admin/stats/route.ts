import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const now = new Date();

    // 1. Zaman Aralıkları Hesaplamaları
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
    const endOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);

    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);

    // 2. Tüm Siparişleri ve Kalemlerini Çek
    const allOrders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === 'PENDING').length;
    const inProductionOrders = allOrders.filter((o) => o.status === 'IN_PRODUCTION').length;
    const shippedOrders = allOrders.filter((o) => o.status === 'SHIPPED').length;
    const deliveredOrders = allOrders.filter((o) => o.status === 'DELIVERED').length;
    const cancelledOrders = allOrders.filter((o) => o.status === 'CANCELLED').length;
    const printedOrdersCount = allOrders.filter((o) => o.isPrinted).length;

    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER', isDeleted: false } });
    const totalProducts = await prisma.product.count({ where: { isActive: true } });

    // Dönem bazlı yardımcı hesaplama fonksiyonu
    const calculatePeriodStats = (filterFn: (date: Date) => boolean) => {
      const filtered = allOrders.filter(
        (o) => o.status !== 'CANCELLED' && filterFn(new Date(o.createdAt))
      );
      const ordersCount = filtered.length;
      const revenue = filtered.reduce((sum, o) => sum + o.grandTotal, 0);
      let meters = 0;
      let itemCount = 0;

      filtered.forEach((o) => {
        o.items.forEach((i) => {
          meters += (i.calculatedArea || 0) * (i.quantity || 1);
          itemCount += i.quantity || 1;
        });
      });

      return {
        ordersCount,
        revenue: Number(revenue.toFixed(2)),
        meters: Number(meters.toFixed(2)),
        itemCount,
      };
    };

    // Dönem Metrikleri
    const todayStats = calculatePeriodStats((d) => d >= startOfToday && d <= endOfToday);
    const yesterdayStats = calculatePeriodStats((d) => d >= startOfYesterday && d <= endOfYesterday);
    const weekStats = calculatePeriodStats((d) => d >= startOfWeek);
    const monthStats = calculatePeriodStats((d) => d >= startOfMonth);
    const yearStats = calculatePeriodStats((d) => d >= startOfYear);
    const allTimeStats = calculatePeriodStats(() => true);

    // 3. Kategori Bazlı Satış Analizi
    const categoryMap: Record<
      string,
      {
        id: string;
        name: string;
        slug: string;
        itemCount: number;
        quantityTotal: number;
        revenue: number;
        totalArea: number;
      }
    > = {};

    // Önce mevcut tüm aktif kategorileri hazırla (0 satış olanlar da görünsün diye)
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    allCategories.forEach((cat) => {
      categoryMap[cat.id] = {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        itemCount: 0,
        quantityTotal: 0,
        revenue: 0,
        totalArea: 0,
      };
    });

    // Sipariş kalemlerini kategorilere göre dağıt
    const validOrders = allOrders.filter((o) => o.status !== 'CANCELLED');
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const catId = item.product?.category?.id;
        const catName = item.product?.category?.name || item.curtainType || 'Diğer';
        const targetId = catId || 'other';

        if (!categoryMap[targetId]) {
          categoryMap[targetId] = {
            id: targetId,
            name: catName,
            slug: item.product?.category?.slug || 'diger',
            itemCount: 0,
            quantityTotal: 0,
            revenue: 0,
            totalArea: 0,
          };
        }

        categoryMap[targetId].itemCount += 1;
        categoryMap[targetId].quantityTotal += item.quantity || 1;
        categoryMap[targetId].revenue += item.totalPrice || 0;
        categoryMap[targetId].totalArea += (item.calculatedArea || 0) * (item.quantity || 1);
      });
    });

    const totalValidRevenue = allTimeStats.revenue > 0 ? allTimeStats.revenue : 1;
    const categorySales = Object.values(categoryMap)
      .map((cat) => ({
        ...cat,
        revenue: Number(cat.revenue.toFixed(2)),
        totalArea: Number(cat.totalArea.toFixed(2)),
        percent: Number(((cat.revenue / totalValidRevenue) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 4. En Çok Satan Ürünler
    const productSalesMap: Record<
      string,
      {
        productName: string;
        curtainType: string;
        categoryName: string;
        quantity: number;
        revenue: number;
        totalArea: number;
      }
    > = {};

    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        const key = item.productId || item.productName;
        if (!productSalesMap[key]) {
          productSalesMap[key] = {
            productName: item.productName,
            curtainType: item.curtainType,
            categoryName: item.product?.category?.name || item.curtainType,
            quantity: 0,
            revenue: 0,
            totalArea: 0,
          };
        }
        productSalesMap[key].quantity += item.quantity || 1;
        productSalesMap[key].revenue += item.totalPrice || 0;
        productSalesMap[key].totalArea += (item.calculatedArea || 0) * (item.quantity || 1);
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .map((p) => ({
        ...p,
        revenue: Number(p.revenue.toFixed(2)),
        totalArea: Number(p.totalArea.toFixed(2)),
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5. Son 7 Günlük Günlük Trend Grafiği Verisi
    const dailyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayOrders = allOrders.filter(
        (o) => o.status !== 'CANCELLED' && new Date(o.createdAt) >= startOfDay && new Date(o.createdAt) <= endOfDay
      );

      const dayRevenue = dayOrders.reduce((sum, o) => sum + o.grandTotal, 0);
      let dayMeters = 0;
      dayOrders.forEach((o) => o.items.forEach((item) => (dayMeters += (item.calculatedArea || 0) * (item.quantity || 1))));

      const dayName = d.toLocaleDateString('tr-TR', { weekday: 'short' });
      const dayDateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });

      dailyTrend.push({
        dayName,
        dayDateStr,
        ordersCount: dayOrders.length,
        revenue: Number(dayRevenue.toFixed(2)),
        meters: Number(dayMeters.toFixed(2)),
      });
    }

    // 6. Son 6 Sipariş
    const recentOrders = allOrders.slice(0, 6).map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerSurname: o.customerSurname,
      grandTotal: o.grandTotal,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      isPrinted: o.isPrinted,
      createdAt: o.createdAt.toISOString(),
      items: o.items.map((i) => ({
        productName: i.productName,
        calculatedArea: i.calculatedArea,
        quantity: i.quantity,
        curtainType: i.curtainType,
      })),
    }));

    return NextResponse.json({
      success: true,
      data: {
        periods: {
          today: todayStats,
          yesterday: yesterdayStats,
          thisWeek: weekStats,
          thisMonth: monthStats,
          thisYear: yearStats,
          allTime: allTimeStats,
        },
        summary: {
          totalRevenue: allTimeStats.revenue,
          totalOrders,
          pendingOrders,
          inProductionOrders,
          shippedOrders,
          deliveredOrders,
          cancelledOrders,
          printedOrdersCount,
          totalCustomers,
          totalProducts,
          totalMeters: allTimeStats.meters,
        },
        categorySales,
        topSellingProducts,
        dailyTrend,
        recentOrders,
      },
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
