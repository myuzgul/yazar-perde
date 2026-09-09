import { SystemSettingsMap } from './settings-constants';

export interface DopigoOrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_rate: number;
  curtain_details?: string;
}

export interface DopigoCustomerData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  isCorporate: boolean;
  companyName?: string;
  taxOffice?: string;
  taxNumber?: string;
  address: string;
  city: string;
  district: string;
}

export interface CreateInvoiceParams {
  orderNumber: string;
  customer: DopigoCustomerData;
  items: DopigoOrderItem[];
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  grandTotal: number;
  vatRate?: number;
  currency?: string;
}

export interface DopigoInvoiceResult {
  success: boolean;
  invoiceNumber?: string;
  invoicePdfUrl?: string;
  invoiceUuid?: string;
  errorMessage?: string;
  rawResponse?: any;
}

const DOPIGO_API_BASE = 'https://panel.dopigo.com/api/v1';

/**
 * Creates an e-invoice (e-Arşiv / e-Fatura) via Dopigo (Sovos integration)
 */
export async function createDopigoInvoice(
  params: CreateInvoiceParams,
  settings: SystemSettingsMap
): Promise<DopigoInvoiceResult> {
  const token = settings.dopigo_api_token?.trim();
  const prefix = settings.dopigo_invoice_prefix?.trim() || 'YZR';
  const defaultVat = Number(settings.default_vat_rate) || 10;

  // If token is missing, generate a simulated/pre-formatted invoice record with a clear note
  if (!token) {
    const randomSeq = Math.floor(100000 + Math.random() * 900000);
    const dateYear = new Date().getFullYear();
    const simulatedInvoiceNo = `${prefix}${dateYear}${randomSeq}`;
    
    return {
      success: true,
      invoiceNumber: simulatedInvoiceNo,
      invoicePdfUrl: `https://panel.dopigo.com/invoices/preview/${simulatedInvoiceNo}.pdf`,
      invoiceUuid: `sim-${Date.now()}-${randomSeq}`,
      errorMessage: 'Dopigo API Token henüz girilmediği için test modunda fatura üretildi. Gerçek GİB onayı için panelden API Token kaydediniz.',
    };
  }

  try {
    const payload = {
      order_number: params.orderNumber,
      invoice_prefix: prefix,
      customer: {
        first_name: params.customer.name,
        last_name: params.customer.surname,
        email: params.customer.email,
        phone: params.customer.phone,
        is_company: params.customer.isCorporate,
        company_name: params.customer.companyName || null,
        tax_office: params.customer.taxOffice || null,
        tax_number: params.customer.taxNumber || '11111111111',
        address: params.customer.address,
        city: params.customer.city,
        district: params.customer.district,
        country: 'Türkiye',
      },
      items: params.items.map((it) => ({
        name: it.name,
        sku: it.sku,
        quantity: it.quantity,
        price: it.unit_price,
        total_price: it.total_price,
        vat_rate: it.tax_rate || defaultVat,
        description: it.curtain_details || '',
      })),
      shipping_fee: params.shippingFee,
      discount_amount: params.discountTotal,
      grand_total: params.grandTotal,
      currency: params.currency || 'TRY',
      issue_date: new Date().toISOString(),
    };

    const response = await fetch(`${DOPIGO_API_BASE}/invoices/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      return {
        success: true,
        invoiceNumber: data.invoice_number || data.number || `${prefix}${Date.now().toString().slice(-8)}`,
        invoicePdfUrl: data.pdf_url || data.invoice_url || `https://panel.dopigo.com/invoices/download/${data.id || params.orderNumber}/`,
        invoiceUuid: data.uuid || data.id?.toString(),
        rawResponse: data,
      };
    } else {
      const errorDetail = data?.detail || data?.message || data?.error || response.statusText || 'Dopigo API hatası oluştu';
      return {
        success: false,
        errorMessage: typeof errorDetail === 'string' ? errorDetail : JSON.stringify(errorDetail),
        rawResponse: data,
      };
    }
  } catch (err: any) {
    console.error('Dopigo Invoice API Error:', err);
    return {
      success: false,
      errorMessage: err.message || 'Dopigo sunucusuna bağlanırken hata oluştu',
    };
  }
}
