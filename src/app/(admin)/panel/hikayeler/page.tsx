'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  X, 
  Save, 
  Upload,
  Image as ImageIcon
} from 'lucide-react';

interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<StoryItem | null>(null);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStories = () => {
    setLoading(true);
    fetch('/api/admin/stories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStories(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleOpenCreate = () => {
    setEditingStory(null);
    setTitle('');
    setImageUrl('');
    setTargetUrl('');
    setSortOrder(stories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: StoryItem) => {
    setEditingStory(s);
    setTitle(s.title);
    setImageUrl(s.imageUrl);
    setTargetUrl(s.targetUrl || '');
    setSortOrder(s.sortOrder);
    setIsActive(s.isActive);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setImageUrl(data.url);
      } else {
        alert(data.error || 'Yükleme başarısız');
      }
    } catch {
      alert('Yükleme sırasında hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) {
      alert('Lütfen hikaye başlığı ve görselini giriniz.');
      return;
    }

    setIsSaving(true);
    const method = editingStory ? 'PUT' : 'POST';
    const payload = {
      id: editingStory?.id,
      title,
      imageUrl,
      targetUrl,
      sortOrder,
      isActive,
    };

    try {
      const res = await fetch('/api/admin/stories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchStories();
      } else {
        alert(data.error || 'Kaydetme hatası');
      }
    } catch {
      alert('Bağlantı hatası oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, storyTitle: string) => {
    if (!confirm(`"${storyTitle}" hikayesini silmek istediğinize emin misiniz?`)) return;

    try {
      const res = await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchStories();
      } else {
        alert(data.error || 'Silinemedi');
      }
    } catch {
      alert('Bağlantı hatası');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Hikaye (Story) Yönetimi</h1>
            <p className="text-xs text-slate-500">
              Anasayfadaki Instagram tarzı yuvarlak hikayeleri, görsellerini ve kampanya yönlendirme linklerini yönetin
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1B84F8]/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Hikaye Ekle</span>
          </button>
        </div>

        {/* Hikaye Kartları Izgarası */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-400">Hikayeler yükleniyor...</div>
          ) : stories.length > 0 ? (
            stories.map((story) => (
              <div
                key={story.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-4 relative group"
              >
                <div className="flex items-center gap-3">
                  {/* Yuvarlak Hikaye Çerçevesi */}
                  <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#1B84F8] to-blue-400 shrink-0 shadow-md">
                    <img
                      src={story.imageUrl}
                      alt={story.title}
                      className="w-full h-full rounded-full object-cover border border-white"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 truncate">{story.title}</h3>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      Hedef: {story.targetUrl || 'Link yok'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        Sıra: {story.sortOrder}
                      </span>
                      {story.isActive ? (
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          ● Yayında
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          ○ Pasif
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Büyük Görsel Önizleme */}
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
                </div>

                {/* Butonlar */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  {story.targetUrl ? (
                    <Link
                      href={story.targetUrl}
                      target="_blank"
                      className="text-[11px] font-bold text-[#1B84F8] flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Linki Test Et</span>
                    </Link>
                  ) : <span />}

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(story)}
                      className="p-1.5 rounded-lg bg-blue-50 text-[#1B84F8] hover:bg-[#1B84F8] hover:text-white transition cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(story.id, story.title)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
              Henüz hikaye eklenmemiş. Yeni hikaye ekleyerek anasayfada yayınlayabilirsiniz.
            </div>
          )}
        </div>

        {/* Hikaye Ekle / Düzenle Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-[#1B84F8]" />
                  <h3>{editingStory ? 'Hikayeyi Düzenle' : 'Yeni Hikaye Ekle'}</h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hikaye Başlığı *</label>
                  <input
                    type="text"
                    placeholder="Örn: Yeni Sezon Petek Tüller"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Hikaye Görseli (Dosya Yükle veya URL Gir) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="/uploads/... veya https://..."
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B84F8]"
                      required
                    />
                    <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploading ? 'Yükleniyor...' : 'Gözat'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {imageUrl && (
                    <div className="mt-3 flex items-center gap-3 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                      <img
                        src={imageUrl}
                        alt="Önizleme"
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                      />
                      <span className="text-[10px] text-slate-500 font-bold">Görsel Seçildi</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tıklandığında Gidilecek Kampanya Linki (Hedef URL)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: /kategori/plise-perdeler veya /urun/duz-petek-tul-perde"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#1B84F8]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Müşteri hikaye kutucuğunu açıp tıkladığında bu linke yönlenir.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Sıralama</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer pb-2 font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 text-[#1B84F8] rounded border-slate-300"
                      />
                      <span>Yayında (Aktif)</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isUploading}
                    className="bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</span>
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