'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Settings, Save, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

interface SettingItem {
  id: string;
  key: string;
  value: string;
  label: string;
  group: string;
  description: string | null;
}

export default function AyarlarPage() {
  const [settings, setSettings] = useState<SettingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.success) {
        setSettings(data.data);
      }
    } catch {
      setMessage('Ayarlar yüklenemedi.');
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
        setMessage('Genel ve Kargo ayarları başarıyla kaydedildi!');
      }
    } catch {
      alert('Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const generalItems = settings.filter((s) => s.group === 'GENERAL' || s.group === 'SHIPPING' || s.group === 'PAYMENT');

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Settings className="w-4 h-4" />
              <span>SİSTEM YAPILANDIRMASI</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Genel & Kargo Ayarları</h1>
            <p className="text-sm text-slate-500">
              Site başlığı, pre-header duyuruları, müşteri iletişim telefonları ve kargo baremleri
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {generalItems.map((item) => (
              <div key={item.key} className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  {item.label}
                </label>
                {item.description && (
                  <p className="text-[11px] text-slate-500 mb-2">
                    {item.description}
                  </p>
                )}
                <input
                  type="text"
                  value={item.value}
                  onChange={(e) => handleChange(item.key, e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                />
              </div>
            ))}
          </div>
        </form>
      </main>
    </div>
  );
}
