'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, X, ArrowRight, Flame } from 'lucide-react';
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
  const bannerText = settings?.cart_discount_banner_text || `🎉 BÜYÜK FIRSAT! Tüm özel dikim perde siparişlerinizde ${title} avantajını kaçırmayın!`;

  return (
    <aside aria-label="Kampanya Duyuru Çubuğu" className="relative bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white text-xs font-medium py-2 px-4 shadow-md overflow-hidden z-40 transition-all duration-300">
      {/* Arka Plan Hareketli Işıltı Efekti */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.15)_50%,transparent_100%)] animate-[shimmer_3s_infinite]" />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 relative z-10">
        {/* Sol / Ana Mesaj */}
        <div className="flex items-center gap-2 text-center md:text-left flex-wrap justify-center">
          <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
            <span>FIRSAT KAMPANYASI</span>
          </span>
          <span className="font-extrabold text-white text-xs sm:text-sm drop-shadow-xs">
            {bannerText}
          </span>
        </div>

        {/* Sağ: Geri Sayım Sayacı & Keşfet Butonu */}
        <div className="flex items-center gap-3 shrink-0">
          {timeLeft && (
            <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/20 text-[11px] font-bold text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Kalan Süre:</span>
              <div className="flex items-center gap-1 font-mono text-white font-black">
                {timeLeft.days > 0 && (
                  <>
                    <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{String(timeLeft.days).padStart(2, '0')}g</span>
                    <span>:</span>
                  </>
                )}
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{String(timeLeft.hours).padStart(2, '0')}s</span>
                <span>:</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px]">{String(timeLeft.minutes).padStart(2, '0')}d</span>
                <span>:</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded text-[11px] text-amber-300">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          )}

          <Link
            href="/kategori/tul-perdeler"
            className="inline-flex items-center gap-1 bg-white text-slate-950 hover:bg-amber-100 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition shadow-sm hover:scale-105 transform active:scale-95"
          >
            <span>Alışverişe Başla</span>
            <ArrowRight className="w-3 h-3 text-red-600" />
          </Link>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Duyuruyu Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
