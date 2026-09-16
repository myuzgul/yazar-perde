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
  const customerNumber = String(settings.mng_customer_number ?? '').trim();
  const password = String(settings.mng_password ?? '').trim();
  const username = String(settings.mng_username ?? '').trim();

  // Barkod / Sipariş No: Kesinlikle YP veya YZ gibi zorunlu ön ekler eklenmez!
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

  // 1. Bilgiler eksikse uyarı döndür
  if (!customerNumber || !password) {
    return {
      success: false,
      errorMessage: 'MNG Kargo Abone / Müşteri Numarası veya API Şifresi eksik. Lütfen panelden Ayarlar > Kargo & Ödeme bölümünden bilgilerinizi kaydedin.',
    };
  }

  const authUser = username || customerNumber;

  // 2. DENEME 1: MNG Kargo Resmi SOAP Web Servisi (musterikargosiparis.asmx - SiparisGirisiDetayliV3)
  try {
    const soapEnvelopeV3 = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SiparisGirisiDetayliV3 xmlns="http://tempuri.org/">
      <pKullaniciAdi>${escapeXml(authUser)}</pKullaniciAdi>
      <pSifre>${escapeXml(password)}</pSifre>
      <pChIrsaliyeNo>${escapeXml(cleanOrderNum)}</pChIrsaliyeNo>
      <pChSiparisNo>${escapeXml(cleanOrderNum)}</pChSiparisNo>
      <pChBarkod>${escapeXml(barcode)}</pChBarkod>
      <pPrKiymet>${params.grandTotal || 0}</pPrKiymet>
      <pChIcerik>Ozel Olculu Perde Sistemleri</pChIcerik>
      <pGonderiHizmetSekli>STANDART</pGonderiHizmetSekli>
      <pTeslimSekli>1</pTeslimSekli>
      <pFlKapidaOdeme>${isCod ? 1 : 0}</pFlKapidaOdeme>
      <pPrKapidaTahsilatTutari>${codAmount}</pPrKapidaTahsilatTutari>
      <pChKapidaOdemeTahsilatTipi>${isCod ? 1 : 0}</pChKapidaOdemeTahsilatTipi>
      <pAliciMusteriAdi>${escapeXml(fullName)}</pAliciMusteriAdi>
      <pChAdres>${escapeXml(address)}</pChAdres>
      <pChIl>${escapeXml(city)}</pChIl>
      <pChIlce>${escapeXml(district)}</pChIlce>
      <pChTelCep>${phone10 || phone11}</pChTelCep>
      <pChEmail>${escapeXml(params.customer?.email || '')}</pChEmail>
      <pFlAlSms>1</pFlAlSms>
      <pFlGnSms>0</pFlGnSms>
      <pKoliAdedi>${params.itemCount || 1}</pKoliAdedi>
    </SiparisGirisiDetayliV3>
  </soap:Body>
</soap:Envelope>`;

    const controller1 = new AbortController();
    const timeoutId1 = setTimeout(() => controller1.abort(), 9000);

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

      if (resVal && !resVal.toLowerCase().includes('hata') && !resVal.toLowerCase().includes('geçersiz') && !resVal.toLowerCase().includes('yetkisiz')) {
        const trkCode = resVal.length >= 8 && /^[0-9]+$/.test(resVal) ? resVal : barcode;
        return {
          success: true,
          trackingNumber: trkCode,
          trackingUrl: getMngTrackingUrl(trkCode),
          barcode: barcode,
          shipmentId: `MNG-${cleanOrderNum}`,
          statusMessage: `Sipariş MNG Kargo sistemine başarıyla iletildi (MNG Yanıtı: ${resVal}).`,
          rawResponse: xmlText,
        };
      }
    }
  } catch (err: any) {
    console.error('MNG V3 error:', err);
  }

  // 3. DENEME 2: MNG Kargo standardServices (standardServices.asmx - SiparisGirisi)
  try {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SiparisGirisi xmlns="http://tempuri.org/">
      <pKullaniciAdi>${escapeXml(authUser)}</pKullaniciAdi>
      <pSifre>${escapeXml(password)}</pSifre>
      <pMusteriNo>${escapeXml(customerNumber)}</pMusteriNo>
      <pSiparisNo>${escapeXml(cleanOrderNum)}</pSiparisNo>
      <pBarkod>${escapeXml(barcode)}</pBarkod>
      <pAliciAdi>${escapeXml(fullName)}</pAliciAdi>
      <pAliciAdres>${escapeXml(address)}</pAliciAdres>
      <pAliciIl>${escapeXml(city)}</pAliciIl>
      <pAliciIlce>${escapeXml(district)}</pAliciIlce>
      <pAliciTel>${phone11}</pAliciTel>
      <pOdemeTipi>${isCod ? 3 : 1}</pOdemeTipi>
      <pKapidaTahsilatTutari>${codAmount}</pKapidaTahsilatTutari>
      <pParcaSayisi>${params.itemCount || 1}</pParcaSayisi>
      <pIcerik>Ozel Olculu Perde Sistemleri</pIcerik>
    </SiparisGirisi>
  </soap:Body>
</soap:Envelope>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const soapResponse = await fetch('https://service.mngkargo.com.tr/tsws/standardServices.asmx', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: 'http://tempuri.org/SiparisGirisi',
      },
      body: soapEnvelope,
      signal: controller.signal,
    }).catch((err) => {
      console.warn('MNG Standard SOAP fetch failed:', err.message);
      return null;
    });

    clearTimeout(timeoutId);

    if (soapResponse && soapResponse.ok) {
      const xmlText = await soapResponse.text();
      console.log('MNG SOAP Response:', xmlText);

      const resultMatch = xmlText.match(/<SiparisGirisiResult>(.*?)<\/SiparisGirisiResult>/is);
      const resVal = resultMatch ? resultMatch[1].trim() : '';

      if (resVal && !resVal.toLowerCase().includes('hata') && !resVal.toLowerCase().includes('geçersiz') && !resVal.toLowerCase().includes('yetkisiz')) {
        const trackingCode = resVal.length >= 8 && /^[0-9]+$/.test(resVal) ? resVal : barcode;
        return {
          success: true,
          trackingNumber: trackingCode,
          trackingUrl: getMngTrackingUrl(trackingCode),
          barcode: barcode,
          shipmentId: `MNG-${cleanOrderNum}`,
          statusMessage: `Sipariş MNG Kargo Web Servisine aktarıldı (MNG Yanıtı: ${resVal}).`,
          rawResponse: xmlText,
        };
      } else if (resVal) {
        return {
          success: false,
          errorMessage: `MNG Kargo Servisi Yanıtı: ${resVal}.`,
          rawResponse: xmlText,
        };
      }
    }
  } catch (soapError: any) {
    console.error('MNG SOAP error:', soapError);
  }

  // 4. DENEME 3: MNG REST API (Token + Shipment)
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 8000);

    const tokenRes = await fetch('https://api.mngkargo.com.tr/mngapi/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerNumber,
        username: authUser,
        password,
        identityType: 1,
      }),
      signal: controller2.signal,
    }).catch(() => null);

    if (tokenRes) {
      const tokenData = await tokenRes.json().catch(() => ({}));
      const token = tokenData.jwt || tokenData.token || tokenData.jwtToken;

      if (token) {
        const shipRes = await fetch('https://api.mngkargo.com.tr/mngapi/api/shipment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order: {
              referenceId: cleanOrderNum,
              barcode: barcode,
              billOfLandingId: cleanOrderNum,
              isCod: isCod,
              codAmount: codAmount,
              codCollectionType: 0,
              description: `Yazar Perde - #${params.orderNumber}`,
              pieceCount: params.itemCount || 1,
              recipient: {
                name: fullName,
                address: address,
                city: city,
                district: district,
                phone: phone10 || phone11,
                email: params.customer?.email || '',
              },
            },
          }),
          signal: controller2.signal,
        }).catch(() => null);

        clearTimeout(timeoutId2);

        if (shipRes && shipRes.ok) {
          const shipData = await shipRes.json();
          const trk = shipData.trackingNumber || shipData.shipmentId || barcode;
          return {
            success: true,
            trackingNumber: String(trk),
            trackingUrl: getMngTrackingUrl(String(trk)),
            barcode: barcode,
            shipmentId: String(shipData.shipmentId || barcode),
            statusMessage: 'Sipariş MNG REST API üzerinden başarıyla iletildi.',
            rawResponse: shipData,
          };
        } else if (shipRes) {
          const errData = await shipRes.json().catch(() => ({}));
          return {
            success: false,
            errorMessage: `MNG REST API Yanıtı: ${errData.message || errData.error || 'Gönderi oluşturulamadı'}.`,
            rawResponse: errData,
          };
        }
      }
    }
    clearTimeout(timeoutId2);
  } catch (restError: any) {
    console.error('MNG REST Error:', restError);
  }

  // 5. Sunucu yanıt vermediyse fallback mesajı
  return {
    success: false,
    errorMessage: `MNG Kargo web servisine ulaşılamadı veya yetkilendirme yanıt vermedi. Lütfen MNG şubenizden Web Servis şifrenizi teyit ediniz veya kargo takip numarasını manuel girerek siparişi kargoya veriniz.`,
  };
}
