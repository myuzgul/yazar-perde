'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Barcode from '@/components/admin/Barcode';

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
        <span>A5 Sipariş ve MNG kargo etiketleri hazırlanıyor...</span>
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
              <span>Toplu A5 Sipariş & MNG Kargo Yazdırma</span>
              <span className="bg-[#1B84F8] text-white px-2 py-0.5 rounded text-[11px] font-black">
                {orders.length} Sipariş ({totalItemsCount} Kalem Perde)
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Her sipariş ayrı bir A5 kağıdına yazdırılır (Sağ üstte MNG Kargo gönderi etiketi bulunur).
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
            <span>Tümünü Yazdır ({orders.length} A5 Sayfa)</span>
          </button>
        </div>
      </div>

      {/* Sipariş Sayfaları (Her biri ayrı A5 Yaprağı) */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8 print:space-y-0 print:p-0">
        {orders.map((order, orderIndex) => {
          const shippingAddr = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
          const barcodeValue = `YP${order.orderNumber.replace(/[^0-9A-Za-z]/g, '')}`;

          return (
            <div
              key={order.id}
              className="order-sheet a5-container bg-white p-3 sm:p-4 rounded-xl border-2 border-black print:border-2 print:border-black print:rounded-none print:shadow-none shadow-md space-y-3"
              style={{ pageBreakAfter: orderIndex < orders.length - 1 ? 'always' : 'auto' }}
            >
              {/* 1. ÜST KISIM: SOLDA ATÖLYE BİLGİSİ - SAĞDA MNG KARGO ETİKETİ */}
              <div className="grid grid-cols-12 gap-2.5 items-stretch border-b-2 border-black pb-2.5">
                {/* Sol Kolon: Atölye ve Sipariş Başlığı (%50) */}
                <div className="col-span-6 flex flex-col justify-between pr-1 border-r border-slate-300">
                  <div>
                    <h2 className="text-sm font-black tracking-tight text-black uppercase">
                      YAZAR PERDE SİSTEMLERİ
                    </h2>
                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-wide">
                      Özel Ölçü Atölye İmalat Fişi
                    </p>
                    <p className="text-[8px] text-slate-600 mt-0.5">
                      Tel: 0541 494 51 73 • yazarperde.com
                    </p>
                  </div>

                  <div className="mt-2 bg-slate-50 border border-black p-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black uppercase text-slate-500">Sipariş No:</span>
                      <span className="font-mono text-xs font-black text-black">#{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5 text-[8px] text-slate-600">
                      <span>Tarih:</span>
                      <span className="font-bold">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="mt-1.5 pt-1 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[8px] font-bold text-slate-600">Ödeme:</span>
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                        order.paymentMethod === 'CASH_ON_DELIVERY'
                          ? 'bg-amber-100 text-amber-950 border border-amber-300 font-extrabold'
                          : 'bg-black text-white'
                      }`}>
                        {order.paymentMethod === 'PAYTR_CC' && 'KREDİ KARTI (ÖDENDİ)'}
                        {order.paymentMethod === 'BANK_TRANSFER' && 'HAVALE / EFT'}
                        {order.paymentMethod === 'CASH_ON_DELIVERY' && `KAPIDA ÖDEME: ₺${order.grandTotal.toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  {/* Müşteri İletişim Özeti */}
                  <div className="mt-1.5 text-[8px] text-slate-700">
                    <span className="font-bold text-black">Müşteri: </span>
                    <span className="font-bold">{order.customerName} {order.customerSurname}</span>
                    <span className="ml-1 text-slate-600">({order.customerPhone})</span>
                  </div>
                </div>

                {/* Sağ Kolon: MNG / DHL Kargo Resmi Gönderi Etiketi (%50) */}
                <div className="col-span-6 bg-slate-50 border-2 border-black p-2 rounded-lg flex flex-col justify-between">
                  {/* Kargo Logo & Barkod */}
                  <div className="border-b border-black pb-1 mb-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-black text-white px-1.5 py-0.5 rounded">
                        DHL / MNG KARGO
                      </span>
                      <span className="text-[8px] font-mono font-bold text-slate-700">
                        {order.orderNumber}
                      </span>
                    </div>

                    {/* Scannable SVG Barcode */}
                    <div className="flex justify-center my-1">
                      <Barcode
                        value={barcodeValue}
                        height={28}
                        barWidth={1.15}
                        textClassName="text-[8px] font-mono font-bold text-black text-center mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Alıcı Bilgileri */}
                  <div className="space-y-0.5 text-[8px]">
                    <div className="flex items-baseline justify-between">
                      <span className="font-black text-[9px] text-black uppercase">
                        ALICI: {order.customerName} {order.customerSurname}
                      </span>
                      <span className="font-black text-[9px] text-black">
                        {order.customerPhone}
                      </span>
                    </div>
                    <div className="text-slate-800 leading-tight font-medium text-[8px] line-clamp-2">
                      {shippingAddr?.fullAddress}
                    </div>
                    <div className="text-[9px] font-black text-black uppercase bg-slate-200 px-1 py-0.5 rounded inline-block mt-0.5">
                      {shippingAddr?.district} / {shippingAddr?.city}
                    </div>
                  </div>

                  {/* Kargo Tahsilat / Gönderici Kutusu */}
                  <div className="mt-1.5 pt-1 border-t border-black text-[8px] flex items-center justify-between">
                    <div>
                      <span className="text-[7px] text-slate-500 uppercase block leading-none">Gönderici:</span>
                      <span className="font-bold text-[8px] text-slate-800 leading-none">Yazar Perde - Bursa</span>
                    </div>
                    <div className="text-right">
                      {order.paymentMethod === 'CASH_ON_DELIVERY' ? (
                        <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase">
                          KAPIDA TAHSİLAT: ₺{order.grandTotal.toFixed(2)}
                        </span>
                      ) : (
                        <span className="bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[8px] font-bold uppercase">
                          PEŞİN ÖDENDİ (TAHSİLATSIZ)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. ORTA KISIM: GENEL SİPARİŞ NOTU (Varsa) */}
              {order.customerNote && (
                <div className="bg-amber-50 border border-amber-300 p-1.5 rounded text-[8px] font-bold text-amber-950 flex items-center gap-1">
                  <span className="bg-amber-200 text-amber-900 px-1 py-0.5 rounded text-[7px] font-black uppercase">
                    MÜŞTERİ NOTU:
                  </span>
                  <span>{order.customerNote}</span>
                </div>
              )}

              {/* 3. ATÖLYE ÖZEL ÖLÇÜLÜ PERDE İMALAT TABLOSU */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-[9px] font-black uppercase tracking-wider text-black">
                    İMAL EDİLECEK ÖZEL ÖLÇÜLÜ PERDELER ({order.items.length} KALEM)
                  </h3>
                  <span className="text-[8px] text-slate-500 font-semibold">
                    (Sayfa {orderIndex + 1} / {orders.length})
                  </span>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[8px]">
                  <thead>
                    <tr className="bg-slate-200 text-black font-black border-b-2 border-black">
                      <th className="border border-black p-1 text-center w-6">#</th>
                      <th className="border border-black p-1 text-left">Perde Modeli & Kodu</th>
                      <th className="border border-black p-1 text-center w-24 bg-slate-300 text-black">NET EN x BOY</th>
                      <th className="border border-black p-1 text-center w-10">Adet</th>
                      <th className="border border-black p-1 text-left">Mekanizma, Pile & Dikim Detayları</th>
                      <th className="border border-black p-1 text-center w-10">Onay</th>
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
                          <td className="border border-black p-1 text-center font-black">{idx + 1}</td>

                          <td className="border border-black p-1">
                            <span className="font-mono text-[7px] text-slate-600 block">{item.productSku}</span>
                            <strong className="text-black block text-[8px] leading-tight">{item.productName}</strong>
                            <span className="text-[7px] font-bold text-slate-700 uppercase">
                              Tür: {item.curtainType}
                            </span>
                          </td>

                          {/* NET EN x BOY */}
                          <td className="border border-black p-1 text-center bg-slate-50">
                            <div className="text-[10px] font-black text-black">
                              {item.width} x {item.height} cm
                            </div>
                            <span className="text-[7px] text-slate-500 block leading-none mt-0.5">
                              {item.calculatedArea} {item.curtainType === 'TULLE' || item.curtainType === 'FON' ? 'Metre' : 'm²'}
                            </span>
                          </td>

                          <td className="border border-black p-1 text-center font-black text-[10px]">
                            {item.quantity}
                          </td>

                          {/* ATÖLYE DETAY TALİMATLARI */}
                          <td className="border border-black p-1">
                            <div className="flex flex-wrap gap-1 text-[7px] font-semibold text-black">
                              {snap.pleatLabel && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Pile: <strong>{snap.pleatLabel}</strong>
                                </span>
                              )}
                              {snap.caseType && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Kasa: <strong>{snap.caseType === 'CLOSED' ? 'KAPALI KASA' : 'AÇIK KASA'}</strong>
                                </span>
                              )}
                              {snap.chainType && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Zincir: <strong>{snap.chainType === 'METAL' ? 'METAL' : 'PLASTİK'}</strong>
                                </span>
                              )}
                              {snap.mechanismDirection && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Yön: <strong>{snap.mechanismDirection === 'RIGHT' ? 'SAĞ' : 'SOL'}</strong>
                                </span>
                              )}
                              {snap.mountingLabel && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Montaj: <strong>{snap.mountingLabel}</strong>
                                </span>
                              )}
                              {snap.plisseMeasurementLabel && (
                                <span className="bg-blue-50 text-blue-900 border border-blue-200 px-1 py-0.5 rounded">
                                  Ölçü: <strong>{snap.plisseMeasurementLabel}</strong>
                                </span>
                              )}
                              {snap.plisseColorLabel && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Profil: <strong>{snap.plisseColorLabel}</strong>
                                </span>
                              )}
                              {snap.skirtCut && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Etek: <strong>DİLİMLİ {snap.withBeads ? '+ BONCUK' : ''}</strong>
                                </span>
                              )}
                              {snap.rollerType && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Stor: <strong>{snap.rollerType === 'BLACKOUT_ROLLER' ? 'BLACKOUT' : 'NORMAL'}</strong>
                                </span>
                              )}
                              {snap.fonWingType && (
                                <span className="bg-slate-100 px-1 py-0.5 rounded border border-slate-200">
                                  Kanat: <strong>{snap.fonWingType === 'DOUBLE_WING' ? 'ÇİFT' : 'TEK'}</strong>
                                </span>
                              )}
                            </div>

                            {item.itemNote && (
                              <div className="bg-amber-100 p-1 rounded border border-amber-300 text-[7px] font-black text-amber-950 mt-1">
                                ⚠️ ATÖLYE NOTU: {item.itemNote}
                              </div>
                            )}
                          </td>

                          {/* Kontrol Onay Kutucuğu */}
                          <td className="border border-black p-1 text-center">
                            <div className="w-4 h-4 border border-black mx-auto rounded" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. ALT KISIM: ATÖLYE İMZA & KALİTE KONTROL ALANI */}
              <div className="grid grid-cols-4 gap-2 border-2 border-black p-2 rounded-lg text-center text-[7px]">
                <div className="space-y-1.5">
                  <span className="font-bold uppercase block text-black">1. Kesim</span>
                  <div className="h-4 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold uppercase block text-black">2. Dikim</span>
                  <div className="h-4 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold uppercase block text-black">3. Mekanizma</span>
                  <div className="h-4 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>

                <div className="space-y-1.5">
                  <span className="font-bold uppercase block text-black">4. Kalite & Paket</span>
                  <div className="h-4 border-b border-dashed border-black" />
                  <span className="text-slate-500">İmza / Tarih</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* A5 YAZDIRMA CSS AYARLARI */}
      <style>{`
        @page {
          size: A5 portrait;
          margin: 4mm;
        }
        @media print {
          .no-print {
            display: none !important;
          }
          html, body {
            width: 148mm;
            height: 210mm;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .order-sheet {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 3mm !important;
            border: 1.5pt solid black !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            width: 140mm !important;
            max-width: 140mm !important;
            page-break-inside: avoid !important;
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
