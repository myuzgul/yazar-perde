'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function SifreYenilePage(props: { params: Promise<{ token: string }> }) {
  const params = use(props.params);
  const router = useRouter();
  const token = params.token;

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Girdiğiniz şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      setError('Şifreniz en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          passwordConfirm,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeout(() => {
          router.push('/giris');
        }, 1500);
      } else {
        setError(data.message || 'Şifre yenilenemedi.');
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Yeni Şifre Belirleyin</h1>
          <p className="text-xs text-slate-500 mt-1">Hesabınız için güçlü ve yeni bir şifre oluşturun</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifreniz *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="En az 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifre Tekrar *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="Şifrenizi tekrar girin"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>{loading ? 'Şifre Güncelleniyor...' : 'Şifreyi Güncelle ve Giriş Yap'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link href="/giris" className="text-xs text-slate-600 hover:text-slate-900 font-semibold">
            Giriş Sayfasına Dön
          </Link>
        </div>
      </div>
    </main>
  );
}