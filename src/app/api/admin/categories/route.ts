import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        children: {
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
    console.error('Categories get error:', error);
    return NextResponse.json({ success: false, message: 'Kategoriler yüklenemedi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        slug,
        description: body.description || null,
        imageUrl: body.imageUrl || null,
        parentId: body.parentId || null,
        showInMenu: body.showInMenu !== undefined ? Boolean(body.showInMenu) : true,
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        seoTitle: body.seoTitle || null,
        seoDesc: body.seoDesc || null,
      },
      include: {
        parent: true,
        children: true,
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
    if (!body.id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    // Kendisini üst kategori olarak seçmesini engelle
    if (body.parentId === body.id) {
      return NextResponse.json({ success: false, message: 'Bir kategori kendisinin üst kategorisi olamaz.' }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: body.id },
      data: {
        name: body.name.trim(),
        slug: body.slug,
        description: body.description !== undefined ? body.description : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : undefined,
        parentId: body.parentId || null,
        showInMenu: body.showInMenu !== undefined ? Boolean(body.showInMenu) : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        seoTitle: body.seoTitle,
        seoDesc: body.seoDesc,
      },
      include: {
        parent: true,
        children: true,
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

    const targetCategory = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!targetCategory) {
      return NextResponse.json({ success: false, message: 'Kategori bulunamadı' }, { status: 404 });
    }

    // Bu kategoriye ait ürünleri aktaracak güvenli bir kategori bul
    let targetFallbackId: string | null = targetCategory.parentId;

    if (!targetFallbackId) {
      const otherCat = await prisma.category.findFirst({
        where: { id: { not: id } },
      });
      if (otherCat) {
        targetFallbackId = otherCat.id;
      }
    }

    // Eğer silinen kategoride ürünler varsa, ürünlerin kaybolmaması için onları üst/alternatif kategoriye taşı
    if (targetFallbackId) {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: targetFallbackId },
      });
    }

    // Alt kategorilerin ebeveynini üst kategoriye veya ana kategoriye bağla
    if (targetCategory.children && targetCategory.children.length > 0) {
      await prisma.category.updateMany({
        where: { parentId: id },
        data: { parentId: targetCategory.parentId || null },
      });
    }

    // Kategoriyi sil
    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Kategori başarıyla silindi ve içerisindeki ürünler güvenle aktarıldı.',
    });
  } catch (error) {
    console.error('Category delete error:', error);
    return NextResponse.json({ success: false, message: 'Kategori silinirken bir hata oluştu.' }, { status: 500 });
  }
}