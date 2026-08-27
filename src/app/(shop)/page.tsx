import React from 'react';
import StoryBar from '@/components/shop/StoryBar';
import ProductCard from '@/components/shop/ProductCard';
import SmallBanners from '@/components/shop/SmallBanners';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const revalidate = 60;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      category: true,
      brand: true,
      tag: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hikaye Çubuğu */}
      <StoryBar />

      {/* 2. Hero Banner (Doğal İç Mekan ve Gerçek Perde Görseli) */}
      <section className="max-w-7xl mx-auto px-4 pt-4 pb-8">
        <div className="relative rounded-md overflow-hidden bg-slate-900 text-white min-h-[380px] sm:min-h-[460px] flex items-center p-6 sm:p-14 border border-slate-200">
          {/* Arka Plan Gerçek Fotoğraf */}
          <img
            src="/uploads/products/fon_lacivert_kadife.jpg"
            alt="Yazar Perde Özel Ölçü"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />

          {/* Hero Metni */}
          <div className="relative z-10 max-w-lg">
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-sm backdrop-blur-2xs inline-block mb-3">
              ATÖLYEDEN DOĞRUDAN SİPARİŞ
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight mb-3">
              Evinize Özel Ölçü, <br className="hidden sm:block" />
              Kusursuz Perde Dikimi
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mb-6 leading-relaxed">
              Tül, stor, zebra, cam balkon plisesi ve fon perdelerinizi milimetrik net ölçünüze göre hazırlıyoruz. Pile sıklığını, kasa tipini ve aparatları adım adım seçin.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/kategori/tul-perdeler"
                className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-6 py-3 rounded-md text-xs font-bold transition shadow-xs"
              >
                Koleksiyonları Keşfet
              </Link>
              <Link
                href="/sayfalar/perde-olcusu-nasil-alinir"
                className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-3 rounded-md text-xs font-bold transition shadow-xs"
              >
                Ölçü Nasıl Alınır?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Ürün Listeleme Alanı */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3 mb-6">
          <div>
            <span className="text-[11px] font-bold text-[#1B84F8] uppercase tracking-wider block">
              ÖZEL DİKİM KOLEKSİYONU
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
              En Çok Tercih Edilen Perde Modelleri
            </h2>
          </div>

          <Link
            href="/kategori/tul-perdeler"
            className="text-xs font-semibold text-slate-700 hover:text-[#1B84F8] flex items-center gap-1 transition"
          >
            <span>Tüm Modeller</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Ürün Izgarası (Mobilde 2'li, Desktopta 4'lü) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
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
      </section>

      {/* 4. Küçük Kampanya Bannerları & Avantajlar */}
      <div className="max-w-7xl mx-auto px-4">
        <SmallBanners />
      </div>
    </main>
  );
}