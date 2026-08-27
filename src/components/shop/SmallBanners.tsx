'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Truck, RotateCcw, Scissors } from 'lucide-react';

export default function SmallBanners() {
  return (
    <section className="py-10 space-y-12">
      {/* 1. Güven & Avantaj Barı (Doğal, entegre e-ticaret ızgarası) */}
      <div className="border border-slate-200 rounded-md bg-slate-50/70 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex items-start gap-3">
          <Scissors className="w-5 h-5 text-[#1B84F8] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Milimetrik Özel Dikim</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Pencerenize tam uyan atölye işçiliği</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Truck className="w-5 h-5 text-[#1B84F8] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Ücretsiz & Sigortalı Kargo</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">1.500 TL üzeri tüm siparişlerde</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#1B84F8] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">24 Ay Mekanizma Garantisi</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">1. sınıf alüminyum ve çelik ray</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <RotateCcw className="w-5 h-5 text-[#1B84F8] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-900">Birebir Değişim Güvencesi</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">Üretim kaynaklı kusurlarda ücretsiz yenileme</p>
          </div>
        </div>
      </div>

      {/* 2. 3'lü Editoryal Koleksiyon Bannerları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/kategori/plise-perdeler"
          className="group relative h-56 rounded-md overflow-hidden bg-slate-900 p-6 flex flex-col justify-between text-white border border-slate-200"
        >
          <img
            src="/uploads/products/plise_beyaz_petek.jpg"
            alt="Cam Balkon Plise"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-950/80 px-2 py-0.5 rounded-sm">
              CAM BALKON & PVC
            </span>
            <h3 className="text-lg font-bold mt-2 leading-tight">
              Kancalı & Vidalı Plise Perdeler
            </h3>
            <p className="text-xs text-slate-200 mt-1">Delmeden 10 dakikada kolay montaj</p>
          </div>
          <span className="relative z-10 text-xs font-bold text-[#1B84F8] flex items-center gap-1 group-hover:underline">
            Koleksiyonu İncele <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/kategori/ciftli-sistem-tul-stor"
          className="group relative h-56 rounded-md overflow-hidden bg-slate-900 p-6 flex flex-col justify-between text-white border border-slate-200"
        >
          <img
            src="/uploads/products/zebra_simli_etekli.jpg"
            alt="Çiftli Sistem"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-950/80 px-2 py-0.5 rounded-sm">
              ÇİFT İŞLEVLİ SİSTEMLER
            </span>
            <h3 className="text-lg font-bold mt-2 leading-tight">
              Tül + Karartma Stor Tek Kasada
            </h3>
            <p className="text-xs text-slate-200 mt-1">Gündüz tül zarafeti, gece tam karartma</p>
          </div>
          <span className="relative z-10 text-xs font-bold text-[#1B84F8] flex items-center gap-1 group-hover:underline">
            Fiyat Hesapla <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link
          href="/kategori/fon-perdeler"
          className="group relative h-56 rounded-md overflow-hidden bg-slate-900 p-6 flex flex-col justify-between text-white border border-slate-200"
        >
          <img
            src="/uploads/products/fon_lacivert_kadife.jpg"
            alt="Lüks Fon Perdeler"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-slate-950/80 px-2 py-0.5 rounded-sm">
              SALON & YATAK ODASI
            </span>
            <h3 className="text-lg font-bold mt-2 leading-tight">
              Dökümlü Kadife & Keten Fonlar
            </h3>
            <p className="text-xs text-slate-200 mt-1">Tek kanat ve çift kanat seçenekleriyle</p>
          </div>
          <span className="relative z-10 text-xs font-bold text-[#1B84F8] flex items-center gap-1 group-hover:underline">
            Modelleri Gör <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}