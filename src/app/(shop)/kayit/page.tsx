'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Phone, User, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';

export default function KayitPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      setError('Girdiğiniz şifreler eşleşmiyor.');
      return;
    }
    if (!agreeTerms) {
      setError('Lütfen Kullanıcı Sözleşmesi ve Gizlilik Politikasını onaylayınız.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          surname,
          email,
          phone,
          password,
          passwordConfirm,
          agreeTerms,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess('Üyeliğiniz başarıyla tamamlandı! Hesabınıza yönlendiriliyorsunuz...');
        setTimeout(() => {
          window.location.href = '/hesabim';
        }, 800);
      } else {
        setError(data.message || 'Kayıt oluşturulamadı.');
      }
    } catch {
      setError('Bağlantı hatası oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-[75vh] flex items-center justify-center">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#1B84F8] flex items-center justify-center mx-auto mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Yeni Üyelik Oluştur</h1>
          <p className="text-xs text-slate-500 mt-1">Hızlı sipariş vermek ve sipariş durumunuzu takip etmek için üye olun</p>
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adınız *</label>
              <input
                type="text"
                required
                placeholder="Ahmet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Soyadınız *</label>
              <input
                type="text"
                required
                placeholder="Yılmaz"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md px-3 py-2 text-xs text-slate-900"
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900"
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-md pl-9 pr-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Şifre Tekrar *</label>
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
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-3.5 h-3.5 text-[#1B84F8] rounded border-slate-300 mt-0.5"
              />
              <span>
                <Link href="/sayfalar/mesafeli-satis-sozlesmesi" target="_blank" className="text-slate-900 font-bold underline">
                  Kullanıcı Sözleşmesi
                </Link>
                'ni okudum ve kabul ediyorum.
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-md text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs mt-2"
          >
            <span>{loading ? 'Kayıt Yapılıyor...' : 'Üyeliği Tamamla'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          Zaten bir hesabınız var mı?{' '}
          <Link href="/giris" className="text-slate-900 font-bold hover:underline">
            Giriş Yapın
          </Link>
        </div>
      </div>
    </main>
  );
}