import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive ?? true,
        seoTitle: body.seoTitle || null,
        seoDesc: body.seoDesc || null,
      },
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Category create error:', error);
    return NextResponse.json({ success: false, message: 'Kategori eklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        imageUrl: body.imageUrl,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
      },
    });
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error('Category update error:', error);
    return NextResponse.json({ success: false, message: 'Kategori güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Kategori silindi' });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json({ success: false, message: 'Kategori silinemedi' }, { status: 500 });
  }
}
