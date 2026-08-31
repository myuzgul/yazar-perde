import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { generatePayTRToken } from '@/lib/paytr';
import { triggerOrderNotification } from '@/lib/notification-service';
import { getCustomerSession, hashPassword, createSessionToken, CUSTOMER_COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

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
      createAccount,
      accountPassword,
    } = body;

    if (!email || !phone || !firstName || !lastName || !city || !district || !addressLine || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Eksik sipariş bilgisi' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Kullanıcı Oturumu & Üyelik İlişkilendirmesi
    const customerSession = await getCustomerSession();
    let finalUserId: string | null = customerSession?.userId || null;

    if (!finalUserId) {
      const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existingUser) {
        finalUserId = existingUser.id;
      } else if (createAccount && accountPassword) {
        try {
          const passwordHash = await hashPassword(accountPassword);
          const newUser = await prisma.user.create({
            data: {
              name: firstName.trim(),
              surname: lastName.trim(),
              email: cleanEmail,
              phone: phone ? phone.trim() : null,
              passwordHash,
              role: 'CUSTOMER',
            },
          });
          finalUserId = newUser.id;

          const token = await createSessionToken({
            userId: newUser.id,
            email: newUser.email,
            name: newUser.name,
            surname: newUser.surname,
            role: newUser.role,
          });

          const cookieStore = await cookies();
          cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30,
          });
        } catch (e) {
          console.error('Auto register on checkout error:', e);
        }
      }
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

    // Kupon İndirimi Hesaplama
    let discountTotal = 0;
    let appliedCoupon: any = null;

    if (body.couponCode && typeof body.couponCode === 'string') {
      const cleanCoupon = body.couponCode.trim().toUpperCase().replace(/\s+/g, '');
      const coupon = await prisma.coupon.findUnique({ where: { code: cleanCoupon } });
      const now = new Date();

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.startDate || now >= new Date(coupon.startDate)) &&
        (!coupon.endDate || now <= new Date(coupon.endDate)) &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
        (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount)
      ) {
        if (coupon.discountType === 'PERCENTAGE') {
          let calc = (subtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && calc > coupon.maxDiscountAmount) {
            calc = coupon.maxDiscountAmount;
          }
          discountTotal = Number(calc.toFixed(2));
        } else if (coupon.discountType === 'FIXED_AMOUNT') {
          discountTotal = Number(Math.min(coupon.discountValue, subtotal).toFixed(2));
        } else if (coupon.discountType === 'FREE_SHIPPING') {
          discountTotal = shippingFee;
        }
        appliedCoupon = coupon;
      }
    }

    const grandTotal = Math.max(0, Number((subtotal + shippingFee + paymentFee - discountTotal).toFixed(2)));

    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `YP-${dateStr}-${randomSuffix}`;

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: finalUserId,
        customerName: firstName,
        customerSurname: lastName,
        customerEmail: cleanEmail,
        customerPhone: phone,
        customerNote: orderNote || null,
        subtotal,
        shippingFee,
        paymentFee,
        discountTotal,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
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

    // Kupon Kullanım Kaydı ve Sayacı Artırma
    if (appliedCoupon) {
      prisma.coupon.update({
        where: { id: appliedCoupon.id },
        data: { usageCount: { increment: 1 } },
      }).catch(console.error);

      prisma.couponUsage.create({
        data: {
          couponId: appliedCoupon.id,
          orderId: order.id,
          userEmail: cleanEmail,
          discount: discountTotal,
        },
      }).catch(console.error);
    }

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