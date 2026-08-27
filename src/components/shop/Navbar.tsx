'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react';

interface MenuChildCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  children?: MenuChildCategory[];
  _count?: { products: number };
}

const FALLBACK_CATEGORIES: MenuCategory[] = [
  { id: '1', name: 'TÜL PERDELER', slug: 'tul-perdeler' },
  { id: '2', name: 'STOR PERDELER', slug: 'stor-perdeler' },
  { id: '3', name: 'ZEBRA PERDELER', slug: 'zebra-perdeler' },
  { id: '4', name: 'ÇİFTLİ SİSTEM (TÜL+STOR)', slug: 'ciftli-sistem-tul-stor' },
  { id: '5', name: 'PLİSE PERDELER', slug: 'plise-perdeler' },
  { id: '6', name: 'FON PERDELER', slug: 'fon-perdeler' },
  { id: '7', name: 'AHŞAP JALUZİ', slug: 'ahsap-jaluziler' },
  { id: '8', name: 'İP PERDELER', slug: 'ip-perdeler' },
  { id: '9', name: 'RUSTİKLER', slug: 'rustikler' },
];

export default function Navbar() {
  const [categories, setCategories] = useState<MenuCategory[]>(FALLBACK_CATEGORIES);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/shop/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setCategories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 relative hidden md:block z-30">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 whitespace-nowrap overflow-x-visible">
        {categories.map((cat) => {
          const hasChildren = cat.children && cat.children.length > 0;
          const isDropdownOpen = activeDropdown === cat.id;

          return (
            <div
              key={cat.id}
              className="relative"
              onMouseEnter={() => hasChildren && setActiveDropdown(cat.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                href={`/kategori/${cat.slug}`}
                className={`py-3 px-3 text-[11px] font-bold tracking-wider transition-colors border-b-2 flex items-center gap-1.5 ${
                  isDropdownOpen
                    ? 'text-[#1B84F8] border-[#1B84F8] bg-slate-50'
                    : 'text-slate-800 border-transparent hover:text-[#1B84F8] hover:border-[#1B84F8]'
                }`}
              >
                <span>{cat.name.toUpperCase()}</span>
                {hasChildren && (
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-[#1B84F8]' : 'text-slate-400'
                    }`}
                  />
                )}
              </Link>

              {/* AÇILIR MEGA / DROPDOWN ALT MENÜ */}
              {hasChildren && isDropdownOpen && (
                <div className="absolute top-full left-0 min-w-[240px] bg-white border border-slate-200 shadow-xl rounded-b-md p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Alt Modeller</span>
                    <span className="text-[#1B84F8] font-bold">{cat.children?.length} Çeşit</span>
                  </div>

                  <div className="space-y-0.5">
                    {cat.children?.map((child) => (
                      <Link
                        key={child.id}
                        href={`/kategori/${child.slug}`}
                        onClick={() => setActiveDropdown(null)}
                        className="group flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:text-[#1B84F8] hover:bg-slate-50 rounded transition"
                      >
                        <span className="group-hover:translate-x-1 transition-transform">
                          {child.name}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#1B84F8] transition" />
                      </Link>
                    ))}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <Link
                      href={`/kategori/${cat.slug}`}
                      onClick={() => setActiveDropdown(null)}
                      className="block px-3 py-1.5 text-[11px] font-bold text-[#1B84F8] hover:bg-blue-50 rounded text-center transition"
                    >
                      Tüm {cat.name} Modellerini Gör →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Sabit Ölçü Rehberi Linki */}
        <Link
          href="/sayfalar/perde-olcusu-nasil-alinir"
          className="ml-auto py-3 px-3 text-[11px] font-bold tracking-wider text-[#1B84F8] border-b-2 border-transparent hover:border-[#1B84F8] flex items-center gap-1 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>ÖLÇÜ REHBERİ</span>
        </Link>
      </div>
    </nav>
  );
}