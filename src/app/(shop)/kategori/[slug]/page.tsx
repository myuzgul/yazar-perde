import React from 'react';
import prisma from '@/lib/prisma';
import ProductCard from '@/components/shop/ProductCard';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sort?: string; minPrice?: string; maxPrice?: string }>;
}

export default async function CategoryPage(props: CategoryPageProps) {
  const params = await props.params;
  const searchParams = props.searchParams ? await props.searchParams : {};
  const { slug } = params;
  const { sort, minPrice, maxPrice } = searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  const allCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  const brands = await prisma.brand.findMany({
    where: { isActive: true },
  });

  // Sıralama
  let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
  if (sort === 'price_asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price_desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'name_asc') orderBy = { name: 'asc' };
  else if (sort === 'name_desc') orderBy = { name: 'desc' };

  const products = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      isActive: true,
    },
    orderBy,
    include: {
      category: true,
      brand: true,
      tag: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-400">Kategoriler</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-slate-900">{category.name}</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sol Filtreleme Alanı (Desktop) */}
        <aside className="w-full md:w-60 shrink-0 space-y-6">
          {/* Kategoriler */}
          <div className="border-b border-slate-200 pb-5">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
              Tüm Kategoriler
            </h3>
            <ul className="space-y-1 text-xs">
              {allCategories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/kategori/${c.slug}`}
                    className={`flex items-center justify-between py-1.5 px-2 rounded-sm transition ${
                      c.slug === slug
                        ? 'font-bold text-[#1B84F8] bg-blue-50/60'
                        : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({c._count.products})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>



          {/* Markalar */}
          {brands.length > 0 && (
            <div className="pb-5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                Kumaş Markaları
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                {brands.map((b) => (
                  <label key={b.id} className="flex items-center gap-2 cursor-pointer hover:text-slate-950">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]" />
                    <span>{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Sağ: Başlık, Sıralama & Ürün Grid'i */}
        <section className="flex-1">
          {/* Üst Toolbar */}
          <div className="border-b border-slate-200 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">{category.name}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{products.length} ürün listeleniyor</p>
            </div>

            {/* Sıralama Seçenekleri */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">Sırala:</span>
              <div className="flex items-center border border-slate-200 rounded-sm overflow-hidden bg-slate-50">
                <Link
                  href={`/kategori/${slug}?sort=price_asc`}
                  className={`px-3 py-1.5 transition ${
                    sort === 'price_asc'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  En Düşük Fiyat
                </Link>
                <Link
                  href={`/kategori/${slug}?sort=price_desc`}
                  className={`px-3 py-1.5 border-l border-slate-200 transition ${
                    sort === 'price_desc'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  En Yüksek Fiyat
                </Link>
                <Link
                  href={`/kategori/${slug}?sort=name_asc`}
                  className={`px-3 py-1.5 border-l border-slate-200 transition ${
                    sort === 'name_asc'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  A-Z
                </Link>
              </div>
            </div>
          </div>

          {/* Ürün Izgarası */}
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {products.map((product) => {
                const coverImg = product.images.find((i) => i.isCover) || product.images[0];
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
                  />
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-200 p-12 text-center text-xs text-slate-500 rounded-sm">
              Bu kategoride henüz yayınlanmış perde modeli bulunmuyor.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}