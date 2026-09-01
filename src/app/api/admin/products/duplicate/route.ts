import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ success: false, message: 'Ürün ID gereklidir' }, { status: 400 });
    }

    const source = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!source) {
      return NextResponse.json({ success: false, message: 'Kopyalanacak ürün bulunamadı' }, { status: 404 });
    }

    // Benzersiz SKU Üretimi
    let newSku = `${source.sku}-KOPYA`;
    let skuCount = 2;
    while (await prisma.product.findUnique({ where: { sku: newSku } })) {
      newSku = `${source.sku}-KOPYA-${skuCount}`;
      skuCount++;
    }

    // Benzersiz Slug ve İsim Üretimi
    const newName = `${source.name} (Kopya)`;
    const baseSlug = `${source.slug}-kopya`;
    let newSlug = baseSlug;
    let slugCount = 2;
    while (await prisma.product.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${baseSlug}-${slugCount}`;
      slugCount++;
    }

    // Yeni Ürünü Oluştur
    const duplicatedProduct = await prisma.product.create({
      data: {
        name: newName,
        sku: newSku,
        slug: newSlug,
        curtainType: source.curtainType,
        categoryId: source.categoryId,
        brandId: source.brandId,
        tagId: source.tagId,
        basePrice: source.basePrice,
        discountPrice: source.discountPrice,
        vatRate: source.vatRate,
        stockTracking: source.stockTracking,
        stockQuantity: source.stockQuantity,
        isActive: source.isActive,
        sortOrder: (source.sortOrder || 0) + 1,
        minWidth: source.minWidth,
        maxWidth: source.maxWidth,
        minHeight: source.minHeight,
        maxHeight: source.maxHeight,
        shortDesc: source.shortDesc,
        descriptionHtml: source.descriptionHtml,
        mountingVideoUrl: source.mountingVideoUrl,
        mountingGuideHtml: source.mountingGuideHtml,
        seoTitle: source.seoTitle ? `${source.seoTitle} (Kopya)` : null,
        seoDesc: source.seoDesc,
        seoKeywords: source.seoKeywords,
        images: {
          create: source.images.map((img) => ({
            imageUrl: img.imageUrl,
            sortOrder: img.sortOrder,
            isCover: img.isCover,
          })),
        },
      },
      include: {
        category: true,
        brand: true,
        tag: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({
      success: true,
      message: `"${source.name}" ürünü başarıyla kopyalandı!`,
      data: duplicatedProduct,
    });
  } catch (error) {
    console.error('Product duplicate error:', error);
    return NextResponse.json({ success: false, message: 'Ürün kopyalanırken bir hata oluştu' }, { status: 500 });
  }
}
