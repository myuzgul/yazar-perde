import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('categoryId');
  const search = searchParams.get('search');

  const whereClause: Record<string, unknown> = {};
  if (categoryId && categoryId !== 'ALL') whereClause.categoryId = categoryId;
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: true,
      brand: true,
      tag: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return NextResponse.json({
    success: true,
    data: {
      products,
      categories,
    },
  });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const items: Array<{ id: string; isFeatured: boolean; sortOrder: number }> = body.items || [];

    // Toplu Güncelleme
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: {
            isFeatured: Boolean(item.isFeatured),
            sortOrder: Number(item.sortOrder) || 0,
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Ana sayfa vitrin ve ürün sıralaması başarıyla güncellendi!',
    });
  } catch (error) {
    console.error('Showcase update error:', error);
    return NextResponse.json({ success: false, message: 'Vitrin güncellenemedi' }, { status: 500 });
  }
}
