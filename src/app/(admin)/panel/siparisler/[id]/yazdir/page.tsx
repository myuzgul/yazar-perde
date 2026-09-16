import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PrintButton from '@/components/admin/PrintButton';
import Barcode from '@/components/admin/Barcode';
import { triggerOrderNotification } from '@/lib/notification-service';

interface PrintPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPrintPage({ params }: PrintPageProps) {
  const { id } = await params;

  const existing = await prisma.order.findUnique({ where: { id } });
  if (!existing) {
    notFound();
  }

  const isStatusChanged = !['SHIPPED', 'DELIVERED', 'CANCELLED', 'IN_PRODUCTION'].includes(existing.status);
  const newStatus = isStatusChanged ? 'IN_PRODUCTION' : existing.status;

  const order = await prisma.order.update({
    where: { id },
    data: {
      isPrinted: true,
      printedAt: new Date(),
      printCount: { increment: 1 },
      status: newStatus,
      timeline:
        isStatusChanged
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

  if (isStatusChanged) {
    triggerOrderNotification({
      eventCode: 'IN_PRODUCTION',
      customerName: `${order.customerName} ${order.customerSurname}`,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
      orderNumber: order.orderNumber,
      grandTotal: order.grandTotal,
    }).catch(console.error);
  }

  if (!order) {
    notFound();
  }

  const shippingAddr = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
  const barcodeValue = order.mngBarcode || order.trackingNumber || order.orderNumber;

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
    <div className="min-h-screen bg-slate-100 print:bg-white text-black font-sans p-4 sm:p-8">
      {/* Üst Yazdırma Buton Çubuğu (Baskıda Gizlenir) */}
      <div className="no-print max-w-3xl mx-auto mb-6 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#1B84F8] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
              A5 Fatura & İmalat Formatı
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-slate-700 text-xs font-bold">MNG Kargo Entegreli</span>
          </div>
          <h1 className="text-base font-black text-slate-900 mt-1">
            Sipariş #{order.orderNumber} - Fatura / Sipariş Fişi
          </h1>
          <p className="text-xs text-slate-500">
            A5 dikey kağıt boyutuna göre yüksek kontrastlı ve net olarak düzenlenmiştir.
          </p>
        </div>
        <PrintButton label="A5 Yazdır" />
      </div>

      {/* A5 ÇIKTI SAYFASI */}
      <div className="a5-container bg-white mx-auto border border-black p-6 rounded-none shadow-none print:border-0 print:p-0">
        {/* 1. ÜST BAŞLIK & MÜŞTERİ / SİPARİŞ BİLGİLERİ */}
        <div className="flex justify-between items-start pb-4">
          {/* Sol Kolon: FATURA Başlığı ve Müşteri Bilgileri */}
          <div className="space-y-1.5 max-w-[55%]">
            <h1 className="text-2xl font-black tracking-tight text-black uppercase">
              FATURA
            </h1>
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

                        {snap.pleatLabel && (
                          <div>
                            <span className="font-bold">Pile: </span>
                            <span>{snap.pleatLabel}</span>
                          </div>
                        )}
                        {snap.caseType && (
                          <div>
                            <span className="font-bold">Kasa: </span>
                            <span>{snap.caseType === 'CLOSED' ? 'Kapalı Kasa' : 'Açık Kasa'}</span>
                          </div>
                        )}
                        {snap.chainType && (
                          <div>
                            <span className="font-bold">Zincir: </span>
                            <span>{snap.chainType === 'METAL' ? 'Metal' : 'Plastik'} {snap.mechanismDirection ? `(${snap.mechanismDirection === 'RIGHT' ? 'Sağ' : 'Sol'})` : ''}</span>
                          </div>
                        )}
                        {snap.mountingLabel && (
                          <div>
                            <span className="font-bold">Montaj: </span>
                            <span>{snap.mountingLabel}</span>
                          </div>
                        )}
                        {snap.plisseColorLabel && (
                          <div>
                            <span className="font-bold">Profil: </span>
                            <span>{snap.plisseColorLabel}</span>
                          </div>
                        )}
                        {snap.rollerType && (
                          <div>
                            <span className="font-bold">Stor: </span>
                            <span>{snap.rollerType === 'BLACKOUT_ROLLER' ? 'Blackout' : 'Normal'}</span>
                          </div>
                        )}
                        {snap.skirtCut && (
                          <div>
                            <span className="font-bold">Etek: </span>
                            <span>Dilimli {snap.withBeads ? '+ Boncuk' : ''}</span>
                          </div>
                        )}
                        {snap.fonWingType && (
                          <div>
                            <span className="font-bold">Kanat: </span>
                            <span>{snap.fonWingType === 'DOUBLE_WING' ? 'Çift Kanat' : 'Tek Kanat'}</span>
                          </div>
                        )}
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
          .a5-container {
            width: 136mm !important;
            max-width: 136mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}

