'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Bell, Save, CheckCircle2, AlertCircle, MessageSquare, Mail } from 'lucide-react';

interface NotificationTemplate {
  id: string;
  code: string;
  title: string;
  smsBody: string;
  emailSubject: string;
  emailHtmlBody: string;
  isActive: boolean;
}

export default function BildirimlerPage() {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTemplates(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateTemplate = async (template: NotificationTemplate) => {
    setSavingId(template.id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Şablon başarıyla kaydedildi.');
      }
    } catch {
      alert('Kaydedilemedi');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Bell className="w-4 h-4" />
              <span>OTOMATİK BİLDİRİM MERKEZİ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">SMS ve E-Posta Şablonları</h1>
            <p className="text-sm text-slate-500">
              Sipariş durumları değiştikçe müşterilere otomatik giden mesaj metinleri
            </p>
          </div>
        </div>

        {/* Değişkenler Rehberi */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 mb-8 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold block mb-1">Kullanılabilir Değişkenler:</span>
            <div className="flex flex-wrap gap-2">
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{customer_name}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{order_number}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{total}}"}</code>
            </div>
          </div>
          <span className="text-[11px] text-blue-700">Bu etiketler sipariş anında gerçek müşteri bilgileriyle değiştirilir.</span>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <div className="space-y-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B84F8]" />
                  <h3 className="text-sm font-bold text-slate-900">{tpl.title}</h3>
                  <span className="text-[11px] font-mono text-slate-400">({tpl.code})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateTemplate(tpl)}
                  disabled={savingId === tpl.id}
                  className="px-4 py-1.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {savingId === tpl.id ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SMS Şablonu */}
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>SMS Metni</span>
                  </div>
                  <textarea
                    rows={4}
                    value={tpl.smsBody}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTemplates((prev) =>
                        prev.map((t) => (t.id === tpl.id ? { ...t, smsBody: val } : t))
                      );
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8] focus:ring-1 focus:ring-[#1B84F8]"
                  />
                  <span className="text-[10px] text-slate-400 block mt-1 text-right">
                    Karakter: {tpl.smsBody.length}
                  </span>
                </div>

                {/* E-Posta Şablonu */}
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <Mail className="w-4 h-4 text-[#1B84F8]" />
                    <span>E-Posta Konusu & İçeriği</span>
                  </div>
                  <input
                    type="text"
                    placeholder="E-Posta Konu Başlığı"
                    value={tpl.emailSubject}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTemplates((prev) =>
                        prev.map((t) => (t.id === tpl.id ? { ...t, emailSubject: val } : t))
                      );
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900 mb-2 focus:outline-none focus:border-[#1B84F8]"
                  />
                  <textarea
                    rows={3}
                    placeholder="E-Posta HTML İçeriği"
                    value={tpl.emailHtmlBody}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTemplates((prev) =>
                        prev.map((t) => (t.id === tpl.id ? { ...t, emailHtmlBody: val } : t))
                      );
                    }}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 focus:outline-none focus:border-[#1B84F8] focus:ring-1 focus:ring-[#1B84F8]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
