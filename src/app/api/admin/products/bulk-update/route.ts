import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ success: false, message: 'Yetkisiz' }, { status: 401 });

  try {
    const body = await req.json();
    // { categoryId: string, actionType: 'INCREASE' | 'DECREASE', calculationType: 'PERCENTAGE' | 'FIXED', amount: number }
    const { categoryId, actionType, calculationType, amount } = body;

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ success: false, message: 'Geçerli bir tutar veya yüzde giriniz' }, { status: 400 });
    }

    const whereClause: Record<string, unknown> = {};
    if (categoryId && categoryId !== 'ALL') {
      whereClause.categoryId = categoryId;
    }

    const products = await prisma.product.findMany({ where: whereClause });
    let updatedCount = 0;

    for (const p of products) {
      let newBasePrice = p.basePrice;
      let newDiscountPrice = p.discountPrice;

      if (calculationType === 'PERCENTAGE') {
        const factor = actionType === 'INCREASE' ? (1 + numAmount / 100) : (1 - numAmount / 100);
        newBasePrice = Number((p.basePrice * factor).toFixed(2));
        if (p.discountPrice) {
          newDiscountPrice = Number((p.discountPrice * factor).toFixed(2));
        }
      } else {
        const delta = actionType === 'INCREASE' ? numAmount : -numAmount;
        newBasePrice = Math.max(1, Number((p.basePrice + delta).toFixed(2)));
        if (p.discountPrice) {
          newDiscountPrice = Math.max(1, Number((p.discountPrice + delta).toFixed(2)));
        }
      }

      await prisma.product.update({
        where: { id: p.id },
        data: {
          basePrice: newBasePrice,
          discountPrice: newDiscountPrice,
        },
      });
      updatedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} adet ürünün fiyatı başarıyla güncellendi.`,
      updatedCount,
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    return NextResponse.json({ success: false, message: 'Toplu güncelleme başarısız' }, { status: 500 });
  }
}
