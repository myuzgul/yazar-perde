import prisma from './prisma';
import { getSystemSettings, SystemSettingsMap } from './settings';
import nodemailer from 'nodemailer';

export interface NotificationPayload {
  eventCode: 'ORDER_CREATED' | 'PAYMENT_RECEIVED' | 'IN_PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderNumber: string;
  grandTotal: number;
  trackingNumber?: string;
  trackingUrl?: string;
  cargoCompany?: string;
  extraInfo?: string;
}

export function replaceTemplateVariables(template: string, data: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.split(`{{${key}}}`).join(value || '');
    result = result.split(`{${key}}`).join(value || '');
  }
  return result;
}

let transporter: nodemailer.Transporter | null = null;
let currentConfigKey = '';

/**
 * Creates or reuses a Nodemailer SMTP transporter using system settings
 */
export function getMailTransporter(settings: SystemSettingsMap) {
  const host = String(settings.smtp_host || 'smtp.hostinger.com').trim();
  const port = Number(settings.smtp_port) || 465;
  const secure = Number(settings.smtp_secure) === 1 || port === 465;
  const user = String(settings.smtp_user || 'info@yazarperde.com').trim();
  const pass = String(settings.smtp_password || 'Tpass147852*').trim();

  const configKey = `${host}:${port}:${secure}:${user}:${pass}`;
  if (transporter && currentConfigKey === configKey) {
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port,
    secure, // SSL for 465, STARTTLS for 587
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  currentConfigKey = configKey;
  return transporter;
}

/**
 * Sends an email using Hostinger SMTP
 */
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string,
  settings?: SystemSettingsMap
): Promise<boolean> {
  try {
    if (!to || !to.includes('@')) {
      console.warn('[EMAIL WARNING] Invalid recipient email:', to);
      return false;
    }

    const sysSettings = settings || (await getSystemSettings());
    const fromName = sysSettings.smtp_from_name || 'Yazar Perde';
    const fromEmail = sysSettings.smtp_from_email || sysSettings.smtp_user || 'info@yazarperde.com';

    const mailer = getMailTransporter(sysSettings);

    const info = await mailer.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      html: htmlBody,
    });

    console.log(`[SMTP EMAIL SENT] To: ${to} | Subject: "${subject}" | MessageId: ${info.messageId}`);
    return true;
  } catch (error: any) {
    console.error('[SMTP EMAIL ERROR]', error?.message || error);
    return false;
  }
}

/**
 * Normalizes Turkish phone number to 905XXXXXXXXX format (12 digits)
 */
export function normalizeTurkishPhone(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  if (clean.startsWith('0090')) {
    clean = clean.substring(2);
  }
  if (clean.startsWith('90') && clean.length === 12) {
    return clean;
  }
  if (clean.startsWith('0') && clean.length === 11) {
    return '9' + clean;
  }
  if (clean.length === 10 && clean.startsWith('5')) {
    return '90' + clean;
  }
  return clean;
}

/**
 * Gets remaining SMS balance from Ileti Merkezi API
 */
export async function getSMSBalance(settings?: SystemSettingsMap): Promise<{
  success: boolean;
  smsCount?: number;
  balance?: number;
  message?: string;
  error?: string;
}> {
  try {
    const sysSettings = settings || (await getSystemSettings());
    const apiKey = String(sysSettings.sms_api_key || '0cf1e359e03007ff7d0a10279b9d59e5').trim();
    const apiHash = String(sysSettings.sms_api_hash || '920de97ae51132626b9b47eb7b788c968f4f0b1e5b183af9d465af1e62b66152').trim();

    if (!apiKey || !apiHash) {
      return { success: false, error: 'İleti Merkezi API Anahtarı veya Hash bilgisi eksik' };
    }

    const res = await fetch('https://api.iletimerkezi.com/v1/get-balance/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        request: {
          authentication: {
            key: apiKey,
            hash: apiHash,
          },
        },
      }),
    });

    const data = await res.json().catch(() => null);
    if (!data || !data.response) {
      return { success: false, error: 'İleti Merkezi sunucusundan geçersiz yanıt alındı' };
    }

    const statusCode = data.response?.status?.code;
    const statusMsg = data.response?.status?.message || '';

    if (statusCode === 200) {
      const sms = Number(data.response?.balance?.sms) || 0;
      const amount = Number(data.response?.balance?.amount) || 0;
      return {
        success: true,
        smsCount: sms,
        balance: amount,
        message: `Mevcut Bakiye: ${sms} SMS (${statusMsg})`,
      };
    } else {
      return {
        success: false,
        error: `İleti Merkezi Hatası [Kod ${statusCode}]: ${statusMsg}`,
      };
    }
  } catch (error: any) {
    console.error('[SMS BALANCE ERROR]', error);
    return { success: false, error: error?.message || 'Bakiye sorgulanırken bağlantı hatası' };
  }
}

/**
 * Sends SMS via Ileti Merkezi API v1 JSON
 */
export async function sendSMS(
  phone: string,
  message: string,
  settings?: SystemSettingsMap
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sysSettings = settings || (await getSystemSettings());
    const isActive = Number(sysSettings.sms_active) !== 0;

    if (!isActive) {
      console.log('[SMS INFO] SMS gönderimi ayarlardan devre dışı bırakılmış');
      return { success: false, error: 'SMS gönderimi sistem ayarlarında pasif' };
    }

    const formattedPhone = normalizeTurkishPhone(phone);
    if (!formattedPhone || formattedPhone.length < 10) {
      console.warn('[SMS WARNING] Geçersiz telefon numarası:', phone);
      return { success: false, error: 'Geçersiz telefon numarası' };
    }

    const apiKey = String(sysSettings.sms_api_key || '0cf1e359e03007ff7d0a10279b9d59e5').trim();
    const apiHash = String(sysSettings.sms_api_hash || '920de97ae51132626b9b47eb7b788c968f4f0b1e5b183af9d465af1e62b66152').trim();
    const sender = String(sysSettings.sms_sender_title || 'YazarPerde').trim();

    if (!apiKey || !apiHash) {
      console.warn('[SMS WARNING] İleti Merkezi API Key veya Hash eksik');
      return { success: false, error: 'API anahtarları eksik' };
    }

    const payload = {
      request: {
        authentication: {
          key: apiKey,
          hash: apiHash,
        },
        order: {
          sender: sender,
          sendDateTime: '',
          message: {
            text: message,
            receipents: {
              number: [formattedPhone],
            },
          },
        },
      },
    };

    console.log(`[SMS SENDING] To: ${formattedPhone} | Sender: ${sender} | Message: ${message}`);

    const res = await fetch('https://api.iletimerkezi.com/v1/send-sms/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    console.log('[SMS RESPONSE]', JSON.stringify(data));

    if (!data || !data.response) {
      return { success: false, error: 'İleti Merkezi servisinden boş yanıt alındı' };
    }

    const statusCode = data.response?.status?.code;
    const statusMsg = data.response?.status?.message || '';

    if (statusCode === 200) {
      const orderId = data.response?.order?.id ? String(data.response.order.id) : undefined;
      console.log(`[SMS SUCCESS] SMS başarıyla gönderildi! OrderId: ${orderId}`);
      return { success: true, messageId: orderId };
    } else {
      console.error(`[SMS ERROR] İleti Merkezi Hata Kodu ${statusCode}: ${statusMsg}`);
      return { success: false, error: `Hata [${statusCode}]: ${statusMsg}` };
    }
  } catch (error: any) {
    console.error('[SMS EXCEPTION]', error);
    return { success: false, error: error?.message || 'SMS gönderim sırasında bilinmeyen hata' };
  }
}

/**
 * Builds standard luxury e-commerce HTML email template for Yazar Perde
 */
function buildHtmlEmail(params: {
  title: string;
  badge: string;
  badgeColor?: string;
  customerName: string;
  orderNumber: string;
  totalText: string;
  contentHtml: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
  trackingBox?: {
    company: string;
    trackingNo: string;
    trackingUrl: string;
  };
}): string {
  const badgeBg = params.badgeColor || '#1B84F8';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${params.title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
    .header { background: #0f172a; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
    .header p { margin: 6px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1px; text-transform: uppercase; font-weight: 700; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #ffffff; background: ${badgeBg}; margin-bottom: 16px; }
    .greeting { font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .order-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .order-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; }
    .order-row:last-child { border-bottom: none; }
    .order-row .label { color: #64748b; font-weight: 600; }
    .order-row .val { color: #0f172a; font-weight: 800; font-family: monospace; }
    .tracking-card { background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 24px; }
    .tracking-card .code { font-size: 18px; font-weight: 900; font-family: monospace; color: #1d4ed8; letter-spacing: 1px; margin: 8px 0; }
    .btn { display: inline-block; width: 100%; box-sizing: border-box; background: #1B84F8; color: #ffffff !important; text-decoration: none; padding: 14px 24px; border-radius: 14px; font-weight: 800; font-size: 14px; text-align: center; }
    .btn-green { background: #059669; }
    .footer { background: #f8fafc; padding: 24px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; line-height: 1.6; }
    .footer strong { color: #475569; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>YAZAR PERDE</h1>
      <p>Özel Ölçülü Perde Sistemleri</p>
    </div>
    <div class="content">
      <div class="badge">${params.badge}</div>
      <div class="greeting">Sayın ${params.customerName},</div>
      <div class="text">
        ${params.contentHtml}
      </div>

      <div class="order-box">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Sipariş Numarası:</td>
            <td style="padding: 6px 0; text-align: right; color: #0f172a; font-size: 13px; font-weight: 800; font-family: monospace;">#${params.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b; font-size: 13px; font-weight: 600;">Toplam Tutar:</td>
            <td style="padding: 6px 0; text-align: right; color: #0f172a; font-size: 14px; font-weight: 900;">${params.totalText}</td>
          </tr>
        </table>
      </div>

      ${params.trackingBox ? `
      <div class="tracking-card">
        <div style="font-size: 12px; font-weight: 800; color: #1e40af; text-transform: uppercase;">${params.trackingBox.company} Takip Numarası</div>
        <div class="code">${params.trackingBox.trackingNo}</div>
        <a href="${params.trackingBox.trackingUrl}" target="_blank" class="btn btn-green" style="margin-top: 10px;">
          📦 Kargomu Canlı Takip Et ↗
        </a>
      </div>
      ` : ''}

      ${params.actionButtonUrl && !params.trackingBox ? `
      <div style="margin-top: 20px;">
        <a href="${params.actionButtonUrl}" target="_blank" class="btn">
          ${params.actionButtonText || 'Siparişimi Görüntüle ↗'}
        </a>
      </div>
      ` : ''}
    </div>
    <div class="footer">
      <strong>Yazar Perde Tekstil San. ve Tic. Ltd. Şti.</strong><br>
      Anadolu Mah. Atıcılar Cd. No: 1/A1, 16270 Yıldırım / BURSA<br>
      Müşteri Hizmetleri & WhatsApp: 0541 494 51 73 • E-Posta: info@yazarperde.com<br>
      <a href="https://yazarperde.com" style="color: #1B84F8; text-decoration: none; font-weight: bold;">yazarperde.com</a>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Main Order Notification Trigger (Runs Asynchronously)
 */
export async function triggerOrderNotification(payload: NotificationPayload): Promise<void> {
  try {
    const settings = await getSystemSettings();
    const siteTitle = settings.site_title || 'Yazar Perde - Özel Ölçülü Perde Sistemleri';
    const siteUrl = 'https://yazarperde.com';
    const trackingLink = payload.trackingUrl || `https://www.mngkargo.com.tr/gonderitakip?takipno=${payload.trackingNumber || ''}`;
    const orderTrackingUrl = `${siteUrl}/siparis-takip?orderNumber=${payload.orderNumber}`;
    const cargoCompany = payload.cargoCompany || settings.shipping_company_name || 'DHL Kargo (MNG Kargo)';
    const totalFormatted = `₺${payload.grandTotal.toFixed(2)}`;

    const variables: Record<string, string> = {
      musteri_adi: payload.customerName,
      customer_name: payload.customerName,
      siparis_no: payload.orderNumber,
      order_number: payload.orderNumber,
      tutar: totalFormatted,
      total: totalFormatted,
      kargo_takip_no: payload.trackingNumber || '',
      tracking_number: payload.trackingNumber || '',
      kargo_takip_linki: trackingLink,
      kargo_firmasi: cargoCompany,
      cargo_company: cargoCompany,
      site_adi: siteTitle,
    };

    // 1. Şablon Belirleme
    let subject = '';
    let htmlContent = '';
    let badge = '';
    let badgeColor = '#1B84F8';

    switch (payload.eventCode) {
      case 'ORDER_CREATED':
        badge = 'Siparişiniz Alındı';
        badgeColor = '#1B84F8';
        subject = `Siparişiniz Alındı - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Özel ölçülü perde siparişiniz başarıyla alınmıştır. Siparişinizdeki ölçü ve modeller uzman atölye ekibimiz tarafından kontrol edilerek imalat sırasına alınacaktır.`;
        break;

      case 'PAYMENT_RECEIVED':
        badge = 'Ödeme Onaylandı';
        badgeColor = '#059669';
        subject = `Ödemeniz Onaylandı - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Siparişinize ait ödeme tutarı başarıyla teyit edilmiştir. Siparişiniz atölyede imalat aşamasına sevk edilmiştir.`;
        break;

      case 'IN_PRODUCTION':
        badge = 'Atölyede Üretimde';
        badgeColor = '#7c3aed';
        subject = `Perdeniz Dikimde / Üretimde - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Özel ölçülü perdeleriniz atölyemizde uzman terzilerimiz tarafından kesim, dikim ve kalite kontrol aşamasına alınmıştır. Tamamlandığında kargo paketlemesi yapılacaktır.`;
        break;

      case 'SHIPPED':
        badge = 'Kargoya Verildi';
        badgeColor = '#059669';
        subject = `Siparişiniz Kargoya Verildi! - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Özel ölçülü perdeleriniz titizlikle dikilmiş, kalite kontrolleri tamamlanarak korunaklı ambalajıyla <strong>${cargoCompany}</strong> firmasına teslim edilmiştir. Kargonuzu aşağıdaki takip butonundan anlık izleyebilirsiniz.`;
        break;

      case 'DELIVERED':
        badge = 'Teslim Edildi';
        badgeColor = '#059669';
        subject = `Siparişiniz Teslim Edildi - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Siparişinizin teslimatı başarıyla tamamlanmıştır. Bizi tercih ettiğiniz için teşekkür eder, perdelerinizi güzel günlerde kullanmanızı dileriz.`;
        break;

      case 'CANCELLED':
        badge = 'Sipariş İptal Edildi';
        badgeColor = '#dc2626';
        subject = `Siparişiniz İptal Edildi - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Siparişiniz talebiniz veya işlem durumu doğrultusunda iptal edilmiştir. Bilgi almak için bizimle iletişime geçebilirsiniz.`;
        break;

      default:
        badge = 'Sipariş Bildirimi';
        subject = `Sipariş Bildirimi - #${payload.orderNumber} - Yazar Perde`;
        htmlContent = `Siparişiniz ile ilgili güncelleme yapılmıştır.`;
    }

    // Veritabanında özel şablon varsa onu kullan
    const dbTemplate = await prisma.notificationTemplate.findUnique({
      where: { code: payload.eventCode },
    }).catch(() => null);

    if (dbTemplate && dbTemplate.isActive) {
      if (dbTemplate.emailSubject) {
        subject = replaceTemplateVariables(dbTemplate.emailSubject, variables);
      }
      if (dbTemplate.emailHtmlBody) {
        htmlContent = replaceTemplateVariables(dbTemplate.emailHtmlBody, variables);
      }
    }

    // 2. Müşteriye E-Posta Gönderimi
    if (payload.customerEmail) {
      const fullEmailHtml = buildHtmlEmail({
        title: subject,
        badge,
        badgeColor,
        customerName: payload.customerName,
        orderNumber: payload.orderNumber,
        totalText: totalFormatted,
        contentHtml: htmlContent,
        actionButtonText: 'Siparişimi Takip Et',
        actionButtonUrl: orderTrackingUrl,
        trackingBox: payload.eventCode === 'SHIPPED' && payload.trackingNumber ? {
          company: cargoCompany,
          trackingNo: payload.trackingNumber,
          trackingUrl: trackingLink,
        } : undefined,
      });

      await sendEmail(payload.customerEmail, subject, fullEmailHtml, settings);
    }

    // 3. Sipariş Oluştuğunda Yöneticiye (Mağazaya) Bildirim E-Postası Gönder
    if (payload.eventCode === 'ORDER_CREATED') {
      const adminEmail = settings.smtp_user || 'info@yazarperde.com';
      const adminSubject = `🔔 YENİ SİPARİŞ ALINDI: #${payload.orderNumber} (${totalFormatted})`;
      const adminHtml = buildHtmlEmail({
        title: adminSubject,
        badge: 'Yeni Web Siparişi',
        badgeColor: '#1B84F8',
        customerName: 'Yönetici (Yazar Perde)',
        orderNumber: payload.orderNumber,
        totalText: totalFormatted,
        contentHtml: `Web sitenizden yeni bir özel ölçü perde siparişi verildi.<br><br>
        <strong>Müşteri:</strong> ${payload.customerName}<br>
        <strong>Telefon:</strong> ${payload.customerPhone}<br>
        <strong>E-Posta:</strong> ${payload.customerEmail}<br>
        <strong>Sipariş Tutarı:</strong> ${totalFormatted}`,
        actionButtonText: 'Yönetim Panelinde Siparişi Aç',
        actionButtonUrl: `${siteUrl}/panel/siparisler`,
      });

      sendEmail(adminEmail, adminSubject, adminHtml, settings).catch(console.error);
    }

    // 4. Müşteriye SMS Gönderimi (İleti Merkezi)
    if (payload.customerPhone) {
      let smsText = '';

      if (dbTemplate && dbTemplate.isActive && dbTemplate.smsBody) {
        smsText = replaceTemplateVariables(dbTemplate.smsBody, variables);
      } else {
        // Otomatik varsayılan SMS metinleri
        switch (payload.eventCode) {
          case 'ORDER_CREATED':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} numaralı özel ölçü perde siparişiniz alınmıştır. Tutar: ${totalFormatted}. yazarperde.com`;
            break;
          case 'PAYMENT_RECEIVED':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} siparişinizin ödemesi onaylanmıştır. Perdeleriniz dikim sırasına alınmıştır. yazarperde.com`;
            break;
          case 'IN_PRODUCTION':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} özel ölçü perdeniz atölyemizde dikim ve üretime alınmıştır. yazarperde.com`;
            break;
          case 'SHIPPED':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} siparişiniz kargoya verilmiştir. ${cargoCompany} Takip No: ${payload.trackingNumber || ''}. yazarperde.com`;
            break;
          case 'DELIVERED':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} siparişiniz teslim edilmiştir. Bizi tercih ettiğiniz için teşekkür ederiz. yazarperde.com`;
            break;
          case 'CANCELLED':
            smsText = `Sayın ${payload.customerName}, #${payload.orderNumber} siparişiniz iptal edilmiştir. Bilgi için: 0541 494 51 73. yazarperde.com`;
            break;
        }
      }

      if (smsText.trim()) {
        sendSMS(payload.customerPhone, smsText.trim(), settings).catch((err) =>
          console.error('[TRIGGER SMS ERROR]', err)
        );
      }
    }
  } catch (error) {
    console.error('[TRIGGER NOTIFICATION ERROR]', error);
  }
}

