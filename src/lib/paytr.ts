import crypto from 'crypto';

interface PayTRTokenParams {
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
    userName,
    userAddress,
    userPhone,
    merchantOkUrl,
    merchantFailUrl,
    userBasket,
    userIp,
    timeoutLimit = 30,
    testMode = 1,
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