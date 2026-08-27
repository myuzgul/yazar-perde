const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Admin User
  const adminPassword = await bcrypt.hash('admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@perdesiparisi.com' },
    update: {},
    create: {
      name: 'Sistem',
      surname: 'Yöneticisi',
      email: 'admin@perdesiparisi.com',
      phone: '05551234567',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created:', admin.email);

  // 2. System Settings (PDF'teki tüm katsayılar ve başlangıç değerleri)
  const defaultSettings = [
    { key: 'tulle_extra_allowance_cm', value: '20', label: 'Tül Perde Ek Pay (cm)', group: 'PRICING', description: 'Tül hesaplamasında ene eklenen pay' },
    { key: 'tulle_s_pile_extra_price', value: '60', label: 'S Pile Metre Ek Ücreti (TL)', group: 'PRICING', description: 'S pile seçilirse metre fiyatına eklenen tutar' },
    { key: 'tulle_american_pile_extra_price', value: '60', label: 'Amerikan Pile Metre Ek Ücreti (TL)', group: 'PRICING', description: 'Amerikan pile seçilirse metre fiyatına eklenen tutar' },
    { key: 'tulle_kruvaze_mechanism_price', value: '100', label: 'Kruvaze Mekanizma Ücreti (TL)', group: 'PRICING', description: 'Kruvaze mekanizmalı seçiminde eklenen sabit ücret' },

    { key: 'closed_case_sqm_price', value: '30', label: 'Kapalı Kasa m² Ek Ücreti (TL)', group: 'PRICING', description: 'Stor/Zebra/Çiftli sistemde kapalı kasa m² fiyatı' },
    { key: 'metal_chain_extra_price', value: '100', label: 'Metal Zincir Ek Ücreti (TL)', group: 'PRICING', description: 'Metal zincir seçildiğinde eklenen sabit tutar (Çiftli sistemde x2)' },
    { key: 'metal_ceiling_bracket_step_price', value: '5', label: 'Metal Tavan Aparatı 50cm Birim Ücreti (TL)', group: 'PRICING', description: 'Her 50 cm için eklenen tavan aparatı ücreti' },
    { key: 'l_bracket_wall_step_price', value: '10', label: 'L Ayak Duvar Aparatı 50cm Birim Ücreti (TL)', group: 'PRICING', description: 'Her 50 cm için eklenen L ayak duvar aparatı ücreti' },
    { key: 'skirt_cut_sqm_price', value: '30', label: 'Etek Dilimi m² Ek Ücreti (TL)', group: 'PRICING', description: 'Etek dilimi seçildiğinde m² başına ek ücret' },
    { key: 'bead_sqm_price', value: '40', label: 'Boncuk m² Ek Ücreti (TL)', group: 'PRICING', description: 'Etek dilimine boncuk eklendiğinde m² başına ek ücret' },
    { key: 'blackout_sqm_price', value: '250', label: 'Blackout Stor m² Ek Ücreti (TL)', group: 'PRICING', description: 'Çiftli sistemde Blackout stor kumaşı m² ek ücreti' },

    { key: 'plisse_hook_extra_price', value: '50', label: 'Plise Kancalı Montaj Ek Ücreti (TL)', group: 'PRICING', description: 'Cam balkon kancalı montaj seçilirse eklenen tutar' },
    { key: 'renso_piece_price', value: '100', label: 'Renso Adet Fiyatı (TL)', group: 'PRICING', description: 'Fon perde renso aksesuarı birim fiyatı (Çift kanatta x2)' },

    { key: 'free_shipping_threshold', value: '1500', label: 'Ücretsiz Kargo Limiti (TL)', group: 'SHIPPING', description: 'Bu tutar ve üzeri siparişlerde kargo ücretsiz olur' },
    { key: 'shipping_fee', value: '99.90', label: 'Sabit Kargo Ücreti (TL)', group: 'SHIPPING', description: 'Alt limit altındaki siparişlerde kargo ücreti' },
    { key: 'cash_on_delivery_fee', value: '100', label: 'Kapıda Nakit Ödeme Hizmet Bedeli (TL)', group: 'PAYMENT', description: 'Kapıda nakit ödeme seçilirse eklenen tutar' },

    { key: 'site_title', value: 'PerdeSiparisi.com - Özel Ölçülü Perde Mağazası', label: 'Site Başlığı', group: 'GENERAL', description: 'Site genel başlığı' },
    { key: 'site_phone', value: '+90 212 510 22 55', label: 'Müşteri Hizmetleri Telefonu', group: 'GENERAL', description: 'Header ve pre-header iletişim telefonu' },
    { key: 'site_slogan', value: 'Perde Almanın En Kolay Yolu', label: 'Üst Slogan', group: 'GENERAL', description: 'Pre-header sol üst slogan' },
    { key: 'site_discount_bar_text', value: '%40 İNDİRİM KAMPANYASI', label: 'İndirim Çubuğu Metni', group: 'GENERAL', description: 'Pre-header orta kampanya duyurusu' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }
  console.log('System settings seeded.');

  // 3. Brands
  const brands = [
    { name: 'Brillant', slug: 'brillant', logoUrl: '/static/brands/brillant.png' },
    { name: 'Taç', slug: 'tac', logoUrl: '/static/brands/tac.png' },
    { name: 'Premier', slug: 'premier', logoUrl: '/static/brands/premier.png' },
    { name: 'Venezia Perde', slug: 'venezia', logoUrl: '/static/brands/venezia.png' },
  ];
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }
  console.log('Brands seeded.');

  // 4. Product Tags
  const tags = [
    { name: 'İndirimli Ürün', slug: 'indirimli-urun', badgeColor: '#EF4444' },
    { name: 'Çok Satan', slug: 'cok-satan', badgeColor: '#1B84F8' },
    { name: 'Yeni Sezon', slug: 'yeni-sezon', badgeColor: '#10B981' },
    { name: 'Son 1 Ürün', slug: 'son-1-urun', badgeColor: '#F59E0B' },
  ];
  for (const t of tags) {
    await prisma.productTag.upsert({
      where: { slug: t.slug },
      update: {},
      create: t,
    });
  }
  console.log('Product tags seeded.');

  // 5. Categories
  const categories = [
    { name: 'Tül Perdeler', slug: 'tul-perdeler', description: 'Özel dikim şık tül perdeler' },
    { name: 'Stor Perdeler', slug: 'stor-perdeler', description: 'Modern mekanizmalı stor perde modelleri' },
    { name: 'Zebra Perdeler', slug: 'zebra-perdeler', description: 'Gece ve gündüz kullanımına uygun zebra perdeler' },
    { name: 'Çiftli Sistem Tül+Stor', slug: 'ciftli-sistem-tul-stor', description: 'Tül ve storun tek kasada birleştiği çiftli sistemler' },
    { name: 'Plise Perdeler', slug: 'plise-perdeler', description: 'Cam balkon ve dar alanlar için ipli plise perde' },
    { name: 'Fon Perdeler', slug: 'fon-perdeler', description: 'Dekoratif şık kumaş fon perdeler' },
    { name: 'İp Perdeler', slug: 'ip-perdeler', description: 'Ferah ve dekoratif ip perdeler' },
    { name: 'Ahşap Jaluziler', slug: 'ahsap-jaluziler', description: 'Doğal ahşap jaluzi sistemleri' },
    { name: 'Rustikler', slug: 'rustikler', description: 'Ahşap ve metal borulu rustik perdeler' },
  ];
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log('Categories seeded.');

  // 6. Notification Templates
  const notificationTemplates = [
    {
      code: 'ORDER_RECEIVED',
      title: 'Sipariş Alındı Bildirimi',
      smsBody: 'Sayin {{customer_name}}, {{order_number}} numarali siparisiniz alinmistir. Tutar: {{total}} TL. PerdeSiparisi.com',
      emailSubject: 'Siparişiniz Alındı - {{order_number}}',
      emailHtmlBody: '<p>Merhaba <strong>{{customer_name}}</strong>,</p><p>{{order_number}} numaralı siparişiniz başarıyla alınmıştır.</p><p>Toplam Tutar: <strong>{{total}} TL</strong></p><p>Sipariş detaylarınız üretime hazırlanmaktadır.</p>',
    },
    {
      code: 'IN_PRODUCTION',
      title: 'Üretime Sevk Edildi',
      smsBody: 'Sayin {{customer_name}}, {{order_number}} numarali ozel olculu perdeniz dikim/uretim asamasina gecmistir. PerdeSiparisi.com',
      emailSubject: 'Siparişiniz Üretime Sevk Edildi - {{order_number}}',
      emailHtmlBody: '<p>Merhaba <strong>{{customer_name}}</strong>,</p><p>{{order_number}} numaralı perde siparişiniz atölyemizde üretim ve dikim sürecine girmiştir.</p>',
    },
    {
      code: 'SHIPPED',
      title: 'Kargoya Verildi',
      smsBody: 'Sayin {{customer_name}}, {{order_number}} numarali siparisiniz kargoya verilmistir. Takip kodunuz ulasacaktir. PerdeSiparisi.com',
      emailSubject: 'Siparişiniz Kargoya Verildi - {{order_number}}',
      emailHtmlBody: '<p>Merhaba <strong>{{customer_name}}</strong>,</p><p>{{order_number}} numaralı siparişiniz titizlikle paketlenerek kargoya teslim edilmiştir.</p>',
    },
  ];

  for (const nt of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { code: nt.code },
      update: {},
      create: nt,
    });
  }
  console.log('Notification templates seeded.');

  // 7. Static Pages
  const staticPages = [
    { title: 'Hakkımızda', slug: 'hakkimizda', contentHtml: '<h2>Hakkımızda</h2><p>PerdeSiparisi.com olarak 20 yılı aşkın süredir özel ölçülü perde üretimi yapmaktayız.</p>' },
    { title: 'Sıkça Sorulan Sorular', slug: 'sikca-sorulan-sorular', contentHtml: '<h2>Sıkça Sorulan Sorular</h2><p>Sipariş ve ölçü alma süreçleri ile ilgili merak ettikleriniz.</p>' },
    { title: 'Perde Ölçüsü Nasıl Alınır?', slug: 'perde-olcusu-nasil-alinir', contentHtml: '<h2>Perde Ölçüsü Alma Rehberi</h2><p>Korniş, duvar ve cam balkon ölçülerinizi kolayca alabilirsiniz.</p>' },
    { title: 'Garanti ve İade Şartları', slug: 'garanti-sartlari', contentHtml: '<h2>Garanti Şartları</h2><p>Tüm mekanizma ve kumaşlarımız 24 ay garantilidir.</p>' },
    { title: 'Kargo Bilgileri', slug: 'kargo-bilgileri', contentHtml: '<h2>Kargo ve Teslimat</h2><p>Türkiye geneline sigortalı ve korumalı ambalaj ile gönderim yapılmaktadır.</p>' },
    { title: 'İletişim', slug: 'iletisim', contentHtml: '<h2>İletişim</h2><p>Müşteri Hizmetleri: +90 212 510 22 55<br>E-posta: info@perdesiparisi.com</p>' },
  ];
  for (const sp of staticPages) {
    await prisma.staticPage.upsert({
      where: { slug: sp.slug },
      update: {},
      create: sp,
    });
  }
  console.log('Static pages seeded.');

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
