import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendSMS, sendEmail, replaceTemplateVariables } from '@/lib/notification-service';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { type, recipient, templateBody, templateSubject } = await req.json();

    if (!type || !recipient) {
      return NextResponse.json({ success: false, error: 'Alıcı ve bildirim türü zorunludur' }, { status: 400 });
    }

    const dummyVariables: Record<string, string> = {
      musteri_adi: 'Ahmet Yılmaz',
      siparis_no: 'YP-2026-TEST',
      tutar: '₺1.250,00',
      kargo_takip_no: 'TR123456789',
      kargo_takip_linki: 'https://perdesiparisi.com/siparis-takip?orderNumber=YP-2026-TEST',
      site_adi: 'PerdeSiparisi.com',
    };

    if (type === 'SMS') {
      const message = replaceTemplateVariables(templateBody || 'Test SMS bildirimi', dummyVariables);
      const ok = await sendSMS(recipient, message);
      return NextResponse.json({ success: ok, message: 'Test SMS başarıyla kuyruğa alındı' });
    }

    if (type === 'EMAIL') {
      const subject = replaceTemplateVariables(templateSubject || 'Test Bildirim Başlığı', dummyVariables);
      const htmlBody = replaceTemplateVariables(templateBody || '<p>Bu bir test e-postasıdır.</p>', dummyVariables);
      const ok = await sendEmail(recipient, subject, htmlBody);
      return NextResponse.json({ success: ok, message: 'Test E-posta başarıyla kuyruğa alındı' });
    }

    return NextResponse.json({ success: false, error: 'Geçersiz tür' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}