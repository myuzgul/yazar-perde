import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Sadece üst seviye (parentId: null) ve menüde gösterilmesi istenen aktif kategoriler
    const categories = await prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
        showInMenu: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        children: {
          where: {
            isActive: true,
          },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          include: {
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Shop categories get error:', error);
    return NextResponse.json({ success: false, message: 'Kategoriler getirilemedi' }, { status: 500 });
  }
}