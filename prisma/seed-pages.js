const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPages() {
  console.log('Seeding rich static pages...');

  const pages = [
    {
      title: 'Perde Ölçüsü Nasıl Alınır?',
      slug: 'perde-olcusu-nasil-alinir',
      seoTitle: 'Perde Ölçüsü Nasıl Alınır? - Adım Adım Ölçü Alma Rehberi',
      seoDesc: 'Tül, stor, zebra ve cam balkon plise perdeleriniz için evde kolay ve hatasız ölçü alma rehberi.',
      contentHtml: `
        <h3>1. Tül ve Fon Perdelerde Ölçü Alma</h3>
        <p>Tül ve fon perdelerde <strong>En ölçüsü</strong>, kornişinizin sağ başından sol başına kadar olan mesafedir. Dilerseniz pencere kasasının her iki yanından 20'şer cm taşırarak da alabilirsiniz.</p>
        <p><strong>Boy ölçüsü</strong> için korniş üzerinden süpürpeliğe kadar veya yere değecekse yerden 2-3 cm yukarıda kalacak şekilde ölçüm yapınız.</p>

        <h3>2. Stor ve Zebra Perdelerde Ölçü Alma</h3>
        <p>Pencere kenarlarınızda boşluk varsa pencere kasasından sağdan ve soldan en az <strong>10'ar cm</strong> taşırarak ölçü veriniz (Örn: Cam 120 cm ise 140 cm sipariş veriniz). Bu sayede içeriye ışık sızması engellenir.</p>

        <h3>3. Cam Balkon Plise Perdelerde Ölçü Alma</h3>
        <p>Her bir açılır cam kanadı için cam fitilinden diğer fitile kadar olan net cam ölçüsünü alınız. Plise perdelerimizde <strong>buçuklu (örn: 27.5 cm, 32.5 cm)</strong> ölçü girebilirsiniz.</p>
      `
    },
    {
      title: 'Sıkça Sorulan Sorular (SSS)',
      slug: 'sikca-sorulan-sorular',
      seoTitle: 'Sıkça Sorulan Sorular - PerdeSiparisi.com',
      seoDesc: 'Özel ölçülü perde siparişi, dikim süreleri, pile modelleri ve montaj hakkında merak edilen sorular.',
      contentHtml: `
        <h3>Perde siparişim kaç günde hazırlanır?</h3>
        <p>Kişiye özel ölçüye göre dikilen tüm perde modellerimiz <strong>3 ila 5 iş günü</strong> içerisinde titizlikle imal edilip kargoya teslim edilmektedir.</p>

        <h3>Cam balkonuma delmeden plise perde takabilir miyim?</h3>
        <p>Evet, kancalı montaj seçeneğimizi tercih ettiğinizde alüminyum veya PVC doğramanızı delmeden, kancaları kanat üst ve altına geçirerek 10 dakikada montaj yapabilirsiniz.</p>

        <h3>Pile sıklığı nedir? Hangi pileyi seçmeliyim?</h3>
        <p>En çok tercih edilen döküm <strong>1x2.5 Normal Pile</strong> ve <strong>1x3 Sık Pile</strong>dir. 1x3 pilede her 1 metre pencere için 3 metre kumaş kullanılır ve zengin, kabarık bir görünüm sağlar.</p>
      `
    },
    {
      title: 'Garanti ve İade Şartları',
      slug: 'garanti-sartlari',
      seoTitle: 'Garanti ve İade Şartları - PerdeSiparisi.com',
      seoDesc: '24 ay mekanizma garantisi ve tüketici hakları bilgilendirmesi.',
      contentHtml: `
        <h3>24 Ay Mekanizma Garantisi</h3>
        <p>Tüm stor, zebra, plise ve motorlu perde mekanizmalarımız 1. sınıf alüminyum ve çelik parçalardan üretilmekte olup <strong>24 ay tam garanti</strong> kapsamındadır.</p>

        <h3>Özel Ölçü Dikim Güvencesi</h3>
        <p>Tarafınızca girilen ölçülerin atölyemizde birebir hatasız dikilmesi taahhüt edilmektedir. Üretim veya kumaş kaynaklı herhangi bir kusurda perdeniz ücretsiz olarak derhal yeniden dikilir ve değiştirilir.</p>
      `
    },
    {
      title: 'Kargo ve Teslimat',
      slug: 'kargo-bilgileri',
      seoTitle: 'Kargo ve Teslimat Bilgileri - PerdeSiparisi.com',
      seoDesc: 'Sigortalı kargo gönderimi ve teslimat süreleri hakkında bilgiler.',
      contentHtml: `
        <h3>1.500 TL Üzeri Ücretsiz Kargo</h3>
        <p>PerdeSiparisi.com üzerinden verilen <strong>1.500 TL ve üzeri tüm siparişlerde kargo tamamen ücretsizdir</strong>.</p>
        <p>Tüm ürünlerimiz darbelere ve bükülmelere karşı korumalı özel sert silindir kutularda ve ambalajlarda sigortalı olarak gönderilir.</p>
      `
    },
    {
      title: 'İletişim & Atölye',
      slug: 'iletisim',
      seoTitle: 'İletişim & Atölye Bilgileri - PerdeSiparisi.com',
      seoDesc: 'Yazar Perde iletişim numaraları, atölye adresi ve destek kanalları.',
      contentHtml: `
        <h3>Merkez Ofis & İmalat Atölyesi</h3>
        <p><strong>Firma:</strong> Yazar Perde Sistemleri San. ve Tic. Ltd. Şti.</p>
        <p><strong>Adres:</strong> Keresteciler Sitesi, Perdeciler Çarşısı No: 42, Zeytinburnu / İstanbul</p>
        <p><strong>Müşteri Hizmetleri:</strong> +90 212 510 22 55</p>
        <p><strong>WhatsApp Sipariş Hattı:</strong> +90 532 100 20 30</p>
        <p><strong>E-Posta:</strong> destek@perdesiparisi.com</p>
      `
    },
    {
      title: 'Mesafeli Satış Sözleşmesi',
      slug: 'mesafeli-satis-sozlesmesi',
      seoTitle: 'Mesafeli Satış Sözleşmesi - PerdeSiparisi.com',
      seoDesc: 'Yasal mesafeli satış sözleşmesi ve tüketici hakları metni.',
      contentHtml: `
        <h3>Mesafeli Satış Sözleşmesi</h3>
        <p>Bu sözleşme 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri uyarınca düzenlenmiştir.</p>
        <p>Alıcı, sipariş verdiği anda bu sözleşmenin tüm koşullarını kabul etmiş sayılır.</p>
      `
    },
    {
      title: 'Gizlilik ve Güvenlik Politikası',
      slug: 'gizlilik-politikasi',
      seoTitle: 'Gizlilik Politikası - PerdeSiparisi.com',
      seoDesc: 'KVKK ve müşteri veri güvenliği ilkeleri.',
      contentHtml: `
        <h3>Kişisel Verilerin Korunması</h3>
        <p>Müşterilerimizin kişisel verileri 6698 sayılı KVKK kapsamında yalnızca siparişin teslimi ve faturalandırılması amacıyla işlenmekte olup 3. şahıslarla asla paylaşılmamaktadır.</p>
      `
    }
  ];

  for (const page of pages) {
    await prisma.staticPage.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }

  console.log('All static pages successfully seeded.');
}

seedPages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
