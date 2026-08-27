import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yazar.mesarajans.com';

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const staticPages = await prisma.staticPage.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
      url: `${baseUrl}/kategori/${cat.slug}`,
      lastModified: cat.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/urun/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'daily',
      priority: 0.9,
    }));

    const pageEntries: MetadataRoute.Sitemap = staticPages.map((sp) => ({
      url: `${baseUrl}/sayfalar/${sp.slug}`,
      lastModified: sp.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.5,
    }));

    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/sepet`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      },
      {
        url: `${baseUrl}/siparis-takip`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      ...categoryEntries,
      ...productEntries,
      ...pageEntries,
    ];
  } catch {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}