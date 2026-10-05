'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, X, Flame } from 'lucide-react';
import { isCampaignLive } from '@/lib/cart-discount';

interface CampaignTopBarProps {
  initialSettings?: any;
}

export default function CampaignTopBar({ initialSettings }: CampaignTopBarProps) {
  const [settings, setSettings] = useState<any>(initialSettings || null);
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!initialSettings) {
      fetch('/api/settings/public')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data) setSettings(d.data);
        })
        .catch(() => {});
    }
  }, [initialSettings]);

  const isLive = isCampaignLive(settings) && Number(settings?.cart_discount_show_top_bar ?? 1) === 1;
  const endDateStr = settings?.cart_discount_end_date;

  useEffect(() => {
    if (!isLive || !endDateStr) {
      setTimeLeft(null);
      return;
    }

    const calculateTimeLeft = () => {
      const difference = +new Date(endDateStr) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [isLive, endDateStr]);

  if (!isLive || dismissed) return null;

  const rate = Number(settings?.cart_discount_rate || 10);
  const title = settings?.cart_discount_title || `Sepette %${rate} İndirim`;
  const bannerText = settings?.cart_discount_banner_text || `🔥 SEPETTE BÜYÜK FIRSAT! Tüm perde siparişlerinizde ${title} fırsatını kaçırmayın!`;

  return (
    <aside aria-label="Kampanya Duyuru Çubuğu" className="relative bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-[11px] sm:text-xs font-semibold py-1 sm:py-1.5 px-3 sm:px-4 shadow-xs overflow-hidden z-40 transition-all">
      {/* Hareketli Işıltı Efekti */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_50%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 relative z-10">
        {/* Tıklanabilir İnce Duyuru Alanı */}
        <Link
          href="/kategori/tul-perdeler"
          className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2.5 text-center truncate hover:opacity-95 transition"
        >
          <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0 animate-pulse" />
          
          <span className="truncate drop-shadow-xs">
            {bannerText}
          </span>

          {/* Geri Sayım Sayacı (Kompakt Tek Satır) */}
          {timeLeft && (
            <span className="inline-flex items-center gap-1 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-mono text-amber-200 font-bold shrink-0 ml-1">
              <Clock className="w-3 h-3 text-amber-300 shrink-0" />
              {timeLeft.days > 0 && `${timeLeft.days}g `}
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          )}

          <span className="hidden sm:inline-block text-[10px] font-bold text-amber-200 underline shrink-0 ml-1">
            İncele →
          </span>
        </Link>

        {/* Kapatma Butonu (Sağda Küçük ve İnce) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDismissed(true);
          }}
          className="p-0.5 rounded text-white/75 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
          title="Kapat"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
