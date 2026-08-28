'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'LOGIN' | 'REGISTER';
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, initialTab = 'LOGIN', onSuccess }: AuthModalProps) {
  const router = useRouter();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>(initialTab);

  // Giriş State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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
      if (data.success) {
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
        className="relative w-full max-w-md bg-white rounded-md border border-slate-300 shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Üst Başlık & Sekmeler */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex gap-4">
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
          <div className="m-4 mb-0 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-semibold">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Alanı */}
        <div className="p-6">
          {tab === 'LOGIN' ? (
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-sm pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-sm text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>{loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="pt-2 text-center text-xs text-slate-500">
                Hesabınız yok mu?{' '}
                <button
                  type="button"
                  onClick={() => setTab('REGISTER')}
                  className="font-bold text-[#1B84F8] hover:underline"
                >
                  Hemen Üye Olun
                </button>
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