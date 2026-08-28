'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export default function SifremiUnuttumPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
    } catch {
      setMessage('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Şifremi Unuttum</h1>
          <p className="text-xs text-slate-500 mt-1">Kayıtlı e-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.</p>
        </div>

        {message && (
          <div className="mb-4 p-3.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-md text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#1B84F8] shrink-0 mt-0.5" />
            <span>{message}</span>
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
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
          >
            <span>{loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
          <Link href="/giris" className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Giriş Sayfasına Dön</span>
          </Link>
        </div>
      </div>
    </main>
  );
}