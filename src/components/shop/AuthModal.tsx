'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle2, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'LOGIN' | 'REGISTER';
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialTab = 'LOGIN', onSuccess }: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'LEGACY_SETUP'>(initialTab);

  // Giriş State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Eski Sistem Üye Şifre Belirleme State
  const [legacyUserName, setLegacyUserName] = useState('');
  const [legacyNewPassword, setLegacyNewPassword] = useState('');
  const [legacyNewPasswordConfirm, setLegacyNewPasswordConfirm] = useState('');

  // Kayıt State
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();

      if (data.requirePasswordSetup) {
        // Eski sistem üyesi tespit edildi -> Şifre belirleme adımına geç
        setTab('LEGACY_SETUP');
        setLegacyUserName(`${data.name} ${data.surname || ''}`.trim());
        setError(null);
      } else if (data.success) {
        setSuccessMsg('Giriş başarılı!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
          router.push('/hesabim');
        }, 600);
      } else {
        setError(data.message || 'Giriş yapılamadı');
      }
    } catch {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSetLegacyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (legacyNewPassword.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }
    if (legacyNewPassword !== legacyNewPasswordConfirm) {
      setError('Girdiğiniz şifreler birbiriyle eşleşmiyor.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/set-legacy-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, newPassword: legacyNewPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Şifreniz kaydedildi! Giriş yapılıyor...');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
          router.push('/hesabim');
        }, 800);
      } else {
        setError(data.message || 'Şifre kaydedilemedi.');
      }
    } catch {
      setError('İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          surname: regSurname,
          email: regEmail,
          phone: regPhone,
          password: regPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Hesabınız oluşturuldu!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
          router.refresh();
          router.push('/hesabim');
        }, 600);
      } else {
        setError(data.message || 'Kayıt olunamadı');
      }
    } catch {
      setError('Bağlantı hatası oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-2xl border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık & Sekmeler */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex gap-4">
            {tab === 'LEGACY_SETUP' ? (
              <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>YENİ ŞİFRE BELİRLEME</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setTab('LOGIN');
                    setError(null);
                  }}
                  className={`text-xs font-extrabold tracking-wider transition pb-1 border-b-2 cursor-pointer ${
                    tab === 'LOGIN' ? 'border-[#1B84F8] text-[#1B84F8]' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  GİRİŞ YAP
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTab('REGISTER');
                    setError(null);
                  }}
                  className={`text-xs font-extrabold tracking-wider transition pb-1 border-b-2 cursor-pointer ${
                    tab === 'REGISTER' ? 'border-[#1B84F8] text-[#1B84F8]' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  YENİ ÜYELİK
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Bildirim Mesajları */}
        {error && (
          <div className="m-4 mb-0 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-semibold">
            <div>{error}</div>
            {(error.includes('aktarılmıştır') || error.includes('şifre') || error.includes('Hoş')) && tab !== 'LEGACY_SETUP' && (
              <button
                type="button"
                onClick={() => {
                  setTab('LEGACY_SETUP');
                  setError(null);
                }}
                className="mt-2 w-full py-1.5 bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Hemen Yeni Şifrenizi Belirleyin</span>
              </button>
            )}
          </div>
        )}

        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Alanı */}
        <div className="p-6">
          {tab === 'LEGACY_SETUP' ? (
            /* ESKİ SİSTEM ÜYESİ İÇİN ŞİFRE BELİRLEME EKRANI */
            <form onSubmit={handleSetLegacyPassword} className="space-y-4">
              <div className="text-center pb-1">
                <h3 className="text-sm font-black text-slate-900">
                  Hoş Geldiniz, {legacyUserName || 'Değerli Müşterimiz'}!
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Eski sitemizdeki üyeliğiniz yeni sistemimize aktarılmıştır. Lütfen hesabınız için yeni bir şifre belirleyiniz.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresiniz</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ornek@mail.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
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
                    value={legacyNewPassword}
                    onChange={(e) => setLegacyNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
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
                    value={legacyNewPasswordConfirm}
                    onChange={(e) => setLegacyNewPasswordConfirm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#1B84F8]/20"
              >
                <span>{loading ? 'Kaydediliyor...' : 'Şifremi Kaydet ve Giriş Yap'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTab('LOGIN');
                    setError(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  Geri Dön
                </button>
              </div>
            </form>
          ) : tab === 'LOGIN' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@mail.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Şifreniz *</label>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      router.push('/sifremi-unuttum');
                    }}
                    className="text-[11px] text-[#1B84F8] hover:underline cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center space-y-2 text-xs text-slate-500">
                <div>
                  Hesabınız yok mu?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('REGISTER')}
                    className="font-bold text-[#1B84F8] hover:underline cursor-pointer"
                  >
                    Hemen Üye Olun
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('LEGACY_SETUP');
                      setError(null);
                    }}
                    className="text-[11px] text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Eski Sitemizden Aktarılan Üyeyim (İlk Şifremi Belirle)</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmet"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Soyadınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Yılmaz"
                    value={regSurname}
                    onChange={(e) => setRegSurname(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="ornek@mail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cep Telefonu</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şifre Belirleyin *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    placeholder="En az 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-sm text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mt-2"
              >
                <span>{loading ? 'Hesap Oluşturuluyor...' : 'Üyeliği Tamamla'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-1 text-center text-xs text-slate-500">
                Zaten üye misiniz?{' '}
                <button
                  type="button"
                  onClick={() => setTab('LOGIN')}
                  className="font-bold text-slate-900 hover:underline"
                >
                  Giriş Yapın
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}