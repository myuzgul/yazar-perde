'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X, ChevronRight, FolderTree } from 'lucide-react';

interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  _count: { products: number; productCategories?: number };
}

interface CategoryParent {
  id: string;
  name: string;
  slug: string;
  _count: { products: number; productCategories?: number };
  children?: CategoryChild[];
}

interface BrandItem {
  id: string;
  name: string;
}

interface CategoryMobileDrawerProps {
  parentCategories: CategoryParent[];
  brands?: BrandItem[];
  currentSlug: string;
  currentCategoryName: string;
}

export default function CategoryMobileDrawer({
  parentCategories,
  brands = [],
  currentSlug,
  currentCategoryName,
}: CategoryMobileDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Modal açıkken arkadaki sayfanın kaymasını engelle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobilde Tetikleyici Buton */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex md:hidden items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer shrink-0"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-[#1B84F8]" />
        <span>Kategoriler</span>
      </button>

      {/* Drawer Overlay & Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Karartma Arka Plan */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Soldan Açılan Menü Paneli */}
          <div className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Üst Başlık & Kapat Butonu */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-[#1B84F8]" />
                <span className="text-xs font-bold uppercase tracking-wider">Perde Kategorileri</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Kategori Ağacı */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1.5 text-xs">
                {parentCategories.map((p) => {
                  const isParentActive = p.slug === currentSlug;
                  const pCount =
                    (p._count.productCategories ?? p._count.products) +
                    (p.children?.reduce(
                      (acc, c) => acc + (c._count.productCategories ?? c._count.products),
                      0
                    ) || 0);

                  return (
                    <div key={p.id} className="space-y-1">
                      <Link
                        href={`/kategori/${p.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center justify-between py-2 px-2.5 rounded-lg transition ${
                          isParentActive
                            ? 'font-bold text-[#1B84F8] bg-blue-50 border border-blue-200'
                            : 'text-slate-800 hover:text-slate-950 hover:bg-slate-50 font-semibold'
                        }`}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono ml-2">({pCount})</span>
                      </Link>

                      {/* Alt Kategoriler */}
                      {p.children && p.children.length > 0 && (
                        <div className="pl-3 space-y-0.5 border-l-2 border-slate-100 ml-3">
                          {p.children.map((c) => {
                            const isCurrent = c.slug === currentSlug;
                            const cCount = c._count.productCategories ?? c._count.products;
                            return (
                              <Link
                                key={c.id}
                                href={`/kategori/${c.slug}`}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center justify-between py-1.5 px-2.5 text-[11px] rounded-md transition ${
                                  isCurrent
                                    ? 'font-bold text-[#1B84F8] bg-blue-50/70 border border-blue-100'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                              >
                                <span className="truncate">{c.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono ml-2">({cCount})</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Kumaş Markaları Varsa */}
              {brands.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2.5">
                    Kumaş Markaları
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-700">
                    {brands.map((b) => (
                      <div key={b.id} className="py-1 px-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        <span>{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alt Bilgi */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <span className="text-[11px] text-slate-500">
                Seçili: <strong className="text-slate-900">{currentCategoryName}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
