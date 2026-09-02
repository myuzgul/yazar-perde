import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const categoryId = searchParams.get('categoryId');
  const search = searchParams.get('search');

  if (id) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        tag: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return NextResponse.json({ success: true, data: product });
  }

  const whereClause: Record<string, unknown> = {};
  if (categoryId) whereClause.categoryId = categoryId;
  if (search) {
    whereClause.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      brand: true,
      tag: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return NextResponse.json({ success: true, data: products });
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const slug = body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await prisma.product.create({
      data: {
        name: body.name,
        sku: body.sku,
        slug,
        curtainType: body.curtainType,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        tagId: body.tagId || null,
        basePrice: Number(body.basePrice),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        vatRate: Number(body.vatRate) || 10,
        stockTracking: Boolean(body.stockTracking),
        stockQuantity: Number(body.stockQuantity) || 0,
        isActive: body.isActive ?? true,
        isFeatured: body.isFeatured ?? true,
        sortOrder: Number(body.sortOrder) || 0,
        minWidth: Number(body.minWidth) || 30,
        maxWidth: Number(body.maxWidth) || 500,
        minHeight: Number(body.minHeight) || 50,
        maxHeight: Number(body.maxHeight) || 350,
        shortDesc: body.shortDesc || null,
        descriptionHtml: body.descriptionHtml || null,
        mountingVideoUrl: body.mountingVideoUrl || null,
        mountingGuideHtml: body.mountingGuideHtml || null,
        seoTitle: body.seoTitle || null,
        seoDesc: body.seoDesc || null,
        seoKeywords: body.seoKeywords || null,
        images: {
          create: (body.images || []).map((img: { imageUrl: string; sortOrder?: number; isCover?: boolean }, idx: number) => ({
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder ?? idx,
            isCover: idx === 0 || !!img.isCover,
          })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product create error:', error);
    return NextResponse.json({ success: false, message: 'Ürün eklenemedi' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();

    // Mevcut görselleri güncellemek için önce eskileri temizleyip yenileri ekliyoruz
    await prisma.productImage.deleteMany({ where: { productId: body.id } });

    const product = await prisma.product.update({
      where: { id: body.id },
      data: {
        name: body.name,
        sku: body.sku,
        slug: body.slug,
        curtainType: body.curtainType,
        categoryId: body.categoryId,
        brandId: body.brandId || null,
        tagId: body.tagId || null,
        basePrice: Number(body.basePrice),
        discountPrice: body.discountPrice ? Number(body.discountPrice) : null,
        vatRate: Number(body.vatRate) || 10,
        stockTracking: Boolean(body.stockTracking),
        stockQuantity: Number(body.stockQuantity) || 0,
        isActive: body.isActive,
        isFeatured: body.isFeatured ?? true,
        sortOrder: Number(body.sortOrder) || 0,
        minWidth: Number(body.minWidth) || 30,
        maxWidth: Number(body.maxWidth) || 500,
        minHeight: Number(body.minHeight) || 50,
        maxHeight: Number(body.maxHeight) || 350,
        shortDesc: body.shortDesc || null,
        descriptionHtml: body.descriptionHtml || null,
        mountingVideoUrl: body.mountingVideoUrl || null,
        mountingGuideHtml: body.mountingGuideHtml || null,
        seoTitle: body.seoTitle || null,
        seoDesc: body.seoDesc || null,
        seoKeywords: body.seoKeywords || null,
        images: {
          create: (body.images || []).map((img: { imageUrl: string; sortOrder?: number; isCover?: boolean }, idx: number) => ({
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder ?? idx,
            isCover: idx === 0 || !!img.isCover,
          })),
        },
      },
      include: { images: true },
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Product update error:', error);
    return NextResponse.json({ success: false, message: 'Ürün güncellenemedi' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID gerekli' }, { status: 400 });

    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Ürün silindi' });
  } catch (error) {
    console.error('Product delete error:', error);
    return NextResponse.json({ success: false, message: 'Ürün silinemedi' }, { status: 500 });
  }
}
