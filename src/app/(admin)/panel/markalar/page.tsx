'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Award, Plus, Trash2, Edit2, Save, CheckCircle2 } from 'lucide-react';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  _count?: { products: number };
}

export default function MarkalarPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      const res = await fetch('/api/admin/brands');
      const data = await res.json();
      if (data.success) setBrands(data.data);
    } catch {
      alert('Markalar yüklenemedi');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = {
      id: editingId,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      logoUrl,
      isActive: true,
      sortOrder: 0,
    };

    try {
      const res = await fetch('/api/admin/brands', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? 'Marka güncellendi' : 'Yeni marka eklendi');
        setName('');
        setSlug('');
        setLogoUrl('');
        setEditingId(null);
        fetchBrands();
      }
    } catch {
      alert('İşlem başarısız');
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingId(brand.id);
    setName(brand.name);
    setSlug(brand.slug);
    setLogoUrl(brand.logoUrl || '');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu markayı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchBrands();
    } catch {
      alert('Silinemedi');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Award className="w-4 h-4" />
              <span>MARKALAR & ÜRETİCİLER</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Marka Yönetimi</h1>
            <p className="text-sm text-slate-500">Ürün kartlarında sağ altta belirecek marka logoları (Brillant, Taç vb.)</p>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-fit">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-[#1B84F8]" /> : <Plus className="w-4 h-4 text-[#1B84F8]" />}
              <span>{editingId ? 'Markayı Düzenle' : 'Yeni Marka Ekle'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marka Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Brillant"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  placeholder="brillant"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL / Dosya Yolu</label>
                <input
                  type="text"
                  placeholder="/static/brands/brillant.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1B84F8] hover:bg-[#156cd1] text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Güncelle' : 'Marka Ekle'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setSlug('');
                      setLogoUrl('');
                    }}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Liste */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Mevcut Markalar ({brands.length})</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Marka Adı</th>
                    <th className="py-3 px-4">Logo</th>
                    <th className="py-3 px-4">Ürün Sayısı</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{brand.name}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {brand.logoUrl ? (
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Logo Var</span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{brand._count?.products || 0} Ürün</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(brand)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(brand.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
