'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Truck, ShieldCheck } from 'lucide-react';

interface PreHeaderProps {
  slogan?: string;
  discountText?: string;
  phone?: string;
}

export default function PreHeader({
  slogan = 'Özel Ölçülü Dikim Atölyesi • Kusursuz Uyum Garantisi',
  discountText = '1.500 TL Üzeri Ücretsiz Kargo',
  phone = '+90 212 510 22 55',
}: PreHeaderProps) {
  return (
    <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Sol: Slogan & Güvence */}
        <div className="hidden lg:flex items-center gap-2 text-slate-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{slogan}</span>
        </div>

        {/* Orta: Kargo & Kampanya Bilgisi */}
        <div className="flex items-center gap-1.5 font-semibold text-slate-200 mx-auto lg:mx-0">
          <Truck className="w-3.5 h-3.5 text-[#1B84F8]" />
          <span>{discountText}</span>
        </div>

        {/* Sağ: Sipariş Takibi & Müşteri Hattı */}
        <div className="hidden sm:flex items-center gap-4 text-slate-300">
          <Link href="/siparis-takip" className="hover:text-white transition">
            Sipariş Takibi
          </Link>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 hover:text-white transition font-medium">
            <Phone className="w-3 h-3 text-[#1B84F8]" />
            <a href={`tel:${phone.replace(/\s+/g, '')}`}>{phone}</a>
          </div>
        </div>
      </div>
    </div>
  );
}