import React from 'react';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  CheckCircle2, 
  Building2, 
  Truck, 
  ArrowRight, 
  FileText
} from 'lucide-react';

interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ status?: string }>;
}

export default async function OrderConfirmationPage({ params, searchParams }: OrderConfirmationPageProps) {
  const { orderNumber } = await params;
  const { status } = await searchParams;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      addresses: true,
      timeline: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddress = order.addresses.find((a) => !a.isBilling);

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {/* Üst Başarı Kartı */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-md text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-black text-emerald-600 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded-full">
          SİPARİŞİNİZ ALINDI
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 mb-2">
          Teşekkür Ederiz, Siparişiniz Başarıyla Oluşturuldu!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Özel ölçülü perde siparişiniz atölye üretim kuyruğuna alınmıştır. Süreçle ilgili tüm bilgilendirmeler e-posta ve SMS ile iletilecektir.
        </p>

        {/* Sipariş No & Tarih Kutusu */}
        <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Sipariş Numarası</span>
            <span className="font-mono text-base font-black text-[#1B84F8]">{order.orderNumber}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Toplam Tutar</span>
            <span className="text-base font-black text-slate-900">₺{order.grandTotal.toFixed(2)}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div>
            <span className="text-[10px] text-slate-400 block font-semibold">Ödeme Yöntemi</span>
            <span className="font-bold text-slate-700">
              {order.paymentMethod === 'PAYTR_CC' && 'Kredi Kartı / 3D Secure'}
              {order.paymentMethod === 'BANK_TRANSFER' && 'Banka Havalesi / EFT'}
              {order.paymentMethod === 'CASH_ON_DELIVERY' && 'Kapıda Nakit Ödeme'}
            </span>
          </div>
        </div>
      </div>

      {/* HAVALE / EFT SEÇİLDİYSE BANKA HESAPLARI KUTUSU */}
      {order.paymentMethod === 'BANK_TRANSFER' && (
        <div className="bg-blue-50/70 p-6 rounded-3xl border border-blue-200 text-xs mb-8 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
            <Building2 className="w-5 h-5 text-[#1B84F8]" />
            <span>Havale / EFT İçin Banka Hesap Bilgilerimiz</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Lütfen transfer yaparken <strong>açıklama alanına yalnızca sipariş numaranızı ({order.orderNumber})</strong> yazınız. Ödemeniz muhasebemizce 15 dakika içinde onaylanacaktır.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-white p-4 rounded-2xl border border-blue-100 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Ziraat Bankası</span>
                <span className="text-[10px] text-[#1B84F8]">TR Lirası</span>
              </div>
              <p className="text-[10px] text-slate-500">Alıcı: Yazar Perde San. Tic. Ltd. Şti.</p>
              <p className="font-mono text-xs font-bold text-slate-800 select-all">TR12 0001 0090 1234 5678 5001</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-blue-100 space-y-1">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Garanti BBVA</span>
                <span className="text-[10px] text-[#1B84F8]">TR Lirası</span>
              </div>
              <p className="text-[10px] text-slate-500">Alıcı: Yazar Perde San. Tic. Ltd. Şti.</p>
              <p className="font-mono text-xs font-bold text-slate-800 select-all">TR62 0006 2000 0001 2345 6789 01</p>
            </div>
          </div>
        </div>
      )}

      {/* KAPIDA ÖDEME SEÇİLDİYSE BİLGİLENDİRME */}
      {order.paymentMethod === 'CASH_ON_DELIVERY' && (
        <div className="bg-purple-50 p-5 rounded-3xl border border-purple-200 text-xs mb-8 flex items-start gap-3">
          <Truck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-purple-900">Kapıda Nakit Ödeme Bildirimi</h4>
            <p className="text-purple-700 text-[11px] mt-1 leading-relaxed">
              Özel ölçü dikim siparişinizin üretime alınabilmesi için müşteri temsilcimiz kayıtlı cep telefonunuzdan ({order.customerPhone}) arayarak teyit alacaktır.
            </p>
          </div>
        </div>
      )}

      {/* SİPARİŞ KALEMLERİ VE TEKNİK DÖKÜM */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs mb-8 space-y-6">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#1B84F8]" />
          <span>Sipariş Kalemleri ve Teknik Ölçü Dökümü</span>
        </h3>

        <div className="divide-y divide-slate-100 space-y-4">
          {order.items.map((item) => {
            let snap: Record<string, any> = {};
            try {
              if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
            } catch {}

            return (
              <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">{item.productSku}</span>
                    <h4 className="text-xs font-bold text-slate-900">{item.productName}</h4>
                  </div>
                  <div className="mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div className="font-bold text-slate-900">
                      Ölçü: {item.width} x {item.height} cm ({item.calculatedArea} m²) • {item.quantity} Adet
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-slate-500">
                      {snap.pleatLabel && <span>Pile: {snap.pleatLabel}</span>}
                      {snap.caseType && <span>Kasa: {snap.caseType === 'CLOSED' ? 'Kapalı Kasa' : 'Açık Kasa'}</span>}
                      {snap.chainType && <span>Zincir: {snap.chainType === 'METAL' ? 'Metal Zincir' : 'Plastik'}</span>}
                      {snap.mechanismDirection && <span>Yön: {snap.mechanismDirection === 'RIGHT' ? 'Sağ' : 'Sol'}</span>}
                      {snap.mountingLabel && <span>Montaj: {snap.mountingLabel}</span>}
                    </div>
                    {item.itemNote && (
                      <div className="text-[10px] text-amber-700 italic">Not: {item.itemNote}</div>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-400 block">Birim: ₺{item.unitPrice.toFixed(2)}</span>
                  <span className="text-sm font-black text-slate-900">₺{item.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Adres Bilgisi */}
        {shippingAddress && (
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Teslimat Adresi</span>
              <p className="font-bold text-slate-900 mt-1">{shippingAddress.name} {shippingAddress.surname}</p>
              <p className="text-slate-600 text-[11px] mt-0.5">{shippingAddress.fullAddress}</p>
              <p className="text-slate-600 text-[11px]">{shippingAddress.district} / {shippingAddress.city}</p>
              <p className="text-slate-500 text-[10px] mt-1">Tel: {shippingAddress.phone}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Üretim & Kargo Süresi</span>
              <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">
                Özel ölçülü dikim ve kalite kontrol süreci ortalama <strong>3-5 iş günüdür</strong>. Siparişiniz kargoya verildiğinde SMS ile takip linki gönderilecektir.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Alt Butonlar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          href="/"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold text-center transition"
        >
          Alışverişe Devam Et
        </Link>
        <Link
          href={`/siparis-takip?orderNumber=${order.orderNumber}&phone=${order.customerPhone}`}
          className="w-full sm:w-auto bg-[#1B84F8] hover:bg-[#156cd1] text-white px-7 py-3.5 rounded-2xl text-xs font-bold text-center shadow-lg shadow-[#1B84F8]/25 flex items-center justify-center gap-2 transition"
        >
          <span>Sipariş Durumunu Takip Et</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}