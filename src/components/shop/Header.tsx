'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  ShoppingBag, 
  User, 
  X, 
  Menu, 
  ChevronRight, 
  Phone, 
  Package, 
  Ruler, 
  HelpCircle 
} from 'lucide-react';

interface HeaderProps {
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
}

const CATEGORIES = [
  { name: 'Tül Perdeler', slug: 'tul-perdeler' },
  { name: 'Stor Perdeler', slug: 'stor-perdeler' },
  { name: 'Zebra Perdeler', slug: 'zebra-perdeler' },
  { name: 'Çiftli Sistem Tül+Stor', slug: 'ciftli-sistem-tul-stor' },
  { name: 'Plise Perdeler (Cam Balkon)', slug: 'plise-perdeler' },
  { name: 'Fon Perdeler', slug: 'fon-perdeler' },
  { name: 'Ahşap Jaluziler', slug: 'ahsap-jaluziler' },
  { name: 'İp & Rustikler', slug: 'ip-ve-rustik-perdeler' },
];

export default function Header({ cartCount = 0, onOpenCart, onOpenAuth }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/products?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data.slice(0, 5));
      }
    } catch {
      setSearchResults([]);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-8">
          {/* Sol: Hamburger Butonu (Mobil) & Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1.5 -ml-1 rounded-md hover:bg-slate-100 text-slate-800 md:hidden cursor-pointer"
              aria-label="Kategorileri Göster"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="/images/logo.jpg"
                alt="Yazar Perde"
                className="h-8 sm:h-9 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Orta: Profesyonel Arama Çubuğu (Masaüstü) */}
          <div className="relative flex-1 max-w-lg hidden md:block">
            <div className="relative flex items-center border border-slate-300 focus-within:border-slate-800 rounded-md bg-white transition-colors">
              <input
                type="text"
                placeholder="Perde modeli, kumaş türü veya ürün kodu arayın..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full py-2 pl-3.5 pr-9 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent"
              />
              {searchQuery ? (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSearching(false);
                  }}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <Search className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
              )}
            </div>

            {/* Canlı Arama Sonuç Dropdown */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md border border-slate-200 shadow-xl p-1.5 z-50 divide-y divide-slate-100">
                {searchResults.map((item) => (
                  <Link
                    key={item.id}
                    href={`/urun/${item.slug}`}
                    onClick={() => setIsSearching(false)}
                    className="flex items-center gap-3 p-2 hover:bg-slate-50 transition"
                  >
                    <img
                      src={item.images?.[0]?.imageUrl || '/static/sample/tulle_sample.jpg'}
                      alt={item.name}
                      className="w-9 h-9 object-cover rounded-sm border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.category?.name} • {item.sku}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1B84F8] shrink-0">
                      ₺{item.basePrice.toFixed(2)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sağ Aksiyonlar: Sipariş Takip, Hesabım & Sepet */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              href="/siparis-takip"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#1B84F8] transition"
            >
              <Package className="w-4 h-4 text-slate-400" />
              <span>Sipariş Takibi</span>
            </Link>

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-950 transition cursor-pointer"
            >
              <User className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Hesabım</span>
            </button>

            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-[#1B84F8] hover:bg-[#156cd1] text-white px-3.5 py-2 rounded-md text-xs font-bold transition cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Sepetim</span>
              {cartCount > 0 && (
                <span className="bg-white text-[#1B84F8] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobilde Arama Çubuğu */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="relative flex items-center border border-slate-300 rounded-md bg-white">
            <input
              type="text"
              placeholder="Perde modeli veya kumaş ara..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full py-1.5 pl-3 pr-8 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent"
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setIsSearching(false);
                }}
                className="absolute right-2.5 text-slate-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            )}
          </div>

          {/* Mobil Arama Sonuçları */}
          {isSearching && searchResults.length > 0 && (
            <div className="mt-1 bg-white border border-slate-200 shadow-xl p-1 z-50 divide-y divide-slate-100 rounded-md">
              {searchResults.map((item) => (
                <Link
                  key={item.id}
                  href={`/urun/${item.slug}`}
                  onClick={() => setIsSearching(false)}
                  className="flex items-center gap-2.5 p-2 hover:bg-slate-50 transition"
                >
                  <img
                    src={item.images?.[0]?.imageUrl || '/static/sample/tulle_sample.jpg'}
                    alt={item.name}
                    className="w-8 h-8 object-cover rounded-sm border border-slate-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-[9px] text-slate-500">{item.category?.name}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[#1B84F8] shrink-0">
                    ₺{item.basePrice.toFixed(2)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* MOBİL DRAWER MENÜ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Karartma Katmanı */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Çekmece */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Çekmece Başlığı */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center">
                <img
                  src="/images/logo.jpg"
                  alt="Yazar Perde"
                  className="h-7 w-auto object-contain"
                />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kategori Listesi */}
            <div className="p-4 flex-1 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2 px-1">
                  Kategoriler
                </span>
                <nav className="divide-y divide-slate-100">
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/kategori/${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between py-2.5 px-1 text-xs font-semibold text-slate-800 hover:text-[#1B84F8] transition"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Kurumsal / Yardım Linkleri */}
              <div className="pt-2 border-t border-slate-200 space-y-2 text-xs font-medium text-slate-600">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  Hızlı Menü
                </span>
                <Link
                  href="/siparis-takip"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 px-1 text-slate-800"
                >
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>Sipariş Takibi</span>
                </Link>
                <Link
                  href="/sayfalar/perde-olcusu-nasil-alinir"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 px-1 text-slate-800"
                >
                  <Ruler className="w-4 h-4 text-slate-400" />
                  <span>Perde Ölçü Rehberi</span>
                </Link>
                <Link
                  href="/sayfalar/sikca-sorulan-sorular"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-1.5 px-1 text-slate-800"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Sıkça Sorulan Sorular</span>
                </Link>
              </div>
            </div>

            {/* Alt Telefon Destek Butonu */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
              <a
                href="tel:+902125102255"
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-md text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-[#1B84F8]" />
                <span>+90 212 510 22 55</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}