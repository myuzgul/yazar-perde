'use client';

import React from 'react';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { CalculationResult } from '@/modules/pricing-engine';

interface PriceSummaryBoxProps {
  calcResult: CalculationResult | null;
  quantity: number;
  setQuantity: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  onAddToCart: () => void;
}

export default function PriceSummaryBox({
  calcResult,
  quantity,
  setQuantity,
  note,
  setNote,
  onAddToCart,
}: PriceSummaryBoxProps) {
  if (!calcResult) return null;

  return (
    <div className="border border-slate-300 rounded-sm p-5 space-y-4 bg-slate-50/60">
      <div className="flex items-end justify-between border-b border-slate-200 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
            HESAPLANAN TOPLAM TUTAR (KDV DAHİL)
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
            ₺{calcResult.grandTotal.toFixed(2)}
          </div>
        </div>
        <div className="text-right text-xs">
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
          <span>Sepete Ekle • ₺{calcResult.grandTotal.toFixed(2)}</span>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Kişiye Özel Milimetrik Kesim & 24 Ay Mekanizma Garantisi</span>
      </div>
    </div>
  );
}