'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Building2, 
  UserCheck, 
  Truck, 
  ArrowLeft, 
  ChevronRight
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Müşteri & İletişim Bilgileri
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Teslimat Adresi
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Fatura Tipi
  const [invoiceType, setInvoiceType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [identityNumber, setIdentityNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Farklı Fatura Adresi
  const [sameInvoiceAddress, setSameInvoiceAddress] = useState(true);
  const [invoiceAddressLine, setInvoiceAddressLine] = useState('');

  // Sipariş Notu & Sözleşmeler
  const [orderNote, setOrderNote] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Ödeme Yöntemi
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY'>('CREDIT_CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const freeShippingThreshold = 1500;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 75;
  const codFee = paymentMethod === 'CASH_ON_DELIVERY' ? 35 : 0;
  const grandTotal = subtotal + shippingFee + codFee;

  // Sipariş başarıyla oluşturulduğunda veya gönderilirken yönlendirme ekranı göster (Sepetiniz Boş çıkmasını engeller)
  if (isSubmitting || isSuccess) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 p-8 rounded-sm bg-white shadow-sm space-y-4 animate-in fade-in">
          <div className="w-10 h-10 border-3 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h1 className="text-base font-bold text-slate-900">Siparişiniz Hazırlanıyor...</h1>
            <p className="text-xs text-slate-500 mt-1">Lütfen bekleyiniz, sipariş onay sayfasına yönlendiriliyorsunuz.</p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 p-8 rounded-sm bg-white">
          <h1 className="text-lg font-bold text-slate-900 mb-2">Sepetiniz Boş</h1>
          <p className="text-xs text-slate-500 mb-6">Ödeme adımına geçebilmek için lütfen sepetinize ürün ekleyin.</p>
          <Link href="/" className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-6 py-2.5 rounded-sm text-xs font-bold inline-block transition">
            Alışverişe Başla
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmitOrder = async () => {
    if (!email || !phone || !firstName || !lastName || !city || !district || !addressLine) {
      setErrorMessage('Lütfen tüm zorunlu iletişim ve teslimat adresi alanlarını doldurunuz.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Lütfen Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Koşullarını onaylayınız.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone,
          firstName,
          lastName,
          city,
          district,
          addressLine,
          postalCode,
          invoiceType,
          identityNumber,
          companyName,
          taxOffice,
          taxNumber,
          sameInvoiceAddress,
          invoiceAddressLine,
          orderNote,
          paymentMethod,
          items,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.redirectUrl) {
        setIsSuccess(true);
        clearCart();
        router.push(data.data.redirectUrl);
      } else {
        setErrorMessage(data.error || 'Sipariş oluşturulamadı');
        setIsSubmitting(false);
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu, lütfen tekrar deneyiniz');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/sepet" className="hover:text-slate-900 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Sepete Dön</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">Güvenli Ödeme & Teslimat</span>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-sm text-xs font-bold mb-6">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Form Alanları */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. İletişim Bilgileri */}
          <div className="border border-slate-200 rounded-sm p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1B84F8]" />
                <span>1. İletişim Bilgileri (Hızlı Sipariş)</span>
              </h2>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">
                Üyeliksiz Tamamlama
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  placeholder="siparis@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Cep Telefonu *</label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Teslimat Adresi */}
          <div className="border border-slate-200 rounded-sm p-5 space-y-4 bg-white">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1B84F8]" />
              <span>2. Teslimat Adresi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Adınız *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Soyadınız *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">İl (Şehir) *</label>
                <input
                  type="text"
                  placeholder="İstanbul"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">İlçe *</label>
                <input
                  type="text"
                  placeholder="Kadıköy"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Açık Adres (Cadde, Mahalle, Kapı No) *</label>
                <textarea
                  rows={2}
                  placeholder="Mahalle, Cadde/Sokak, Bina ve Daire No"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Fatura Türü */}
          <div className="border border-slate-200 rounded-sm p-5 space-y-4 bg-white">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1B84F8]" />
              <span>3. Fatura Bilgileri</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setInvoiceType('INDIVIDUAL')}
                className={`py-2 px-3 rounded-sm border font-bold transition cursor-pointer ${
                  invoiceType === 'INDIVIDUAL'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Bireysel Fatura
              </button>
              <button
                type="button"
                onClick={() => setInvoiceType('CORPORATE')}
                className={`py-2 px-3 rounded-sm border font-bold transition cursor-pointer ${
                  invoiceType === 'CORPORATE'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                Kurumsal Fatura (Şirket)
              </button>
            </div>

            {invoiceType === 'INDIVIDUAL' ? (
              <div className="text-xs">
                <label className="block font-semibold text-slate-700 mb-1">T.C. Kimlik No (Opsiyonel)</label>
                <input
                  type="text"
                  maxLength={11}
                  placeholder="11111111111"
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-700 mb-1">Firma Resmi Ünvanı *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Vergi Dairesi *</label>
                  <input
                    type="text"
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vergi No *</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Ödeme Yöntemi Seçimi */}
          <div className="border border-slate-200 rounded-sm p-5 space-y-3 bg-white">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#1B84F8]" />
              <span>4. Ödeme Yöntemi</span>
            </h2>

            <div className="space-y-2 text-xs">
              <label
                className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition ${
                  paymentMethod === 'CREDIT_CARD'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="text-[#1B84F8]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Kredi Kartı / Banka Kartı (PayTR 3D Secure)</span>
                    <span className="text-[10px] text-slate-500">Tüm bankaların kartlarıyla 12 aya varan taksit imkanı</span>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-slate-400" />
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition ${
                  paymentMethod === 'BANK_TRANSFER'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'BANK_TRANSFER'}
                    onChange={() => setPaymentMethod('BANK_TRANSFER')}
                    className="text-[#1B84F8]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Banka Havalesi / EFT</span>
                    <span className="text-[10px] text-slate-500">Hesaplarımıza doğrudan transfer</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-sm">
                  IBAN
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer transition ${
                  paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment_method"
                    checked={paymentMethod === 'CASH_ON_DELIVERY'}
                    onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
                    className="text-[#1B84F8]"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">Kapıda Nakit Ödeme (+35 TL Hizmet Bedeli)</span>
                    <span className="text-[10px] text-slate-500">Kargo teslimatı sırasında nakit ödeme</span>
                  </div>
                </div>
                <Truck className="w-4 h-4 text-slate-400" />
              </label>
            </div>
          </div>
        </div>

        {/* SAĞ: Sipariş Özeti & Onay */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-slate-200 rounded-sm p-5 bg-slate-50/70 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Sipariş Kalemleri ({items.length})
            </h3>

            {/* Kalemler */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-200 pr-1 space-y-2.5">
              {items.map((item) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex gap-3 text-xs">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-14 object-cover rounded-sm border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {item.width}x{item.height} cm • {item.quantity} Adet
                    </p>
                    <span className="font-extrabold text-slate-950 block mt-0.5">
                      ₺{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Fiyat Kırılımı */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span className="font-bold text-slate-900">₺{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Kargo Bedeli:</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">Ücretsiz</span>
                ) : (
                  <span className="font-bold text-slate-900">₺{shippingFee.toFixed(2)}</span>
                )}
              </div>
              {codFee > 0 && (
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Kapıda Ödeme Bedeli:</span>
                  <span>₺{codFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Genel Toplam */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-900">Ödenecek Tutar:</span>
              <span className="text-2xl font-extrabold text-slate-950">
                ₺{grandTotal.toFixed(2)}
              </span>
            </div>

            {/* Sözleşme Onay */}
            <div className="pt-2">
              <label className="flex items-start gap-2 text-[11px] text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8] mt-0.5"
                />
                <span>
                  <Link href="/sayfalar/mesafeli-satis-sozlesmesi" target="_blank" className="text-slate-900 underline font-bold">
                    Mesafeli Satış Sözleşmesi
                  </Link>
                  'ni okudum ve onaylıyorum.
                </span>
              </label>
            </div>

            {/* Buton */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmitOrder}
              className="w-full bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white py-3.5 px-4 rounded-sm text-xs font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wide transition cursor-pointer shadow-xs"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting ? 'Sipariş Kaydediliyor...' : `Siparişi ve Ödemeyi Tamamla (₺${grandTotal.toFixed(2)})`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL Güvenli Alışveriş Güvencesi</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}