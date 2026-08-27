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
  Phone
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
    const statusOrder: Record<string, number> = {
      PENDING: 1,
      CONFIRMED: 2,
      IN_PRODUCTION: 3,
      SHIPPED: 4,
      DELIVERED: 5,
    };
    const currentStep = statusOrder[currentStatus] || 1;
    if (currentStep > stepIndex) return 'COMPLETED';
    if (currentStep === stepIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  const steps = [
    { title: 'Sipariş Alındı', desc: 'Sipariş kaydınız oluşturuldu.' },
    { title: 'Ödeme Onaylandı', desc: 'Ödemeniz teyit edildi.' },
    { title: 'Atölyede Üretimde', desc: 'Kumaşınız kesiliyor ve dikiliyor.' },
    { title: 'Kargoya Verildi', desc: 'Siparişiniz kargo firmasına teslim edildi.' },
    { title: 'Teslim Edildi', desc: 'Paketiniz adresinize ulaştı.' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          Sipariş Durumu Sorgulama
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Özel ölçülü perde siparişinizin dikim, üretim ve kargo aşamalarını anlık takip edin.
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
              placeholder="Örn: YP-260826-1234"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase focus:outline-none focus:border-[#1B84F8]"
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
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B84F8]"
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
          className="w-full bg-[#1B84F8] hover:bg-[#156cd1] text-white py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1B84F8]/25 transition cursor-pointer"
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
              <span className="text-[10px] text-slate-400 font-semibold block">Sipariş No</span>
              <span className="text-lg font-black text-slate-900">{order.orderNumber}</span>
              <span className="text-xs text-slate-500 block mt-0.5">Alıcı: {order.customerName} {order.customerSurname}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Sipariş Tarihi</span>
              <span className="text-xs font-bold text-slate-800">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">Toplam Tutar</span>
              <span className="text-lg font-black text-[#1B84F8]">₺{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* 5 Aşamalı Canlı Timeline Barı */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-6">
              Sipariş İlerleme Durumu
            </h3>

            <div className="relative flex flex-col md:flex-row justify-between gap-6 md:gap-2">
              {steps.map((step, idx) => {
                const stepNum = idx + 1;
                const state = getStepStatus(stepNum, order.status);

                return (
                  <div key={idx} className="flex md:flex-col items-center md:items-center gap-3 text-left md:text-center flex-1 relative">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-black text-xs transition ${
                        state === 'COMPLETED'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                          : state === 'CURRENT'
                          ? 'bg-[#1B84F8] text-white shadow-md shadow-[#1B84F8]/30 ring-4 ring-[#1B84F8]/20 animate-pulse'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {state === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : stepNum}
                    </div>

                    <div>
                      <h4 className={`text-xs font-bold ${state === 'CURRENT' ? 'text-[#1B84F8]' : 'text-slate-900'}`}>
                        {step.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 mt-0.5 max-w-[140px] md:mx-auto">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Siparişteki Perdeler */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
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
                      <span className="font-mono text-[10px] text-slate-400 block">{item.productSku}</span>
                      <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                      <div className="text-[11px] text-slate-600 mt-1">
                        <strong>Ölçü:</strong> {item.width} x {item.height} cm ({item.calculatedArea} m²) • {item.quantity} Adet
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {snap.pleatLabel || snap.caseType || snap.mountingLabel || ''}
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900">₺{item.totalPrice.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
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