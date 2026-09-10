import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendSMS, sendEmail, getSMSBalance, replaceTemplateVariables } from '@/lib/notification-service';

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { type, recipient, templateBody, templateSubject } = await req.json();

    if (type === 'SMS_BALANCE') {
      const balanceResult = await getSMSBalance();
      if (balanceResult.success) {
        return NextResponse.json({
          success: true,
          smsCount: balanceResult.smsCount,
          balance: balanceResult.balance,
          message: balanceResult.message,
        });
      } else {
        return NextResponse.json({
          success: false,
          error: balanceResult.error || 'Bakiye bilgisi alınamadı',
        }, { status: 400 });
      }
    }

    if (!type || !recipient) {
      return NextResponse.json({ success: false, error: 'Alıcı ve bildirim türü zorunludur' }, { status: 400 });
    }

    const dummyVariables: Record<string, string> = {
      musteri_adi: 'Ahmet Yılmaz',
      siparis_no: 'YP2609101234',
      tutar: '₺1.250,00',
      kargo_takip_no: '827046904757',
      kargo_takip_linki: 'https://www.mngkargo.com.tr/gonderitakip?takipno=827046904757',
      kargo_firmasi: 'DHL Kargo (MNG Kargo)',
      site_adi: 'Yazar Perde - Özel Ölçülü Perde Sistemleri',
    };

    if (type === 'SMS') {
      const message = replaceTemplateVariables(templateBody || 'Sayın {{musteri_adi}}, #{{siparis_no}} numaralı test SMS bildirimi. yazarperde.com', dummyVariables);
      const res = await sendSMS(recipient, message);
      if (res.success) {
        return NextResponse.json({ 
          success: true, 
          message: `Test SMS başarıyla gönderildi (${recipient}). İleti Merkezi Paket/Sipariş No: ${res.messageId || 'OK'}` 
        });
      } else {
        return NextResponse.json({ 
          success: false, 
          error: res.error || 'SMS gönderilemedi' 
        }, { status: 400 });
      }
    }

    if (type === 'EMAIL') {
      const subject = replaceTemplateVariables(templateSubject || 'Test Bildirim Başlığı', dummyVariables);
      const htmlBody = replaceTemplateVariables(templateBody || '<p>Bu bir test e-postasıdır.</p>', dummyVariables);
      const ok = await sendEmail(recipient, subject, htmlBody);
      if (ok) {
        return NextResponse.json({ success: true, message: 'Test E-posta başarıyla gönderildi' });
      } else {
        return NextResponse.json({ success: false, error: 'E-posta gönderilemedi. SMTP ayarlarını kontrol ediniz.' }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: 'Geçersiz tür' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}