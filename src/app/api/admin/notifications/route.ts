import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  const defaultTemplates = [
    {
      code: 'ORDER_CREATED',
      title: '1. Sipariş Alındı Bildirimi',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı özel ölçü perde siparişiniz alınmıştır. Tutar: {{tutar}}. yazarperde.com',
      emailSubject: 'Siparişiniz Alındı - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Özel ölçülü perde siparişiniz başarıyla alınmıştır. Siparişinizdeki ölçü ve modeller uzman atölye ekibimiz tarafından kontrol edilerek dikim ve imalat sırasına alınacaktır.</p>',
    },
    {
      code: 'PAYMENT_RECEIVED',
      title: '2. Ödeme Onaylandı (Havale / EFT)',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı siparişinizin ödemesi onaylanmıştır. İmalat aşamasına geçilmiştir. yazarperde.com',
      emailSubject: 'Ödemeniz Onaylandı - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Siparişinize ait ödeme tutarı başarıyla teyit edilmiştir. Siparişiniz atölyede dikim aşamasına sevk edilmiştir.</p>',
    },
    {
      code: 'IN_PRODUCTION',
      title: '3. Atölyede Üretimde (Dikimde)',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı özel ölçülü perdeniz atölyemizde dikim ve imalat aşamasına alınmıştır. yazarperde.com',
      emailSubject: 'Perdeniz Atölyede Dikimde - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Özel ölçülü perdeleriniz atölyemizde uzman terzilerimiz tarafından kesim, dikim ve mekanizma montaj sürecine girmiştir.</p>',
    },
    {
      code: 'SHIPPED',
      title: '4. Kargoya Verildi (MNG Kargo)',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı siparişiniz kargoya verilmiştir. MNG Kargo Takip No: {{kargo_takip_no}}. yazarperde.com',
      emailSubject: 'Siparişiniz Kargoya Verildi! - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Özel ölçülü perdeleriniz titizlikle dikilmiş, kalite kontrolleri yapılarak korunaklı ambalajıyla <strong>{{kargo_firmasi}}</strong> firmasına teslim edilmiştir.</p>',
    },
    {
      code: 'DELIVERED',
      title: '5. Teslim Edildi',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı siparişiniz teslim edilmiştir. Perdelerinizi güzel günlerde kullanmanızı dileriz. yazarperde.com',
      emailSubject: 'Siparişiniz Teslim Edildi - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Siparişinizin teslimatı başarıyla tamamlanmıştır. Bizi tercih ettiğiniz için teşekkür eder, perdelerinizi güzel günlerde kullanmanızı dileriz.</p>',
    },
    {
      code: 'CANCELLED',
      title: '6. Sipariş İptal Edildi',
      smsBody: 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı siparişiniz iptal edilmiştir. Detaylı bilgi için: 0541 494 51 73. yazarperde.com',
      emailSubject: 'Siparişiniz İptal Edildi - #{{siparis_no}} - Yazar Perde',
      emailHtmlBody: '<p>Siparişiniz talebiniz veya işlem durumu doğrultusunda iptal edilmiştir. Detaylı bilgi almak için müşteri hizmetlerimizle iletişime geçebilirsiniz.</p>',
    },
  ];

  for (const dt of defaultTemplates) {
    const existing = await prisma.notificationTemplate.findUnique({ where: { code: dt.code } });
    if (!existing) {
      await prisma.notificationTemplate.create({ data: dt });
    }
  }

  const templates = await prisma.notificationTemplate.findMany({
    orderBy: { code: 'asc' },
  });
  return NextResponse.json({ success: true, data: templates });
}

export async function PUT(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Yetkisiz erişim' }, { status: 401 });
  }

  try {
    const body = await req.json(); // { id, smsBody, emailSubject, emailHtmlBody, isActive }
    await prisma.notificationTemplate.update({
      where: { id: body.id },
      data: {
        smsBody: body.smsBody,
        emailSubject: body.emailSubject,
        emailHtmlBody: body.emailHtmlBody,
        isActive: body.isActive,
      },
    });

    return NextResponse.json({ success: true, message: 'Şablon güncellendi' });
  } catch (error) {
    console.error('Notification template update error:', error);
    return NextResponse.json({ success: false, message: 'Şablon güncelleme hatası' }, { status: 500 });
  }
}
