import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    const where: any = {};
    if (search) {
      where.OR = [
        { code: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (status === 'ACTIVE') {
      where.isActive = true;
    } else if (status === 'PASSIVE') {
      where.isActive = false;
    }

    const coupons = await prisma.coupon.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        usages: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    // İstatistiksel özet
    const allCoupons = await prisma.coupon.findMany({
      include: { usages: true },
    });

    const totalCoupons = allCoupons.length;
    const activeCoupons = allCoupons.filter((c) => c.isActive).length;
    let totalUsagesCount = 0;
    let totalDiscountGiven = 0;

    allCoupons.forEach((c) => {
      totalUsagesCount += c.usageCount;
      c.usages.forEach((u) => {
        totalDiscountGiven += u.discount || 0;
      });
    });

    return NextResponse.json({
      success: true,
      data: coupons,
      summary: {
        totalCoupons,
        activeCoupons,
        totalUsagesCount,
        totalDiscountGiven: Number(totalDiscountGiven.toFixed(2)),
      },
    });
  } catch (error: any) {
    console.error('Get coupons error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    let {
      code,
      title,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      startDate,
      endDate,
      isActive,
      firstOrderOnly,
    } = body;

    if (!code || !discountValue || discountValue <= 0) {
      return NextResponse.json(
        { success: false, error: 'Kupon kodu ve geçerli bir indirim tutarı gereklidir.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');

    // Kod benzersizliği kontrolü
    const existing = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `'${cleanCode}' koduna sahip bir kupon zaten mevcut.` },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        title: title?.trim() || null,
        description: description?.trim() || null,
        discountType: discountType || 'PERCENTAGE',
        discountValue: Number(discountValue),
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        perUserLimit: perUserLimit ? parseInt(perUserLimit, 10) : 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        firstOrderOnly: Boolean(firstOrderOnly),
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Kupon ID gereklidir' }, { status: 400 });
    }

    const updateData: any = {};
    if (data.code !== undefined) updateData.code = data.code.trim().toUpperCase().replace(/\s+/g, '');
    if (data.title !== undefined) updateData.title = data.title ? data.title.trim() : null;
    if (data.description !== undefined) updateData.description = data.description ? data.description.trim() : null;
    if (data.discountType !== undefined) updateData.discountType = data.discountType;
    if (data.discountValue !== undefined) updateData.discountValue = Number(data.discountValue);
    if (data.minOrderAmount !== undefined) updateData.minOrderAmount = data.minOrderAmount ? Number(data.minOrderAmount) : null;
    if (data.maxDiscountAmount !== undefined) updateData.maxDiscountAmount = data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null;
    if (data.usageLimit !== undefined) updateData.usageLimit = data.usageLimit ? parseInt(data.usageLimit, 10) : null;
    if (data.perUserLimit !== undefined) updateData.perUserLimit = data.perUserLimit ? parseInt(data.perUserLimit, 10) : null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);
    if (data.firstOrderOnly !== undefined) updateData.firstOrderOnly = Boolean(data.firstOrderOnly);

    const updated = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error('Update coupon error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Kupon ID gereklidir' }, { status: 400 });
    }

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Kupon başarıyla silindi' });
  } catch (error: any) {
    console.error('Delete coupon error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
