import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { getSystemSettings } from '@/lib/settings';
import { sendOrderToMNGKargo } from '@/lib/mng-kargo';
import { triggerOrderNotification } from '@/lib/notification-service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

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

    const shippingAddress = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
    const settings = await getSystemSettings();

    const customerData = {
      name: shippingAddress?.name || order.customerName,
      surname: shippingAddress?.surname || order.customerSurname,
      phone: shippingAddress?.phone || order.customerPhone,
      email: order.customerEmail,
      address: shippingAddress?.fullAddress || '',
      city: shippingAddress?.city || '',
      district: shippingAddress?.district || '',
    };

    const mngResult = await sendOrderToMNGKargo(
      {
        orderNumber: order.orderNumber,
        customer: customerData,
        paymentMethod: order.paymentMethod,
        grandTotal: order.grandTotal,
        itemCount: order.items?.length || 1,
        description: `Yazar Perde - Sipariş #${order.orderNumber}`,
      },
      settings
    );

    if (!mngResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: mngResult.errorMessage || 'MNG Kargo servisine gönderilirken hata oluştu',
        },
        { status: 400 }
      );
    }

    // Sipariş Durumunu SHIPPED (Kargoya Verildi) olarak güncelle
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'SHIPPED',
        shippingCompany: settings.shipping_company_name || 'DHL Kargo (MNG Kargo)',
        trackingNumber: mngResult.trackingNumber,
        trackingUrl: mngResult.trackingUrl,
        shippingStatus: 'DISPATCHED',
        dispatchedAt: new Date(),
        mngBarcode: mngResult.barcode,
        timeline: {
          create: {
            status: 'SHIPPED',
            title: 'MNG Kargo Sistemine Bildirildi (Kargoya Verildi)',
            description: `Takip No: ${mngResult.trackingNumber} • Barkod: ${mngResult.barcode}. Kargo firmasına gönderi kaydı açıldı.`,
          },
        },
      },
      include: {
        items: true,
        addresses: true,
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    // Müşteriye Kargo Takip Bildirimi (SMS / E-Posta) Tetikle
    triggerOrderNotification({
      eventCode: 'SHIPPED',
      customerName: `${updatedOrder.customerName} ${updatedOrder.customerSurname}`,
      customerPhone: updatedOrder.customerPhone,
      customerEmail: updatedOrder.customerEmail,
      orderNumber: updatedOrder.orderNumber,
      grandTotal: updatedOrder.grandTotal,
      trackingNumber: mngResult.trackingNumber,
      cargoCompany: settings.shipping_company_name || 'DHL Kargo (MNG Kargo)',
    }).catch((err) => console.error('Kargo bildirim hatası:', err));

    return NextResponse.json({
      success: true,
      message: mngResult.statusMessage || 'MNG Kargo gönderisi başarıyla oluşturuldu!',
      data: updatedOrder,
      tracking: {
        trackingNumber: mngResult.trackingNumber,
        trackingUrl: mngResult.trackingUrl,
        barcode: mngResult.barcode,
        shippingCompany: updatedOrder.shippingCompany,
      },
    });
  } catch (error: any) {
    console.error('MNG Kargo Route Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'MNG Kargo işlemi sırasında sunucu hatası' },
      { status: 500 }
    );
  }
}
