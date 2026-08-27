import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPayTRCallbackHash } from '@/lib/paytr';
import { getSystemSettings } from '@/lib/settings';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const merchantOid = formData.get('merchant_oid') as string;
    const status = formData.get('status') as string;
    const totalAmount = formData.get('total_amount') as string;
    const hash = formData.get('hash') as string;
    const failedReasonCode = formData.get('failed_reason_code') as string;
    const failedReasonMsg = formData.get('failed_reason_msg') as string;

    const settings = await getSystemSettings();
    const merchantKey = settings.paytr_merchant_key || 'test_merchant_key';
    const merchantSalt = settings.paytr_merchant_salt || 'test_merchant_salt';

    const isValid = verifyPayTRCallbackHash(
      merchantOid,
      status,
      totalAmount,
      hash,
      merchantKey,
      merchantSalt
    );

    if (!isValid) {
      console.error(`PayTR Callback HASH ERROR for order ${merchantOid}`);
      return new NextResponse('PAYTR BAD HASH', { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: merchantOid },
    });

    if (!order) {
      console.error(`PayTR Order Not Found: ${merchantOid}`);
      return new NextResponse('OK');
    }

    if (status === 'success') {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          timeline: {
            create: {
              status: 'CONFIRMED',
              title: 'Ödeme Başarılı',
              description: 'PayTR 3D Secure ile ödeme başarıyla tahsil edildi.',
            },
          },
        },
      });
      console.log(`Order ${merchantOid} marked as PAID via PayTR`);
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          timeline: {
            create: {
              status: 'PENDING_PAYMENT',
              title: 'Ödeme Başarısız',
              description: `PayTR Hata: ${failedReasonMsg} (Kod: ${failedReasonCode})`,
            },
          },
        },
      });
      console.log(`Order ${merchantOid} payment FAILED: ${failedReasonMsg}`);
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('PayTR Callback Exception:', error);
    return new NextResponse('SERVER ERROR', { status: 500 });
  }
}