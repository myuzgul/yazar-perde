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
 * Normalizes a Turkish mobile phone number to standard format
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('90') && digits.length === 12) {
    return '0' + digits.slice(2);
  }
  if (digits.length === 10) {
    return '0' + digits;
  }
  return digits;
}

/**
 * Sends order delivery information to DHL / MNG Kargo Web Service / API
 */
export async function sendOrderToMNGKargo(
  params: MngShipmentParams,
  settings: SystemSettingsMap
): Promise<MngShipmentResult> {
  const isActive = Number(settings.mng_kargo_active) === 1;
  const customerNumber = String(settings.mng_customer_number ?? '').trim();
  const password = String(settings.mng_password ?? '').trim();
  const username = String(settings.mng_username ?? '').trim();
  const branchName = String(settings.mng_branch_name ?? '').trim() || 'Bursa Yıldırım Şubesi';
  const prefix = String(settings.mng_barcode_prefix ?? '').trim() || 'YP';

  const cleanOrderNum = String(params.orderNumber ?? '').replace(/[^0-9A-Za-z]/g, '');
  const barcode = `${prefix}${cleanOrderNum}`;
  const isCod = params.paymentMethod === 'CASH_ON_DELIVERY';
  const codAmount = isCod ? params.grandTotal : 0;
  const recipientPhone = normalizePhone(String(params.customer?.phone ?? ''));
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

  // 2. MNG Kargo Resmi SOAP Web Servisi (standardServices.asmx - SiparisGirisi)
  try {
    const soapEnvelope = `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SiparisGirisi xmlns="http://tempuri.org/">
      <pKullaniciAdi>${username || customerNumber}</pKullaniciAdi>
      <pSifre>${password}</pSifre>
      <pMusteriNo>${customerNumber}</pMusteriNo>
      <pSiparisNo>${cleanOrderNum}</pSiparisNo>
      <pBarkod>${barcode}</pBarkod>
      <pAliciAdi>${fullName}</pAliciAdi>
      <pAliciAdres>${address}</pAliciAdres>
      <pAliciIl>${city}</pAliciIl>
      <pAliciIlce>${district}</pAliciIlce>
      <pAliciTel>${recipientPhone}</pAliciTel>
      <pOdemeTipi>${isCod ? 3 : 1}</pOdemeTipi>
      <pKapidaTahsilatTutari>${codAmount}</pKapidaTahsilatTutari>
      <pParcaSayisi>${params.itemCount || 1}</pParcaSayisi>
      <pIcerik>Özel Ölçülü Perde Sistemleri</pIcerik>
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
      console.warn('MNG SOAP fetch failed:', err.message);
      return null;
    });

    clearTimeout(timeoutId);

    if (soapResponse && soapResponse.ok) {
      const xmlText = await soapResponse.text();
      console.log('MNG SOAP Response:', xmlText);

      // XML içindeki sonucu incele
      const resultMatch = xmlText.match(/<SiparisGirisiResult>(.*?)<\/SiparisGirisiResult>/i);
      const resVal = resultMatch ? resultMatch[1] : '';

      // Eğer 1 veya takip no veya başarılı yanıt döndüyse:
      if (resVal && !resVal.toLowerCase().includes('hata') && !resVal.toLowerCase().includes('geçersiz') && !resVal.toLowerCase().includes('yetkisiz')) {
        const trackingCode = resVal.length >= 8 && /^[0-9]+$/.test(resVal) ? resVal : barcode;
        return {
          success: true,
          trackingNumber: trackingCode,
          trackingUrl: getMngTrackingUrl(trackingCode),
          barcode: barcode,
          shipmentId: `MNG-${cleanOrderNum}`,
          statusMessage: `Sipariş MNG Kargo Web Servisine başarıyla aktarıldı (MNG Yanıtı: ${resVal}).`,
          rawResponse: xmlText,
        };
      } else if (resVal) {
        // MNG doğrudan bir hata açıklaması döndü:
        return {
          success: false,
          errorMessage: `MNG Kargo Servisi Yanıtı: ${resVal}. (Lütfen MNG Şubeniz veya MNG Bilgi İşlem ile görüşüp Web Servis / API izninizin ve IP yetkinizin açık olduğunu teyit ediniz).`,
          rawResponse: xmlText,
        };
      }
    }
  } catch (soapError: any) {
    console.error('MNG SOAP error:', soapError);
  }

  // 3. SOAP bağlantısı yanıt vermediyse MNG REST API (Token + Shipment) dene
  try {
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 8000);

    const tokenRes = await fetch('https://api.mngkargo.com.tr/mngapi/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerNumber,
        username: username || customerNumber,
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
              referenceId: barcode,
              barcode: barcode,
              billOfLandingId: barcode,
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
                phone: recipientPhone,
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
      } else if (tokenData.message || tokenData.error) {
        clearTimeout(timeoutId2);
        return {
          success: false,
          errorMessage: `MNG API Giriş Başarısız: ${tokenData.message || tokenData.error}. Lütfen MNG Müşteri No ve API Şifrenizi kontrol edin.`,
          rawResponse: tokenData,
        };
      }
    }
    clearTimeout(timeoutId2);
  } catch (restError: any) {
    console.error('MNG REST Error:', restError);
  }

  // 4. MNG sunucusuna erişilemediyse veya henüz API izni verilmediyse:
  return {
    success: false,
    errorMessage: `MNG Kargo sunucusundan yanıt alınamadı. MNG şubenizden Web Servis kullanıcı adı/şifrenizin aktif olduğunu doğrulayınız veya elinizdeki kargo takip kodunu (örn: 827046904757) yukarıdaki alana girerek tek tıkla kaydedebilirsiniz.`,
  };
}
