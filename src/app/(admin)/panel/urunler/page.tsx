'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  slug: string;
  curtainType: string;
  basePrice: number;
  discountPrice: number | null;
  isActive: boolean;
  category: { name: string };
  brand: { name: string } | null;
  tag: { name: string; badgeColor: string } | null;
  images: Array<{ imageUrl: string; isCover: boolean }>;
}

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch {
      alert('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu perde ürününü silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchProducts();
    } catch {
      alert('Silinemedi');
    }
  };

  const getCurtainTypeName = (type: string) => {
    switch (type) {
      case 'TULLE': return 'Tül Perde';
      case 'ROLLER': return 'Stor Perde';
      case 'ZEBRA': return 'Zebra Perde';
      case 'DOUBLE_ROLLER': return 'Çiftli Sistem Tül+Stor';
      case 'PLISSE': return 'Plise Perde';
      case 'FON': return 'Fon Perde';
      case 'STRING': return 'İp Perde';
      case 'WOODEN_JALOUSIE': return 'Ahşap Jaluzi';
      case 'RUSTIC': return 'Rustik';
      default: return type;
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Layers className="w-4 h-4" />
              <span>ÜRÜN VE MODEL YÖNETİMİ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Perde Modelleri ({products.length})</h1>
            <p className="text-sm text-slate-500">Tüm perde türleri, fiyatlandırmalar ve stok durumları</p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panel/urunler/toplu-guncelle"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1B84F8]" />
              Toplu Fiyat Güncelle
            </Link>
            <Link
              href="/panel/urunler/yeni"
              className="px-4 py-2 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#1B84F8]/20 transition"
            >
              <Plus className="w-4 h-4" />
              Yeni Perde Ekle
            </Link>
          </div>
        </div>

        {/* Arama & Filtre */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Ürün adı, kodu veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1B84F8]"
            />
          </div>
        </div>

        {/* Ürün Tablosu */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Görsel</th>
                  <th className="py-3 px-4">Ürün Adı & Kodu</th>
                  <th className="py-3 px-4">Perde Türü</th>
                  <th className="py-3 px-4">Kategori & Marka</th>
                  <th className="py-3 px-4">Fiyat (Metre / m²)</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const coverImg = product.images.find((i) => i.isCover) || product.images[0];
                    return (
                      <tr key={product.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          {coverImg ? (
                            <img
                              src={coverImg.imageUrl}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                              <ImageIcon className="w-5 h-5" />
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{product.name}</span>
                          <span className="font-mono text-[11px] text-slate-500">SKU: {product.sku}</span>
                          {product.tag && (
                            <span
                              style={{ backgroundColor: product.tag.badgeColor }}
                              className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold text-white rounded-full"
                            >
                              {product.tag.name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1B84F8] border border-blue-100">
                            {getCurtainTypeName(product.curtainType)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-semibold text-slate-800">{product.category?.name}</div>
                          <div className="text-[11px] text-slate-500">{product.brand?.name || 'Markasız'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {product.discountPrice ? (
                            <div>
                              <span className="text-slate-400 line-through text-[11px] block">
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
                        <td className="py-3 px-4">
                          {product.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                              <XCircle className="w-3.5 h-3.5" /> Pasif
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Link
                            href={`/panel/urunler/${product.id}/duzenle`}
                            className="inline-block p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Henüz ürün bulunamadı. Yeni bir perde ekleyin.
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
