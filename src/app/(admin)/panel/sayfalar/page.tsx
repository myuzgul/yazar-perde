'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  X, 
  Save, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface StaticPageItem {
  id: string;
  title: string;
  slug: string;
  contentHtml: string;
  seoTitle?: string | null;
  seoDesc?: string | null;
  isActive: boolean;
  updatedAt: string;
}

export default function AdminStaticPagesPage() {
  const [pages, setPages] = useState<StaticPageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<StaticPageItem | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [contentHtml, setContentHtml] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDesc, setSeoDesc] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchPages = () => {
    setLoading(true);
    fetch('/api/admin/static-pages')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPages(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleOpenCreate = () => {
    setEditingPage(null);
    setTitle('');
    setSlug('');
    setContentHtml('');
    setSeoTitle('');
    setSeoDesc('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: StaticPageItem) => {
    setEditingPage(p);
    setTitle(p.title);
    setSlug(p.slug);
    setContentHtml(p.contentHtml);
    setSeoTitle(p.seoTitle || '');
    setSeoDesc(p.seoDesc || '');
    setIsActive(p.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !slug || !contentHtml) {
      alert('Lütfen başlık, slug ve sayfa içeriğini doldurunuz.');
      return;
    }

    setIsSaving(true);
    const method = editingPage ? 'PUT' : 'POST';
    const payload = {
      id: editingPage?.id,
      title,
      slug,
      contentHtml,
      seoTitle,
      seoDesc,
      isActive,
    };

    try {
      const res = await fetch('/api/admin/static-pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchPages();
      } else {
        alert(data.error || 'Kaydetme sırasında bir hata oluştu');
      }
    } catch {
      alert('Bağlantı hatası oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, pageTitle: string) => {
    if (!confirm(`"${pageTitle}" sayfasını silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/static-pages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchPages();
      } else {
        alert(data.error || 'Silinemedi');
      }
    } catch {
      alert('Bağlantı hatası oluştu');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Kurumsal Sayfalar & Rehberler</h1>
            <p className="text-xs text-slate-500">
              Hakkımızda, SSS, Ölçü Alma Rehberi, Garanti ve Yasal Sözleşmelerin Yönetimi
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1B84F8]/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Sayfa Ekle</span>
          </button>
        </div>

        {/* Sayfa Listesi Tablosu */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Sayfalar yükleniyor...</div>
          ) : pages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Sayfa Başlığı</th>
                    <th className="py-3 px-4">Bağlantı (Slug)</th>
                    <th className="py-3 px-4">Durum</th>
                    <th className="py-3 px-4">Son Güncelleme</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#1B84F8]" />
                          <span>{p.title}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        /sayfalar/{p.slug}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.isActive ? (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            ● Yayında
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold">
                            ○ Taslak
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-[10px] text-slate-400">
                        {new Date(p.updatedAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/sayfalar/${p.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition"
                            title="Önizle / Sayfaya Git"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-blue-50 text-[#1B84F8] hover:bg-[#1B84F8] hover:text-white transition cursor-pointer"
                            title="Düzenle"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(p.id, p.title)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">Henüz sayfa eklenmemiş.</div>
          )}
        </div>

        {/* Sayfa Ekleme / Düzenleme Modalı */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <FileText className="w-5 h-5 text-[#1B84F8]" />
                  <h3>{editingPage ? `"${editingPage.title}" Düzenle` : 'Yeni Kurumsal Sayfa Ekle'}</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sayfa Başlığı *</label>
                    <input
                      type="text"
                      placeholder="Örn: Perde Ölçüsü Nasıl Alınır?"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (!editingPage) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kalıcı Bağlantı (Slug) *</label>
                    <input
                      type="text"
                      placeholder="perde-olcusu-nasil-alinir"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 focus:outline-none focus:border-[#1B84F8]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Sayfa İçeriği (HTML Destekli) *
                  </label>
                  <textarea
                    rows={10}
                    placeholder="<h3>Başlık</h3><p>Paragraf içeriği...</p>"
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-[#1B84F8]"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;img&gt; gibi standart HTML etiketlerini kullanabilirsiniz.
                  </span>
                </div>

                {/* SEO Ayarları */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B84F8]" />
                    <span>SEO Meta Ayarları (Opsiyonel)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">SEO Title</label>
                      <input
                        type="text"
                        placeholder="Sayfa Başlığı - PerdeSiparisi.com"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">SEO Meta Description</label>
                      <input
                        type="text"
                        placeholder="Google arama sonuçlarında görünecek açıklama..."
                        value={seoDesc}
                        onChange={(e) => setSeoDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-[#1B84F8] rounded border-slate-300"
                    />
                    <span>Bu sayfa yayında olsun (Aktif)</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Kaydediliyor...' : 'Sayfayı Kaydet'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}