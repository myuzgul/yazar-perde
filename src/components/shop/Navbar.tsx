'use client';

import React from 'react';
import Link from 'next/link';

export const DEFAULT_CATEGORIES = [
  { name: 'TÜL PERDELER', slug: 'tul-perdeler' },
  { name: 'STOR PERDELER', slug: 'stor-perdeler' },
  { name: 'ZEBRA PERDELER', slug: 'zebra-perdeler' },
  { name: 'ÇİFTLİ SİSTEM (TÜL+STOR)', slug: 'ciftli-sistem-tul-stor' },
  { name: 'PLİSE PERDELER (CAM BALKON)', slug: 'plise-perdeler' },
  { name: 'FON PERDELER', slug: 'fon-perdeler' },
  { name: 'AHŞAP JALUZİ', slug: 'ahsap-jaluziler' },
  { name: 'İP PERDELER', slug: 'ip-perdeler' },
  { name: 'RUSTİK PERDELER', slug: 'rustikler' },
  { name: 'ÖLÇÜ REHBERİ', slug: 'perde-olcusu-nasil-alinir', isGuide: true },
];

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-none hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-5 whitespace-nowrap">
        {DEFAULT_CATEGORIES.map((item) => (
          <Link
            key={item.slug}
            href={item.isGuide ? `/sayfalar/${item.slug}` : `/kategori/${item.slug}`}
            className={`py-3 text-[11px] font-bold tracking-wide transition-colors border-b-2 ${
              item.isGuide
                ? 'text-[#1B84F8] border-transparent hover:border-[#1B84F8]'
                : 'text-slate-800 border-transparent hover:text-[#1B84F8] hover:border-[#1B84F8]'
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}