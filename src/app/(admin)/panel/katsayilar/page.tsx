'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Sliders, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  label: string;
  group: string;
  description: string | null;
}

export default function KatsayilarPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch {
      setMessage({ type: 'error', text: 'Katsayılar yüklenemedi.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (key: string, newValue: string) => {
    setSettings((prev) =>
      prev.map((item) => (item.key === key ? { ...item, value: newValue } : item))
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Tüm perde katsayıları ve fiyat parametreleri başarıyla güncellendi!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Kaydedilemedi' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Bağlantı hatası oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const getGroupTitle = (group: string) => {
    switch (group) {
      case 'PRICING': return 'Perde Fiyatlandırma & Ek Opsiyon Katsayıları';
      case 'SHIPPING': return 'Kargo Ücret & Ücretsiz Kargo Limitleri';
      case 'PAYMENT': return 'Ödeme Yöntemi Ek Ücretleri';
      default: return 'Genel Ayarlar';
    }
  };

  const groups = Array.from(new Set(settings.map((s) => s.group)));

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Sliders className="w-4 h-4" />
              <span>DİNAMİK HESAPLAMA MOTORU</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Perde Katsayıları ve Fiyat Parametreleri</h1>
            <p className="text-sm text-slate-500">
              Buradaki tüm değerler fiyat hesaplama motoru tarafından anında kullanılır. Kod değişikliği gerektirmez.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchSettings}
              disabled={loading || saving}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="px-5 py-2 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#1B84F8]/20 border-t-[#1B84F8] rounded-full animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Katsayılar yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-8">
            {groups.map((group) => {
              const groupItems = settings.filter((s) => s.group === group);
              return (
                <div key={group} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 tracking-wide">
                      {getGroupTitle(group)}
                    </h2>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {groupItems.length} Parametre
                    </span>
                  </div>

                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupItems.map((item) => (
                      <div key={item.key} className="flex flex-col justify-between bg-slate-50/50 p-4 rounded-xl border border-slate-200/60">
                        <div>
                          <label className="block text-xs font-bold text-slate-800 mb-1">
                            {item.label}
                          </label>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="relative mt-2">
                          <input
                            type="text"
                            value={item.value}
                            onChange={(e) => handleChange(item.key, e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8] focus:ring-1 focus:ring-[#1B84F8]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 pointer-events-none">
                            {item.key.includes('price') || item.key.includes('fee') || item.key.includes('threshold') ? 'TL' : item.key.includes('cm') ? 'cm' : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </form>
        )}
      </main>
    </div>
  );
}
