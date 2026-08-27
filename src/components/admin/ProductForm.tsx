'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  Star, 
  Image as ImageIcon, 
  Layers, 
  DollarSign, 
  FileText, 
  Search,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface Category { id: string; name: string; }
interface Brand { id: string; name: string; logoUrl: string | null; }
interface ProductTag { id: string; name: string; badgeColor: string; }

interface ProductImageItem {
  imageUrl: string;
  sortOrder: number;
  isCover: boolean;
}

interface ProductFormData {
  id?: string;
  name: string;
  sku: string;
  slug: string;
  curtainType: string;
  categoryId: string;
  brandId: string;
  tagId: string;
  basePrice: number;
  discountPrice: number | null;
  vatRate: number;
  stockTracking: boolean;
  stockQuantity: number;
  isActive: boolean;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  shortDesc: string;
  descriptionHtml: string;
  seoTitle: string;
  seoDesc: string;
  seoKeywords: string;
  images: ProductImageItem[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'PRICING' | 'IMAGES' | 'DESCRIPTION' | 'SEO'>('GENERAL');
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: '',
      sku: '',
      slug: '',
      curtainType: 'TULLE',
      categoryId: '',
      brandId: '',
      tagId: '',
      basePrice: 250,
      discountPrice: null,
      vatRate: 10,
      stockTracking: false,
      stockQuantity: 100,
      isActive: true,
      minWidth: 30,
      maxWidth: 500,
      minHeight: 50,
      maxHeight: 300,
      shortDesc: '',
      descriptionHtml: '',
      seoTitle: '',
      seoDesc: '',
      seoKeywords: '',
      images: [],
    }
  );

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then((r) => r.json()),
      fetch('/api/admin/brands').then((r) => r.json()),
      fetch('/api/admin/tags').then((r) => r.json()),
    ]).then(([catData, brandData, tagData]) => {
      if (catData.success) {
        setCategories(catData.data);
        if (!formData.categoryId && catData.data.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: catData.data[0].id }));
        }
      }
      if (brandData.success) setBrands(brandData.data);
      if (tagData.success) setTags(tagData.data);
    });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (formData.images.length >= 10) {
      alert('Maksimum 10 adet fotoğraf yükleyebilirsiniz.');
      return;
    }

    setUploading(true);
    const file = e.target.files[0];
    const uploadBody = new FormData();
    uploadBody.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadBody,
      });
      const data = await res.json();
      if (data.success) {
        const newImages = [
          ...formData.images,
          {
            imageUrl: data.url,
            sortOrder: formData.images.length,
            isCover: formData.images.length === 0,
          },
        ];
        setFormData((prev) => ({ ...prev, images: newImages }));
      }
    } catch {
      alert('Fotoğraf yüklenemedi');
    } finally {
      setUploading(false);
    }
  };

  const handleSetCover = (index: number) => {
    const updated = formData.images.map((img, idx) => ({
      ...img,
      isCover: idx === index,
    }));
    setFormData((prev) => ({ ...prev, images: updated }));
  };

  const handleDeleteImage = (index: number) => {
    const filtered = formData.images.filter((_, idx) => idx !== index);
    if (filtered.length > 0 && !filtered.some((i) => i.isCover)) {
      filtered[0].isCover = true;
    }
    setFormData((prev) => ({ ...prev, images: filtered }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const payload = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
    };

    try {
      const res = await fetch('/api/admin/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Ürün başarıyla kaydedildi!');
        setTimeout(() => router.push('/panel/urunler'), 1000);
      } else {
        alert(data.message || 'Hata oluştu');
      }
    } catch {
      alert('İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/panel/urunler"
            className="text-xs font-semibold text-[#1B84F8] hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ürün Listesine Dön
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEdit ? 'Perde Modelini Düzenle' : 'Yeni Perde Modeli Ekle'}
          </h1>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* 5 Sekmeli Menü */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'GENERAL', label: 'Genel Bilgiler', icon: Layers },
          { id: 'PRICING', label: 'Stok & Fiyat Bilgisi', icon: DollarSign },
          { id: 'IMAGES', label: `Fotoğraflar (${formData.images.length}/10)`, icon: ImageIcon },
          { id: 'DESCRIPTION', label: 'Açıklamalar & Video', icon: FileText },
          { id: 'SEO', label: 'SEO Ayarları', icon: Search },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? 'bg-[#1B84F8] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sekme İçerikleri */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
        {/* SEKME 1: GENEL BİLGİLER */}
        {activeTab === 'GENERAL' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ürün Adı *</label>
              <input
                type="text"
                required
                placeholder="Örn: Düz Beyaz Mat Stor Perde"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ürün Kodu (SKU) *</label>
              <input
                type="text"
                required
                placeholder="Örn: STR-102"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Perde Türü (Hesaplama Modeli) *</label>
              <select
                value={formData.curtainType}
                onChange={(e) => setFormData({ ...formData, curtainType: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value="TULLE">Tül Perde (En x Pile Katsayısı)</option>
                <option value="ROLLER">Stor Perde (m² hesabı, kasa/aparat/zincir)</option>
                <option value="ZEBRA">Zebra Perde (m² hesabı, kasa/aparat/zincir)</option>
                <option value="DOUBLE_ROLLER">Çiftli Sistem Tül+Stor (Blackout + Çift Zincir)</option>
                <option value="PLISSE">Plise Perde (Kancalı/Vidalı Montaj)</option>
                <option value="FON">Fon Perde (Sol/Sağ/Çift Kanat + Renso)</option>
                <option value="STRING">İp Perde (En Ölçüsü)</option>
                <option value="WOODEN_JALOUSIE">Ahşap Jaluzi (m² hesabı)</option>
                <option value="RUSTIC">Rustik (En Ölçüsü)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Marka</label>
              <select
                value={formData.brandId}
                onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value="">Markasız / Özel Üretim</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ürün Rozet Etiketi</label>
              <select
                value={formData.tagId}
                onChange={(e) => setFormData({ ...formData, tagId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value="">Etiket Yok</option>
                {tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-[#1B84F8] rounded border-slate-300"
                />
                <span>Ürün Mağazada Aktif Olarak Yayınlansın</span>
              </label>
            </div>
          </div>
        )}

        {/* SEKME 2: STOK VE FİYAT BİLGİSİ */}
        {activeTab === 'PRICING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Normal Fiyat (TL/Metre veya TL/m²) *</label>
              <input
                type="number"
                step="any"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">İndirimli Fiyat (TL)</label>
              <input
                type="number"
                step="any"
                placeholder="Varsa giriniz (Normal fiyat üstü çizilir)"
                value={formData.discountPrice ?? ''}
                onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value ? Number(e.target.value) : null })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-red-600 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">KDV Oranı (%)</label>
              <select
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value={10}>%10 KDV</option>
                <option value={20}>%20 KDV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stok Takibi Yapılsın mı?</label>
              <select
                value={formData.stockTracking ? 'YES' : 'NO'}
                onChange={(e) => setFormData({ ...formData, stockTracking: e.target.value === 'YES' })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value="NO">Hayır (Sınırsız Kumaş / Sipariş Üzerine Üretim)</option>
                <option value="YES">Evet (Stoktan Düş)</option>
              </select>
            </div>

            {formData.stockTracking && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Stok Miktarı (Metre/Adet)</label>
                <input
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>
            )}

            <div className="md:col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                İzin Verilen Ölçü Sınırları (cm)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Min En (cm)</label>
                  <input
                    type="number"
                    value={formData.minWidth}
                    onChange={(e) => setFormData({ ...formData, minWidth: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Max En (cm)</label>
                  <input
                    type="number"
                    value={formData.maxWidth}
                    onChange={(e) => setFormData({ ...formData, maxWidth: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Min Boy (cm)</label>
                  <input
                    type="number"
                    value={formData.minHeight}
                    onChange={(e) => setFormData({ ...formData, minHeight: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Max Boy (cm)</label>
                  <input
                    type="number"
                    value={formData.maxHeight}
                    onChange={(e) => setFormData({ ...formData, maxHeight: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEKME 3: FOTOĞRAFLAR */}
        {activeTab === 'IMAGES' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Ürün Fotoğraf Galerisi (Maksimum 10 Adet)
                </h3>
                <p className="text-[11px] text-slate-500">İlk sıradaki görsel vitrin kapak fotoğrafı olarak kullanılır.</p>
              </div>

              <label className="px-4 py-2 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading || formData.images.length >= 10}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group bg-slate-50 rounded-xl border p-2 flex flex-col items-center justify-between ${
                    img.isCover ? 'border-[#1B84F8] ring-2 ring-[#1B84F8]/20' : 'border-slate-200'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`Ürün Görseli ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />

                  {img.isCover ? (
                    <span className="text-[10px] font-bold text-white bg-[#1B84F8] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Kapak
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetCover(idx)}
                      className="text-[10px] font-semibold text-slate-600 hover:text-[#1B84F8] transition"
                    >
                      Kapak Yap
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {formData.images.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="text-xs">Henüz fotoğraf yüklenmedi.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEKME 4: AÇIKLAMALAR */}
        {activeTab === 'DESCRIPTION' && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kısa Açıklama (Özet)</label>
              <textarea
                rows={3}
                placeholder="Ürün kartlarında veya sağ panelde çıkacak kısa tanıtım metni..."
                value={formData.shortDesc}
                onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Detaylı Açıklama (Zengin HTML, Resim ve YouTube Video Desteği)
              </label>
              <textarea
                rows={10}
                placeholder="<h1>1. Sınıf Bal Peteği Kumaş</h1><p>Metin, görsel linkleri ve YouTube iframe gömebilirsiniz...</p>"
                value={formData.descriptionHtml}
                onChange={(e) => setFormData({ ...formData, descriptionHtml: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>
        )}

        {/* SEKME 5: SEO AYARLARI */}
        {activeTab === 'SEO' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SEO Başlığı (Title)</label>
              <input
                type="text"
                placeholder="Düz Beyaz Mat Stor Perde - Özel Ölçü Dikim | PerdeSiparisi"
                value={formData.seoTitle}
                onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Meta Açıklaması (Meta Description)</label>
              <textarea
                rows={3}
                placeholder="Özel ölçünüze uygun en kaliteli stor perde modelleri en uygun fiyatlarla..."
                value={formData.seoDesc}
                onChange={(e) => setFormData({ ...formData, seoDesc: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Odak Anahtar Kelimeler</label>
              <input
                type="text"
                placeholder="stor perde, beyaz stor, özel ölçü perde"
                value={formData.seoKeywords}
                onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
