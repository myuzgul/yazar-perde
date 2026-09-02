import React from 'react';
import Link from 'next/link';
import StoryBar from '@/components/shop/StoryBar';
import SmallBanners from '@/components/shop/SmallBanners';
import HomepageShowcase from '@/components/shop/HomepageShowcase';
import prisma from '@/lib/prisma';

export const revalidate = 60;

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { 
      isActive: true,
      isFeatured: true,
    },
    orderBy: [
      { sortOrder: 'asc' },
      { createdAt: 'desc' },
    ],
    include: {
      category: true,
      brand: true,
      tag: true,
      images: { orderBy: { sortOrder: 'asc' } },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
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

      {/* 3. Ana Sayfa Vitrin ve Kategori Filtreli Ürün Listesi */}
      <HomepageShowcase products={products as any} />

      {/* 4. Küçük Kampanya Bannerları & Avantajlar */}
      <div className="max-w-7xl mx-auto px-4">
        <SmallBanners />
      </div>
    </main>
  );
}