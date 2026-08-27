'use client';

import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ProductImage {
  id: string;
  imageUrl: string;
  isCover: boolean;
}

interface ProductGalleryProps {
  productName: string;
  images: ProductImage[];
  tag?: { name: string; badgeColor: string } | null;
}

export default function ProductGallery({ productName, images, tag }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const imgList = images.length > 0 ? images : [{ id: '1', imageUrl: '/static/sample/tulle_sample.jpg', isCover: true }];
  const currentImg = imgList[activeIndex]?.imageUrl || imgList[0]?.imageUrl;

  return (
    <div className="space-y-3">
      {/* Büyük Görsel */}
      <div className="relative aspect-4/5 w-full rounded-sm overflow-hidden bg-slate-100 border border-slate-200 group">
        <img
          src={currentImg}
          alt={productName}
          className="w-full h-full object-cover cursor-zoom-in group-hover:scale-102 transition-transform duration-300"
          onClick={() => setIsLightboxOpen(true)}
        />
        {tag && (
          <span
            style={{ backgroundColor: tag.badgeColor }}
            className="absolute top-3 left-3 text-[10px] font-bold text-white px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs"
          >
            {tag.name}
          </span>
        )}
        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 bg-slate-900/70 hover:bg-slate-900 text-white p-2 rounded-sm transition cursor-pointer"
          title="Büyük Gör"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Küçük Thumbnail Barı */}
      {imgList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {imgList.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={`w-16 h-16 rounded-sm overflow-hidden border transition shrink-0 cursor-pointer ${
                activeIndex === idx
                  ? 'border-slate-900 ring-1 ring-slate-900'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Tam Ekran Görünüm */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xs flex items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 rounded text-white/70 hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImg}
            alt={productName}
            className="max-w-full max-h-[85vh] object-contain rounded-sm"
          />
        </div>
      )}
    </div>
  );
}