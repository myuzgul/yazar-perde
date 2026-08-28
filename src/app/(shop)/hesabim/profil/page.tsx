'use client';

import React, { useEffect, useState } from 'react';
import { 
  User, 
  Lock, 
  Phone, 
  Mail, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Trash2,
  KeyRound
} from 'lucide-react';

export default function ProfilPage() {
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Şifre Değiştirme
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setName(data.user.name || '');
          setSurname(data.user.surname || '');
          setEmail(data.user.email || '');
          setPhone(data.user.phone || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await fetch('/api/shop/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, surname, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ text: 'Kişisel bilgileriniz başarıyla güncellendi.', type: 'success' });
      } else {
        setProfileMsg({ text: data.message || 'Güncelleme başarısız.', type: 'error' });
      }
    } catch {
      setProfileMsg({ text: 'Bağlantı hatası.', type: 'error' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      setPasswordMsg({ text: 'Yeni şifreler birbiriyle eşleşmiyor.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Yeni şifre en az 6 karakter olmalıdır.', type: 'error' });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await fetch('/api/shop/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPasswordMsg({ text: 'Şifreniz başarıyla değiştirildi.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setNewPasswordConfirm('');
      } else {
        setPasswordMsg({ text: data.message || 'Mevcut şifreniz hatalı.', type: 'error' });
      }
    } catch {
      setPasswordMsg({ text: 'Bağlantı hatası.', type: 'error' });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = () => {
    alert('Hesap kapatma talebiniz müşteri hizmetlerimize iletildi. Yetkili ekibimiz sizinle iletişime geçecektir.');
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-6 h-6 border-2 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Kişisel Bilgiler */}
      <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[#1B84F8]" />
            <span>Kişisel Profil Bilgileri</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Adınız, soyadınız ve iletişim bilgilerinizi güncelleyin.</p>
        </div>

        {profileMsg && (
          <div
            className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Adınız *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Soyadınız *</label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi (Kayıtlı)</label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cep Telefonu</label>
              <input
                type="tel"
                placeholder="05XX XXX XX XX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{savingProfile ? 'Kaydediliyor...' : 'Profil Bilgilerini Kaydet'}</span>
          </button>
        </form>
      </div>

      {/* 2. Şifre Değiştirme */}
      <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-xs space-y-4">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#1B84F8]" />
            <span>Şifre Değiştir</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Hesap güvenliğiniz için şifrenizi düzenli olarak güncelleyin.</p>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mevcut Şifreniz *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifreniz *</label>
              <input
                type="password"
                required
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Yeni Şifre Tekrar *</label>
              <input
                type="password"
                required
                placeholder="Şifrenizi tekrar girin"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="px-5 py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Lock className="w-4 h-4" />
            <span>{savingPassword ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}</span>
          </button>
        </form>
      </div>

      {/* 3. Hesap Kapatma & Güvenlik Bildirimi */}
      <div className="border border-red-200 bg-red-50/40 rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Hesabımı Kapat / Silme Talebi</span>
          </h3>
          <p className="text-xs text-red-700 mt-0.5">
            Hesabınızı kapatmak istediğinizde sipariş geçmişiniz yasal muhasebe süresi boyunca arşivlenir.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-white border border-red-300 text-red-600 hover:bg-red-50 rounded text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hesap Kapatma Talebi</span>
        </button>
      </div>
    </div>
  );
}