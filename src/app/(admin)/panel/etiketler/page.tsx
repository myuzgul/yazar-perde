'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Palette,
  Sparkles,
  Layers
} from 'lucide-react';

interface ProductTagItem {
  id: string;
  name: string;
  slug: string;
  badgeColor: string;
  isActive: boolean;
  _count?: { products: number };
}

const PRESET_COLORS = [
  { name: 'Kırmızı (İndirim / Fırsat)', hex: '#EF4444' },
  { name: 'Mavi (Çok Satan / Popüler)', hex: '#1B84F8' },
  { name: 'Yeşil (Yeni Sezon / Çevreci)', hex: '#10B981' },
  { name: 'Mor (Lüks / Özel Tasarım)', hex: '#8B5CF6' },
  { name: 'Turuncu (Günün Fırsatı)', hex: '#F97316' },
  { name: 'Sarı (Dikkat / Kampanya)', hex: '#EAB308' },
  { name: 'Koyu Antrasit (Minimal / Premium)', hex: '#1E293B' },
  { name: 'Pembe / Gül', hex: '#EC4899' },
];

export default function EtiketlerPage() {
  const [tags, setTags] = useState<ProductTagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<ProductTagItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [badgeColor, setBadgeColor] = useState('#1B84F8');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/tags');
      const data = await res.json();
      if (data.success) setTags(data.data);
    } catch {
      alert('Rozetler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleOpenCreate = () => {
    setEditingTag(null);
    setName('');
    setBadgeColor('#1B84F8');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (tag: ProductTagItem) => {
    setEditingTag(tag);
    setName(tag.name);
    setBadgeColor(tag.badgeColor || '#1B84F8');
    setIsActive(tag.isActive);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert('Rozet adı boş bırakılamaz');

    setSaving(true);
    try {
      if (editingTag) {
        // Güncelle
        const res = await fetch('/api/admin/tags', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTag.id,
            name,
            badgeColor,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          fetchTags();
        } else {
          alert(data.message || 'Güncellenemedi');
        }
      } else {
        // Yeni Ekle
        const res = await fetch('/api/admin/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            badgeColor,
            isActive,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setModalOpen(false);
          fetchTags();
        } else {
          alert(data.message || 'Eklenemedi');
        }
      }
    } catch {
      alert('İşlem sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!confirm(`"${tagName}" rozetini silmek istediğinize emin misiniz? Bu rozete sahip ürünlerdeki rozet kaldırılacaktır.`)) return;
    try {
      const res = await fetch(`/api/admin/tags?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchTags();
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch {
      alert('Silme sırasında hata oluştu');
    }
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Başlık ve Yeni Ekle Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Tag className="w-4 h-4" />
              <span>ÜRÜN PAZARLAMA & VİTRİN</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Ürün Rozetleri & Etiketler</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Ürün kartlarının üzerinde beliren "Çok Satan", "Yeni Sezon", "İndirim" gibi rozetleri ve renklerini yönetin.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Rozet Oluştur</span>
          </button>
        </div>

        {/* Rozet Kartı & Arama */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700">
              Toplam Rozet: {tags.length}
            </span>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Rozet ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>

          {/* Rozet Tablosu */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Rozet Görünümü (Önizleme)</th>
                  <th className="py-3 px-4">Rozet Adı</th>
                  <th className="py-3 px-4">Renk Kodu</th>
                  <th className="py-3 px-4 text-center">Kullanılan Ürün</th>
                  <th className="py-3 px-4 text-center">Durum</th>
                  <th className="py-3 px-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1B84F8]" />
                      <span>Rozetler yükleniyor...</span>
                    </td>
                  </tr>
                ) : filteredTags.length > 0 ? (
                  filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-slate-50/80 transition">
                      {/* Canlı Rozet Önizlemesi */}
                      <td className="py-3 px-4">
                        <span
                          style={{ backgroundColor: tag.badgeColor }}
                          className="inline-block px-3 py-1 text-[10px] font-black uppercase text-white rounded-md tracking-wider shadow-xs"
                        >
                          {tag.name}
                        </span>
                      </td>

                      {/* Adı */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{tag.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">slug: {tag.slug}</span>
                      </td>

                      {/* Renk */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-4 h-4 rounded-full border border-slate-300 shrink-0 shadow-xs"
                            style={{ backgroundColor: tag.badgeColor }}
                          />
                          <span className="font-mono text-xs text-slate-700 font-semibold">
                            {tag.badgeColor}
                          </span>
                        </div>
                      </td>

                      {/* Ürün Sayısı */}
                      <td className="py-3 px-4 text-center">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                          {tag._count?.products || 0} Ürün
                        </span>
                      </td>

                      {/* Durum */}
                      <td className="py-3 px-4 text-center">
                        {tag.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Pasif
                          </span>
                        )}
                      </td>

                      {/* Aksiyonlar */}
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(tag)}
                          title="Düzenle"
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(tag.id, tag.name)}
                          title="Sil"
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Henüz ürün rozeti bulunamadı. "Yeni Rozet Oluştur" butonuna basarak ilk rozeti ekleyin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ROZET EKLE / DÜZENLE MODALI */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
              <div className="py-4 px-6 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#1B84F8]" />
                  <h3 className="text-sm font-bold">
                    {editingTag ? 'Rozeti Düzenle' : 'Yeni Ürün Rozeti Oluştur'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Rozet Önizleme Kutusu */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Canlı Rozet Önizlemesi
                  </span>
                  <div className="flex items-center justify-center py-2">
                    <span
                      style={{ backgroundColor: badgeColor }}
                      className="px-3.5 py-1.5 text-xs font-black uppercase text-white rounded-md tracking-wider shadow-sm"
                    >
                      {name || 'ROZET METNİ'}
                    </span>
                  </div>
                </div>

                {/* Rozet Adı */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rozet Başlığı (Metin) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: ÇOK SATAN, YENİ SEZON, %20 İNDİRİM"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                  />
                </div>

                {/* Renk Seçimi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#1B84F8]" />
                    <span>Rozet Rengi</span>
                  </label>

                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="w-28 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-900"
                    />
                  </div>

                  {/* Hazır Renk Paleti */}
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setBadgeColor(col.hex)}
                        title={col.name}
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[10px] font-semibold transition cursor-pointer ${
                          badgeColor === col.hex
                            ? 'border-slate-900 bg-slate-100 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: col.hex }}
                        />
                        <span className="truncate">{col.name.split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aktiflik Durumu */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#1B84F8] rounded border-slate-300"
                    />
                    <span>Rozet Aktif Olarak Kullanılsın</span>
                  </label>
                </div>

                {/* Butonlar */}
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold transition shadow-md shadow-[#1B84F8]/20 cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Kaydediliyor...' : editingTag ? 'Güncelle' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
