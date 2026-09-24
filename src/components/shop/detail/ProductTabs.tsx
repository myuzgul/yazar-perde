'use client';

import React, { useState, useEffect } from 'react';
import { Video, Star, Camera, CheckCircle2, MessageSquarePlus, X, ZoomIn, CreditCard, ShieldCheck } from 'lucide-react';
import { compressImage } from '@/lib/image-compressor';

interface ReviewItem {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl?: string | null;
  createdAt: string;
}

interface ProductTabsProps {
  productId?: string;
  descriptionHtml: string | null;
  mountingVideoUrl?: string | null;
  mountingGuideHtml?: string | null;
  grandTotal: number;
}

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.includes('embed/')) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

export default function ProductTabs({
  productId,
  descriptionHtml,
  mountingVideoUrl,
  mountingGuideHtml,
  grandTotal,
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'DESC' | 'VIDEO' | 'REVIEWS' | 'INSTALLMENT' | 'SHIPPING'>('DESC');

  // Yorumlar State
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(5.0);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Yorum Ekleme Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fotoğraf Büyütme Modalı
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);

  const youtubeEmbed = getYouTubeEmbedUrl(mountingVideoUrl);

  // Yorumları Çekme
  const fetchReviews = async () => {
    if (!productId) return;
    setLoadingReviews(true);
    try {
      const res = await fetch(`/api/shop/reviews?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data.reviews || []);
        setTotalCount(data.data.totalCount || 0);
        setAverageRating(data.data.averageRating || 5.0);
      }
    } catch {
      // Hata durumunda sessizce geç
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Fotoğraf Seçildiğinde (İstemcide Hızlı Sıkıştırma)
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // Otomatik sıkıştırma (< 100KB WebP)
    const compressed = await compressImage(file);
    setSelectedPhoto(compressed);
    setPhotoPreview(URL.createObjectURL(compressed));
  };

  // Yorum Gönderme
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !customerName.trim() || !comment.trim()) {
      setSubmitError('Lütfen adınızı ve yorumunuzu yazınız.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let uploadedImageUrl: string | null = null;

      // Eğer fotoğraf eklendiyse önce upload et
      if (selectedPhoto) {
        const formData = new FormData();
        formData.append('file', selectedPhoto);
        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          uploadedImageUrl = uploadData.url;
        }
      }

      // Yorum kaydı
      const res = await fetch('/api/shop/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName,
          rating,
          comment,
          imageUrl: uploadedImageUrl,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setCustomerName('');
        setComment('');
        setSelectedPhoto(null);
        setPhotoPreview(null);
        setShowReviewForm(false);
      } else {
        setSubmitError(data.message || 'Yorum gönderilemedi.');
      }
    } catch {
      setSubmitError('Bağlantı hatası oluştu, lütfen tekrar deneyiniz.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-sm p-6 mb-16 bg-white">
      {/* Yatay Sekme Başlıkları */}
      <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-3 mb-6">
        {[
          { id: 'DESC', label: 'Ürün Bilgileri & Özellikler' },
          { id: 'VIDEO', label: 'Montaj & Kurulum Videosu' },
          { id: 'REVIEWS', label: `Müşteri Yorumları (${totalCount})` },
          { id: 'INSTALLMENT', label: 'Taksit Tablosu', badge: 'Vade Farksız 3 Taksit' },
          { id: 'SHIPPING', label: 'Teslimat & İade' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-bold transition pb-1 border-b-2 cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* SEKME 1: ÜRÜN BİLGİLERİ */}
      {activeTab === 'DESC' && (
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-xs sm:text-sm">
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          ) : (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">1. Sınıf Kumaş & Dayanıklı Mekanizma</h3>
              <p>Tüm perdelerimiz ISO standartlarında kumaş ve alüminyum mekanizmalar kullanılarak atölyemizde üretilmektedir.</p>
            </div>
          )}
        </div>
      )}

      {/* SEKME 2: MONTAJ VİDEOSU & REHBER */}
      {activeTab === 'VIDEO' && (
        <div className="space-y-6">
          <div className="max-w-3xl mx-auto">
            {youtubeEmbed ? (
              <div className="aspect-video w-full rounded-sm overflow-hidden border border-slate-300 shadow-sm bg-black">
                <iframe
                  src={youtubeEmbed}
                  title="Perde Montaj ve Kurulum Videosu"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-sm overflow-hidden border border-slate-300 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                <Video className="w-12 h-12 text-[#1B84F8]" />
                <div>
                  <h4 className="text-sm font-bold">Kolay ve Hızlı Perde Montajı</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Özel ölçülü perdeleriniz pratik montaj aparatları ile birlikte gönderilir. Matkap veya vida kullanmadan kornişe 5 dakikada takabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 pt-6 max-w-3xl mx-auto">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🛠️ Adım Adım Kurulum ve Montaj Talimatları</span>
            </h3>

            {mountingGuideHtml ? (
              <div 
                className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mountingGuideHtml }}
              />
            ) : (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">1. Korniş Montajı (Pratik Çevir-Tak)</h4>
                  <p className="text-slate-600">Paketinizden çıkan plastik montaj aparatlarını her 40-50 cm aralıkla korniş kanalına takıp saat yönünde çevirerek kilitleyin.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">2. Perde Profilini Oturtma</h4>
                  <p className="text-slate-600">Perdenizin üst alüminyum kasasını aparatların ön tırnağına oturtup hafifçe yukarı doğru bastırarak &quot;çıt&quot; sesini duyana kadar itin.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">3. Mekanizma Testi</h4>
                  <p className="text-slate-600">Yan zinciri yavaşça çekerek perdenin aşağı ve yukarı akıcı hareket ettiğini kontrol edin.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKME 3: MÜŞTERİ YORUMLARI & FOTOĞRAFLI YORUM EKLEME */}
      {activeTab === 'REVIEWS' && (
        <div className="space-y-6">
          {/* Başarı Bildirimi */}
          {submitSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-sm text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Teşekkürler!</strong> Yorumunuz ve fotoğrafınız başarıyla alındı. Yönetici onayının ardından burada yayınlanacaktır.</span>
              </div>
              <button 
                type="button" 
                onClick={() => setSubmitSuccess(false)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-2 cursor-pointer"
              >
                Tamam
              </button>
            </div>
          )}

          {/* Üst Özet & Yorum Yap Butonu */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex text-amber-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i <= Math.round(averageRating) ? 'fill-current' : 'text-slate-200'}`}
                  />
                ))}
              </div>
              <div>
                <span className="text-sm font-bold text-slate-900">{averageRating} / 5.0</span>
                <span className="text-xs text-slate-500 ml-1.5">({totalCount} Müşteri Değerlendirmesi)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>{showReviewForm ? 'Formu Kapat' : 'Yorum ve Fotoğraf Ekle'}</span>
            </button>
          </div>

          {/* YORUM EKLEME FORMU (AÇILIR KUTU) */}
          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-300 rounded-sm p-4 sm:p-5 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  ✍️ Ürün Yorumu ve Evinizden Fotoğraf Bırakın
                </h4>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-sm text-xs">
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Puanınız *
                  </label>
                  <div className="flex items-center gap-1 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                      >
                        <Star className={`w-5 h-5 ${star <= rating ? 'fill-current' : 'text-slate-200'}`} />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">({rating} Yıldız)</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Yorumunuz *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Kumaş kalitesi, dikiş işçiliği, montaj kolaylığı ve deneyiminiz hakkında..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-sm p-3 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              {/* FOTOĞRAF YÜKLEME ALANI (OTOMATİK WEB/MOBİL SIKIŞTIRMALI) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Perdenizin Fotoğrafı (İsteğe Bağlı)
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-3 py-2 bg-white border border-slate-300 hover:border-slate-500 rounded-sm text-xs font-semibold text-slate-700 flex items-center gap-2 cursor-pointer transition">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>{selectedPhoto ? 'Fotoğrafı Değiştir' : 'Evinizden Fotoğraf Seç'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Otomatik optimize edilir, sayfa hızını yavaşlatmaz.
                  </span>
                </div>

                {photoPreview && (
                  <div className="relative inline-block mt-2">
                    <img
                      src={photoPreview}
                      alt="Önizleme"
                      className="w-20 h-20 object-cover rounded-sm border border-slate-300 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-xs hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] text-white rounded-sm text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Gönderiliyor...' : 'Yorumu Gönder'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ONAYLI YORUMLAR LİSTESİ */}
          <div className="divide-y divide-slate-100 space-y-4">
            {reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                        {rev.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-900 block leading-tight">
                          {rev.customerName}
                        </span>
                        <div className="flex text-amber-400 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed pl-9">
                    {rev.comment}
                  </p>

                  {/* MÜŞTERİ FOTOĞRAFI (Tıklayınca Büyür) */}
                  {rev.imageUrl && (
                    <div className="pl-9 pt-1">
                      <button
                        type="button"
                        onClick={() => setEnlargedPhoto(rev.imageUrl!)}
                        className="relative group inline-block rounded-sm overflow-hidden border border-slate-200 hover:border-slate-400 transition cursor-pointer"
                        title="Fotoğrafı Büyüt"
                      >
                        <img
                          src={rev.imageUrl}
                          alt={`${rev.customerName} perdesi`}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-sm"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition">
                          <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition" />
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                Bu ürün için henüz onaylanmış müşteri yorumu bulunmuyor. İlk yorumu ve fotoğrafı siz bırakın!
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEKME 4: TAKSİT TABLOSU */}
      {activeTab === 'INSTALLMENT' && (
        <div className="space-y-6">
          {/* Vade Farksız 3 Taksit Banner */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50/70 to-emerald-50 border-2 border-[#1B84F8]/20 rounded-md p-4 sm:p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-10 h-10 rounded-full bg-[#1B84F8] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Tüm Kredi Kartlarına Vade Farksız 3 Taksit İmkanı
                    </h3>
                    <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0">
                      %0 Vade Farkı
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Bonus, World, Maximum, Axess, CardFinans, Paraf, Bankkart ve Sağlam Kart ile peşin fiyatına 3 taksitle güvenle satın alabilirsiniz.
                  </p>
                </div>
              </div>

              {grandTotal > 0 && (
                <div className="bg-white px-4 py-2.5 rounded-md border border-slate-200/80 shrink-0 text-left sm:text-center shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">3 Taksitli Aylık Ödeme</span>
                  <span className="text-base font-black text-emerald-600 block">
                    3 x ₺{(grandTotal / 3).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Toplam: ₺{grandTotal.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Kart Aileleri & Taksit Tabloları */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                name: 'Bonus',
                bank: 'Garanti BBVA, TEB, Deniz',
                headerClass: 'border-emerald-500/30 bg-emerald-50/50 text-emerald-950',
              },
              {
                name: 'World',
                bank: 'Yapı Kredi, Albaraka, Vakıf',
                headerClass: 'border-purple-500/30 bg-purple-50/50 text-purple-950',
              },
              {
                name: 'Maximum',
                bank: 'Türkiye İş Bankası',
                headerClass: 'border-blue-500/30 bg-blue-50/50 text-blue-950',
              },
              {
                name: 'Axess',
                bank: 'Akbank',
                headerClass: 'border-amber-500/30 bg-amber-50/50 text-amber-950',
              },
              {
                name: 'CardFinans',
                bank: 'QNB Finansbank',
                headerClass: 'border-sky-500/30 bg-sky-50/50 text-sky-950',
              },
              {
                name: 'Paraf',
                bank: 'Halkbank',
                headerClass: 'border-cyan-500/30 bg-cyan-50/50 text-cyan-950',
              },
              {
                name: 'Bankkart',
                bank: 'Ziraat Bankası',
                headerClass: 'border-red-500/30 bg-red-50/50 text-red-950',
              },
              {
                name: 'Sağlam Kart',
                bank: 'Kuveyt Türk',
                headerClass: 'border-teal-500/30 bg-teal-50/50 text-teal-950',
              },
            ].map((card) => (
              <div key={card.name} className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-2xs flex flex-col">
                <div className={`p-2.5 border-b border-slate-100 flex items-center justify-between ${card.headerClass}`}>
                  <span className="font-black text-xs">{card.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium truncate max-w-[120px]">{card.bank}</span>
                </div>
                <div className="p-3 text-xs divide-y divide-slate-100 flex-1 flex flex-col justify-between">
                  <div className="py-1.5 flex justify-between items-center text-slate-700">
                    <span>Tek Çekim</span>
                    <span className="font-bold text-slate-900">₺{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center text-slate-700">
                    <div className="flex items-center gap-1">
                      <span>2 Taksit</span>
                      <span className="text-[9px] bg-slate-100 text-slate-600 px-1 rounded font-bold">Vade Farksız</span>
                    </div>
                    <span className="font-bold text-slate-900">2 x ₺{(grandTotal / 2).toFixed(2)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center bg-emerald-50/60 -mx-3 px-3 border-y border-emerald-100 text-emerald-900">
                    <div className="flex items-center gap-1">
                      <span className="font-black">3 Taksit</span>
                      <span className="text-[9px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-black">Vade Farksız</span>
                    </div>
                    <span className="font-black text-emerald-700">3 x ₺{(grandTotal / 3).toFixed(2)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center text-slate-500 text-[11px]">
                    <span>6 Taksit</span>
                    <span>6 x ₺{((grandTotal * 1.09) / 6).toFixed(2)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center text-slate-500 text-[11px]">
                    <span>9 Taksit</span>
                    <span>9 x ₺{((grandTotal * 1.15) / 9).toFixed(2)}</span>
                  </div>
                  <div className="py-1.5 flex justify-between items-center text-slate-500 text-[11px]">
                    <span>12 Taksit</span>
                    <span>12 x ₺{((grandTotal * 1.21) / 12).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tüm kart işlemleriniz PayTR 256-Bit SSL güvencesiyle 3D Secure onaylı olarak gerçekleştirilir.</span>
          </div>
        </div>
      )}

      {/* SEKME 5: TESLİMAT & İADE */}
      {activeTab === 'SHIPPING' && (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p><strong>Kargo Süresi:</strong> Özel dikim perdeleriniz ortalama 3-5 iş günü içerisinde üretilip sigortalı kargo ile sevk edilir.</p>
          <p><strong>Garanti:</strong> 24 ay mekanizma garantisi kapsamındadır.</p>
        </div>
      )}

      {/* MÜŞTERİ FOTOĞRAFI BÜYÜTME MODALI (LIGHTBOX) */}
      {enlargedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setEnlargedPhoto(null)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-white rounded-sm border border-slate-300 p-2 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setEnlargedPhoto(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 shadow-md hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={enlargedPhoto}
              alt="Müşteri Perde Fotoğrafı"
              className="max-h-[80vh] w-auto object-contain rounded-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}