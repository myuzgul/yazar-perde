'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  FolderTree, 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  CheckCircle2, 
  CornerDownRight, 
  Eye, 
  EyeOff, 
  Layers, 
  ExternalLink,
  Search,
  Check,
  FolderPlus
} from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  showInMenu: boolean;
  sortOrder: number;
  isActive: boolean;
  parent?: { id: string; name: string; slug: string } | null;
  children?: CategoryItem[];
  _count?: { products: number };
}

export default function KategorilerPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [showInMenu, setShowInMenu] = useState(true);
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data || []);
    } catch {
      alert('Kategoriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setSlug('');
    setDescription('');
    setParentId('');
    setShowInMenu(true);
    setSortOrder(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const payload = {
      id: editingId,
      name: name.trim(),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: description.trim() || null,
      parentId: parentId || null,
      showInMenu,
      sortOrder: Number(sortOrder) || 0,
      isActive: true,
    };

    try {
      const res = await fetch('/api/admin/categories', {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingId ? 'Kategori başarıyla güncellendi!' : 'Yeni kategori eklendi!');
        resetForm();
        fetchCategories();
      } else {
        alert(data.message || 'İşlem başarısız');
      }
    } catch {
      alert('İşlem başarısız');
    }
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setShowInMenu(cat.showInMenu);
    setSortOrder(cat.sortOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddSubCategory = (parentCat: CategoryItem) => {
    resetForm();
    setParentId(parentCat.id);
    setName('');
    setSortOrder(parentCat.children ? parentCat.children.length + 1 : 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" kategorisini silmek istediğinize emin misiniz? Alt kategorileri varsa onlar da etkilenecektir.`)) return;
    try {
      const res = await fetch(`/api/admin/categories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCategories();
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch {
      alert('Hata oluştu');
    }
  };

  // Ana Kategoriler (parentId: null olanlar)
  const parentCategories = categories.filter((c) => !c.parentId);

  // Filtrelenmiş Ana Kategoriler
  const filteredParentCategories = parentCategories.filter((cat) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    const matchParent = cat.name.toLowerCase().includes(s) || cat.slug.toLowerCase().includes(s);
    const matchChild = cat.children?.some(
      (ch) => ch.name.toLowerCase().includes(s) || ch.slug.toLowerCase().includes(s)
    );
    return matchParent || matchChild;
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <FolderTree className="w-4 h-4" />
              <span>WOOCOMMERCE MENÜ & KATEGORİ SİSTEMİ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Kategori & Menü Yönetimi</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Ana kategoriler (Örn: Zebra Perde), alt kategoriler (Örn: Baskılı Zebra) oluşturabilir ve üst menüde gösterilme sırasını belirleyebilirsiniz.
            </p>
          </div>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-xs font-semibold flex items-center justify-between border bg-emerald-50 text-emerald-800 border-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* SOL: Kategori Ekleme / Düzenleme Formu (4 Kolon) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm h-fit sticky top-6">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              {editingId ? <Edit2 className="w-4 h-4 text-[#1B84F8]" /> : <Plus className="w-4 h-4 text-[#1B84F8]" />}
              <span>{editingId ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Zebra Perdeler veya Baskılı Zebra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (URL Adresi)</label>
                <input
                  type="text"
                  placeholder="Otomatik: zebra-perdeler"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              {/* Üst Kategori Seçimi (WooCommerce Mantığı) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Üst Kategori (Ebeveyn)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                >
                  <option value="">-- Yok (Ana Kategori Yap) --</option>
                  {parentCategories
                    .filter((p) => p.id !== editingId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.name}
                      </option>
                    ))}
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Alt kategori yapmak istediğiniz ana perde grubunu seçiniz.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Menü Sırası</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInMenu}
                      onChange={(e) => setShowInMenu(e.target.checked)}
                      className="w-4 h-4 text-[#1B84F8] rounded border-slate-300"
                    />
                    <span>Menüde Göster</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama (Opsiyonel)</label>
                <textarea
                  rows={2}
                  placeholder="Kategori hakkında kısa açıklama..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#1B84F8] hover:bg-[#156cd1] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingId ? 'Güncelle' : 'Kategori Oluştur'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    İptal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* SAĞ: Hiyerarşik Kategori Ağacı & Menü Düzeni (8 Kolon) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Kategori ve Menü Hiyerarşisi ({categories.length} Toplam Kategori)
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ana kategorilerin altına dilediğiniz kadar alt kategori ekleyebilir, üst menüde açılır menü (dropdown) olarak görüntüleyebilirsiniz.
                </p>
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Kategori ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-full sm:w-48 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 font-semibold bg-white rounded-2xl border border-slate-200">
                Kategoriler yükleniyor...
              </div>
            ) : filteredParentCategories.length === 0 ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                <FolderTree className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Henüz kategori bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredParentCategories.map((parent) => (
                  <div
                    key={parent.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition"
                  >
                    {/* ANA KATEGORİ SATIRI */}
                    <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          📁
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 truncate">
                              {parent.name}
                            </span>
                            {parent.showInMenu ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Menüde
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Gizli
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              (Sıra: {parent.sortOrder})
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="font-mono text-slate-400">/{parent.slug}</span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">
                              {parent._count?.products || 0} Ürün
                            </span>
                            <span>•</span>
                            <span className="text-[#1B84F8] font-semibold">
                              {parent.children?.length || 0} Alt Kategori
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Ana Kategori Aksiyonları */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAddSubCategory(parent)}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-[#1B84F8] rounded-lg text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                          title="Bu kategoriye alt kategori ekle"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Alt Kategori Ekle</span>
                        </button>

                        <Link
                          href={`/kategori/${parent.slug}`}
                          target="_blank"
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition"
                          title="Sitede Görüntüle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleEdit(parent)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Düzenle"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(parent.id, parent.name)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ALT KATEGORİLER LİSTESİ */}
                    {parent.children && parent.children.length > 0 && (
                      <div className="divide-y divide-slate-100 bg-white">
                        {parent.children.map((child) => (
                          <div
                            key={child.id}
                            className="py-2.5 px-4 pl-10 flex items-center justify-between hover:bg-slate-50/70 transition"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <CornerDownRight className="w-4 h-4 text-slate-300 shrink-0" />
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {child.name}
                                  </span>
                                  {child.showInMenu && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded">
                                      Menü
                                    </span>
                                  )}
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    (Sıra: {child.sortOrder})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                  <span>/{child.slug}</span>
                                  <span>•</span>
                                  <span className="font-sans text-slate-600 font-semibold">
                                    {child._count?.products || 0} Ürün
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <Link
                                href={`/kategori/${child.slug}`}
                                target="_blank"
                                className="p-1 text-slate-400 hover:text-slate-700 transition"
                                title="Sitede İncele"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleEdit(child)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                                title="Düzenle"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(child.id, child.name)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}