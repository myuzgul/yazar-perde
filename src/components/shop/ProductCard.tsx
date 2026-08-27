'use client';

import React from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  sku: string;
  curtainType: string;
  basePrice: number;
  discountPrice?: number | null;
  categoryName?: string;
  brandName?: string;
  brandLogo?: string | null;
  tag?: { name: string; badgeColor: string } | null;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
}

export default function ProductCard({
  name,
  slug,
  sku,
  curtainType,
  basePrice,
  discountPrice,
  categoryName,
  brandName,
  tag,
  imageUrl = '/static/sample/tulle_sample.jpg',
  rating = 5,
  reviewCount = 0,
}: ProductCardProps) {
  const hasDiscount = discountPrice && discountPrice < basePrice;
  const currentPrice = hasDiscount ? discountPrice : basePrice;

  return (
    <Link
      href={`/urun/${slug}`}
      className="group flex flex-col bg-white border border-slate-200 hover:border-slate-400 transition-colors duration-200 rounded-sm overflow-hidden"
    >
      {/* 1. Ürün Görsel Alanı (Büyük ve Öne Çıkan) */}
      <div className="relative aspect-4/5 w-full bg-slate-100 overflow-hidden">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
        />

        {/* Sol Üst Rozet */}
        {tag && (
          <span
            style={{ backgroundColor: tag.badgeColor }}
            className="absolute top-2 left-2 text-[9px] font-bold text-white px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs"
          >
            {tag.name}
          </span>
        )}

        {/* İndirim Rozeti */}
        {hasDiscount && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
            %{Math.round(((basePrice - discountPrice) / basePrice) * 100)} İNDİRİM
          </span>
        )}
      </div>

      {/* 2. Bilgi Alanı (Doğal E-Ticaret Düzeni) */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Kategori ve Marka */}
          <div className="text-[10px] text-slate-400 font-medium mb-1 flex items-center justify-between">
            <span>{categoryName || 'Özel Ölçü'}</span>
            {brandName && <span className="font-semibold text-slate-600">{brandName}</span>}
          </div>

          {/* Ürün Adı */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#1B84F8] transition-colors">
            {name}
          </h3>

          {/* Yıldız / Değerlendirme */}
          <div className="flex items-center gap-1 mt-1.5">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`w-3 h-3 ${star <= (reviewCount > 0 ? rating : 5) ? 'fill-current' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400">
              ({reviewCount})
            </span>
          </div>
        </div>

        {/* Fiyat Alanı */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between">
          <div>
            <span className="text-[9px] text-slate-400 block font-medium">Birim Fiyat</span>
            <div className="flex items-baseline gap-1.5">
              {hasDiscount && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₺{basePrice.toFixed(2)}
                </span>
              )}
              <span className={`text-sm sm:text-base font-extrabold ${hasDiscount ? 'text-red-600' : 'text-slate-950'}`}>
                ₺{currentPrice.toFixed(2)}
              </span>
            </div>
          </div>

          <span className="text-[10px] text-[#1B84F8] font-bold">
            Ölçü Seçin →
          </span>
        </div>
      </div>
    </Link>
  );
}