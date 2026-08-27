const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProducts() {
  console.log('Seeding sample curtain products...');

  const catTulle = await prisma.category.findUnique({ where: { slug: 'tul-perdeler' } });
  const catRoller = await prisma.category.findUnique({ where: { slug: 'stor-perdeler' } });
  const catZebra = await prisma.category.findUnique({ where: { slug: 'zebra-perdeler' } });
  const catDouble = await prisma.category.findUnique({ where: { slug: 'ciftli-sistem-tul-stor' } });
  const catPlisse = await prisma.category.findUnique({ where: { slug: 'plise-perdeler' } });
  const catFon = await prisma.category.findUnique({ where: { slug: 'fon-perdeler' } });
  const catJalousie = await prisma.category.findUnique({ where: { slug: 'ahsap-jaluziler' } });

  const brandBrillant = await prisma.brand.findUnique({ where: { slug: 'brillant' } });
  const brandTac = await prisma.brand.findUnique({ where: { slug: 'tac' } });
  const tagIndirim = await prisma.productTag.findUnique({ where: { slug: 'indirimli-urun' } });
  const tagCokSatan = await prisma.productTag.findUnique({ where: { slug: 'cok-satan' } });

  const sampleProducts = [
    {
      name: 'Brillant Düz Petek Tül Perde (Ütü İstemez)',
      sku: 'BR-TUL-01',
      slug: 'brillant-duz-petek-tul-perde',
      curtainType: 'TULLE',
      categoryId: catTulle ? catTulle.id : '',
      brandId: brandBrillant ? brandBrillant.id : null,
      tagId: tagCokSatan ? tagCokSatan.id : null,
      basePrice: 320.0,
      discountPrice: 280.0,
      vatRate: 10,
      shortDesc: 'Özel dokuma ütü istemez 1. kalite petek tül perde',
      descriptionHtml: '<h3>Brillant Petek Dokuma</h3><p>Güneş ışığını mükemmel süzer, kırışmaz ve kolay temizlenir.</p>',
      images: [
        { imageUrl: '/static/sample/tulle_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: 'Düz Beyaz Mat Stor Perde',
      sku: 'STR-MAT-101',
      slug: 'duz-beyaz-mat-stor-perde',
      curtainType: 'ROLLER',
      categoryId: catRoller ? catRoller.id : '',
      brandId: brandTac ? brandTac.id : null,
      tagId: tagIndirim ? tagIndirim.id : null,
      basePrice: 360.0,
      discountPrice: null,
      vatRate: 10,
      shortDesc: 'Alüminyum mekanizmalı, leke tutmaz apreli stor perde',
      descriptionHtml: '<h3>Mat Stor Perde</h3><p>Ofis ve ev kullanımı için minimalist şıklık.</p>',
      images: [
        { imageUrl: '/static/sample/roller_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: 'Ekonomik Krem Zebra Perde',
      sku: 'ZBR-KRM-201',
      slug: 'ekonomik-krem-zebra-perde',
      curtainType: 'ZEBRA',
      categoryId: catZebra ? catZebra.id : '',
      brandId: brandBrillant ? brandBrillant.id : null,
      tagId: null,
      basePrice: 420.0,
      discountPrice: 380.0,
      vatRate: 10,
      shortDesc: 'Gece ve gündüz çift fonksiyonlu zebra perde sistemi',
      descriptionHtml: '<h3>Çift Fonksiyonlu Zebra</h3><p>Işık kontrolünü kolayca ayarlayın.</p>',
      images: [
        { imageUrl: '/static/sample/zebra_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: 'Yeni Sezon Çiftli Sistem TülStor 2026',
      sku: 'UK-2650',
      slug: 'yeni-sezon-ciftli-sistem-tulstor-2026',
      curtainType: 'DOUBLE_ROLLER',
      categoryId: catDouble ? catDouble.id : '',
      brandId: brandTac ? brandTac.id : null,
      tagId: tagCokSatan ? tagCokSatan.id : null,
      basePrice: 680.0,
      discountPrice: 590.0,
      vatRate: 10,
      shortDesc: 'Tek kasada bağımsız tül ve stor mekanizması',
      descriptionHtml: '<h3>Çiftli Sistem Konforu</h3><p>Hem tülünüzü hem storunuzu tek şık kasada yönetin.</p>',
      images: [
        { imageUrl: '/static/sample/double_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: '1. Sınıf Bal Peteği Plise Perde',
      sku: 'PLS-BAL-301',
      slug: '1-sinif-bal-petegi-plise-perde',
      curtainType: 'PLISSE',
      categoryId: catPlisse ? catPlisse.id : '',
      brandId: null,
      tagId: tagIndirim ? tagIndirim.id : null,
      basePrice: 450.0,
      discountPrice: null,
      vatRate: 10,
      shortDesc: 'Cam balkon ve dar kanatlar için ipli plise perde',
      descriptionHtml: '<h3>Isı ve Ses Yalıtımlı Petek Plise</h3><p>Delmeden kancalı montaj seçeneği ile cam balkonunuza tam uyum.</p>',
      images: [
        { imageUrl: '/static/sample/plisse_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: 'Kadife Dokulu Lüks Fon Perde',
      sku: 'FON-KDF-401',
      slug: 'kadife-dokulu-luks-fon-perde',
      curtainType: 'FON',
      categoryId: catFon ? catFon.id : '',
      brandId: brandTac ? brandTac.id : null,
      tagId: null,
      basePrice: 550.0,
      discountPrice: 480.0,
      vatRate: 10,
      shortDesc: 'Ağır gramajlı, zengin dökümlü kadife fon perde',
      descriptionHtml: '<h3>Lüks Kadife Döküm</h3><p>Evinizin salonuna asalet ve zarafet katar.</p>',
      images: [
        { imageUrl: '/static/sample/fon_sample.jpg', sortOrder: 0, isCover: true }
      ]
    },
    {
      name: 'Doğal Ahşap Jaluzi 50mm Raylı',
      sku: 'JLZ-AHS-501',
      slug: 'dogal-ahsap-jaluzi-50mm',
      curtainType: 'WOODEN_JALOUSIE',
      categoryId: catJalousie ? catJalousie.id : '',
      brandId: null,
      tagId: null,
      basePrice: 850.0,
      discountPrice: null,
      vatRate: 10,
      shortDesc: 'Doğal fırınlanmış ahşap slatler ve sağlam mekanizma',
      descriptionHtml: '<h3>Doğal Ahşap Jaluzi</h3><p>Sıcak ve doğal ahşap dokusu.</p>',
      images: [
        { imageUrl: '/static/sample/jalousie_sample.jpg', sortOrder: 0, isCover: true }
      ]
    }
  ];

  for (const p of sampleProducts) {
    if (!p.categoryId) continue;
    const { images, ...productData } = p;
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        ...productData,
        images: {
          create: images
        }
      }
    });
  }

  console.log('Sample curtain products successfully seeded.');
}

seedProducts()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
