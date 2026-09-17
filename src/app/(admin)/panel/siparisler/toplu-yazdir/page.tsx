'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import Barcode from '@/components/admin/Barcode';
import { formatCurtainOptions } from '@/lib/curtain-options-helper';

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
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-8 print:space-y-0 print:p-0">
        {orders.map((order, orderIndex) => {
          const shippingAddr = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
          const barcodeValue = (order as any).mngBarcode || (order as any).trackingNumber || order.orderNumber;

          const formattedDate = new Date(order.createdAt).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          });

          const paymentLabel = (() => {
            if (order.paymentMethod === 'PAYTR_CC') return 'Kredi Banka Kartı (PayTR)';
            if (order.paymentMethod === 'BANK_TRANSFER') return 'Banka Havalesi / EFT';
            if (order.paymentMethod === 'CASH_ON_DELIVERY') return `Kapıda Nakit Ödeme (₺${order.grandTotal.toFixed(2)})`;
            return order.paymentMethod;
          })();

          const vatAmount = (order.grandTotal * 0.1).toFixed(2);

          return (
            <div
              key={order.id}
              className="order-sheet a5-container bg-white p-6 rounded-none border border-black print:border-0 print:p-0 shadow-none space-y-3"
              style={{ pageBreakAfter: orderIndex < orders.length - 1 ? 'always' : 'auto' }}
            >
              {/* 1. ÜST BAŞLIK & MÜŞTERİ / SİPARİŞ BİLGİLERİ */}
              <div className="flex justify-between items-start pb-4">
                {/* Sol Kolon: FATURA Başlığı ve Müşteri Bilgileri */}
                <div className="space-y-1.5 max-w-[55%]">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-black uppercase">
                      FATURA
                    </h1>
                    <span className="no-print bg-slate-900 text-white text-[9px] font-bold px-2 py-0.5 rounded">
                      {orderIndex + 1}/{orders.length}
                    </span>
                  </div>
                  <div className="text-[13px] leading-snug text-black">
                    <p className="font-bold capitalize">{order.customerName} {order.customerSurname}</p>
                    <p className="text-black font-normal">{shippingAddr?.fullAddress}</p>
                    <p className="font-medium text-black">
                      {shippingAddr?.postalCode ? `${shippingAddr.postalCode} ` : ''}
                      {shippingAddr?.district} {shippingAddr?.city}
                    </p>
                    {order.customerPhone && (
                      <p className="font-semibold text-black mt-0.5">Tel: {order.customerPhone}</p>
                    )}
                  </div>
                </div>

                {/* Sağ Kolon: Sipariş Bilgileri & MNG Barkodu */}
                <div className="text-right space-y-1 text-[12px] text-black">
                  <div className="flex justify-end gap-2">
                    <span className="text-black">Sipariş Numarası:</span>
                    <span className="font-bold text-black font-mono">#{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-black">Sipariş Tarihi:</span>
                    <span className="font-bold text-black">{formattedDate}</span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <span className="text-black">Ödeme Yöntemi:</span>
                    <span className="font-bold text-black">{paymentLabel}</span>
                  </div>

                  {/* MNG Barkodu */}
                  <div className="pt-2 flex flex-col items-end">
                    <div className="border border-black p-1.5 inline-block bg-white">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[8px] font-black uppercase tracking-wider bg-black text-white px-1 py-0.2 rounded">
                          MNG / DHL
                        </span>
                        <span className="text-[9px] font-mono font-black text-black">
                          {barcodeValue}
                        </span>
                      </div>
                      <Barcode
                        value={barcodeValue}
                        height={32}
                        barWidth={1.3}
                        showText={false}
                      />
                      <div className="text-[9px] font-mono font-bold text-center mt-0.5 text-black">
                        *{barcodeValue}*
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. MÜŞTERİ GENEL NOTU (Varsa) */}
              {order.customerNote && (
                <div className="my-2 p-2 border border-black text-[11px] font-bold text-black bg-white">
                  <span className="font-black underline mr-1">MÜŞTERİ NOTU:</span>
                  <span>{order.customerNote}</span>
                </div>
              )}

              {/* 3. ÜRÜN TABLOSU (Siyah Başlık Çubuğu) */}
              <div className="mt-3">
                <table className="w-full border-collapse text-[12px]">
                  <thead>
                    <tr className="bg-black text-white font-bold">
                      <th className="py-1.5 px-2 text-left w-[60%]">Ürün</th>
                      <th className="py-1.5 px-2 text-center w-[15%]">Miktar</th>
                      <th className="py-1.5 px-2 text-right w-[25%]">Fiyat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      let snap: Record<string, any> = {};
                      try {
                        if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
                      } catch {}

                      return (
                        <tr key={item.id} className="border-b border-gray-300">
                          {/* Ürün İsmi ve Özel İmalat Detayları */}
                          <td className="py-2 px-2 align-top">
                            <div className="font-bold text-black text-[13px] leading-tight">
                              {item.productName}
                            </div>
                            {item.productSku && (
                              <span className="font-mono text-[10px] text-black font-semibold block">
                                Kod: {item.productSku}
                              </span>
                            )}

                            {/* İmalat Ölçüleri ve Dikim Özellikleri */}
                            <div className="mt-1.5 space-y-0.5 text-[11px] text-black">
                              <div className="font-bold text-black">
                                Ölçü: <span className="font-black text-[12px]">{item.width} x {item.height} cm</span>
                                <span className="font-normal ml-1">
                                  ({item.calculatedArea} {item.curtainType === 'TULLE' || item.curtainType === 'FON' ? 'Metre' : 'm²'})
                                </span>
                              </div>

                              {formatCurtainOptions(item).map((opt, oIdx) => (
                                <div key={oIdx}>
                                  <span className="font-bold">{opt.label}: </span>
                                  <span>{opt.value}</span>
                                </div>
                              ))}

                              {item.itemNote && (
                                <div className="font-bold mt-1 text-black">
                                  <span>Kalem Notu: </span>
                                  <span className="font-black">{item.itemNote}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Miktar */}
                          <td className="py-2 px-2 text-center align-top font-bold text-black text-[13px]">
                            {item.quantity}
                          </td>

                          {/* Fiyat */}
                          <td className="py-2 px-2 text-right align-top font-bold text-black text-[13px] font-mono">
                            {item.totalPrice.toFixed(2)}₺
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* 4. ALT TOPLAM VE FİYATLANDIRMA DÖKÜMÜ */}
              <div className="mt-4 flex justify-end">
                <div className="w-64 space-y-1 text-[12px] text-black">
                  <div className="flex justify-between py-0.5">
                    <span className="font-medium">Ara toplam</span>
                    <span className="font-bold font-mono">{order.subtotal.toFixed(2)}₺</span>
                  </div>

                  {order.shippingFee > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span className="font-medium">Kargo Ücreti</span>
                      <span className="font-bold font-mono">{order.shippingFee.toFixed(2)}₺</span>
                    </div>
                  )}

                  {order.discountTotal > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span className="font-medium">İndirim</span>
                      <span className="font-bold font-mono">-{order.discountTotal.toFixed(2)}₺</span>
                    </div>
                  )}

                  {order.paymentFee > 0 && (
                    <div className="flex justify-between py-0.5">
                      <span className="font-medium">Kapıda Ödeme Bedeli</span>
                      <span className="font-bold font-mono">{order.paymentFee.toFixed(2)}₺</span>
                    </div>
                  )}

                  {/* Kalın Çizgili Toplam */}
                  <div className="border-t-2 border-b-2 border-black py-1.5 mt-1 flex justify-between items-baseline">
                    <span className="font-black text-sm uppercase">Toplam</span>
                    <div className="text-right">
                      <span className="font-black text-sm font-mono">{order.grandTotal.toFixed(2)}₺</span>
                      <span className="text-[11px] font-normal block">
                        ({vatAmount}₺ KDV dahil)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. ATÖLYE İMALAT VE KONTROL ONAY BÖLÜMÜ */}
              <div className="mt-6 pt-3 border-t border-black text-[10px] text-black">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="border border-black p-1">
                    <span className="font-bold block">1. KESİM</span>
                    <div className="h-5" />
                    <span className="text-[8px]">İmza: ________</span>
                  </div>
                  <div className="border border-black p-1">
                    <span className="font-bold block">2. DİKİM</span>
                    <div className="h-5" />
                    <span className="text-[8px]">İmza: ________</span>
                  </div>
                  <div className="border border-black p-1">
                    <span className="font-bold block">3. MEKANİZMA</span>
                    <div className="h-5" />
                    <span className="text-[8px]">İmza: ________</span>
                  </div>
                  <div className="border border-black p-1">
                    <span className="font-bold block">4. KALİTE & PAKET</span>
                    <div className="h-5" />
                    <span className="text-[8px]">İmza: ________</span>
                  </div>
                </div>
                <div className="mt-2 text-center text-[9px] text-black font-semibold">
                  Yazar Perde Sistemleri • Tel: 0541 494 51 73 • yazarperde.com
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
          margin: 6mm;
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
            background-color: #ffffff !important;
            color: #000000 !important;
            font-size: 11px !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .order-sheet {
            page-break-after: always !important;
            break-after: page !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            width: 136mm !important;
            max-width: 136mm !important;
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
