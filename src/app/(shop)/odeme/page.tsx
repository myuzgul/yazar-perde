'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Building2, 
  UserCheck, 
  Truck, 
  ArrowLeft, 
  ChevronRight,
  CheckCircle2,
  Tag,
  Sparkles,
  X
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  // Giriş Yapmış Kullanıcı Bilgisi
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Müşteri & İletişim Bilgileri
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Otomatik Üyelik Oluşturma State
  const [createAccount, setCreateAccount] = useState(false);
  const [accountPassword, setAccountPassword] = useState('');

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

  // PayTR iFrame State
  const [paytrIframeToken, setPaytrIframeToken] = useState<string | null>(null);
  const [showPaytrModal, setShowPaytrModal] = useState(false);
  const [activeOrderNumber, setActiveOrderNumber] = useState<string | null>(null);

  // Kupon State'leri
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; amount: number; desc: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Dinamik Sistem Ayarları (Kargo & Kapıda Ödeme)
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.email) setEmail(data.user.email);
          if (data.user.name) setFirstName(data.user.name);
          if (data.user.surname) setLastName(data.user.surname);
          if (data.user.phone) setPhone(data.user.phone);
        }
      })
      .catch(() => {});

    fetch('/api/settings/public')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
          if (data.data.payment_paytr_active === 0) {
            if (data.data.payment_bank_transfer_active !== 0) {
              setPaymentMethod('BANK_TRANSFER');
            } else if (data.data.payment_cod_active !== 0) {
              setPaymentMethod('CASH_ON_DELIVERY');
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          userEmail: email || currentUser?.email,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount({
          code: data.data.code,
          amount: data.data.discountAmount,
          desc: data.data.descriptionText,
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Geçersiz kupon kodu');
      }
    } catch {
      setCouponError('Kupon uygulanırken hata oluştu');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const paytrActive = settings?.payment_paytr_active !== 0;
  const bankActive = settings?.payment_bank_transfer_active !== 0;
  const codActive = settings?.payment_cod_active !== 0;
  const bankDiscountRate = Number(settings?.bank_transfer_discount_rate ?? 5);

  const freeShippingThreshold = settings?.free_shipping_threshold ?? 1500;
  const standardShippingFee = settings?.shipping_fee ?? 99.90;
  const standardCodFee = settings?.cash_on_delivery_fee ?? 100;

  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : standardShippingFee;
  const codFee = paymentMethod === 'CASH_ON_DELIVERY' ? standardCodFee : 0;
  
  const couponDiscountAmount = couponDiscount ? couponDiscount.amount : 0;
  const subtotalAfterCoupon = Math.max(0, subtotal - couponDiscountAmount);
  
  // Havale İndirimi Hesaplama
  const bankDiscountAmount = (paymentMethod === 'BANK_TRANSFER' && bankDiscountRate > 0)
    ? Number(((subtotalAfterCoupon * bankDiscountRate) / 100).toFixed(2))
    : 0;

  const totalDiscount = couponDiscountAmount + bankDiscountAmount;
  const grandTotal = Math.max(0, Number((subtotal - totalDiscount + shippingFee + codFee).toFixed(2)));

  // Sipariş başarıyla oluşturulduğunda yönlendirme ekranı
  if (isSubmitting && !showPaytrModal) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 p-8 rounded-2xl bg-white shadow-sm space-y-4 animate-in fade-in">
          <div className="w-10 h-10 border-3 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
          <div>
            <h1 className="text-base font-bold text-slate-900">
              {paymentMethod === 'CREDIT_CARD' ? 'PayTR Güvenli Ödeme Ekranı Hazırlanıyor...' : 'Siparişiniz Hazırlanıyor...'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Lütfen bekleyiniz, işlem tamamlanıyor.</p>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0 && !showPaytrModal && !isSuccess) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 p-8 rounded-2xl bg-white">
          <h1 className="text-lg font-bold text-slate-900 mb-2">Sepetiniz Boş</h1>
          <p className="text-xs text-slate-500 mb-6">Ödeme adımına geçebilmek için lütfen sepetinize ürün ekleyin.</p>
          <Link href="/" className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-6 py-2.5 rounded-xl text-xs font-bold inline-block transition">
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
          createAccount,
          accountPassword,
          couponCode: couponDiscount?.code || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // PayTR Kredi Kartı iFrame Ödeme Akışı
        if (paymentMethod === 'CREDIT_CARD' && data.data?.isIframe && data.data?.paytrToken) {
          setPaytrIframeToken(data.data.paytrToken);
          setActiveOrderNumber(data.data.orderNumber);
          setShowPaytrModal(true);
          setIsSubmitting(false);
          return;
        }

        // Havale / Kapıda Ödeme Akışı
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
      {/* PayTR Resizer Script */}
      <Script 
        src="https://www.paytr.com/js/iframeResizer.min.js" 
        strategy="lazyOnload" 
      />

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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs font-bold mb-6">
          {errorMessage}
        </div>
      )}

      {/* PAYTR 3D SECURE MODAL */}
      {showPaytrModal && paytrIframeToken && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[96vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Başlık */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <span>PayTR 3D Secure Güvenli Kart Ödemesi</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">Sipariş No: #{activeOrderNumber}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Ödeme penceresini kapatmak istediğinize emin misiniz? Siparişiniz ödeme bekliyor durumunda kalacaktır.')) {
                    setShowPaytrModal(false);
                  }
                }}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PayTR iframe */}
            <div className="flex-1 overflow-y-auto p-1 sm:p-3 bg-slate-50 min-h-[580px]">
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${paytrIframeToken}`}
                id="paytriframe"
                frameBorder="0"
                scrolling="no"
                style={{ width: '100%', minHeight: '580px', border: 'none' }}
                className="rounded-xl w-full"
                onLoad={() => {
                  if (typeof (window as any).iFrameResize === 'function') {
                    (window as any).iFrameResize({}, '#paytriframe');
                  }
                }}
              />
            </div>

            {/* Alt Güvenlik Bildirimi */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kart bilgileriniz 256-Bit SSL ve PCI-DSS Level 1 güvencesiyle doğrudan bankaya iletilir.</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Ödemeyi iptal etmek istediğinize emin misiniz?')) {
                    setShowPaytrModal(false);
                  }
                }}
                className="text-red-600 hover:underline font-bold shrink-0 cursor-pointer"
              >
                Ödemeyi İptal Et
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Form Alanları */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. İletişim Bilgileri */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#1B84F8]" />
                <span>1. İletişim Bilgileri</span>
              </h2>
              {currentUser ? (
                <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#1B84F8]" />
                  <span>Kayıtlı Üye ({currentUser.name})</span>
                </span>
              ) : (
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  Hızlı Sipariş / Üyeliksiz
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  placeholder="siparis@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  required
                />
              </div>
            </div>

            {/* Misafir Kullanıcı İçin Kolay Üyelik Seçeneği */}
            {!currentUser && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={createAccount}
                    onChange={(e) => setCreateAccount(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#1B84F8] rounded border-slate-300"
                  />
                  <span>Bu bilgilerle üye hesabı oluştur (Siparişimi takip etmek istiyorum)</span>
                </label>

                {createAccount && (
                  <div className="pl-6 pt-1 animate-in fade-in">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Hesap Şifrenizi Belirleyin *</label>
                    <input
                      type="password"
                      placeholder="En az 6 karakterli şifre"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      className="w-full sm:w-64 border border-slate-300 rounded-xl px-3.5 py-2 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Teslimat Adresi */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Soyadınız *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* 3. Fatura Türü */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1B84F8]" />
              <span>3. Fatura Bilgileri</span>
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setInvoiceType('INDIVIDUAL')}
                className={`py-2.5 px-3 rounded-xl border font-bold transition cursor-pointer ${
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
                className={`py-2.5 px-3 rounded-xl border font-bold transition cursor-pointer ${
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
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
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
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Vergi Dairesi *</label>
                  <input
                    type="text"
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vergi No *</label>
                  <input
                    type="text"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Ödeme Yöntemi Seçimi */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-4 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#1B84F8]" />
                <span>4. Ödeme Yöntemi</span>
              </h2>
              {paymentMethod === 'BANK_TRANSFER' && bankDiscountRate > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1 animate-in fade-in">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>%{bankDiscountRate} Havale Kazancı</span>
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              {/* Kredi Kartı / PayTR */}
              {paytrActive && (
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900'
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
                      <span className="font-bold text-slate-900 block text-xs">Kredi Kartı / Banka Kartı (PayTR 3D Secure)</span>
                      <span className="text-[10px] text-slate-500">Tüm bankaların kartlarıyla 12 aya varan taksit imkanı • 256-Bit SSL Güvencesi</span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-600" />
                </label>
              )}

              {/* Banka Havalesi / EFT */}
              {bankActive && (
                <div className="space-y-2">
                  <label
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                      paymentMethod === 'BANK_TRANSFER'
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={paymentMethod === 'BANK_TRANSFER'}
                        onChange={() => setPaymentMethod('BANK_TRANSFER')}
                        className="text-emerald-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 block text-xs">Banka Havalesi / EFT</span>
                          {bankDiscountRate > 0 && (
                            <span className="text-[10px] font-black text-white bg-emerald-600 px-1.5 py-0.5 rounded">
                              %{bankDiscountRate} İNDİRİM
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">Resmi şirket banka hesaplarımıza doğrudan transfer</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded">
                      IBAN
                    </span>
                  </label>

                  {/* Havale Seçildiğinde Açılan Canlı Kâr & Bilgi Kutusu */}
                  {paymentMethod === 'BANK_TRANSFER' && (
                    <div className="p-3.5 bg-emerald-50/90 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
                      <div className="flex items-start gap-2 text-emerald-950">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-black text-emerald-900">
                            🎉 Havale ile ödeme seçtiğiniz için %{bankDiscountRate} indirimle ₺{bankDiscountAmount.toFixed(2)} kâr ettiniz!
                          </p>
                          <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                            Bu indirim ödenecek toplam tutarınıza anında yansıtılmıştır. Siparişinizi onayladıktan sonra verilecek sipariş numarası ile ödemenizi yapabilirsiniz.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Kapıda Nakit Ödeme */}
              {codActive && (
                <label
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${
                    paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-900'
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
                      <span className="font-bold text-slate-900 block text-xs">
                        Kapıda Nakit Ödeme {standardCodFee > 0 ? `(+₺${standardCodFee.toFixed(2)} Hizmet Bedeli)` : '(Ücretsiz)'}
                      </span>
                      <span className="text-[10px] text-slate-500">Kargo teslimatı sırasında kuryeye nakit ödeme</span>
                    </div>
                  </div>
                  <Truck className="w-4 h-4 text-slate-400" />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* SAĞ: Sipariş Özeti & Onay */}
        <div className="lg:col-span-5 space-y-6">
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-4">
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
                    className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
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

            {/* Kupon Kodu Alanı */}
            <div className="pt-3 border-t border-slate-200">
              {couponDiscount ? (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-xs text-emerald-900 block">{couponDiscount.code}</span>
                      <span className="text-[10px] text-emerald-700">{couponDiscount.desc}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCouponDiscount(null)}
                    className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="İndirim Kupon Kodu"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                        className="w-full bg-white border border-slate-300 rounded-xl pl-7 pr-2 py-2 text-xs uppercase font-mono placeholder:normal-case focus:outline-hidden focus:border-[#1B84F8]"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    </div>
                    <button
                      type="button"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      {isApplyingCoupon ? '...' : 'Uygula'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] font-semibold text-red-600 animate-in fade-in">{couponError}</p>
                  )}
                </div>
              )}
            </div>

            {/* Fiyat Kırılımı */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Ara Toplam:</span>
                <span className="font-bold text-slate-900">₺{subtotal.toFixed(2)}</span>
              </div>
              {couponDiscount && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Kupon İndirimi ({couponDiscount.code}):</span>
                  <span>-₺{couponDiscount.amount.toFixed(2)}</span>
                </div>
              )}
              {paymentMethod === 'BANK_TRANSFER' && bankDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Havale İndirimi (%{bankDiscountRate}):</span>
                  </span>
                  <span>-₺{bankDiscountAmount.toFixed(2)}</span>
                </div>
              )}
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
              <span className="text-2xl font-black text-slate-950">
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
                  className="w-3.5 h-3.5 rounded border-slate-300 text-[#1B84F8] mt-0.5"
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
              className="w-full bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 uppercase tracking-wide transition cursor-pointer shadow-lg shadow-[#1B84F8]/20"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Sipariş Kaydediliyor...' 
                  : paymentMethod === 'CREDIT_CARD'
                    ? `Kartla Güvenli Öde (₺${grandTotal.toFixed(2)})`
                    : `Siparişi Onayla (₺${grandTotal.toFixed(2)})`
                }
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
