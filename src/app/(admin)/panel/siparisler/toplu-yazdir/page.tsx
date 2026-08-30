'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2, Package, AlertCircle } from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  curtainType: string;
  width: number;
  height: number;
  quantity: number;
  calculatedArea?: number;
  selectedOptionsSnapshot?: string;
  itemNote?: string | null;
}

interface OrderAddress {
  id: string;
  isBilling: boolean;
  name: string;
  surname: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string | null;
  grandTotal: number;
  createdAt: string;
  isPrinted: boolean;
  printCount: number;
  items: OrderItem[];
  addresses: OrderAddress[];
}

function TopluYazdirContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawIds = searchParams.get('ids') || '';
  const orderIds = rawIds.split(',').map((s) => s.trim()).filter(Boolean);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarked, setIsMarked] = useState(false);

  useEffect(() => {
    if (orderIds.length === 0) {
      setLoading(false);
      return;
    }

    // Seçilen tüm siparişleri API üzerinden çek
    fetch('/api/admin/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          const matched = data.data.filter((o: Order) => orderIds.includes(o.id));
          setOrders(matched);

          // Arka planda hepsini 'Yazdırıldı' olarak güncelle
          if (matched.length > 0) {
            fetch('/api/admin/orders/mark-printed', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderIds: matched.map((m: any) => m.id) }),
            })
              .then(() => setIsMarked(true))
              .catch(console.error);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [rawIds]);

  const handlePrint = () => {
    // Yazdırma işlemi başlatılmadan önce teyit amacıyla tekrar mark et
    fetch('/api/admin/orders/mark-printed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderIds: orders.map((o) => o.id) }),
    }).catch(console.error);

    window.print();
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-sm font-bold text-slate-600">
        <div className="w-8 h-8 border-3 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Seçilen sipariş iş fişleri hazırlanıyor...</span>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-12 max-w-lg mx-auto text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-base font-bold text-slate-900">Yazdırılacak Sipariş Bulunamadı</h2>
        <p className="text-xs text-slate-500">Lütfen sipariş listesinden yazdırmak istediğiniz siparişleri seçip tekrar deneyin.</p>
        <Link
          href="/panel/siparisler"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sipariş Listesine Dön</span>
        </Link>
      </div>
    );
  }

  const totalItemsCount = orders.reduce((sum, o) => sum + o.items.length, 0);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-black font-sans pb-16">
      {/* Üst Kontrol Çubuğu (Yazdırmada Gizlenir) */}
      <div className="no-print sticky top-0 z-50 bg-slate-900 text-white p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/panel/siparisler"
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
            title="Sipariş Listesine Dön"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-sm font-bold flex items-center gap-2">
              <span>Toplu Sipariş Yazdırma</span>
              <span className="bg-[#1B84F8] text-white px-2 py-0.5 rounded text-[11px] font-black">
                {orders.length} Sipariş ({totalItemsCount} Kalem Perde)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Her sipariş otomatik olarak ayrı bir A4 sayfasına yerleştirilecektir.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMarked && (
            <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              <span>Siparişler "Yazdırıldı" Olarak İşaretlendi</span>
            </span>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-6 py-2.5 rounded-lg text-xs font-black flex items-center gap-2 transition cursor-pointer shadow-lg shadow-[#1B84F8]/30"
          >
            <Printer className="w-4 h-4" />
            <span>Tümünü Yazdır ({orders.length} Sayfa)</span>
          </button>
        </div>
      </div>

      {/* Sipariş Sayfaları (Her biri ayrı A4 Yaprağı) */}
      <div className="max-w-5xl mx-auto p-4 sm:p-8 space-y-10 print:space-y-0 print:p-0">
        {orders.map((order, orderIndex) => {
          const shippingAddr = order.addresses.find((a) => !a.isBilling) || order.addresses[0];

          return (
            <div
              key={order.id}
              className="order-sheet bg-white p-6 sm:p-8 rounded-2xl border-2 border-black print:border-2 print:border-black print:rounded-none print:shadow-none shadow-md space-y-5"
              style={{ pageBreakAfter: orderIndex < orders.length - 1 ? 'always' : 'auto' }}
            >
              {/* 1. Başlık & Sipariş Bilgisi */}
              <div className="flex justify-between items-start border-b-2 border-black pb-4">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-black">
                    YAZAR PERDE SİSTEMLERİ
                  </h2>
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                    ATÖLYE İŞ EMRİ & İMALAT KAĞIDI
                  </p>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Tel: +90 212 510 22 55 • www.perdesiparisi.com
                  </p>
                </div>

                <div className="text-right border-2 border-black p-3 rounded-xl bg-slate-50">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Sipariş Numarası</span>
                  <span className="font-mono text-base font-black text-black">#{order.orderNumber}</span>
                  <div className="text-[10px] text-slate-600 mt-1 font-semibold">
                    Tarih: {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <span className="inline-block mt-1 bg-black text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                    {order.paymentMethod === 'PAYTR_CC' && 'KREDİ KARTI (ÖDENDİ)'}
                    {order.paymentMethod === 'BANK_TRANSFER' && 'HAVALE / EFT'}
                    {order.paymentMethod === 'CASH_ON_DELIVERY' && 'KAPIDA ÖDEME'}
                  </span>
                </div>
              </div>

              {/* 2. Müşteri & Teslimat Bilgisi */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-black p-4 rounded-xl text-xs">
                <div>
                  <span className="font-bold text-black text-[10px] uppercase block border-b border-slate-300 pb-1 mb-1">
                    Müşteri & Kargo Bilgileri
                  </span>
                  <p className="font-black text-sm text-black">{order.customerName} {order.customerSurname}</p>
                  <p className="text-slate-800 font-bold mt-0.5">Tel: {order.customerPhone}</p>
                  <p className="text-slate-600 text-[11px]">{order.customerEmail}</p>
                </div>

                <div>
                  <span className="font-bold text-black text-[10px] uppercase block border-b border-slate-300 pb-1 mb-1">
                    Teslimat Adresi
                  </span>
                  <p className="text-slate-800 font-medium">{shippingAddr?.fullAddress}</p>
                  <p className="font-bold text-black mt-0.5">{shippingAddr?.district} / {shippingAddr?.city}</p>
                  {order.customerNote && (
                    <p className="text-black font-bold bg-amber-100 p-1.5 rounded border border-amber-300 text-[10px] mt-1.5">
                      Genel Not: {order.customerNote}
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Özel Ölçülü Perde Üretim Tablosu */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-black flex justify-between items-center">
                  <span>İMAL EDİLECEK ÖZEL ÖLÇÜLÜ PERDELER ({order.items.length} KALEM)</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    (Sayfa {orderIndex + 1} / {orders.length})
                  </span>
                </h3>

                <table className="w-full border-collapse border-2 border-black text-xs">
                  <thead>
                    <tr className="bg-slate-200 text-black font-black border-b-2 border-black">
                      <th className="border border-black p-2 text-center w-8">#</th>
                      <th className="border border-black p-2 text-left">Perde Modeli & Kodu</th>
                      <th className="border border-black p-2 text-center w-28 bg-slate-300">NET EN x BOY</th>
                      <th className="border border-black p-2 text-center w-16">Adet</th>
                      <th className="border border-black p-2 text-left">Mekanizma, Pile & Dikim Talimatları</th>
                      <th className="border border-black p-2 text-center w-16">Kontrol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      let snap: Record<string, any> = {};
                      try {
                        if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
                      } catch {}

                      return (
                        <tr key={item.id} className="border-b border-black">
                          <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>

                          <td className="border border-black p-2">
                            <span className="font-mono text-[10px] text-slate-600 block">{item.productSku}</span>
                            <strong className="text-black block text-xs">{item.productName}</strong>
                            <span className="text-[10px] font-bold text-slate-700 uppercase">
                              Tür: {item.curtainType}
                            </span>
                          </td>

                          {/* NET EN x BOY */}
                          <td className="border border-black p-2 text-center bg-slate-50">
                            <div className="text-sm font-black text-black">
                              {item.width} x {item.height} cm
                            </div>
                            <span className="text-[9px] text-slate-500 block mt-0.5">
                              {item.calculatedArea} {item.curtainType === 'TULLE' || item.curtainType === 'FON' ? 'Metre' : 'm²'}
                            </span>
                          </td>

                          <td className="border border-black p-2 text-center font-black text-sm">
                            {item.quantity}
                          </td>

                          {/* ATÖLYE DETAY TALİMATLARI */}
                          <td className="border border-black p-2 space-y-1">
                            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-semibold text-black">
                              {snap.pleatLabel && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Pile: <strong>{snap.pleatLabel}</strong>
                                </div>
                              )}
                              {snap.caseType && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Kasa: <strong>{snap.caseType === 'CLOSED' ? 'KAPALI KASA' : 'AÇIK KASA'}</strong>
                                </div>
                              )}
                              {snap.chainType && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Zincir: <strong>{snap.chainType === 'METAL' ? 'METAL' : 'PLASTİK'}</strong>
                                </div>
                              )}
                              {snap.mechanismDirection && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Yön: <strong>{snap.mechanismDirection === 'RIGHT' ? 'SAĞ' : 'SOL'}</strong>
                                </div>
                              )}
                              {snap.mountingLabel && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Montaj: <strong>{snap.mountingLabel}</strong>
                                </div>
                              )}
                              {snap.skirtCut && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Etek: <strong>DİLİMLİ {snap.withBeads ? '+ BONCUK' : ''}</strong>
                                </div>
                              )}
                              {snap.rollerType && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Stor: <strong>{snap.rollerType === 'BLACKOUT_ROLLER' ? 'BLACKOUT' : 'NORMAL'}</strong>
                                </div>
                              )}
                              {snap.fonWingType && (
                                <div className="bg-slate-100 px-1 py-0.5 rounded">
                                  Kanat: <strong>{snap.fonWingType === 'DOUBLE_WING' ? 'ÇİFT KANAT' : 'TEK KANAT'}</strong>
                                </div>
                              )}
                            </div>

                            {item.itemNote && (
                              <div className="bg-amber-100 p-1.5 rounded border border-amber-400 text-[11px] font-black text-amber-950 mt-1">
                                ⚠️ ATÖLYE NOTU: {item.itemNote}
                              </div>
                            )}
                          </td>

                          <td className="border border-black p-2 text-center">
                            <div className="w-6 h-6 border-2 border-black mx-auto rounded" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. Atölye İmzaları ve Kalite Kontrol */}
              <div className="grid grid-cols-4 gap-4 border-2 border-black p-3.5 rounded-xl text-center text-[10px]">
                <div className="space-y-3">
                  <span className="font-bold uppercase block text-black">1. Kesim Yapan Usta</span>
                  <div className="h-5 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold uppercase block text-black">2. Dikim Yapan Usta</span>
                  <div className="h-5 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold uppercase block text-black">3. Mekanizma / Montaj</span>
                  <div className="h-5 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-3">
                  <span className="font-bold uppercase block text-black">4. Kalite Kontrol & Paket</span>
                  <div className="h-5 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Yazdırma CSS'i */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          .order-sheet {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 0 20mm 0 !important;
            padding: 0 !important;
            border: 2px solid black !important;
            box-shadow: none !important;
          }
          .order-sheet:last-child {
            page-break-after: auto !important;
            break-after: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TopluYazdirPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs">Yükleniyor...</div>}>
      <TopluYazdirContent />
    </Suspense>
  );
}