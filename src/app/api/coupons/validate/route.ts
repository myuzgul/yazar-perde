import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal, shippingFee = 0, userEmail } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Lütfen bir kupon kodu giriniz.' },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, '');
    const now = new Date();

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { success: false, error: 'Girdiğiniz kupon kodu geçersiz veya kullanım dışıdır.' },
        { status: 400 }
      );
    }

    // 1. Tarih Kontrolleri
    if (coupon.startDate && now < new Date(coupon.startDate)) {
      const startStr = new Date(coupon.startDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
      return NextResponse.json(
        { success: false, error: `Bu kupon henüz aktif değildir. Başlangıç tarihi: ${startStr}` },
        { status: 400 }
      );
    }

    if (coupon.endDate && now > new Date(coupon.endDate)) {
      return NextResponse.json(
        { success: false, error: 'Bu kuponun kullanım süresi (son geçerlilik tarihi) dolmuştur.' },
        { status: 400 }
      );
    }

    // 2. Toplam Kullanım Limiti Kontrolü
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Bu kuponun maksimum kullanım kotası dolmuştur.' },
        { status: 400 }
      );
    }

    // 3. Minimum Sepet Tutarı Kontrolü
    const cartSubtotal = Number(subtotal) || 0;
    if (coupon.minOrderAmount && cartSubtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Bu kuponun geçerli olması için minimum sepet tutarı ₺${coupon.minOrderAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} olmalıdır. (Mevcut: ₺${cartSubtotal.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // 4. Sadece İlk Sipariş Kuralı Kontrolü
    if (coupon.firstOrderOnly && userEmail) {
      const existingOrderCount = await prisma.order.count({
        where: {
          customerEmail: userEmail.trim().toLowerCase(),
          status: { not: 'CANCELLED' },
        },
      });

      if (existingOrderCount > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bu kupon yalnızca ilk kez sipariş veren yeni müşterilerimiz için geçerlidir.',
          },
          { status: 400 }
        );
      }
    }

    // 5. Kullanıcı Başına Kullanım Limiti Kontrolü
    if (userEmail && coupon.perUserLimit) {
      const userUsageCount = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          userEmail: userEmail.trim().toLowerCase(),
        },
      });

      if (userUsageCount >= coupon.perUserLimit) {
        return NextResponse.json(
          {
            success: false,
            error: `Bu kuponu daha önce kullandınız (Kişi başı kullanım hakkı: ${coupon.perUserLimit} adet).`,
          },
          { status: 400 }
        );
      }
    }

    // 6. İndirim Tutarının Hesaplanması
    let discountAmount = 0;
    let descriptionText = '';

    if (coupon.discountType === 'PERCENTAGE') {
      let calc = (cartSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && calc > coupon.maxDiscountAmount) {
        calc = coupon.maxDiscountAmount;
        descriptionText = `%${coupon.discountValue} İndirim (Maksimum ₺${coupon.maxDiscountAmount} ile sınırlandırıldı)`;
      } else {
        descriptionText = `%${coupon.discountValue} İndirim`;
      }
      discountAmount = Number(calc.toFixed(2));
    } else if (coupon.discountType === 'FIXED_AMOUNT') {
      discountAmount = Number(Math.min(coupon.discountValue, cartSubtotal).toFixed(2));
      descriptionText = `₺${coupon.discountValue} Sabit İndirim`;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discountAmount = Number(shippingFee || 0);
      descriptionText = 'Ücretsiz Kargo Avantajı';
    }

    return NextResponse.json({
      success: true,
      data: {
        couponId: coupon.id,
        code: coupon.code,
        title: coupon.title,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        descriptionText,
        minOrderAmount: coupon.minOrderAmount,
        maxDiscountAmount: coupon.maxDiscountAmount,
      },
      message: `Tebrikler! '${coupon.code}' kuponu başarıyla uygulandı ve ₺${discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} indirim kazandınız.`,
    });
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
