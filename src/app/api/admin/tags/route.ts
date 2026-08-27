import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const tags = await prisma.productTag.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ success: true, data: tags });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const tag = await prisma.productTag.create({
      data: {
        name: body.name,
        slug,
        badgeColor: body.badgeColor || '#1B84F8',
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('Tag create error:', error);
    return NextResponse.json({ success: false, message: 'Etiket eklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const tag = await prisma.productTag.update({
      where: { id: body.id },
      data: {
        name: body.name,
        slug: body.slug,
        badgeColor: body.badgeColor,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error('Tag update error:', error);
    return NextResponse.json({ success: false, message: 'Etiket güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    await prisma.productTag.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Etiket silindi' });
  } catch (error) {
    console.error('Tag delete error:', error);
    return NextResponse.json({ success: false, message: 'Etiket silinemedi' }, { status: 500 });
  }
}
