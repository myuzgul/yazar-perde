import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Müşterilerin onaylanmış yorumları görmesi
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');

  if (!productId) {
    return NextResponse.json({ success: false, message: 'Ürün ID gerekli' }, { status: 400 });
  }

  try {
    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        isApproved: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
        : 5.0;

    return NextResponse.json({
      success: true,
      data: {
        reviews,
        totalCount: reviews.length,
        averageRating,
      },
    });
  } catch (error) {
    console.error('Reviews get error:', error);
    return NextResponse.json({ success: false, message: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}

// Müşterinin yeni yorum ve fotoğraf göndermesi (Onaysız olarak kaydolur)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, customerName, rating, comment, imageUrl } = body;

    if (!productId || !customerName || !comment) {
      return NextResponse.json(
        { success: false, message: 'Lütfen adınızı ve yorumunuzu eksiksiz doldurunuz.' },
        { status: 400 }
      );
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        customerName: customerName.trim(),
        rating: Number(rating) || 5,
        comment: comment.trim(),
        imageUrl: imageUrl || null,
        isApproved: false, // Yönetici onayı bekler
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Yorumunuz ve fotoğrafınız başarıyla alındı! Yönetici onayından sonra yayınlanacaktır.',
      data: review,
    });
  } catch (error) {
    console.error('Review create error:', error);
    return NextResponse.json(
      { success: false, message: 'Yorum kaydedilirken bir hata oluştu.' },
      { status: 500 }
    );
  }
}