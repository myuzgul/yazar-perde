'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  MessageSquare, 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  ExternalLink,
  Clock,
  Check,
  Search,
  Filter,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface ReviewProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  images: { imageUrl: string }[];
}

interface AdminReviewItem {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  imageUrl: string | null;
  isApproved: boolean;
  createdAt: string;
  product: ReviewProduct;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'approved'>('pending');
  const [search, setSearch] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${filterTab}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch {
      // Hata durumunda
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterTab]);

  // Onaylama / Onay Kaldırma
  const handleToggleApprove = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApproved: !currentStatus }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.message || 'İşlem başarısız');
      }
    } catch {
      alert('Hata oluştu');
    }
  };

  // Yorum Silme
  const handleDelete = async (id: string) => {
    if (!confirm('Bu müşteri yorumunu kalıcı olarak silmek istediğinizden emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch {
      alert('Hata oluştu');
    }
  };

  const filteredReviews = reviews.filter((r) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      r.customerName.toLowerCase().includes(s) ||
      r.comment.toLowerCase().includes(s) ||
      r.product?.name.toLowerCase().includes(s) ||
      r.product?.sku.toLowerCase().includes(s)
    );
  });

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="space-y-6">
          {/* Başlık ve Özet */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-[#1B84F8]" />
                <span>Müşteri Yorumları ve Fotoğraf Onayı</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Müşterilerin ürünlere bıraktığı değerlendirmeleri, puanları ve ev fotoğraflarını inceleyip onaylayabilirsiniz.
              </p>
            </div>
          </div>

          {/* Sekmeler & Filtre */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilterTab('pending')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  filterTab === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Onay Bekleyenler ({counts.pending})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('approved')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  filterTab === 'approved'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Yayında Olanlar ({counts.approved})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterTab('all')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  filterTab === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Tümü ({counts.total})</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Müşteri, ürün veya yorumda ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>

          {/* Yorumlar Tablosu / Listesi */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-xs text-slate-500 font-semibold">
                Yorumlar yükleniyor...
              </div>
            ) : filteredReviews.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">Bu filtreye uygun yorum bulunamadı.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredReviews.map((rev) => (
                  <div key={rev.id} className="p-5 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between hover:bg-slate-50/50 transition">
                    {/* Sol: Müşteri & Ürün Bilgisi */}
                    <div className="flex gap-4 items-start min-w-[280px]">
                      {rev.product?.images?.[0]?.imageUrl ? (
                        <img
                          src={rev.product.images[0].imageUrl}
                          alt={rev.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-14 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 text-slate-400 text-xs">
                          Görsel Yok
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{rev.customerName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            rev.isApproved 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {rev.isApproved ? 'Yayında' : 'Onay Bekliyor'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-amber-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-[11px] font-semibold text-slate-500 ml-1">
                            ({rev.rating}/5)
                          </span>
                        </div>

                        {rev.product && (
                          <Link
                            href={`/urun/${rev.product.slug}`}
                            target="_blank"
                            className="text-[11px] font-medium text-[#1B84F8] hover:underline flex items-center gap-1 mt-1"
                          >
                            <span>{rev.product.name}</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}

                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(rev.createdAt).toLocaleString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Orta: Yorum Metni ve Müşteri Fotoğrafı */}
                    <div className="flex-1 max-w-2xl">
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                        &ldquo;{rev.comment}&rdquo;
                      </p>

                      {rev.imageUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">Müşteri Fotoğrafı:</span>
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(rev.imageUrl!)}
                            className="relative group inline-block rounded overflow-hidden border border-slate-300 hover:border-[#1B84F8] transition cursor-pointer"
                          >
                            <img
                              src={rev.imageUrl}
                              alt="Müşteri Fotoğrafı"
                              className="w-12 h-12 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <Eye className="w-3.5 h-3.5 text-white" />
                            </div>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sağ: Aksiyon Butonları */}
                    <div className="flex items-center gap-2 shrink-0">
                      {rev.isApproved ? (
                        <button
                          type="button"
                          onClick={() => handleToggleApprove(rev.id, true)}
                          className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Yayından Kaldır</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleApprove(rev.id, false)}
                          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Onayla & Yayınla</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(rev.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Yorumu Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fotoğraf Büyütme Modalı */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative max-w-2xl bg-white rounded-lg p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute -top-3 -right-3 bg-slate-900 text-white rounded-full p-1.5 hover:bg-slate-800"
            >
              ✕
            </button>
            <img
              src={selectedPhoto}
              alt="Müşteri Ev Perdesi"
              className="max-h-[80vh] w-auto object-contain rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}