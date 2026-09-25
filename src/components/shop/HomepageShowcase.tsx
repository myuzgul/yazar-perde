'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { ChevronRight, Filter, ChevronDown, Loader2 } from 'lucide-react';

interface ShowcaseProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  curtainType: string;
  basePrice: number;
  discountPrice: number | null;
  sortOrder: number;
  category?: { id: string; name: string; slug: string };
  categories?: Array<{ category?: { id: string; name: string; slug: string } }>;
  brand?: { name: string } | null;
  tag?: { name: string; badgeColor: string } | null;
  images: Array<{ imageUrl: string; isCover: boolean }>;
  reviews?: Array<{ rating: number }>;
}

interface HomepageShowcaseProps {
  products: ShowcaseProduct[];
}

const INITIAL_COUNT = 12;
const BATCH_SIZE = 12;

export default function HomepageShowcase({ products }: HomepageShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  // Mevcut kategorileri ürünlerden otomatik ayıkla
  const categoryMap = new Map<string, { id: string; name: string; count: number }>();
  products.forEach((p) => {
    const productCategoryIds = new Set<string>();

    if (p.category) {
      productCategoryIds.add(p.category.id);
      if (!categoryMap.has(p.category.id)) {
        categoryMap.set(p.category.id, {
          id: p.category.id,
          name: p.category.name,
          count: 0,
        });
      }
    }

    if (p.categories) {
      p.categories.forEach((pc) => {
        if (pc.category) {
          productCategoryIds.add(pc.category.id);
          if (!categoryMap.has(pc.category.id)) {
            categoryMap.set(pc.category.id, {
              id: pc.category.id,
              name: pc.category.name,
              count: 0,
            });
          }
        }
      });
    }

    productCategoryIds.forEach((catId) => {
      const entry = categoryMap.get(catId);
      if (entry) {
        entry.count += 1;
      }
    });
  });

  const categories = Array.from(categoryMap.values());

  const filteredProducts = products.filter((p) => {
    if (activeCategory === 'ALL') return true;
    if (p.category?.id === activeCategory) return true;
    if (p.categories?.some((c) => c.category?.id === activeCategory)) return true;
    return false;
  });

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setVisibleCount(INITIAL_COUNT);
  };

  const hasMore = visibleCount < filteredProducts.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredProducts.length));
      setIsLoadingMore(false);
    }, 300);
  }, [isLoadingMore, hasMore, filteredProducts.length]);

  // Sayfa aşağı kaydırıldığında otomatik daha fazla ürün yükleme (Infinite Scroll)
  useEffect(() => {
    const target = observerTargetRef.current;
    if (!target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      {
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, isLoadingMore, loadMore]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const currentCategoryName =
    activeCategory === 'ALL'
      ? `Tümü (${products.length} Model)`
      : `${categories.find((c) => c.id === activeCategory)?.name} (${
          categories.find((c) => c.id === activeCategory)?.count || 0
        })`;

  return (
    <section className="max-w-7xl mx-auto px-4 py-8">
      {/* 1. Başlık Alanı */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
            Öne Çıkan Perde Modelleri
          </h2>
          <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
            {products.length} Model
          </span>
        </div>

        <Link
          href="/kategori/tul-perdeler"
          className="text-xs font-bold text-[#1B84F8] hover:text-[#156cd1] flex items-center gap-1 transition"
        >
          <span>Tüm Modeller</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2. MOBİL: Şık ve Pratik Açılır Kategori Seçici */}
      <div className="block sm:hidden mb-6">
        <div className="relative">
          <div className="flex items-center justify-between bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 shadow-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Filter className="w-4 h-4 text-[#1B84F8] shrink-0" />
              <span className="text-xs font-medium text-slate-500 shrink-0">Kategori:</span>
              <span className="text-xs font-extrabold text-slate-900 truncate">
                {currentCategoryName}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
          </div>
          <select
            value={activeCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer text-xs"
          >
            <option value="ALL">Tüm Modeller ({products.length} Ürün)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.count} Ürün)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. MASAÜSTÜ: Ferah Kategori Butonları */}
      <div className="hidden sm:flex flex-wrap items-center gap-2 mb-8">
        <button
          type="button"
          onClick={() => handleCategoryChange('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeCategory === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          Tümü ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-slate-900 text-white shadow-sm ring-1 ring-slate-900'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </div>

      {/* Ürün Izgarası (Mobilde 2'li, Desktopta 4'lü) */}
      {displayedProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedProducts.map((product) => {
              const coverImg = product.images.find((i) => i.isCover) || product.images[0];
              const approvedRevs = product.reviews || [];
              const revCount = approvedRevs.length;
              const avgRating =
                revCount > 0
                  ? Math.round(
                      approvedRevs.reduce((acc: number, r: { rating: number }) => acc + r.rating, 0) /
                        revCount
                    )
                  : 5;

              return (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  sku={product.sku}
                  curtainType={product.curtainType}
                  basePrice={product.basePrice}
                  discountPrice={product.discountPrice}
                  categoryName={product.category?.name}
                  brandName={product.brand?.name}
                  tag={product.tag}
                  imageUrl={coverImg?.imageUrl}
                  reviewCount={revCount}
                  rating={avgRating}
                />
              );
            })}
          </div>

          {/* Sayfa Kaydırıldığında Tetiklenen Infinite Scroll ve Loading Göstergesi */}
          {hasMore && (
            <div ref={observerTargetRef} className="mt-8 flex flex-col items-center justify-center py-6">
              {isLoadingMore ? (
                <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-2xs">
                  <Loader2 className="w-4 h-4 text-[#1B84F8] animate-spin" />
                  <span>Daha fazla model yükleniyor...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={loadMore}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition py-2 px-4 rounded-full border border-slate-200 hover:border-slate-300 bg-white shadow-2xs cursor-pointer"
                >
                  Daha Fazla Göster ({filteredProducts.length - visibleCount} ürün daha)
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-semibold">Bu kategoride henüz vitrine eklenmiş ürün bulunmuyor.</p>
        </div>
      )}
    </section>
  );
}
