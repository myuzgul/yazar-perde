import crypto from 'crypto';

export interface PayTRTokenParams {
  merchantId: string;
  merchantKey: string;
  merchantSalt: string;
  email: string;
  paymentAmount: number; // Kuruş cinsinden (ör: 100 TL -> 10000)
  merchantOid: string; // Sipariş Numarası
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

    const userBasketBase64 = Buffer.from(JSON.stringify(userBasket)).toString('base64');
    const noInstallment = 0;
    const maxInstallment = 12;
    const currency = 'TL';

    // Hash calculation according to PayTR official specification
    const hashStr = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${userBasketBase64}${noInstallment}${maxInstallment}${currency}${testMode}`;
    const paytrToken = crypto
      .createHmac('sha256', merchantKey)
      .update(hashStr + merchantSalt)
      .digest('base64');

    const formData = new URLSearchParams();
    formData.append('merchant_id', merchantId);
    formData.append('user_ip', userIp);
    formData.append('merchant_oid', merchantOid);
    formData.append('email', email);
    formData.append('payment_amount', paymentAmount.toString());
    formData.append('paytr_token', paytrToken);
    formData.append('user_basket', userBasketBase64);
    formData.append('user_name', userName);
    formData.append('user_address', userAddress);
    formData.append('user_phone', userPhone);
    formData.append('merchant_ok_url', merchantOkUrl);
    formData.append('merchant_fail_url', merchantFailUrl);
    formData.append('timeout_limit', timeoutLimit.toString());
    formData.append('currency', currency);
    formData.append('test_mode', testMode.toString());
    formData.append('no_installment', noInstallment.toString());
    formData.append('max_installment', maxInstallment.toString());
    formData.append('lang', 'tr');

    const res = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });

    const data = await res.json();
    if (data.status === 'success' && data.token) {
      return { success: true, token: data.token };
    } else {
      console.error('PayTR get-token failed:', data);
      return { success: false, error: data.reason || 'PayTR token oluşturulamadı' };
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
