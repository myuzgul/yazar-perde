import { NextRequest, NextResponse } from 'next/server';
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
