import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Kupon kodu giriniz' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    // Örnek aktif kuponlar
    if (cleanCode === 'YENIEV10') {
      const discount = Math.min(subtotal * 0.1, 500);
      return NextResponse.json({
        success: true,
        data: {
          code: 'YENIEV10',
          discountType: 'PERCENT',
          value: 10,
          discountAmount: Number(discount.toFixed(2)),
          description: '%10 Yeni Ev İndirimi',
        },
      });
    }

    if (cleanCode === 'PERDE100' && subtotal >= 1000) {
      return NextResponse.json({
        success: true,
        data: {
          code: 'PERDE100',
          discountType: 'FIXED',
          value: 100,
          discountAmount: 100,
          description: '1000 TL ve Üzeri 100 TL İndirim',
        },
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Geçersiz veya süresi dolmuş kupon kodu',
    }, { status: 400 });
  } catch {
    return NextResponse.json({ success: false, error: 'Kupon doğrulanamadı' }, { status: 500 });
  }
}