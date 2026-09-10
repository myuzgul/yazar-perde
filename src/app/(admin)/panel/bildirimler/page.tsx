'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Bell, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Mail, 
  Server, 
  Send, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

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

  // SMTP Ayarları State'i
  const [smtpHost, setSmtpHost] = useState('smtp.hostinger.com');
  const [smtpPort, setSmtpPort] = useState('465');
  const [smtpUser, setSmtpUser] = useState('info@yazarperde.com');
  const [smtpPassword, setSmtpPassword] = useState('Tpass147852*');
  const [smtpFromName, setSmtpFromName] = useState('Yazar Perde');
  const [smtpFromEmail, setSmtpFromEmail] = useState('info@yazarperde.com');
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSuccess, setSmtpSuccess] = useState<string | null>(null);

  // Test E-Posta State'i
  const [testEmailRecipient, setTestEmailRecipient] = useState('info@yazarperde.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; text: string } | null>(null);

  const fetchTemplatesAndSettings = async () => {
    setLoading(true);
    try {
      const [tplRes, setRes] = await Promise.all([
        fetch('/api/admin/notifications'),
        fetch('/api/admin/settings'),
      ]);
      const tplData = await tplRes.json();
      const setData = await setRes.json();

      if (tplData.success) {
        setTemplates(tplData.data);
      }

      if (setData.success && Array.isArray(setData.data)) {
        const map: Record<string, string> = {};
        setData.data.forEach((item: any) => {
          map[item.key] = item.value;
        });

        if (map.smtp_host) setSmtpHost(map.smtp_host);
        if (map.smtp_port) setSmtpPort(String(map.smtp_port));
        if (map.smtp_user) setSmtpUser(map.smtp_user);
        if (map.smtp_password) setSmtpPassword(map.smtp_password);
        if (map.smtp_from_name) setSmtpFromName(map.smtp_from_name);
        if (map.smtp_from_email) setSmtpFromEmail(map.smtp_from_email);
      }
    } catch {
      setMessage('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplatesAndSettings();
  }, []);

  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSmtp(true);
    setSmtpSuccess(null);

    const payload = [
      { key: 'smtp_host', value: smtpHost, label: 'SMTP Sunucusu', group: 'EMAIL' },
      { key: 'smtp_port', value: smtpPort, label: 'SMTP Port', group: 'EMAIL' },
      { key: 'smtp_secure', value: smtpPort === '465' ? '1' : '0', label: 'SMTP SSL/TLS', group: 'EMAIL' },
      { key: 'smtp_user', value: smtpUser, label: 'SMTP E-Posta / Kullanıcı', group: 'EMAIL' },
      { key: 'smtp_password', value: smtpPassword, label: 'SMTP Şifresi', group: 'EMAIL' },
      { key: 'smtp_from_name', value: smtpFromName, label: 'E-Posta Gönderen Adı', group: 'EMAIL' },
      { key: 'smtp_from_email', value: smtpFromEmail, label: 'E-Posta Gönderen Adresi', group: 'EMAIL' },
    ];

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpSuccess('Hostinger SMTP E-posta ayarları başarıyla kaydedildi!');
        setTimeout(() => setSmtpSuccess(null), 4000);
      }
    } catch {
      alert('SMTP ayarları kaydedilemedi');
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSendTestEmail = async () => {
    if (!testEmailRecipient.trim()) {
      alert('Lütfen test e-postasının gönderileceği adresi yazın');
      return;
    }
    setIsSendingTest(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/admin/notifications/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EMAIL',
          recipient: testEmailRecipient.trim(),
          templateSubject: '🔔 Yazar Perde - Hostinger SMTP Test E-Postası',
          templateBody: '<p>Tebrikler! <strong>smtp.hostinger.com</strong> üzerinden Yazar Perde e-posta bildirim sistemi başarıyla test edildi ve çalışıyor.</p>',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          text: `Test e-postası başarıyla gönderildi (${testEmailRecipient})! Lütfen gelen kutunuzu (ve spam klasörünü) kontrol ediniz.`,
        });
      } else {
        setTestResult({
          success: false,
          text: `E-posta gönderilemedi: ${data.error || 'SMTP sunucu hatası'}`,
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        text: `Bağlantı hatası: ${err.message || 'Sunucuya ulaşılamadı'}`,
      });
    } finally {
      setIsSendingTest(false);
    }
  };

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
        setMessage(`'${template.title}' şablonu başarıyla kaydedildi.`);
        setTimeout(() => setMessage(null), 3000);
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
              <span>OTOMATİK BİLDİRİM & E-POSTA MERKEZİ</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">E-Posta & SMS Bildirim Ayarları</h1>
            <p className="text-xs text-slate-500">
              Hostinger SMTP sunucusu yapılandırması ve sipariş durumlarına göre müşterilere otomatik giden mesajlar
            </p>
          </div>
        </div>

        {/* 1. KART: HOSTINGER SMTP E-POSTA YAPILANDIRMASI */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#1B84F8] flex items-center justify-center font-black">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Hostinger SMTP E-Posta Sunucusu</h2>
                <p className="text-xs text-slate-500">
                  Sipariş oluşturulduğunda ve kargoya verildiğinde e-postalar bu hesap üzerinden gönderilir
                </p>
              </div>
            </div>

            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SMTP AKTİF (SSL 465)</span>
            </span>
          </div>

          {smtpSuccess && (
            <div className="p-4 rounded-2xl mb-6 text-xs font-bold flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{smtpSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveSmtp} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Sunucusu (Host) *</label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="smtp.hostinger.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Port *</label>
                <select
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="465">465 (SSL - Önerilen)</option>
                  <option value="587">587 (TLS / STARTTLS)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Kullanıcı Adı / E-Posta *</label>
                <input
                  type="email"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="info@yazarperde.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">SMTP Şifresi *</label>
                <input
                  type="password"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gönderen Adı</label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="Yazar Perde"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Gönderen E-Posta Adresi</label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="info@yazarperde.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
              {/* Test E-Postası Alanı */}
              <div className="flex items-center gap-2 max-w-md w-full">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Test e-posta adresi yazın..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  disabled={isSendingTest}
                  onClick={handleSendTestEmail}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSendingTest ? 'Gönderiliyor...' : 'Test Maili Gönder'}</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isSavingSmtp}
                className="bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingSmtp ? 'Kaydediliyor...' : 'SMTP Ayarlarını Kaydet'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{testResult.text}</span>
              </div>
            )}
          </form>
        </div>

        {/* Değişkenler Rehberi */}
        <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 mb-6 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold block mb-1">Şablonlarda Kullanılabilir Değişkenler:</span>
            <div className="flex flex-wrap gap-2">
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{musteri_adi}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{siparis_no}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{tutar}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{kargo_takip_no}}"}</code>
              <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono font-bold text-[#1B84F8]">{"{{kargo_firmasi}}"}</code>
            </div>
          </div>
          <span className="text-[11px] text-blue-700">Bu etiketler sipariş anında gerçek müşteri ve kargo bilgileriyle otomatik doldurulur.</span>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-xs font-bold flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* 2. BÖLÜM: SİPARİŞ DURUM BİLDİRİM ŞABLONLARI */}
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Mail className="w-4 h-4 text-[#1B84F8]" />
          <span>Sipariş Durumu E-Posta ve SMS Şablonları ({templates.length})</span>
        </h2>

        <div className="space-y-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B84F8]" />
                  <h3 className="text-sm font-black text-slate-900">{tpl.title}</h3>
                  <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    {tpl.code}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateTemplate(tpl)}
                  disabled={savingId === tpl.id}
                  className="px-4 py-1.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === tpl.id ? 'Kaydediliyor...' : 'Şablonu Kaydet'}</span>
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SMS Şablonu */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>SMS Metni</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {tpl.smsBody.length} Karakter
                    </span>
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
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                  />
                </div>

                {/* E-Posta Şablonu */}
                <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <Mail className="w-4 h-4 text-[#1B84F8]" />
                    <span>E-Posta Konu Başlığı & Gövde Metni</span>
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
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 mb-2 focus:outline-hidden focus:border-[#1B84F8]"
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
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
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
