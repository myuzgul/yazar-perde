import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { generatePayTRToken } from '@/lib/paytr';
import { triggerOrderNotification } from '@/lib/notification-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      phone,
      firstName,
      lastName,
      city,
      district,
      addressLine,
      invoiceType,
      identityNumber,
      companyName,
      taxOffice,
      taxNumber,
      sameInvoiceAddress,
      invoiceAddressLine,
      orderNote,
      paymentMethod,
      items,
    } = body;

    if (!email || !phone || !firstName || !lastName || !city || !district || !addressLine || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Eksik sipariş bilgisi' }, { status: 400 });
    }

    const settings = await getSystemSettings();

    let subtotal = 0;
    const orderItemsData = [];
    const paytrBasket: Array<[string, string, number]> = [];

    for (const item of items) {
      const itemTotal = Number(item.totalPrice.toFixed(2));
      subtotal += itemTotal;

      const calcArea = Number(item.calculationResult?.calculatedArea || (item.width * item.height / 10000));
      const selectedSnapshot = JSON.stringify(item.calculationResult?.selectedOptionsSnapshot || {});
      const pricingSnapshot = JSON.stringify(item.calculationResult?.breakdown || []);

      orderItemsData.push({
        productId: item.productId,
        productName: item.name,
        productSku: item.sku,
        curtainType: item.curtainType,
        width: Number(item.width),
        height: Number(item.height),
        quantity: Number(item.quantity),
        calculatedArea: calcArea,
        selectedOptionsSnapshot: selectedSnapshot,
        pricingBreakdownSnapshot: pricingSnapshot,
        unitPrice: Number(item.unitPrice),
        totalPrice: itemTotal,
        itemNote: item.note || null,
      });

      paytrBasket.push([item.name, item.unitPrice.toFixed(2), item.quantity]);
    }

    const freeShippingThreshold = settings.free_shipping_threshold || 1500;
    const shippingFee = subtotal >= freeShippingThreshold ? 0 : 75;
    const paymentFee = paymentMethod === 'CASH_ON_DELIVERY' ? 35 : 0;
    const grandTotal = Number((subtotal + shippingFee + paymentFee).toFixed(2));

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `YP-${dateStr}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: firstName,
        customerSurname: lastName,
        customerEmail: email,
        customerPhone: phone,
        customerNote: orderNote || null,
        subtotal,
        shippingFee,
        paymentFee,
        discountTotal: 0,
        grandTotal,
        status: 'PENDING',
        paymentMethod: paymentMethod === 'CREDIT_CARD' ? 'PAYTR_CC' : paymentMethod,
        paymentStatus: 'PENDING',
        items: {
          create: orderItemsData,
        },
        addresses: {
          create: [
            {
              isBilling: false,
              addressType: 'INDIVIDUAL',
              name: firstName,
              surname: lastName,
              phone,
              city,
              district,
              fullAddress: addressLine,
            },
            {
              isBilling: true,
              addressType: invoiceType || 'INDIVIDUAL',
              name: firstName,
              surname: lastName,
              phone,
              city,
              district,
              fullAddress: sameInvoiceAddress ? addressLine : (invoiceAddressLine || addressLine),
              companyName: invoiceType === 'CORPORATE' ? companyName : null,
              taxOffice: invoiceType === 'CORPORATE' ? taxOffice : null,
              taxNo: invoiceType === 'CORPORATE' ? taxNumber : (identityNumber || null),
            },
          ],
        },
        timeline: {
          create: {
            status: 'PENDING',
            title: 'Sipariş Oluşturuldu',
            description: `Siparişiniz ${orderNumber} kodu ile başarıyla sisteme alındı.`,
          },
        },
      },
    });

    // Asenkron Bildirim Tetikleme (SMS & E-posta)
    triggerOrderNotification({
      eventCode: 'ORDER_CREATED',
      customerName: `${firstName} ${lastName}`,
      customerPhone: phone,
      customerEmail: email,
      orderNumber,
      grandTotal,
    }).catch(console.error);

    if (paymentMethod === 'CREDIT_CARD') {
      const userIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
      const host = req.headers.get('host') || 'localhost:3000';
      const protocol = host.includes('localhost') ? 'http' : 'https';

      const merchantId = settings.paytr_merchant_id || 'test_merchant_id';
      const merchantKey = settings.paytr_merchant_key || 'test_merchant_key';
      const merchantSalt = settings.paytr_merchant_salt || 'test_merchant_salt';

      const paytrToken = generatePayTRToken({
        merchantId,
        merchantKey,
        merchantSalt,
        email,
        paymentAmount: Math.round(grandTotal * 100),
        merchantOid: orderNumber,
        userName: `${firstName} ${lastName}`,
        userAddress: `${addressLine} ${district}/${city}`,
        userPhone: phone,
        merchantOkUrl: `${protocol}://${host}/siparis-onay/${orderNumber}?status=success`,
        merchantFailUrl: `${protocol}://${host}/siparis-onay/${orderNumber}?status=failed`,
        userBasket: paytrBasket,
        userIp,
      });

      return NextResponse.json({
        success: true,
        data: {
          orderNumber,
          grandTotal,
          paymentMethod: 'CREDIT_CARD',
          paytrToken,
          redirectUrl: `/siparis-onay/${orderNumber}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        orderNumber,
        grandTotal,
        paymentMethod,
        redirectUrl: `/siparis-onay/${orderNumber}`,
      },
    });
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sipariş kaydedilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}