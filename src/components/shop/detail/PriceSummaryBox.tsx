'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';
import { CalculationResult } from '@/modules/pricing-engine';

export interface CartDiscountInfo {
  active: boolean;
  rate: number;
  title: string;
  discountAmount: number;
  discountedPrice: number;
}

interface PriceSummaryBoxProps {
  calcResult: CalculationResult | null;
  quantity: number;
  setQuantity: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  onAddToCart: () => void;
  cartDiscountInfo?: CartDiscountInfo | null;
}

export default function PriceSummaryBox({
  calcResult,
  quantity,
  setQuantity,
  note,
  setNote,
  onAddToCart,
  cartDiscountInfo,
}: PriceSummaryBoxProps) {
  if (!calcResult) return null;

  const hasCartDiscount = Boolean(cartDiscountInfo?.active && cartDiscountInfo.discountAmount > 0);
  const effectiveFinalPrice = hasCartDiscount ? cartDiscountInfo!.discountedPrice : calcResult.grandTotal;

  return (
    <div className="border border-slate-300 rounded-sm p-5 space-y-4 bg-slate-50/60">
      <div className="flex items-start sm:items-end justify-between border-b border-slate-200 pb-3.5 gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            HESAPLANAN TOPLAM TUTAR (KDV DAHİL)
          </span>

          {hasCartDiscount ? (
            <div className="mt-1 space-y-1.5">
              <div className="flex items-baseline gap-2.5">
                <span className="text-base sm:text-lg font-bold text-slate-400 line-through">
                  ₺{calcResult.grandTotal.toFixed(2)}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">
                  ₺{effectiveFinalPrice.toFixed(2)}
                </div>
              </div>

              {/* Sepette İndirim Rozeti & Vade Farksız Taksit */}
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <div className="text-[11px] font-extrabold text-white bg-emerald-600 px-2.5 py-0.5 rounded-sm inline-flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>{cartDiscountInfo?.title || `Sepette %${cartDiscountInfo?.rate} İndirim`}</span>
                </div>
                <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-xs inline-flex items-center gap-1 border border-emerald-200/60">
                  <span>💳</span> 3 x ₺{(effectiveFinalPrice / 3).toFixed(2)} Vade Farksız
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
                ₺{calcResult.grandTotal.toFixed(2)}
              </div>
              <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-xs inline-flex items-center gap-1 mt-1.5 border border-emerald-200/60">
                <span>💳</span> 3 x ₺{(calcResult.grandTotal / 3).toFixed(2)} Vade Farksız
              </div>
            </div>
          )}
        </div>

        <div className="text-right text-xs shrink-0">
          <span className="font-bold text-slate-900 block font-mono">
            {calcResult.curtainType === 'FIXED_PRICE' ? `${quantity} Adet` : `${calcResult.calculatedArea} ${calcResult.areaUnit === 'SQM' ? 'm²' : 'Metre'}`}
          </span>
          <span className="text-[10px] text-slate-500">
            {calcResult.curtainType === 'FIXED_PRICE' ? 'Hazır Standart Ölçü' : 'Net Kesim Ölçüsü'}
          </span>
        </div>
      </div>

      {/* Maliyet Kırılım Dökümü */}
      <div className="space-y-1 text-xs text-slate-600 bg-white p-3 rounded-sm border border-slate-200">
        <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Fiyat Kırılımı:</span>
        {calcResult.breakdown.map((item, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{item.label} {item.unit ? `(${item.unit})` : ''}</span>
            <span className="font-semibold text-slate-900">₺{item.amount.toFixed(2)}</span>
          </div>
        ))}
        {hasCartDiscount && (
          <div className="flex justify-between text-emerald-600 font-bold pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>{cartDiscountInfo?.title}:</span>
            </span>
            <span>-₺{cartDiscountInfo?.discountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Müşteri Notu */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Atölye Sipariş Notu (Opsiyonel)
        </label>
        <input
          type="text"
          placeholder="Örn: Salon sol pencere için, 2 cm kısa dikilsin vb."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full border border-slate-300 focus:border-slate-800 rounded-sm px-3 py-2 text-xs bg-white text-slate-900"
        />
      </div>

      {/* Adet & Sepete Ekle Butonu */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center border border-slate-300 rounded-sm bg-white overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2.5 hover:bg-slate-100 font-bold text-slate-700 text-sm"
          >
            -
          </button>
          <span className="px-3.5 font-bold text-slate-900 text-xs">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2.5 hover:bg-slate-100 font-bold text-slate-700 text-sm"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          className="flex-1 bg-[#1B84F8] hover:bg-[#156cd1] text-white py-3 px-6 rounded-sm text-xs font-extrabold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs uppercase tracking-wide"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Sepete Ekle • ₺{effectiveFinalPrice.toFixed(2)}</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Kişiye Özel Milimetrik Kesim & 24 Ay Mekanizma Garantisi</span>
      </div>
    </div>
  );
}