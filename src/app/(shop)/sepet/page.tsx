'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Trash2, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  CheckCircle2, 
  Tag, 
  ShieldCheck 
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState<{ code: string; amount: number; desc: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const freeShippingThreshold = 1500;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 75;
  const discountAmount = couponDiscount ? couponDiscount.amount : 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');

    try {
      const res = await fetch('/api/shop/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponDiscount({
          code: data.data.code,
          amount: data.data.discountAmount,
          desc: data.data.description,
        });
        setCouponCode('');
      } else {
        setCouponError(data.error || 'Geçersiz kupon kodu');
      }
    } catch {
      setCouponError('Kupon uygulanırken bir hata oluştu');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full border border-slate-200 p-8 rounded-sm bg-white">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <h1 className="text-lg font-bold text-slate-900 mb-1">Sepetiniz Boş</h1>
          <p className="text-xs text-slate-500 mb-6 leading-relaxed">
            Özel ölçülü perde modellerimizi inceleyebilir, milimetrik ölçülerinize göre fiyat hesaplayarak sepetinize ekleyebilirsiniz.
          </p>
          <Link
            href="/kategori/tul-perdeler"
            className="w-full bg-[#1B84F8] hover:bg-[#156cd1] text-white py-3 px-4 rounded-sm text-xs font-bold inline-flex items-center justify-center gap-1.5 transition"
          >
            <span>Perde Modellerini İncele</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Üst Başlık */}
      <div className="flex items-end justify-between border-b border-slate-200 pb-3 mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Alışveriş Sepeti</h1>
          <p className="text-xs text-slate-500">{items.length} kalem özel ölçü perde</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-slate-400 hover:text-red-600 font-semibold transition flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Sepeti Temizle</span>
        </button>
      </div>

      {/* Ücretsiz Kargo İlerleme Çubuğu */}
      <div className="border border-slate-200 rounded-sm p-4 bg-slate-50 mb-6">
        {remainingForFreeShipping > 0 ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-900">
                <Truck className="w-4 h-4 text-[#1B84F8]" />
                <span>Ücretsiz Kargo Fırsatı:</span>
              </span>
              <span className="text-[#1B84F8] font-bold">₺{remainingForFreeShipping.toFixed(2)} daha ekleyin</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1B84F8] transition-all duration-300"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tebrikler! 1.500 TL üzeri siparişiniz için KARGO ÜCRETSİZ!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Sepet Ürünleri Listesi */}
        <div className="lg:col-span-8 space-y-4">
          <div className="border border-slate-200 rounded-sm divide-y divide-slate-200">
            {items.map((item) => {
              const snap = item.calculationResult.selectedOptionsSnapshot as Record<string, any>;
              return (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 bg-white">
                  {/* Fotoğraf */}
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full sm:w-24 sm:h-28 aspect-4/3 sm:aspect-auto object-cover rounded-sm border border-slate-200 shrink-0"
                  />

                  {/* Detaylar */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 block">{item.sku}</span>
                          <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                            <Link href={`/urun/${item.slug}`} className="hover:text-[#1B84F8] transition">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-red-600 transition p-1 cursor-pointer"
                          title="Ürünü Kaldır"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Teknik Ölçü Bilgileri */}
                      <div className="mt-2 text-xs text-slate-600 space-y-0.5 bg-slate-50 p-2.5 rounded-sm border border-slate-100">
                        <div className="font-bold text-slate-900 font-mono">
                          Ölçü: {item.width} x {item.height} cm ({item.calculationResult.calculatedArea} {item.calculationResult.areaUnit === 'SQM' ? 'm²' : 'm'})
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                          {snap.pleatLabel && <span>• Pile: <strong>{snap.pleatLabel}</strong></span>}
                          {snap.caseType && <span>• Kasa: <strong>{snap.caseType === 'CLOSED' ? 'Kapalı Kasa' : 'Açık Kasa'}</strong></span>}
                          {snap.chainType && <span>• Zincir: <strong>{snap.chainType === 'METAL' ? 'Metal' : 'Plastik'}</strong></span>}
                          {snap.mechanismDirection && <span>• Yön: <strong>{snap.mechanismDirection === 'RIGHT' ? 'Sağ' : 'Sol'}</strong></span>}
                          {snap.skirtCut && <span>• Etek: <strong>Dilimli {snap.withBeads ? '+ Boncuk' : ''}</strong></span>}
                          {snap.mountingLabel && <span>• Montaj: <strong>{snap.mountingLabel}</strong></span>}
                        </div>
                        {item.note && (
                          <div className="text-[11px] text-amber-800 italic mt-1">
                            Not: {item.note}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Adet & Fiyat */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center border border-slate-300 rounded-sm bg-white overflow-hidden text-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                        >
                          -
                        </button>
                        <span className="px-3 font-bold text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 hover:bg-slate-100 text-slate-600 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block">Birim: ₺{item.unitPrice.toFixed(2)}</span>
                        <span className="text-base font-extrabold text-slate-950">
                          ₺{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-700 hover:text-slate-950 inline-flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Alışverişe Devam Et</span>
            </Link>
          </div>
        </div>

        {/* SAĞ: Kupon & Sipariş Özeti */}
        <div className="lg:col-span-4 space-y-6">
          {/* İndirim Kuponu */}
          <div className="border border-slate-200 rounded-sm p-4 bg-white space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span>İndirim Kuponu</span>
            </h3>

            {couponDiscount ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-sm flex items-center justify-between text-xs text-emerald-800">
                <div>
                  <span className="font-bold">{couponDiscount.code}</span>
                  <span className="block text-[10px] text-emerald-600">{couponDiscount.desc}</span>
                </div>
                <button
                  onClick={() => setCouponDiscount(null)}
                  className="text-xs text-red-500 hover:text-red-700 font-bold"
                >
                  Kaldır
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Kupon Kodu"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-1.5 text-xs uppercase"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={isApplyingCoupon || !couponCode.trim()}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-sm text-xs font-bold transition cursor-pointer"
                  >
                    Uygula
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-500">{couponError}</p>
                )}
              </div>
            )}
          </div>

          {/* Sipariş Özeti */}
          <div className="border border-slate-200 rounded-sm p-5 bg-slate-50/70 space-y-4">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Sipariş Özeti
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Ara Toplam (KDV Dahil):</span>
                <span className="font-bold text-slate-900">₺{subtotal.toFixed(2)}</span>
              </div>

              {couponDiscount && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Kupon İndirimi ({couponDiscount.code}):</span>
                  <span>-₺{couponDiscount.amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Kargo Bedeli:</span>
                {shippingFee === 0 ? (
                  <span className="font-bold text-emerald-600">ÜCRETSİZ</span>
                ) : (
                  <span className="font-bold text-slate-900">₺{shippingFee.toFixed(2)}</span>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-900">Toplam Tutar:</span>
              <span className="text-2xl font-extrabold text-slate-950">
                ₺{grandTotal.toFixed(2)}
              </span>
            </div>

            <Link
              href="/odeme"
              className="w-full bg-[#1B84F8] hover:bg-[#156cd1] text-white py-3.5 px-4 rounded-sm text-xs font-extrabold flex items-center justify-center gap-1.5 transition uppercase tracking-wide shadow-xs"
            >
              <span>Ödeme Adımına Geç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>256-Bit SSL ile Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}