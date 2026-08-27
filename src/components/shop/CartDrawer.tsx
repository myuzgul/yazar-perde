'use client';

import React from 'react';
import { useCart } from '@/lib/cart-context';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

interface CartDrawerProps {
  freeShippingThreshold?: number;
}

export default function CartDrawer({ freeShippingThreshold = 1500 }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, subtotal, isDrawerOpen, closeDrawer } = useCart();

  if (!isDrawerOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Arkaplan Karartma */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col font-sans">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-900" />
              <h2 className="text-sm font-bold text-slate-900">Alışveriş Sepetim ({items.length})</h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1 text-slate-400 hover:text-slate-900 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Ücretsiz Kargo İlerleme Çubuğu */}
          <div className="p-3 bg-slate-50 border-b border-slate-200 text-xs">
            {remainingForFreeShipping > 0 ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-[#1B84F8]" />
                    <span>Ücretsiz Kargo:</span>
                  </span>
                  <span className="text-slate-900 font-bold">₺{remainingForFreeShipping.toFixed(2)} daha ekleyin</span>
                </div>
                <div className="w-full h-1 bg-slate-200 overflow-hidden rounded-full">
                  <div
                    className="h-full bg-[#1B84F8] transition-all duration-300"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bu siparişinizde KARGO ÜCRETSİZ!</span>
              </div>
            )}
          </div>

          {/* Sepet Kalemleri Listesi */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
            {items.length > 0 ? (
              items.map((item) => {
                const snap = item.calculationResult.selectedOptionsSnapshot as Record<string, any>;
                return (
                  <div key={item.id} className="pt-4 first:pt-0 flex gap-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-sm border border-slate-200 shrink-0"
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.name}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-slate-400 hover:text-red-600 transition p-0.5 cursor-pointer"
                            title="Kaldır"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Ölçü & Perde Detayları */}
                        <div className="mt-1 text-[11px] text-slate-600 space-y-0.5">
                          <div className="font-semibold text-slate-900 font-mono">
                            {item.width} x {item.height} cm ({item.calculationResult.calculatedArea} {item.calculationResult.areaUnit === 'SQM' ? 'm²' : 'm'})
                          </div>
                          {snap.pleatLabel && <div>Pile: {snap.pleatLabel}</div>}
                          {snap.caseType && <div>Kasa: {snap.caseType === 'CLOSED' ? 'Kapalı Kasa' : 'Açık Kasa'}</div>}
                          {snap.chainType && <div>Zincir: {snap.chainType === 'METAL' ? 'Metal' : 'Plastik'}</div>}
                          {snap.mechanismDirection && <div>Yön: {snap.mechanismDirection === 'RIGHT' ? 'Sağ' : 'Sol'}</div>}
                          {snap.skirtCut && <div>Etek: Dilimli {snap.withBeads ? '+ Boncuk' : ''}</div>}
                          {item.note && <div className="text-amber-800 text-[10px]">Not: {item.note}</div>}
                        </div>
                      </div>

                      {/* Adet & Fiyat */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center border border-slate-300 rounded-sm bg-white overflow-hidden text-xs">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 py-0.5 font-bold text-slate-900 text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 font-bold"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-extrabold text-slate-950">
                          ₺{item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center text-slate-400">
                <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-bold text-slate-700">Sepetinizde ürün bulunmuyor</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Perde modellerini inceleyerek sepete ekleyebilirsiniz.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                <span>Ara Toplam:</span>
                <span className="text-base font-extrabold text-slate-950">₺{subtotal.toFixed(2)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/sepet"
                  onClick={closeDrawer}
                  className="py-2.5 px-3 rounded-sm border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold text-center transition"
                >
                  Sepete Git
                </Link>
                <Link
                  href="/odeme"
                  onClick={closeDrawer}
                  className="py-2.5 px-3 rounded-sm bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold text-center flex items-center justify-center gap-1 transition shadow-xs"
                >
                  <span>Siparişi Tamamla</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}