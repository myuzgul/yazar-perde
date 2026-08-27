'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Sparkles, Save, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
}

export default function TopluGuncellePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('ALL');
  const [actionType, setActionType] = useState<'INCREASE' | 'DECREASE'>('INCREASE');
  const [calculationType, setCalculationType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [amount, setAmount] = useState('10');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Seçilen kriterdeki ürünlerin fiyatları toplu olarak güncellenecektir. Onaylıyor musunuz?')) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/products/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          actionType,
          calculationType,
          amount: Number(amount),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(data.message);
      } else {
        alert(data.message || 'Güncelleme başarısız');
      }
    } catch {
      alert('İşlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-4xl">
        <div className="mb-6">
          <Link
            href="/panel/urunler"
            className="text-xs font-semibold text-[#1B84F8] hover:underline flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Ürün Listesine Dön
          </Link>
          <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
            <Sparkles className="w-4 h-4" />
            <span>TOPLU FİYAT MOTORU</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Toplu Ürün Fiyatı Güncelleme</h1>
          <p className="text-sm text-slate-500">
            Kategori bazlı yüzde veya sabit tutar üzerinden toplu zam / indirim uygulama
          </p>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Hedef Kategori</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              >
                <option value="ALL">Tüm Kategoriler (Bütün Ürünler)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">İşlem Türü</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActionType('INCREASE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    actionType === 'INCREASE'
                      ? 'bg-blue-50 border-[#1B84F8] text-[#1B84F8]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  + Fiyat Artışı (Zam)
                </button>
                <button
                  type="button"
                  onClick={() => setActionType('DECREASE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    actionType === 'DECREASE'
                      ? 'bg-red-50 border-red-500 text-red-600'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  - İndirim Uygula
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Hesaplama Türü</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalculationType('PERCENTAGE')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    calculationType === 'PERCENTAGE'
                      ? 'bg-blue-50 border-[#1B84F8] text-[#1B84F8]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Yüzde Olarak (%)
                </button>
                <button
                  type="button"
                  onClick={() => setCalculationType('FIXED')}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition ${
                    calculationType === 'FIXED'
                      ? 'bg-blue-50 border-[#1B84F8] text-[#1B84F8]'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  Sabit Tutar (TL)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {calculationType === 'PERCENTAGE' ? 'Yüzde Oranı (%)' : 'Değişim Miktarı (TL)'}
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Uygulanıyor...' : 'Toplu Fiyat Değişikliğini Uygula'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
