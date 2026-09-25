import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/shop/ProductDetailClient';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
  });

  if (!product) return { title: 'Ürün Bulunamadı' };

  return {
    title: product.seoTitle || `${product.name} - Özel Ölçü Perde`,
    description: product.seoDesc || product.shortDesc || `${product.name} en uygun fiyatlarla PerdeSiparisi.com'da.`,
    keywords: product.seoKeywords || undefined,
  };
}

import { getSystemSettings } from '@/lib/settings';

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const [product, settings] = await Promise.all([
    prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        categories: { include: { category: true } },
        brand: true,
        tag: true,
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    }),
    getSystemSettings(),
  ]);

  if (!product || !product.isActive) {
    notFound();
  }

  // Benzer ürünler (Ürünün bağlı olduğu kategorilerdeki diğer 4 ürün)
  const allCategoryIds = [
    product.categoryId,
    ...(product.categories?.map((c) => c.categoryId) || []),
  ];

  const similarProducts = await prisma.product.findMany({
    where: {
      OR: [
        { categoryId: { in: allCategoryIds } },
        { categories: { some: { categoryId: { in: allCategoryIds } } } },
      ],
      id: { not: product.id },
      isActive: true,
    },
    take: 4,
    include: { images: true },
  });

  return (
    <ProductDetailClient
      product={product as any}
      similarProducts={similarProducts}
      initialSettings={settings}
    />
  );
}