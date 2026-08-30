import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPrintPage({ params }: PrintPageProps) {
  const { id } = await params;

  const order = await prisma.order.update({
    where: { id },
    data: {
      isPrinted: true,
      printedAt: new Date(),
      printCount: { increment: 1 },
    },
    include: {
      items: true,
      addresses: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr = order.addresses.find((a) => !a.isBilling);

  return (
    <div className="min-h-screen bg-white text-black font-sans p-6 sm:p-10 max-w-5xl mx-auto text-xs">
      {/* Üst Yazdırma Buton Çubuğu (Baskıda Gizlenir) */}
      <div className="no-print mb-8 pb-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Sipariş İş Kağıdı / Atölye Üretim Fişi</h2>
          <p className="text-[11px] text-slate-500">A4 formatında yazdırmak için butona tıklayın.</p>
        </div>
        <PrintButton />
      </div>

      {/* A4 FORM ALANI */}
      <div className="border-2 border-black p-6 rounded-2xl space-y-6">
        {/* 1. Başlık & Sipariş Bilgisi */}
        <div className="flex justify-between items-start border-b-2 border-black pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-black">
              YAZAR PERDE SİSTEMLERİ
            </h1>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              ATÖLYE İŞ EMRİ & İMALAT KAĞIDI
            </p>
            <p className="text-[10px] text-slate-600 mt-1">
              Tel: +90 212 510 22 55 • www.perdesiparisi.com
            </p>
          </div>

          <div className="text-right border-2 border-black p-3 rounded-xl bg-slate-50">
            <span className="text-[9px] font-bold text-slate-500 uppercase block">Sipariş Numarası</span>
            <span className="font-mono text-base font-black text-black">{order.orderNumber}</span>
            <div className="text-[10px] text-slate-600 mt-1">
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
            <p className="text-slate-700 font-bold mt-0.5">Tel: {order.customerPhone}</p>
            <p className="text-slate-600 text-[11px]">{order.customerEmail}</p>
          </div>

          <div>
            <span className="font-bold text-black text-[10px] uppercase block border-b border-slate-300 pb-1 mb-1">
              Teslimat Adresi
            </span>
            <p className="text-slate-800 font-medium">{shippingAddr?.fullAddress}</p>
            <p className="font-bold text-black mt-0.5">{shippingAddr?.district} / {shippingAddr?.city}</p>
            {order.customerNote && (
              <p className="text-black font-bold bg-amber-100 p-1.5 rounded border border-amber-300 text-[10px] mt-2">
                Genel Sipariş Notu: {order.customerNote}
              </p>
            )}
          </div>
        </div>

        {/* 3. Özel Ölçülü Perde Üretim Tablosu */}
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider mb-2 text-black">
            İMAL EDİLECEK ÖZEL ÖLÇÜLÜ PERDELER ({order.items.length} KALEM)
          </h3>

          <table className="w-full border-collapse border-2 border-black text-xs">
            <thead>
              <tr className="bg-slate-200 text-black font-black border-b-2 border-black">
                <th className="border border-black p-2 text-center w-8">#</th>
                <th className="border border-black p-2 text-left">Perde Modeli & Kodu</th>
                <th className="border border-black p-2 text-center w-28 bg-slate-300">NET EN x BOY</th>
                <th className="border border-black p-2 text-center w-20">Adet</th>
                <th className="border border-black p-2 text-left">Mekanizma, Pile & Dikim Talimatları</th>
                <th className="border border-black p-2 text-center w-20">Kontrol</th>
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

                    {/* VURGULANMIŞ BÜYÜK ÖLÇÜLER */}
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
                            Zincir: <strong>{snap.chainType === 'METAL' ? 'METAL ZİNCİR' : 'PLASTİK'}</strong>
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
                            Stor: <strong>{snap.rollerType === 'BLACKOUT_ROLLER' ? 'BLACKOUT KARARTMA' : 'NORMAL'}</strong>
                          </div>
                        )}
                        {snap.fonWingType && (
                          <div className="bg-slate-100 px-1 py-0.5 rounded">
                            Kanat: <strong>{snap.fonWingType === 'DOUBLE_WING' ? 'ÇİFT KANAT' : 'TEK KANAT'}</strong>
                          </div>
                        )}
                      </div>

                      {/* MÜŞTERİ NOTU UYARISI */}
                      {item.itemNote && (
                        <div className="bg-amber-100 p-1.5 rounded border border-amber-400 text-[11px] font-black text-amber-950 mt-1">
                          ⚠️ ATÖLYE NOTU: {item.itemNote}
                        </div>
                      )}
                    </td>

                    {/* Kontrol Onay Kutucuğu */}
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
        <div className="grid grid-cols-4 gap-4 border-2 border-black p-4 rounded-xl text-center text-[10px]">
          <div className="space-y-4">
            <span className="font-bold uppercase block text-black">1. Kesim Yapan Usta</span>
            <div className="h-6 border-b border-dashed border-black" />
            <span className="text-slate-500">İmza / Tarih</span>
          </div>

          <div className="space-y-4">
            <span className="font-bold uppercase block text-black">2. Dikim Yapan Usta</span>
            <div className="h-6 border-b border-dashed border-black" />
            <span className="text-slate-500">İmza / Tarih</span>
          </div>

          <div className="space-y-4">
            <span className="font-bold uppercase block text-black">3. Mekanizma / Montaj</span>
            <div className="h-6 border-b border-dashed border-black" />
            <span className="text-slate-500">İmza / Tarih</span>
          </div>

          <div className="space-y-4">
            <span className="font-bold uppercase block text-black">4. Kalite Kontrol & Paket</span>
            <div className="h-6 border-b border-dashed border-black" />
            <span className="text-slate-500">İmza / Tarih</span>
          </div>
        </div>
      </div>
    </div>
  );
}