import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';
import Barcode from '@/components/admin/Barcode';

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPrintPage({ params }: PrintPageProps) {
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    notFound();
  }

  const newStatus = ['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(existing.status)
    ? existing.status
    : 'IN_PRODUCTION';

  const order = await prisma.order.update({
    where: { id },
    data: {
      isPrinted: true,
      printedAt: new Date(),
      printCount: { increment: 1 },
      status: newStatus,
      timeline:
        newStatus === 'IN_PRODUCTION' && existing.status !== 'IN_PRODUCTION'
          ? {
              create: {
                status: 'IN_PRODUCTION',
                title: 'Sipariş Durumu: Atölyede Üretimde',
                description: 'A5 atölye iş emri ve MNG kargo etiketi yazdırıldı, dikim ve imalata alındı.',
              },
            }
          : undefined,
    },
    include: {
      items: true,
      addresses: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
  const barcodeValue = `YP${order.orderNumber.replace(/[^0-9A-Za-z]/g, '')}`;

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white text-black font-sans p-4 sm:p-8">
      {/* Üst Yazdırma Buton Çubuğu (Baskıda Gizlenir) */}
      <div className="no-print max-w-4xl mx-auto mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1B84F8] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              A5 Tek Sayfa Formatı
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-600 text-xs font-bold">MNG Kargo Entegreli</span>
          </div>
          <h1 className="text-base font-black text-slate-900 mt-1">
            Sipariş #{order.orderNumber} - Atölye İş Emri & Kargo Etiketi
          </h1>
          <p className="text-[11px] text-slate-500">
            A5 kağıda tam sığacak şekilde tasarlanmıştır. Sağ üstteki resmi MNG Kargo etiketi ile ek bir kargo fişi çıkarmanıza gerek kalmaz.
          </p>
        </div>
        <PrintButton label="A5 Yazdır" />
      </div>

      {/* A5 ÇIKTI SAYFASI */}
      <div className="a5-container bg-white mx-auto border-2 border-black p-3 sm:p-4 rounded-xl shadow-md print:shadow-none print:border-2 print:rounded-none space-y-3">
        {/* 1. ÜST KISIM: SOLDA ATÖLYE BİLGİSİ - SAĞDA MNG KARGO ETİKETİ */}
        <div className="grid grid-cols-12 gap-2.5 items-stretch border-b-2 border-black pb-2.5">
          {/* Sol Kolon: Atölye ve Sipariş Başlığı (%50) */}
          <div className="col-span-6 flex flex-col justify-between pr-1 border-r border-slate-300">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black tracking-tight text-black uppercase">
                  YAZAR PERDE SİSTEMLERİ
                </h2>
              </div>
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

            {/* Alıcı Bilgileri (Kargo Görevlisinin Okuyacağı Bölüm) */}
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
              Kusursuz İmalat ve Dikim Talimatları
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

                    {/* VURGULANMIŞ BÜYÜK NET ÖLÇÜ */}
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

                      {/* Özel Atölye Kalem Notu */}
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
          .a5-container {
            width: 140mm !important;
            max-width: 140mm !important;
            margin: 0 auto !important;
            padding: 3mm !important;
            border: 1.5pt solid black !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}
