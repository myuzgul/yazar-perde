const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function slugify(text) {
  const trMap = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'i': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' };
  return text
    .split('')
    .map(char => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function detectCurtainType(title, catName) {
  const text = `${title} ${catName}`.toLowerCase();
  if (text.includes('zebra')) return 'ZEBRA';
  if (text.includes('cam balkon') || text.includes('plise') || text.includes('bal petegi') || text.includes('petek')) return 'PLISE';
  if (text.includes('stor') || text.includes('guneslik')) return 'STOR';
  if (text.includes('fon')) return 'FON';
  if (text.includes('jaluzi')) return 'JALUZI';
  if (text.includes('cift') || text.includes('ciftli')) return 'DOUBLE';
  if (text.includes('tul')) return 'TUL';
  return 'TUL';
}

async function getOrCreateCategory(catName) {
  const cleanName = catName.trim() || 'Genel Perdeler';
  const slug = slugify(cleanName);

  let category = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: cleanName } },
        { slug: { equals: slug } }
      ]
    }
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: cleanName,
        slug: slug,
        isActive: true,
        showInMenu: true,
      }
    });
  }

  return category;
}

async function run() {
  console.log('🚀 yazarperde.com ürün aktarım işlemi başlatılıyor...');
  const sitemapRes = await fetch('https://www.yazarperde.com/sitemap/products/1.xml');
  const sitemapText = await sitemapRes.text();
  const urls = sitemapText.match(/<loc>(.*?)<\/loc>/g)?.map(u => u.replace(/<\/?loc>/g, '')) || [];
  
  console.log(`Toplam ${urls.length} ürün bulundu.`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const currentIndex = i + 1;
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const html = await res.text();

      const titleMatch = html.match(/<h1[^>]*class="[^"]*p-g-m-h-i-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i) || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      let title = titleMatch ? titleMatch[1].trim().replace(/<[^>]+>/g, '').replace(/\s+/g, ' ') : url.split('/').pop().replace(/-/g, ' ');

      const salePriceMatch = html.match(/<div[^>]*class="[^"]*sale-price[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
      let price = 150;
      if (salePriceMatch) {
        const cleaned = salePriceMatch[1].replace(/[^0-9,.]/g, '').replace(/\./g, '').replace(',', '.');
        price = parseFloat(cleaned) || 150;
      }

      const imgMatches = [...html.matchAll(/data-src="([^"]*urunler\/[^"]*)"/gi), ...html.matchAll(/src="([^"]*urunler\/[^"]*)"/gi)];
      const rawImages = [...new Set(imgMatches.map(m => m[1]))];
      const images = rawImages.filter(img => img.includes('urunler/'));

      const breadcrumbs = [...html.matchAll(/<li[^>]*class="breadcrumb-item"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/gi)].map(m => m[1].trim());
      const categoryName = breadcrumbs.length > 1 ? breadcrumbs[1] : 'Tül Perdeler';
      const category = await getOrCreateCategory(categoryName);

      const curtainType = detectCurtainType(title, categoryName);
      let baseSlug = slugify(title);
      if (!baseSlug) baseSlug = `urun-${currentIndex}`;

      let existingProduct = await prisma.product.findFirst({
        where: { OR: [{ name: title }, { slug: baseSlug }] }
      });

      if (existingProduct) {
        await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: title,
            basePrice: price,
            curtainType: curtainType,
            categoryId: category.id,
            isActive: true,
          }
        });
      } else {
        let finalSlug = baseSlug;
        let slugExists = await prisma.product.findUnique({ where: { slug: finalSlug } });
        if (slugExists) {
          finalSlug = `${baseSlug}-${currentIndex}`;
        }

        const sku = `YP-${Math.abs(title.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)).toString(36).toUpperCase().padStart(6, '0')}-${currentIndex}`;

        await prisma.product.create({
          data: {
            name: title,
            slug: finalSlug,
            sku: sku,
            curtainType: curtainType,
            categoryId: category.id,
            basePrice: price,
            vatRate: 10,
            isActive: true,
            isFeatured: true,
            sortOrder: currentIndex,
            images: {
              create: images.slice(0, 10).map((imgUrl, idx) => ({
                imageUrl: imgUrl,
                isCover: idx === 0,
                sortOrder: idx,
              }))
            }
          }
        });
      }
      console.log(`[${currentIndex}/${urls.length}] ${title}`);
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('Tamamlandı!');
}

run().finally(() => prisma.$disconnect());
