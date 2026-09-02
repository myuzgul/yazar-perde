'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, ShieldCheck, CreditCard, Lock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Kolon 1: Logo & Firma Bilgisi */}
        <div>
          <div className="mb-4 bg-white p-2.5 rounded-sm inline-block">
            <img
              src="/images/logo.jpg"
              alt="Yazar Perde"
              className="h-8 w-auto object-contain"
            />
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 mb-4">
            Türkiye'nin özel ölçülü perde dikim atölyesi. Evinize, ofisinize ve cam balkonunuza tam uyan milimetrik dikim ve 24 ay mekanizma garantisi.
          </p>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-[#1B84F8]" />
                <a href="tel:+905414945173" className="hover:text-white transition font-medium">0541 494 51 73</a>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-[#1B84F8]" />
                <a href="mailto:info@yazarperde.com" className="hover:text-white transition font-medium">info@yazarperde.com</a>
              </div>
              <div className="flex items-start gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-[#1B84F8] shrink-0 mt-0.5" />
                <span className="leading-snug">Anadolu Mah. Atıcılar Cd. No: 1/A, 16270 Yıldırım/Bursa</span>
              </div>
            </div>
        </div>

        {/* Kolon 2: Popüler Kategoriler */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-[#1B84F8] pl-2">
            Perde Modelleri
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link href="/kategori/tul-perdeler" className="hover:text-white transition">Tül Perdeler</Link></li>
            <li><Link href="/kategori/stor-perdeler" className="hover:text-white transition">Stor Perdeler</Link></li>
            <li><Link href="/kategori/zebra-perdeler" className="hover:text-white transition">Zebra Perdeler</Link></li>
            <li><Link href="/kategori/ciftli-sistem-tul-stor" className="hover:text-white transition">Çiftli Sistem Tül + Stor</Link></li>
            <li><Link href="/kategori/plise-perdeler" className="hover:text-white transition">Plise Perdeler (Cam Balkon)</Link></li>
            <li><Link href="/kategori/fon-perdeler" className="hover:text-white transition">Fon Perdeler</Link></li>
            <li><Link href="/kategori/ahsap-jaluziler" className="hover:text-white transition">Ahşap Jaluzi Sistemleri</Link></li>
          </ul>
        </div>

        {/* Kolon 3: Müşteri Hizmetleri & Rehberler */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-[#1B84F8] pl-2">
            Müşteri Hizmetleri
          </h4>
          <ul className="space-y-2 text-[11px]">
            <li><Link href="/siparis-takip" className="hover:text-white text-[#1B84F8] font-bold transition">Sipariş Takibi</Link></li>
            <li><Link href="/sayfalar/perde-olcusu-nasil-alinir" className="hover:text-white transition">Perde Ölçüsü Nasıl Alınır?</Link></li>
            <li><Link href="/sayfalar/sikca-sorulan-sorular" className="hover:text-white transition">Sıkça Sorulan Sorular</Link></li>
            <li><Link href="/sayfalar/garanti-sartlari" className="hover:text-white transition">Garanti ve İade Şartları</Link></li>
            <li><Link href="/sayfalar/kargo-bilgileri" className="hover:text-white transition">Kargo ve Teslimat</Link></li>
            <li><Link href="/sayfalar/iletisim" className="hover:text-white transition">İletişim & Atölye</Link></li>
          </ul>
        </div>

        {/* Kolon 4: Güvenli Alışveriş */}
        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4 border-l-2 border-[#1B84F8] pl-2">
            Güvenli Alışveriş
          </h4>
          <p className="text-[11px] text-slate-400 mb-4">
            Tüm siparişleriniz 256-Bit SSL güvenlik sertifikası ve PayTR 3D Secure güvencesiyle korunmaktadır.
          </p>
          <div className="flex flex-wrap gap-2 text-slate-300 mb-4">
            <span className="px-2 py-1 rounded-sm bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> 256-Bit SSL
            </span>
            <span className="px-2 py-1 rounded-sm bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
              <CreditCard className="w-3 h-3 text-[#1B84F8]" /> PayTR 3D Secure
            </span>
            <span className="px-2 py-1 rounded-sm bg-slate-800 border border-slate-700 text-[10px] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-purple-400" /> Kapıda Ödeme
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
        <p>© 2026 Yazar Perde Sistemleri. Tüm Hakları Saklıdır.</p>
        <div className="flex gap-4">
          <Link href="/sayfalar/mesafeli-satis-sozlesmesi" className="hover:text-slate-400">Mesafeli Satış Sözleşmesi</Link>
          <Link href="/sayfalar/gizlilik-politikasi" className="hover:text-slate-400">Gizlilik Politikası</Link>
          <Link href="/panel/login" className="hover:text-[#1B84F8] font-bold">Yönetici Paneli</Link>
        </div>
      </div>
    </footer>
  );
}