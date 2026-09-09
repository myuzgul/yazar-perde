'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Truck, 
  CreditCard, 
  Building2, 
  Package, 
  Save, 
  CheckCircle2, 
  Percent, 
  ShieldCheck, 
  DollarSign,
  QrCode
} from 'lucide-react';

interface SettingItem {
  id?: string;
  key: string;
  value: string;
  label?: string;
  group?: string;
  description?: string | null;
}

export default function KargoOdemeAyarlariPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Kargo Genel State
  const [shippingCompany, setShippingCompany] = useState('DHL Kargo (MNG Kargo)');
  const [shippingDeliveryTime, setShippingDeliveryTime] = useState('2-7 İş Günü');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('1500');
  const [shippingFee, setShippingFee] = useState('99.90');

  // DHL / MNG Kargo API State
  const [mngActive, setMngActive] = useState('1');
  const [mngCustomerNumber, setMngCustomerNumber] = useState('');
  const [mngPassword, setMngPassword] = useState('');
  const [mngUsername, setMngUsername] = useState('');
  const [mngBranchName, setMngBranchName] = useState('Bursa Yıldırım Şubesi');
  const [mngBarcodePrefix, setMngBarcodePrefix] = useState('YP');

  // PayTR State
  const [paytrActive, setPaytrActive] = useState('1');
  const [paytrMerchantId, setPaytrMerchantId] = useState('');
  const [paytrMerchantKey, setPaytrMerchantKey] = useState('');
  const [paytrMerchantSalt, setPaytrMerchantSalt] = useState('');
  const [paytrTestMode, setPaytrTestMode] = useState('1');

  // Havale State
  const [bankActive, setBankActive] = useState('1');
  const [bankDiscountRate, setBankDiscountRate] = useState('5');
  const [bankAccounts, setBankAccounts] = useState(
    'Banka: QNB Finansbank\nAlıcı Ünvanı: Yazar Perde Tekstil Gıda İnş.Otomotiv Mobilya Turizm Dış Tic.San.ve Tic.LTD.ŞTİ.\nIBAN: TR00 0000 0000 0000 0000 0000 00\nŞube: Bursa Yıldırım Şubesi'
  );

  // Kapıda Ödeme State
  const [codActive, setCodActive] = useState('1');
  const [codFee, setCodFee] = useState('100');

  // Dopigo & Sovos E-Fatura State
  const [dopigoActive, setDopigoActive] = useState('1');
  const [dopigoApiToken, setDopigoApiToken] = useState('');
  const [dopigoInvoicePrefix, setDopigoInvoicePrefix] = useState('YZR');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        const map: Record<string, string> = {};
        data.data.forEach((s: SettingItem) => {
          map[s.key] = s.value;
        });

        if (map.shipping_company_name !== undefined) setShippingCompany(map.shipping_company_name);
        if (map.shipping_delivery_time !== undefined) setShippingDeliveryTime(map.shipping_delivery_time);
        if (map.free_shipping_threshold !== undefined) setFreeShippingThreshold(map.free_shipping_threshold);
        if (map.shipping_fee !== undefined) setShippingFee(map.shipping_fee);

        if (map.mng_kargo_active !== undefined) setMngActive(map.mng_kargo_active);
        if (map.mng_customer_number !== undefined) setMngCustomerNumber(map.mng_customer_number);
        if (map.mng_password !== undefined) setMngPassword(map.mng_password);
        if (map.mng_username !== undefined) setMngUsername(map.mng_username);
        if (map.mng_branch_name !== undefined) setMngBranchName(map.mng_branch_name);
        if (map.mng_barcode_prefix !== undefined) setMngBarcodePrefix(map.mng_barcode_prefix);

        if (map.payment_paytr_active !== undefined) setPaytrActive(map.payment_paytr_active);
        if (map.paytr_merchant_id !== undefined) setPaytrMerchantId(map.paytr_merchant_id);
        if (map.paytr_merchant_key !== undefined) setPaytrMerchantKey(map.paytr_merchant_key);
        if (map.paytr_merchant_salt !== undefined) setPaytrMerchantSalt(map.paytr_merchant_salt);
        if (map.paytr_test_mode !== undefined) setPaytrTestMode(map.paytr_test_mode);

        if (map.payment_bank_transfer_active !== undefined) setBankActive(map.payment_bank_transfer_active);
        if (map.bank_transfer_discount_rate !== undefined) setBankDiscountRate(map.bank_transfer_discount_rate);
        if (map.bank_transfer_accounts !== undefined) setBankAccounts(map.bank_transfer_accounts);

        if (map.payment_cod_active !== undefined) setCodActive(map.payment_cod_active);
        if (map.cash_on_delivery_fee !== undefined) setCodFee(map.cash_on_delivery_fee);

        if (map.dopigo_active !== undefined) setDopigoActive(map.dopigo_active);
        if (map.dopigo_api_token !== undefined) setDopigoApiToken(map.dopigo_api_token);
        if (map.dopigo_invoice_prefix !== undefined) setDopigoInvoicePrefix(map.dopigo_invoice_prefix);
      }
    } catch {
      setMessage('Ayarlar yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload: SettingItem[] = [
      { key: 'shipping_company_name', value: shippingCompany, label: 'Kargo Firması Adı', group: 'SHIPPING' },
      { key: 'shipping_delivery_time', value: shippingDeliveryTime, label: 'Tahmini Teslimat Süresi', group: 'SHIPPING' },
      { key: 'free_shipping_threshold', value: freeShippingThreshold, label: 'Ücretsiz Kargo Alt Limiti (TL)', group: 'SHIPPING' },
      { key: 'shipping_fee', value: shippingFee, label: 'Sabit Kargo Ücreti (TL)', group: 'SHIPPING' },

      { key: 'mng_kargo_active', value: mngActive, label: 'DHL / MNG Kargo Entegrasyonu Aktif/Pasif', group: 'SHIPPING' },
      { key: 'mng_customer_number', value: mngCustomerNumber, label: 'MNG Kargo Müşteri No / Abone No', group: 'SHIPPING' },
      { key: 'mng_password', value: mngPassword, label: 'MNG Kargo API Şifresi', group: 'SHIPPING' },
      { key: 'mng_username', value: mngUsername, label: 'MNG Kargo API Kullanıcı Adı', group: 'SHIPPING' },
      { key: 'mng_branch_name', value: mngBranchName, label: 'MNG Kargo Bağlı Şube', group: 'SHIPPING' },
      { key: 'mng_barcode_prefix', value: mngBarcodePrefix, label: 'MNG Kargo Barkod Ön Eki', group: 'SHIPPING' },

      { key: 'payment_paytr_active', value: paytrActive, label: 'PayTR Kredi Kartı Aktif/Pasif', group: 'PAYMENT' },
      { key: 'paytr_merchant_id', value: paytrMerchantId, label: 'PayTR Mağaza No (Merchant ID)', group: 'PAYMENT' },
      { key: 'paytr_merchant_key', value: paytrMerchantKey, label: 'PayTR Mağaza Parolası (Merchant Key)', group: 'PAYMENT' },
      { key: 'paytr_merchant_salt', value: paytrMerchantSalt, label: 'PayTR Mağaza Gizli Anahtarı (Merchant Salt)', group: 'PAYMENT' },
      { key: 'paytr_test_mode', value: paytrTestMode, label: 'PayTR Test/Canlı Modu', group: 'PAYMENT' },

      { key: 'payment_bank_transfer_active', value: bankActive, label: 'Banka Havalesi/EFT Aktif/Pasif', group: 'PAYMENT' },
      { key: 'bank_transfer_discount_rate', value: bankDiscountRate, label: 'Havale İndirim Oranı (%)', group: 'PAYMENT' },
      { key: 'bank_transfer_accounts', value: bankAccounts, label: 'Banka Hesap Bilgileri / IBAN', group: 'PAYMENT' },

      { key: 'payment_cod_active', value: codActive, label: 'Kapıda Nakit Ödeme Aktif/Pasif', group: 'PAYMENT' },
      { key: 'cash_on_delivery_fee', value: codFee, label: 'Kapıda Nakit Ödeme Hizmet Bedeli (TL)', group: 'PAYMENT' },

      { key: 'dopigo_active', value: dopigoActive, label: 'Dopigo / Sovos E-Fatura Aktif/Pasif', group: 'INVOICE' },
      { key: 'dopigo_api_token', value: dopigoApiToken, label: 'Dopigo REST API Token', group: 'INVOICE' },
      { key: 'dopigo_invoice_prefix', value: dopigoInvoicePrefix, label: 'E-Fatura Seri Ön Eki', group: 'INVOICE' },
    ];

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Kargo ve Ödeme ayarları başarıyla kaydedildi!');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert(data.message || 'Hata oluştu');
      }
    } catch {
      alert('Kaydedilirken bağlantı hatası oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık & Kaydet Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <CreditCard className="w-4 h-4" />
              <span>ÖDEME VE LOJİSTİK YAPILANDIRMASI</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Kargo ve Ödeme Ayarları</h1>
            <p className="text-sm text-slate-500">
              DHL/MNG Kargo API bilgileri, PayTR sanal POS, havale indirimi ve kapıda ödeme ücretleri
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-xs sm:text-sm font-semibold flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8 pb-12">
          {/* 1. KART: KARGO GENEL & TESLİMAT BAREMLERİ */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1B84F8] flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">1. Kargo & Teslimat Ayarları</h2>
                <p className="text-xs text-slate-500">Kargo firması, teslimat süreleri ve sepet kargo ücretleri</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kargo Firması Adı
                </label>
                <input
                  type="text"
                  value={shippingCompany}
                  onChange={(e) => setShippingCompany(e.target.value)}
                  placeholder="Örn: DHL Kargo (MNG Kargo)"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Sitede ve bilgilendirme metinlerinde görünen kargo adı</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tahmini Teslimat / Kargoya Veriliş Süresi
                </label>
                <input
                  type="text"
                  value={shippingDeliveryTime}
                  onChange={(e) => setShippingDeliveryTime(e.target.value)}
                  placeholder="Örn: 2-7 İş Günü"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Ürün detay ve kargo sayfalarında belirtilen süre</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ücretsiz Kargo Sepet Alt Limiti (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    placeholder="1500"
                    className="w-full bg-slate-50/60 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Bu tutar ve üzerindeki sepetlerde kargo otomatik bedava olur</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Sabit Kargo Ücreti (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    placeholder="99.90"
                    className="w-full bg-slate-50/60 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Ücretsiz kargo limiti altındaki siparişlere eklenecek ücret</p>
              </div>
            </div>
          </section>

          {/* 2. KART: DHL / MNG KARGO API ENTEGRASYONU */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">2. DHL / MNG Kargo API Entegrasyonu</h2>
                  <p className="text-xs text-slate-500">MNG Kargo şube ve müşteri bilgileri ile A5 otomatik etiket oluşturma</p>
                </div>
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {mngActive === '1' ? 'Aktif' : 'Pasif'}
                </span>
                <input
                  type="checkbox"
                  checked={mngActive === '1'}
                  onChange={(e) => setMngActive(e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            <div className="bg-red-50/60 border border-red-100 rounded-xl p-4 text-xs text-red-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-900">
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>MNG Kargo / DHL Entegrasyon Bilgileri:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-red-900">
                MNG Kargo şubenizden veya kurumsal temsilcinizden aldığınız <strong>Müşteri Numarasını (Abone Kodu)</strong> ve <strong>API Şifrenizi</strong> aşağıdaki alanlara giriniz. Tüm sipariş çıktıları A5 formatında sağ üstte taranabilir barkodlu resmi MNG kargo etiketiyle birlikte basılacaktır.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  MNG Müşteri / Abone No *
                </label>
                <input
                  type="text"
                  value={mngCustomerNumber}
                  onChange={(e) => setMngCustomerNumber(e.target.value.trim())}
                  placeholder="Örn: 12345678"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">MNG Kargo kurumsal müşteri numaranız</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  MNG API Şifresi *
                </label>
                <input
                  type="password"
                  value={mngPassword}
                  onChange={(e) => setMngPassword(e.target.value.trim())}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">MNG Kargo web servis şifreniz</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  MNG API Kullanıcı Adı (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={mngUsername}
                  onChange={(e) => setMngUsername(e.target.value.trim())}
                  placeholder="Varsa kullanıcı adınız"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Gerekiyorsa MNG servis kullanıcı adı</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Bağlı Bulunulan MNG Şubesi
                </label>
                <input
                  type="text"
                  value={mngBranchName}
                  onChange={(e) => setMngBranchName(e.target.value)}
                  placeholder="Örn: Bursa Yıldırım Şubesi"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Kargoların teslim edildiği şubeniz</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Barkod Ön Eki
                </label>
                <input
                  type="text"
                  maxLength={5}
                  value={mngBarcodePrefix}
                  onChange={(e) => setMngBarcodePrefix(e.target.value.toUpperCase().trim())}
                  placeholder="Örn: YP"
                  className="w-full sm:w-48 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold uppercase text-slate-900 focus:outline-hidden focus:border-red-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Etiket üzerindeki taranabilir barkod başlangıç harfleri</p>
              </div>
            </div>
          </section>

          {/* 3. KART: KREDİ KARTI / PAYTR SANAL POS AYARLARI */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">3. Kredi Kartı / Banka Kartı (PayTR Sanal POS)</h2>
                  <p className="text-xs text-slate-500">256-Bit SSL ve 3D Secure ile online kredi kartı tahsilatı</p>
                </div>
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {paytrActive === '1' ? 'Aktif' : 'Pasif'}
                </span>
                <input
                  type="checkbox"
                  checked={paytrActive === '1'}
                  onChange={(e) => setPaytrActive(e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            <div className="bg-purple-50/60 border border-purple-100 rounded-xl p-4 text-xs text-purple-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>PayTR Başvurusu ve API Bilgileri:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-purple-800">
                PayTR başvurunuz onaylandığında PayTR Mağaza Paneli (Entegrasyon &gt; API Bilgileri) sayfasında size verilen <strong>Mağaza No (Merchant ID)</strong>, <strong>Mağaza Parolası (Merchant Key)</strong> ve <strong>Gizli Anahtarı (Merchant Salt)</strong> aşağıdaki alanlara yapıştırmanız yeterlidir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  PayTR Mağaza No (Merchant ID) *
                </label>
                <input
                  type="text"
                  value={paytrMerchantId}
                  onChange={(e) => setPaytrMerchantId(e.target.value.trim())}
                  placeholder="Örn: 123456"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  PayTR Mağaza Parolası (Merchant Key) *
                </label>
                <input
                  type="text"
                  value={paytrMerchantKey}
                  onChange={(e) => setPaytrMerchantKey(e.target.value.trim())}
                  placeholder="Örn: aBCdEfGhIjKlMnOp"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  PayTR Mağaza Gizli Anahtarı (Merchant Salt) *
                </label>
                <input
                  type="text"
                  value={paytrMerchantSalt}
                  onChange={(e) => setPaytrMerchantSalt(e.target.value.trim())}
                  placeholder="Örn: xYz123AbC456"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Çalışma Modu
              </label>
              <select
                value={paytrTestMode}
                onChange={(e) => setPaytrTestMode(e.target.value)}
                className="w-full sm:w-64 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
              >
                <option value="1">Test Modu (Deneme Kartları Geçerli)</option>
                <option value="0">Canlı Mod (Gerçek Ödemeler Açık)</option>
              </select>
            </div>
          </section>

          {/* 4. KART: BANKA HAVALESİ / EFT AYARLARI & İNDİRİM */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">4. Banka Havalesi / EFT ile Ödeme & İndirim</h2>
                  <p className="text-xs text-slate-500">Havale seçen müşterilere özel yüzde indirim ve IBAN hesapları</p>
                </div>
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {bankActive === '1' ? 'Aktif' : 'Pasif'}
                </span>
                <input
                  type="checkbox"
                  checked={bankActive === '1'}
                  onChange={(e) => setBankActive(e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Havale İndirim Oranı */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Havale İndirim Oranı (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="50"
                    value={bankDiscountRate}
                    onChange={(e) => setBankDiscountRate(e.target.value)}
                    placeholder="5"
                    className="w-full bg-slate-50/60 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition"
                  />
                  <Percent className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Örn: <strong>%5</strong> girildiğinde müşteri ödeme sayfasında Havale'yi seçtiği anda sepet tutarından %5 anında düşer.
                </p>
              </div>

              {/* İndirim Önizleme Kartı */}
              <div className="md:col-span-2 bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-bold text-emerald-950 block">Müşteriye Görünen Canlı İndirim Kutusu:</span>
                  <p className="text-[11px] text-emerald-800">
                    Müşteri ödeme sayfasında Havale seçeneğine tıkladığında: <br />
                    <span className="inline-block bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-300 mt-0.5">
                      🎉 Havale ile ödeme seçtiğiniz için %{bankDiscountRate || '0'} indirimle ₺... kâr ettiniz!
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Banka Hesap Bilgileri / IBAN */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Banka Hesap Bilgileri & IBAN'lar *
              </label>
              <textarea
                rows={4}
                value={bankAccounts}
                onChange={(e) => setBankAccounts(e.target.value)}
                placeholder="Banka Adı, Alıcı Adı ve IBAN numaraları..."
                className="w-full bg-slate-50/60 border border-slate-300 rounded-xl p-3.5 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition leading-relaxed"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Sipariş onay sayfasında ve müşteriye giden e-postada yer alacak resmi banka hesapları
              </p>
            </div>
          </section>

          {/* 5. KART: KAPIDA NAKİT ÖDEME AYARLARI */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">5. Kapıda Nakit Ödeme Ayarları</h2>
                  <p className="text-xs text-slate-500">Kargo teslimatında nakit tahsilat ve hizmet bedeli</p>
                </div>
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {codActive === '1' ? 'Aktif' : 'Pasif'}
                </span>
                <input
                  type="checkbox"
                  checked={codActive === '1'}
                  onChange={(e) => setCodActive(e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-amber-600 rounded border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Kapıda Nakit Ödeme Hizmet Bedeli (TL)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={codFee}
                    onChange={(e) => setCodFee(e.target.value)}
                    placeholder="100"
                    className="w-full bg-slate-50/60 border border-slate-300 rounded-xl pl-8 pr-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white transition"
                  />
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₺</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Kargo firmasının tahsilatlı gönderi bedeli (0 girilirse ücretsiz olur)
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-4 text-xs text-amber-900 space-y-1">
                <span className="font-bold block">Kapıda Ödeme Bilgilendirmesi:</span>
                <p className="text-[11px] leading-relaxed text-amber-800">
                  Müşteri kapıda ödeme seçtiğinde, kargo teslimatı sırasında kargo görevlisine nakit olarak ödeme yapar. Bu bedel doğrudan sipariş toplamına eklenir.
                </p>
              </div>
            </div>
          </section>

          {/* 6. KART: E-FATURA & DOPİGO (SOVOS) ENTEGRASYONU */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1B84F8] flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">6. E-Fatura Entegrasyonu (Dopigo & Sovos)</h2>
                  <p className="text-xs text-slate-500">Sipariş detayından tek tıkla GİB onaylı E-Arşiv / E-Fatura kesme altyapısı</p>
                </div>
              </div>

              {/* Aktif/Pasif Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs font-bold text-slate-700">
                  {dopigoActive === '1' ? 'Aktif' : 'Pasif'}
                </span>
                <input
                  type="checkbox"
                  checked={dopigoActive === '1'}
                  onChange={(e) => setDopigoActive(e.target.checked ? '1' : '0')}
                  className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                />
              </label>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <ShieldCheck className="w-4 h-4 text-[#1B84F8]" />
                <span>Dopigo & Sovos Entegrasyon Bilgisi:</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                Dopigo panelinizden (<strong>panel.dopigo.com</strong> &gt; Ayarlar &gt; API Bilgileri) aldığınız <strong>API Token</strong>'ı aşağıya yapıştırınız. Token girildiğinde sipariş yönetim detayından tek tıkla Sovos aracılığıyla GİB onaylı fatura oluşturulup resmi PDF linki üretilecektir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Dopigo REST API Token *
                </label>
                <input
                  type="password"
                  value={dopigoApiToken}
                  onChange={(e) => setDopigoApiToken(e.target.value.trim())}
                  placeholder="Örn: 9a8b7c6d5e4f3g2h1..."
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-semibold text-slate-900 focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">Dopigo REST API yetkilendirme anahtarı</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Fatura Seri Ön Eki (Opsiyonel)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={dopigoInvoicePrefix}
                  onChange={(e) => setDopigoInvoicePrefix(e.target.value.toUpperCase().trim())}
                  placeholder="Örn: YZR"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-[#1B84F8] focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-500 mt-1">GİB fatura serisi için 3 haneli harf kodu (Örn: YZR)</p>
              </div>
            </div>
          </section>

          {/* Alt Kaydet Butonu */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving || loading}
              className="px-8 py-3.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-[#1B84F8]/25 transition cursor-pointer disabled:opacity-50 uppercase tracking-wide"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
