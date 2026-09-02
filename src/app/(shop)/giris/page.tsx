'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, User, Sparkles, KeyRound } from 'lucide-react';

export default function GirisPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Eski Sistem Üyeleri İlk Şifre Belirleme Durumu
  const [isLegacySetup, setIsLegacySetup] = useState(false);
  const [legacyUserName, setLegacyUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });
      const data = await res.json();

      if (data.requirePasswordSetup) {
        // Eski sistem üyesi tespit edildi -> Şifre belirleme adımına geç
        setIsLegacySetup(true);
        setLegacyUserName(`${data.name} ${data.surname || ''}`.trim());
        setError(null);
      } else if (data.success) {
        setSuccess('Giriş başarılı! Hesabınıza yönlendiriliyorsunuz...');
        setTimeout(() => {
          window.location.href = '/hesabim';
        }, 800);
      } else {
        setError(data.message || 'E-posta veya şifre hatalı.');
      }
    } catch {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLegacyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/set-legacy-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Şifreniz başarıyla kaydedildi! Hesabınıza giriş yapılıyor...');
        setTimeout(() => {
          window.location.href = '/hesabim';
        }, 1000);
      } else {
        setError(data.message || 'Şifre kaydedilemedi.');
      }
    } catch {
      setError('İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        
        {/* ESKİ SİSTEM ÜYESİ ŞİFRE BELİRLEME EKRANI */}
        {isLegacySetup ? (
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-100 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-[#1B84F8] rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-2">
                Yazar Perde Yenilendi
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900">
                Hoş Geldiniz, {legacyUserName || 'Değerli Müşterimiz'}!
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Eski sitemizdeki üyeliğiniz yeni sistemimize güvenle aktarılmıştır. Lütfen hesabınız için kullanmak istediğiniz <strong>yeni şifrenizi</strong> belirleyiniz.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSetLegacyPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresiniz</label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifreniz (En az 6 karakter) *</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Yeni şifrenizi giriniz"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifreniz (Tekrar) *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="Şifrenizi tekrar giriniz"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-900 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-[#1B84F8]/20"
              >
                <span>{loading ? 'Kaydediliyor...' : 'Şifremi Kaydet ve Giriş Yap'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => { setIsLegacySetup(false); setError(null); }}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Geri Dön
              </button>
            </form>
          </div>
        ) : (
          /* STANDART MÜŞTERİ GİRİŞ FORMU */
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Müşteri Girişi</h1>
              <p className="text-xs text-slate-500 mt-1">Perde siparişlerinizi ve adreslerinizi yönetmek için giriş yapın</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
                <div>{error}</div>
                {(error.includes('aktarılmıştır') || error.includes('şifre') || error.includes('Hoş')) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLegacySetup(true);
                      setError(null);
                    }}
                    className="mt-2.5 w-full py-2 bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hemen Yeni Şifrenizi Belirleyin</span>
                  </button>
                )}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Şifre *</label>
                  <Link href="/sifremi-unuttum" className="text-[11px] text-[#1B84F8] hover:underline font-semibold">
                    Şifremi Unuttum?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#1B84F8] rounded border-slate-300"
                  />
                  <span>Beni Hatırla</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-100 text-center space-y-2 text-xs">
              <div className="text-slate-500">
                Henüz üye değil misiniz?{' '}
                <Link href="/kayit" className="text-[#1B84F8] font-bold hover:underline">
                  Hemen Üye Olun
                </Link>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLegacySetup(true);
                    setError(null);
                  }}
                  className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>Eski Sitemizden Aktarılan Üyeyim (İlk Şifremi Belirle)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}