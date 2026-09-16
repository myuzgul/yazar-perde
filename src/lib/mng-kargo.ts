import { SystemSettingsMap } from './settings-constants';

export interface MngCustomerData {
  name: string;
  surname: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  district: string;
}

export interface MngShipmentParams {
  orderNumber: string;
  customer: MngCustomerData;
  paymentMethod: string; // 'PAYTR_CC' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'
  grandTotal: number;
  itemCount?: number;
  description?: string;
}

export interface MngShipmentResult {
  success: boolean;
  trackingNumber?: string;
  trackingUrl?: string;
  barcode?: string;
  shipmentId?: string;
  statusMessage?: string;
  errorMessage?: string;
  rawResponse?: any;
}

/**
 * Returns the official MNG Kargo live shipment tracking URL
 */
export function getMngTrackingUrl(trackingNumber: string): string {
  if (!trackingNumber) return 'https://www.mngkargo.com.tr/gonderitakip';
  const clean = trackingNumber.trim();
  return `https://www.mngkargo.com.tr/gonderitakip?takipno=${encodeURIComponent(clean)}`;
}

/**
 * Normalizes a Turkish mobile phone number
 */
function normalizePhone(phone: string): { phone10: string; phone11: string } {
  const digits = String(phone || '').replace(/[^0-9]/g, '');
  let phone10 = digits;
  if (digits.startsWith('90') && digits.length === 12) {
    phone10 = digits.slice(2);
  } else if (digits.startsWith('0') && digits.length === 11) {
    phone10 = digits.slice(1);
  }
  const phone11 = phone10.length === 10 ? `0${phone10}` : phone10;
  return { phone10, phone11 };
}

function escapeXml(unsafe: string): string {
  return String(unsafe || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Sends order delivery information to DHL / MNG Kargo Web Service / API
 */
export async function sendOrderToMNGKargo(
  params: MngShipmentParams,
  settings: SystemSettingsMap
): Promise<MngShipmentResult> {
  const customerNumber = String(settings.mng_customer_number || '248018877').trim();
  const password = String(settings.mng_password || 'Yazar.456').trim();
  const username = String(settings.mng_username || customerNumber).trim();

  // Barkod / Sipariş No
  const cleanOrderNum = String(params.orderNumber ?? '').replace(/[^0-9A-Za-z]/g, '').trim();
  const customPrefix = String(settings.mng_barcode_prefix ?? '').trim();
  const barcode = customPrefix && !cleanOrderNum.toUpperCase().startsWith(customPrefix.toUpperCase())
    ? `${customPrefix}${cleanOrderNum}`
    : cleanOrderNum;

  const isCod = params.paymentMethod === 'CASH_ON_DELIVERY';
  const codAmount = isCod ? params.grandTotal : 0;
  const { phone10, phone11 } = normalizePhone(String(params.customer?.phone ?? ''));
  const fullName = `${params.customer?.name ?? ''} ${params.customer?.surname ?? ''}`.trim();
  const address = params.customer?.address || '';
  const city = params.customer?.city || '';
  const district = params.customer?.district || '';
  const pieceCount = params.itemCount && params.itemCount > 0 ? params.itemCount : 1;
  const parcaList = `1:1:${pieceCount}:Ozel Olculu Perde:${cleanOrderNum}:;`;

  // 1. Bilgiler eksikse uyarı döndür
  if (!customerNumber || !password) {
    return {
      success: false,
      errorMessage: 'MNG Kargo Abone Numarası veya API Şifresi eksik.',
    };
  }

  const authUser = username || customerNumber;

  // 2. MNG Kargo Resmi SOAP Web Servisi (musterikargosiparis.asmx - SiparisGirisiDetayliV3)
  try {
    const soapEnvelopeV3 = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SiparisGirisiDetayliV3 xmlns="http://tempuri.org/">
      <pChIrsaliyeNo>${escapeXml(cleanOrderNum)}</pChIrsaliyeNo>
      <pPrKiymet>${params.grandTotal || 0}</pPrKiymet>
      <pChBarkod>${escapeXml(barcode)}</pChBarkod>
      <pChIcerik>Ozel Olculu Perde</pChIcerik>
      <pGonderiHizmetSekli>NORMAL</pGonderiHizmetSekli>
      <pTeslimSekli>1</pTeslimSekli>
      <pFlAlSms>1</pFlAlSms>
      <pFlGnSms>0</pFlGnSms>
      <pKargoParcaList>${parcaList}</pKargoParcaList>
      <pAliciMusteriMngNo></pAliciMusteriMngNo>
      <pAliciMusteriBayiNo></pAliciMusteriBayiNo>
      <pAliciMusteriAdi>${escapeXml(fullName)}</pAliciMusteriAdi>
      <pChSiparisNo>${escapeXml(cleanOrderNum)}</pChSiparisNo>
      <pLuOdemeSekli>P</pLuOdemeSekli>
      <pFlAdresFarkli>0</pFlAdresFarkli>
      <pChIl>${escapeXml(city)}</pChIl>
      <pChIlce>${escapeXml(district)}</pChIlce>
      <pChAdres>${escapeXml(address)}</pChAdres>
      <pChSemt></pChSemt>
      <pChMahalle></pChMahalle>
      <pChMeydanBulvar></pChMeydanBulvar>
      <pChCadde></pChCadde>
      <pChSokak></pChSokak>
      <pChTelEv></pChTelEv>
      <pChTelCep>${phone11}</pChTelCep>
      <pChTelIs></pChTelIs>
      <pChFax></pChFax>
      <pChEmail>${escapeXml(params.customer?.email || '')}</pChEmail>
      <pChVergiDairesi></pChVergiDairesi>
      <pChVergiNumarasi></pChVergiNumarasi>
      <pFlKapidaOdeme>${isCod ? 1 : 0}</pFlKapidaOdeme>
      <pMalBedeliOdemeSekli>${isCod ? 'NAKIT' : ''}</pMalBedeliOdemeSekli>
      <pPlatformKisaAdi></pPlatformKisaAdi>
      <pPlatformSatisKodu></pPlatformSatisKodu>
      <pKullaniciAdi>${escapeXml(authUser)}</pKullaniciAdi>
      <pSifre>${escapeXml(password)}</pSifre>
    </SiparisGirisiDetayliV3>
  </soap:Body>
</soap:Envelope>`;

    const controller1 = new AbortController();
    const timeoutId1 = setTimeout(() => controller1.abort(), 12000);

    const v3Response = await fetch('https://service.mngkargo.com.tr/musterikargosiparis/musterikargosiparis.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://tempuri.org/SiparisGirisiDetayliV3',
      },
      body: soapEnvelopeV3,
      signal: controller1.signal,
    }).catch((err) => {
      console.warn('MNG V3 SOAP fetch failed:', err.message);
      return null;
    });

    clearTimeout(timeoutId1);

    if (v3Response && v3Response.ok) {
      const xmlText = await v3Response.text();
      console.log('MNG V3 SOAP Response:', xmlText);

      const resultMatch = xmlText.match(/<SiparisGirisiDetayliV3Result>(.*?)<\/SiparisGirisiDetayliV3Result>/is);
      const resVal = resultMatch ? resultMatch[1].trim() : '';

      // MNG V3 "1" veya takip numarası döndüğünde başarılıdır
      if (resVal === '1' || (!resVal.toLowerCase().includes('hata') && !resVal.toLowerCase().includes('geçersiz') && !resVal.toLowerCase().includes('yetkisiz') && !resVal.startsWith('E0') && !resVal.startsWith('H0'))) {
        const isNumericCode = resVal.length >= 8 && /^[0-9]+$/.test(resVal);
        const trackingCode = isNumericCode ? resVal : undefined;
        return {
          success: true,
          trackingNumber: trackingCode,
          trackingUrl: trackingCode ? getMngTrackingUrl(trackingCode) : undefined,
          barcode: barcode,
          shipmentId: `MNG-${cleanOrderNum}`,
          statusMessage: isNumericCode
            ? `Sipariş MNG Kargo sistemine aktarıldı. Takip No: ${trackingCode}`
            : `Sipariş MNG Kargo sistemine dijital manifesto olarak başarıyla aktarıldı (Barkod: #${barcode}).`,
          rawResponse: xmlText,
        };
      } else if (resVal) {
        return {
          success: false,
          errorMessage: `MNG Kargo Servis Yanıtı: ${resVal}`,
          rawResponse: xmlText,
        };
      }
    }
  } catch (err: any) {
    console.error('MNG V3 error:', err);
  }

  // 3. Fallback: Hata alındıysa
  return {
    success: false,
    errorMessage: `MNG Kargo servisine bağlanırken beklenmeyen bir yanıt alındı.`,
  };
}
