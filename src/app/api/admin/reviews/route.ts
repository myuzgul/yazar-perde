import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

// Yönetici: Tüm yorumları listeleme
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status'); // 'approved', 'pending', 'all'

  try {
    const where: Record<string, unknown> = {};
    if (status === 'approved') where.isApproved = true;
    if (status === 'pending') where.isApproved = false;

    const reviews = await prisma.productReview.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
            images: {
              take: 1,
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    const pendingCount = await prisma.productReview.count({ where: { isApproved: false } });
    const approvedCount = await prisma.productReview.count({ where: { isApproved: true } });

    return NextResponse.json({
      success: true,
      data: reviews,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        total: pendingCount + approvedCount,
      },
    });
  } catch (error) {
    console.error('Admin reviews get error:', error);
    return NextResponse.json({ success: false, message: 'Yorumlar getirilemedi' }, { status: 500 });
  }
}

// Yönetici: Yorumu Onaylama / Onay Kaldırma
export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    const { id, isApproved } = body;

    if (!id) return NextResponse.json({ success: false, message: 'Yorum ID gerekli' }, { status: 400 });

    const updated = await prisma.productReview.update({
      where: { id },
      data: { isApproved: Boolean(isApproved) },
    });

    return NextResponse.json({
      success: true,
      message: isApproved ? 'Yorum onaylandı ve yayına alındı!' : 'Yorum yayından kaldırıldı.',
      data: updated,
    });
  } catch (error) {
    console.error('Admin review update error:', error);
    return NextResponse.json({ success: false, message: 'Güncelleme başarısız' }, { status: 500 });
  }
}

// Yönetici: Yorumu Silme
export async function DELETE(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: 'Yorum ID gerekli' }, { status: 400 });

    await prisma.productReview.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Yorum başarıyla silindi.' });
  } catch (error) {
    console.error('Admin review delete error:', error);
    return NextResponse.json({ success: false, message: 'Yorum silinemedi' }, { status: 500 });
  }
}