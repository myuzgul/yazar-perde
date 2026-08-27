import { NextRequest, NextResponse } from 'next/server';
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
