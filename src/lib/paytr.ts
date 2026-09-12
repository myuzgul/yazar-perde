import crypto from 'crypto';

export interface PayTRTokenParams {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  email: string;
  paymentAmount: number; // Kuruş cinsinden (ör: 100 TL -> 10000)
  merchantOid: string; // Sipariş Numarası (alfanümerik)
  userName: string;
  userAddress: string;
  userPhone: string;
  merchantOkUrl: string;
  merchantFailUrl: string;
  userBasket: Array<[string, string, number]>; // [["Ürün adı", "Birim Fiyat", Adet]]
  userIp: string;
  timeoutLimit?: number;
  testMode?: number;
}

export function generatePayTRToken(params: PayTRTokenParams): string {
  const {
    merchantId,
    merchantKey,
    merchantSalt,
    email,
    paymentAmount,
    merchantOid,
    userBasket,
    userIp,
    testMode = 0,
  } = params;

  const userBasketBase64 = Buffer.from(JSON.stringify(userBasket)).toString('base64');
  const noInstallment = 0;
  const maxInstallment = 12;
  const currency = 'TL';

  const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testMode}`;
  const paytrToken = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr + merchantSalt)
    .digest('base64');

  return paytrToken;
}

export async function getPayTRIFrameToken(
  params: PayTRTokenParams
): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const {
      merchantId,
      merchantKey,
      merchantSalt,
      email,
      paymentAmount,
      merchantOid,
      userName,
      userAddress,
      userPhone,
      merchantOkUrl,
      merchantFailUrl,
      userBasket,
      userIp,
      timeoutLimit = 30,
      testMode = 0,
    } = params;

    // 1. Parametreleri PayTR API standartlarına göre sıkı bir şekilde temizle / normalize et
    const cleanMerchantId = String(merchantId || '').trim();
    const cleanMerchantKey = String(merchantKey || '').trim();
    const cleanMerchantSalt = String(merchantSalt || '').trim();

    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanOid = String(merchantOid || '').replace(/[^a-zA-Z0-9]/g, '');
    const cleanAmount = Math.round(Number(paymentAmount) || 0);

    const cleanName = String(userName || '').trim() || 'Musteri';
    const cleanAddress = String(userAddress || '').replace(/[\r\n\t]+/g, ' ').trim() || 'Turkiye';
    const cleanPhone = String(userPhone || '').replace(/[^\d+]/g, '').trim() || '05414945173';
    
    // IP Normalizasyonu (IPv6, yerel IP veya virgüllü IP listelerini filtrele)
    let cleanIp = String(userIp || '').split(',')[0].trim();
    if (!cleanIp || cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') {
      cleanIp = '179.198.199.217'; // Güvenilir sunucu public IP fallback
    }

    // Sepet normalizasyonu
    const safeBasket = Array.isArray(userBasket) && userBasket.length > 0
      ? userBasket.map(([name, price, qty]) => [
          String(name || 'Ürün').replace(/[\r\n\t]/g, ' ').trim(),
          Number(price || 0).toFixed(2),
          Math.max(1, Number(qty) || 1),
        ])
      : [['Özel Ölçü Perde Siparişi', (cleanAmount / 100).toFixed(2), 1]];

    const userBasketBase64 = Buffer.from(JSON.stringify(safeBasket)).toString('base64');
    const noInstallment = 0;
    const maxInstallment = 12;
    const currency = 'TL';

    // Hash calculation according to PayTR official specification
    const hashStr = `${cleanMerchantId}${cleanIp}${cleanOid}${cleanEmail}${cleanAmount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrToken = crypto
      .createHmac('sha256', cleanMerchantKey)
      .update(hashStr + cleanMerchantSalt)
      .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', cleanMerchantId);
    formData.append('user_ip', cleanIp);
    formData.append('merchant_oid', cleanOid);
    formData.append('email', cleanEmail);
    formData.append('payment_amount', cleanAmount.toString());
    formData.append('paytr_token', paytrToken);
    formData.append('user_basket', userBasketBase64);
    formData.append('user_name', cleanName);
    formData.append('user_address', cleanAddress);
    formData.append('user_phone', cleanPhone);
    formData.append('merchant_ok_url', merchantOkUrl);
    formData.append('merchant_fail_url', merchantFailUrl);
    formData.append('timeout_limit', timeoutLimit.toString());
    formData.append('currency', currency);
    formData.append('test_mode', testMode.toString());
    formData.append('no_installment', noInstallment.toString());
    formData.append('max_installment', maxInstallment.toString());
    formData.append('lang', 'tr');

    console.log(`[PayTR Token Request] OID: ${cleanOid} | Amount: ${cleanAmount} (${(cleanAmount/100).toFixed(2)} TL) | IP: ${cleanIp}`);

    const res = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const rawText = await res.text();
    let data: any = null;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error('[PayTR Token Error] Non-JSON Response:', rawText);
      return { 
        success: false, 
        error: `PayTR servisi yanıt veremedi (${rawText ? rawText.substring(0, 80) : 'Boş yanıt'}). Lütfen girdiğiniz adres ve iletişim bilgilerini kontrol ediniz.` 
      };
    }

    if (data.status === 'success' && data.token) {
      console.log(`[PayTR Token SUCCESS] OID: ${cleanOid} | Token generated`);
      return { success: true, token: data.token };
    } else {
      console.error('[PayTR Token FAILED]', data);
      return { 
        success: false, 
        error: data.reason || 'PayTR ödeme oturumu oluşturulamadı. Lütfen bilgilerinizi kontrol ediniz.' 
      };
    }
  } catch (err: any) {
    console.error('PayTR get-token network error:', err);
    return { success: false, error: err.message || 'PayTR sunucusuna bağlanılamadı' };
  }
}

export function verifyPayTRCallbackHash(
  merchantOid: string,
  status: string,
  totalAmount: string,
  receivedHash: string,
  merchantKey: string,
  merchantSalt: string
): boolean {
  const hashStr = `${merchantOid}${merchantSalt}${status}${totalAmount}`;
  const calculatedHash = crypto
    .createHmac('sha256', merchantKey)
    .update(hashStr)
    .digest('base64');

  return calculatedHash === receivedHash;
}

