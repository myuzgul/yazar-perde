import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { createDopigoInvoice } from '@/lib/dopigo';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        addresses: true,
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    const billingAddress = order.addresses.find((a) => a.isBilling) || order.addresses[0];
    const shippingAddress = order.addresses.find((a) => !a.isBilling) || order.addresses[0];

    const isCorporate = billingAddress?.addressType === 'CORPORATE';
    const settings = await getSystemSettings();

    const customerData = {
      name: billingAddress?.name || order.customerName,
      surname: billingAddress?.surname || order.customerSurname,
      email: order.customerEmail,
      phone: billingAddress?.phone || order.customerPhone,
      isCorporate,
      companyName: isCorporate ? (billingAddress?.companyName || undefined) : undefined,
      taxOffice: isCorporate ? (billingAddress?.taxOffice || undefined) : undefined,
      taxNumber: isCorporate ? (billingAddress?.taxNo || undefined) : (billingAddress?.taxNo || '11111111111'),
      address: billingAddress?.fullAddress || '',
      city: billingAddress?.city || '',
      district: billingAddress?.district || '',
    };

    const itemsData = order.items.map((item) => {
      let snap: Record<string, any> = {};
      try {
        if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
      } catch {}

      const pleat = snap.pleatLabel ? `Pile: ${snap.pleatLabel}` : '';
      const caseType = snap.caseType ? `Kasa: ${snap.caseType === 'CLOSED' ? 'Kapalı' : 'Açık'}` : '';
      const details = [pleat, caseType, `${item.width}x${item.height} cm (${item.calculatedArea} m²)`].filter(Boolean).join(' • ');

      return {
        name: item.productName,
        sku: item.productSku,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        tax_rate: Number(settings.default_vat_rate) || 10,
        curtain_details: details,
      };
    });

    const invoiceResult = await createDopigoInvoice(
      {
        orderNumber: order.orderNumber,
        customer: customerData,
        items: itemsData,
        subtotal: order.subtotal,
        shippingFee: order.shippingFee,
        discountTotal: order.discountTotal,
        grandTotal: order.grandTotal,
        vatRate: Number(settings.default_vat_rate) || 10,
        currency: 'TRY',
      },
      settings
    );

    if (!invoiceResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: invoiceResult.errorMessage || 'Dopigo fatura kesme servisi hata döndürdü',
        },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        invoiceNumber: invoiceResult.invoiceNumber,
        invoicePdfUrl: invoiceResult.invoicePdfUrl,
        invoiceUuid: invoiceResult.invoiceUuid,
        invoiceStatus: 'INVOICED',
        invoicedAt: new Date(),
        timeline: {
          create: {
            status: order.status,
            title: 'E-Fatura Kesildi (Dopigo & Sovos)',
            description: `GİB onaylı E-Arşiv / E-Fatura oluşturuldu. Fatura No: ${invoiceResult.invoiceNumber}`,
          },
        },
      },
      include: {
        items: true,
        addresses: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'E-Fatura başarıyla oluşturuldu!',
      data: updatedOrder,
      invoice: {
        invoiceNumber: invoiceResult.invoiceNumber,
        invoicePdfUrl: invoiceResult.invoicePdfUrl,
        invoiceUuid: invoiceResult.invoiceUuid,
        invoicedAt: updatedOrder.invoicedAt,
      },
    });
  } catch (error: any) {
    console.error('Invoice Creation Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Fatura işlemi sırasında sunucu hatası' },
      { status: 500 }
    );
  }
}
