'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Tag, Plus, Trash2, Edit2, Save, CheckCircle2 } from 'lucide-react';

interface ProductTag {
  id: string;
  name: string;
  slug: string;
  badgeColor: string;
  isActive: boolean;
  _count?: { products: number };
}

export default function EtiketlerPage() {
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [badgeColor, setBadgeColor] = useState('#1B84F8');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      if (data.success) setTags(data.data);
    } catch {
      alert('Etiketler yüklenemedi');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = {
      id: editingId,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      badgeColor,
      isActive: true,
    };

    try {
      const res = await fetch('/api/admin/tags', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? 'Etiket güncellendi' : 'Yeni etiket eklendi');
        setName('');
        setSlug('');
        setBadgeColor('#1B84F8');
        setEditingId(null);
        fetchTags();
      }
    } catch {
      alert('İşlem başarısız');
    }
  };

  const handleEdit = (tag: ProductTag) => {
    setEditingId(tag.id);
    setName(tag.name);
    setSlug(tag.slug);
    setBadgeColor(tag.badgeColor);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etiketi silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) fetchTags();
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
              <Tag className="w-4 h-4" />
              <span>ROZET & KAMPANYA ETİKETLERİ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Ürün Etiketleri</h1>
            <p className="text-sm text-slate-500">Ürün kartlarının üzerinde beliren renkli rozetler (İndirimli Ürün, Çok Satan vb.)</p>
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
              <span>{editingId ? 'Etiketi Düzenle' : 'Yeni Etiket Ekle'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Etiket Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: İndirimli Ürün"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL)</label>
                <input
                  type="text"
                  placeholder="indirimli-urun"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Rozet Rengi</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-10 h-9 p-0.5 border border-slate-300 rounded-lg cursor-pointer bg-white"
                  />
                  <input
                    type="text"
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <span
                  style={{ backgroundColor: badgeColor }}
                  className="inline-block px-3 py-1 text-[11px] font-bold text-white rounded-full shadow-sm"
                >
                  Önizleme: {name || 'Etiket Örneği'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1B84F8] hover:bg-[#156cd1] text-white py-2 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Güncelle' : 'Etiket Ekle'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setSlug('');
                      setBadgeColor('#1B84F8');
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
              <span className="text-xs font-bold text-slate-700">Mevcut Etiketler ({tags.length})</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Etiket Görünümü</th>
                    <th className="py-3 px-4">Slug</th>
                    <th className="py-3 px-4">Ürün Sayısı</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4">
                        <span
                          style={{ backgroundColor: tag.badgeColor }}
                          className="px-2.5 py-1 text-[11px] font-bold text-white rounded-full shadow-sm"
                        >
                          {tag.name}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{tag.slug}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{tag._count?.products || 0} Ürün</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(tag)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tag.id)}
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
