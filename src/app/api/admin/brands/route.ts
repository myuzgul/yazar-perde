import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ success: true, data: brands });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const brand = await prisma.brand.create({
      data: {
        name: body.name,
        slug,
        logoUrl: body.logoUrl || null,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive ?? true,
      },
    });
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Brand create error:', error);
    return NextResponse.json({ success: false, message: 'Marka eklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const brand = await prisma.brand.update({
      where: { id: body.id },
      data: {
        name: body.name,
        slug: body.slug,
        logoUrl: body.logoUrl,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive,
      },
    });
    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error('Brand update error:', error);
    return NextResponse.json({ success: false, message: 'Marka güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Marka silindi' });
  } catch (error) {
    console.error('Brand delete error:', error);
    return NextResponse.json({ success: false, message: 'Marka silinemedi' }, { status: 500 });
  }
}
