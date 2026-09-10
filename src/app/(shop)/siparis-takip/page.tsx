'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle2, 
  Scissors, 
  Truck, 
  FileText, 
  AlertCircle,
  ExternalLink,
  MapPin,
  Calendar
} from 'lucide-react';
import Link from 'next/link';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phoneOrEmail, setPhoneOrEmail] = useState(initialPhone);
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber || !phoneOrEmail) {
      setError('Lütfen sipariş numaranızı ve telefon/e-posta bilginizi giriniz.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/shop/order-tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phoneOrEmail }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setOrder(data.data);
      } else {
        setOrder(null);
        setError(data.error || 'Sipariş bulunamadı. Lütfen bilgilerinizi kontrol ediniz.');
      }
    } catch {
      setError('Sorgulama yapılırken bir bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      handleSearch();
    }
  }, [initialOrderNumber, initialPhone]);

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    // 1: Sipariş Alındı (PENDING / CONFIRMED)
    // 2: Üretimde (IN_PRODUCTION)
    // 3: Kargoya Verildi (SHIPPED)
    // 4: Teslim Edildi (DELIVERED)
    const statusOrder: Record<string, number> = {
      PENDING: 1,
      CONFIRMED: 1,
      IN_PRODUCTION: 2,
      SHIPPED: 3,
      DELIVERED: 4,
    };
    const currentStep = statusOrder[currentStatus] || 1;
    if (currentStep > stepIndex) return 'COMPLETED';
    if (currentStep === stepIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  const steps = [
    { 
      title: '1. Siparişiniz Alındı', 
      desc: 'Sipariş kaydınız sisteme başarıyla ulaştı ve onaylandı.' 
    },
    { 
      title: '2. Siparişiniz Üretimde', 
      desc: 'Atölyemizde perde kesim, dikim ve montaj aşamasındadır.' 
    },
    { 
      title: '3. Kargoya Verildi', 
      desc: 'Özel korunaklı paketiniz MNG Kargo firmasına teslim edildi.' 
    },
    { 
      title: '4. Teslim Edildi', 
      desc: 'Siparişiniz adresinize başarıyla ulaştırıldı.' 
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Sipariş Durumu ve Kargo Takibi
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Özel ölçülü perde siparişinizin imalat, dikim ve MNG Kargo süreçlerini anlık takip edin.
        </p>
      </div>

      {/* Sorgulama Formu */}
      <form
        onSubmit={handleSearch}
        className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs mb-8 space-y-4"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Sipariş Numarası *
            </label>
            <input
              type="text"
              placeholder="Örn: YP2609101234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase focus:outline-hidden focus:border-[#1B84F8]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Telefon veya E-Posta *
            </label>
            <input
              type="text"
              placeholder="Sipariş verirken girdiğiniz telefon veya e-posta"
              value={phoneOrEmail}
              onChange={(e) => setPhoneOrEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-hidden focus:border-[#1B84F8]"
              required
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white py-3.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-[#1B84F8]/25 transition cursor-pointer uppercase tracking-wider"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Sorgulanıyor...' : 'Siparişimi Sorgula'}</span>
        </button>
      </form>

      {/* Sipariş Sonucu & Canlı İlerleme Çubuğu */}
      {order && (
        <div className="space-y-6 animate-in fade-in">
          {/* Sipariş Özet Bilgisi */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sipariş Numarası</span>
              <span className="text-xl font-black text-slate-900 font-mono">#{order.orderNumber}</span>
              <span className="text-xs text-slate-500 block mt-0.5 font-bold">
                Alıcı: {order.customerName} {order.customerSurname}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Sipariş Tarihi</span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Toplam Tutar</span>
              <span className="text-xl font-black text-[#1B84F8]">₺{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* 4 AŞAMALI SİPARİŞ İLERLEME ÇUBUĞU */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1B84F8]" />
              <span>Sipariş İlerleme Süreci</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const state = getStepStatus(stepNum, order.status);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                      state === 'COMPLETED'
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : state === 'CURRENT'
                        ? 'bg-blue-50/80 border-[#1B84F8] ring-2 ring-[#1B84F8]/20'
                        : 'bg-slate-50 border-slate-200/80 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          state === 'COMPLETED'
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : state === 'CURRENT'
                            ? 'bg-[#1B84F8] text-white shadow-md shadow-[#1B84F8]/30 animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {state === 'COMPLETED' ? <CheckCircle2 className="w-4 h-4" /> : stepNum}
                      </div>

                      {state === 'CURRENT' && (
                        <span className="bg-[#1B84F8] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          Şu Anki Aşama
                        </span>
                      )}
                      {state === 'COMPLETED' && (
                        <span className="text-emerald-700 text-[10px] font-bold">
                          Tamamlandı ✓
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className={`text-xs font-black ${state === 'CURRENT' ? 'text-[#1B84F8]' : 'text-slate-900'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MNG KARGO TAKİP KUTUSU (Kargo Takip No varsa veya Kargoya Verildiyse) */}
          {(order.trackingNumber || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 sm:p-7 rounded-3xl shadow-lg shadow-emerald-500/20 flex flex-col sm:flex-row items-center justify-between gap-5 animate-in fade-in">
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shrink-0 border border-white/30">
                  <Truck className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-100 tracking-wider block">
                    {order.shippingCompany || 'DHL Kargo (MNG Kargo)'}
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-emerald-100">Takip Numarası:</span>
                    <span className="font-mono text-base font-black bg-white text-emerald-950 px-3 py-0.5 rounded-lg select-all shadow-xs">
                      {order.trackingNumber || 'Sistemde Kayıtlı'}
                    </span>
                  </div>
                  {order.dispatchedAt && (
                    <span className="text-[11px] text-emerald-100 mt-1 block">
                      Kargoya Veriliş: {new Date(order.dispatchedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>

              {order.trackingNumber && (
                <a
                  href={order.trackingUrl || `https://www.mngkargo.com.tr/gonderitakip?takipno=${order.trackingNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto bg-white hover:bg-slate-100 text-emerald-900 px-6 py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition text-center shrink-0 cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-emerald-700" />
                  <span>Kargomu Canlı Takip Et (MNG) ↗</span>
                </a>
              )}
            </div>
          )}

          {/* Siparişteki Özel Ölçülü Perdeler */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#1B84F8]" />
              <span>Siparişteki Özel Ölçülü Perdeler ({order.items?.length})</span>
            </h3>

            <div className="divide-y divide-slate-100 space-y-3">
              {order.items?.map((item: any) => {
                let snap: Record<string, any> = {};
                try {
                  if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
                } catch {}

                return (
                  <div key={item.id} className="pt-3 first:pt-0 flex justify-between items-start gap-4">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 block font-bold">{item.productSku}</span>
                      <h4 className="text-xs font-black text-slate-900">{item.productName}</h4>
                      <div className="text-[11px] text-slate-600 mt-1">
                        <strong>Ölçü:</strong> {item.width} x {item.height} cm ({item.calculatedArea} m²) • {item.quantity} Adet
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {[snap.pleatLabel, snap.caseType, snap.mountingLabel].filter(Boolean).join(' • ')}
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">₺{item.totalPrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sipariş Hareket Geçmişi (Timeline) */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1B84F8]" />
                <span>Sipariş Geçmiş Hareketleri</span>
              </h3>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
                {order.timeline.map((step: any) => (
                  <div key={step.id} className="relative">
                    <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#1B84F8] border-2 border-white flex items-center justify-center shadow-xs" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(step.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {step.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{step.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Yükleniyor...</div>}>
        <OrderTrackingContent />
      </Suspense>
    </main>
  );
}
