'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Sparkles, 
  Save, 
  Search, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  Eye, 
  EyeOff, 
  Layers, 
  ArrowUpDown,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  curtainType: string;
  basePrice: number;
  discountPrice: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  category: { id: string; name: string };
  brand: { name: string } | null;
  tag: { name: string; badgeColor: string } | null;
  images: Array<{ imageUrl: string; isCover: boolean }>;
}

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function VitrinYonetimiPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/showcase');
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
        setCategories(data.data.categories);
      }
    } catch {
      setMessage('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
  };

  const handleSortOrderChange = (id: string, newOrder: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, sortOrder: newOrder } : p))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newProducts = [...products];
    const temp = newProducts[index - 1];
    newProducts[index - 1] = newProducts[index];
    newProducts[index] = temp;

    // Sıra numaralarını güncelle
    newProducts.forEach((p, idx) => {
      p.sortOrder = (idx + 1) * 10;
    });
    setProducts(newProducts);
  };

  const handleMoveDown = (index: number) => {
    if (index === products.length - 1) return;
    const newProducts = [...products];
    const temp = newProducts[index + 1];
    newProducts[index + 1] = newProducts[index];
    newProducts[index] = temp;

    // Sıra numaralarını güncelle
    newProducts.forEach((p, idx) => {
      p.sortOrder = (idx + 1) * 10;
    });
    setProducts(newProducts);
  };

  const handleAutoNumbering = () => {
    const updated = products.map((p, idx) => ({
      ...p,
      sortOrder: (idx + 1) * 10,
    }));
    setProducts(updated);
    setMessage('Sıra numaraları 10, 20, 30... şeklinde otomatik olarak düzenlendi.');
  };

  const handleSelectAllFeatured = (state: boolean) => {
    const updated = products.map((p) => ({
      ...p,
      isFeatured: state,
    }));
    setProducts(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const items = products.map((p) => ({
        id: p.id,
        isFeatured: p.isFeatured,
        sortOrder: Number(p.sortOrder) || 0,
      }));

      const res = await fetch('/api/admin/showcase', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Ana sayfa vitrin ve sıralama ayarları başarıyla kaydedildi!');
        fetchData();
      } else {
        alert(data.message || 'Kaydedilemedi');
      }
    } catch {
      alert('Kayıt sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'ALL' || p.category.id === selectedCategory;
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const featuredCount = products.filter((p) => p.isFeatured).length;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık & Kaydet Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>VİTRİN & SIRALAMA YÖNETİMİ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Ana Sayfa Ürün Vitrini</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Ana sayfada gösterilecek perdeleri belirleyin, kategoriye göre filtreleyin ve sıralamasını dilediğiniz gibi ayarlayın.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
            </button>
          </div>
        </div>

        {/* Başarı / Bilgi Mesajı */}
        {message && (
          <div className="p-4 rounded-xl mb-6 text-xs sm:text-sm flex items-center justify-between gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* İstatistik & Hızlı İşlemler Kartı */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#1B84F8] text-xs font-bold">
              Toplam Ürün: {products.length}
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              Vitrinde Gösterilen: {featuredCount}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleSelectAllFeatured(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Tümünü Vitrine Ekle
            </button>
            <button
              type="button"
              onClick={() => handleSelectAllFeatured(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition cursor-pointer"
            >
              Tümünü Kaldır
            </button>
            <button
              type="button"
              onClick={handleAutoNumbering}
              title="10, 20, 30... şeklinde otomatik numaralandırır"
              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sıralamayı Otomatik Numaralandır
            </button>
          </div>
        </div>

        {/* Kategori Sekmeleri & Arama */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-6">
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Kategori Sekmeleri */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#1B84F8] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                Tümü ({products.length})
              </button>
              {categories.map((cat) => {
                const count = products.filter((p) => p.category.id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1B84F8] text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Arama Kutusu */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Model adı veya SKU ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>

          {/* Ürün Listeleme Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Sıra</th>
                  <th className="py-3 px-4 w-16">Görsel</th>
                  <th className="py-3 px-4">Ürün Bilgisi</th>
                  <th className="py-3 px-4">Kategori & Tür</th>
                  <th className="py-3 px-4">Fiyat</th>
                  <th className="py-3 px-4 text-center">Ana Sayfada Göster</th>
                  <th className="py-3 px-4 text-center w-36">Vitrin Sırası</th>
                  <th className="py-3 px-4 text-right w-24">Aksiyon</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B84F8]" />
                      <span>Ürünler yükleniyor...</span>
                    </td>
                  </tr>
                ) : filteredProducts.length > 0 ? (
                  filteredProducts.map((product, idx) => {
                    const coverImg = product.images.find((i) => i.isCover) || product.images[0];
                    return (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-slate-50/80 transition ${
                          product.isFeatured ? 'bg-emerald-50/20' : 'opacity-60 bg-white'
                        }`}
                      >
                        {/* Numara */}
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>

                        {/* Görsel */}
                        <td className="py-3 px-4">
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {coverImg ? (
                              <img
                                src={coverImg.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Layers className="w-5 h-5 text-slate-300" />
                            )}
                          </div>
                        </td>

                        {/* Ürün Adı & SKU */}
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{product.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku}</span>
                          {product.tag && (
                            <span
                              style={{ backgroundColor: product.tag.badgeColor }}
                              className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-bold text-white rounded-full"
                            >
                              {product.tag.name}
                            </span>
                          )}
                        </td>

                        {/* Kategori */}
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-700 block">{product.category.name}</span>
                          <span className="text-[10px] text-slate-400">{product.curtainType}</span>
                        </td>

                        {/* Fiyat */}
                        <td className="py-3 px-4">
                          {product.discountPrice ? (
                            <div>
                              <span className="text-slate-400 line-through text-[10px] block">
                                ₺{product.basePrice.toFixed(2)}
                              </span>
                              <span className="font-bold text-red-600">
                                ₺{product.discountPrice.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-slate-900">
                              ₺{product.basePrice.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* Ana Sayfada Göster Toggle */}
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(product.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer ${
                              product.isFeatured
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {product.isFeatured ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Vitrinde Açık</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                <span>Gizli</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Sıra Numarası Input */}
                        <td className="py-3 px-4 text-center">
                          <input
                            type="number"
                            value={product.sortOrder}
                            onChange={(e) => handleSortOrderChange(product.id, Number(e.target.value))}
                            className="w-20 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-center font-mono font-bold text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8] shadow-xs"
                          />
                        </td>

                        {/* Yukarı / Aşağı Butonları */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveUp(idx)}
                              disabled={idx === 0}
                              title="Yukarı Taşı"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveDown(idx)}
                              disabled={idx === filteredProducts.length - 1}
                              title="Aşağı Taşı"
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      Seçilen kritere uygun ürün bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
