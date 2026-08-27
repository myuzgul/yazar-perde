const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

// 1. API: src/app/api/admin/settings/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'settings'));
const settingsApiRoute = `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  const settings = await prisma.systemSetting.findMany({
    orderBy: { group: 'asc' },
  });
  return NextResponse.json({ success: true, data: settings });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json(); // Array of { key: string, value: string }
    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, message: 'Geçersiz veri formatı' }, { status: 400 });
    }

    for (const item of body) {
      if (item.key && item.value !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key: item.key },
          update: { value: String(item.value) },
          create: {
            key: item.key,
            value: String(item.value),
            label: item.label || item.key,
            group: item.group || 'GENERAL',
            description: item.description || '',
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Ayarlar başarıyla güncellendi' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, message: 'Güncelleme hatası' }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'settings', 'route.ts'), settingsApiRoute);

// 2. API: src/app/api/admin/stats/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats'));
const statsApiRoute = `import { NextResponse } from 'next/server';
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
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'stats', 'route.ts'), statsApiRoute);

// 3. API: src/app/api/admin/notifications/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'notifications'));
const notificationsApiRoute = `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  const templates = await prisma.notificationTemplate.findMany();
  return NextResponse.json({ success: true, data: templates });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json(); // { id, smsBody, emailSubject, emailHtmlBody, isActive }
    await prisma.notificationTemplate.update({
      where: { id: body.id },
      data: {
        smsBody: body.smsBody,
        emailSubject: body.emailSubject,
        emailHtmlBody: body.emailHtmlBody,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ success: true, message: 'Şablon güncellendi' });
  } catch (error) {
    console.error('Notification template update error:', error);
    return NextResponse.json({ success: false, message: 'Şablon güncelleme hatası' }, { status: 500 });
  }
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'notifications', 'route.ts'), notificationsApiRoute);

// 4. API: src/app/api/admin/customers/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'customers'));
const customersApiRoute = `import { NextResponse } from 'next/server';
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
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'admin', 'customers', 'route.ts'), customersApiRoute);

console.log('Phase 3 Admin APIs successfully generated.');
