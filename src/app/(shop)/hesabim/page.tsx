'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  Settings, 
  LogOut, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  ChevronRight, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  Save,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    slug: string;
    images?: { imageUrl: string }[];
  } | null;
}

interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  timeline: OrderTimeline[];
}

interface CustomerProfile {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
}

export default function HesabimPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PROFILE'>('ORDERS');
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Profil Formu State
  const [editName, setEditName] = useState('');
  const [editSurname, setEditSurname] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Giriş / Kayıt Olma State (Eğer giriş yapılmamışsa)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regSurname, setRegSurname] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setEditName(data.user.name || '');
        setEditSurname(data.user.surname || '');
        setEditPhone(data.user.phone || '');

        // Siparişleri Çek
        const ordersRes = await fetch('/api/shop/account/orders');
        const ordersData = await ordersRes.json();
        if (ordersData.success) {
          setOrders(ordersData.data || []);
        }
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setOrders([]);
    router.refresh();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    try {
      const res = await fetch('/api/shop/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          surname: editSurname,
          phone: editPhone,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfileMsg({ text: 'Bilgileriniz başarıyla güncellendi.', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        fetchUserData();
      } else {
        setProfileMsg({ text: data.message || 'Güncelleme yapılamadı.', type: 'error' });
      }
    } catch {
      setProfileMsg({ text: 'Bağlantı hatası.', type: 'error' });
    }
  };

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (data.success) {
        fetchUserData();
      } else {
        setAuthError(data.message || 'Giriş yapılamadı');
      }
    } catch {
      setAuthError('Bağlantı hatası');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleInlineRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setAuthError(null);
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
        fetchUserData();
      } else {
        setAuthError(data.message || 'Kayıt olunamadı');
      }
    } catch {
      setAuthError('Bağlantı hatası');
    } finally {
      setAuthSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">Onay Bekliyor</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">Sipariş Onaylandı</span>;
      case 'IN_PRODUCTION':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[11px] font-bold">Terzide Hazırlanıyor</span>;
      case 'SHIPPED':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">Kargoya Verildi</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">Teslim Edildi</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">İptal Edildi</span>;
      default:
        return <span className="bg-slate-50 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">{status}</span>;
    }
  };

  if (loading && !authChecked) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 text-center min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
      </main>
    );
  }

  // Giriş Yapılmamışsa
  if (!user) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-12 bg-white min-h-[70vh]">
        <div className="max-w-md mx-auto border border-slate-200 rounded-md p-6 bg-white shadow-xs">
          <div className="flex gap-4 border-b border-slate-200 pb-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setAuthError(null);
              }}
              className={`text-xs font-bold pb-1 border-b-2 transition cursor-pointer ${
                authMode === 'LOGIN' ? 'border-[#1B84F8] text-[#1B84F8]' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              GİRİŞ YAP
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setAuthError(null);
              }}
              className={`text-xs font-bold pb-1 border-b-2 transition cursor-pointer ${
                authMode === 'REGISTER' ? 'border-[#1B84F8] text-[#1B84F8]' : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              YENİ ÜYE KAYDI
            </button>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs font-semibold">
              {authError}
            </div>
          )}

          {authMode === 'LOGIN' ? (
            <form onSubmit={handleInlineLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  placeholder="ornek@mail.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şifre *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-sm text-xs font-bold transition cursor-pointer"
              >
                {authSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleInlineRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adınız *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ahmet"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
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
                    className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta Adresi *</label>
                <input
                  type="email"
                  required
                  placeholder="ornek@mail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cep Telefonu</label>
                <input
                  type="tel"
                  placeholder="05XX XXX XX XX"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şifre Belirleyin *</label>
                <input
                  type="password"
                  required
                  placeholder="En az 6 karakter"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full border border-slate-300 rounded-sm px-3 py-2 text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-2.5 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded-sm text-xs font-bold transition cursor-pointer mt-2"
              >
                {authSubmitting ? 'Kaydediliyor...' : 'Hesap Oluştur'}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
      {/* Üst Karşılama Kartı */}
      <div className="p-6 bg-slate-900 text-white rounded-md mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1B84F8] text-white flex items-center justify-center font-extrabold text-lg">
            {user.name.charAt(0).toUpperCase()}{user.surname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-bold">
              Hoş Geldiniz, {user.name} {user.surname}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email} • {user.phone || 'Telefon Kayıtsız'}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Güvenli Çıkış</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Menü Sekmeleri (3 Kolon) */}
        <div className="lg:col-span-3 space-y-2">
          <button
            type="button"
            onClick={() => setActiveTab('ORDERS')}
            className={`w-full text-left p-3 rounded-md text-xs font-bold flex items-center justify-between transition cursor-pointer ${
              activeTab === 'ORDERS'
                ? 'bg-blue-50 text-[#1B84F8] border border-blue-200'
                : 'text-slate-700 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4" />
              <span>Siparişlerim</span>
            </div>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-600 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PROFILE')}
            className={`w-full text-left p-3 rounded-md text-xs font-bold flex items-center gap-2.5 transition cursor-pointer ${
              activeTab === 'PROFILE'
                ? 'bg-blue-50 text-[#1B84F8] border border-blue-200'
                : 'text-slate-700 hover:bg-slate-50 border border-transparent'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Hesap & Şifre Bilgileri</span>
          </button>

          <Link
            href="/siparis-takip"
            className="w-full text-left p-3 rounded-md text-xs font-bold flex items-center gap-2.5 text-slate-700 hover:bg-slate-50 border border-transparent transition"
          >
            <Truck className="w-4 h-4 text-slate-400" />
            <span>Kargo & Sipariş Takibi</span>
          </Link>
        </div>

        {/* SAĞ: İçerik Alanı (9 Kolon) */}
        <div className="lg:col-span-9">
          {activeTab === 'ORDERS' ? (
            <div className="space-y-4">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                Geçmiş Siparişleriniz ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="p-12 text-center border border-slate-200 rounded-md bg-white">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 mb-1">Henüz Siparişiniz Bulunmuyor</h3>
                  <p className="text-xs text-slate-500 mb-4">Verdiğiniz tüm perde siparişleri ve üretim durumları burada listelenecektir.</p>
                  <Link
                    href="/"
                    className="inline-block bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2 rounded text-xs font-bold transition"
                  >
                    Alışverişe Başla
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-slate-200 rounded-md p-5 bg-white shadow-xs space-y-4"
                    >
                      {/* Sipariş Üst Bilgi */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900 font-mono">
                              #{ord.orderNumber}
                            </span>
                            {getStatusBadge(ord.status)}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            {new Date(ord.createdAt).toLocaleDateString('tr-TR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Toplam Tutar</span>
                          <span className="text-base font-extrabold text-slate-950">₺{ord.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Sipariş Kalemleri */}
                      <div className="divide-y divide-slate-100">
                        {ord.items.map((item) => (
                          <div key={item.id} className="py-2.5 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <h4 className="font-bold text-slate-900">{item.productName}</h4>
                              <p className="text-[11px] text-slate-500 font-mono">
                                {item.width}x{item.height} cm • {item.quantity} Adet • (Birim: ₺{item.unitPrice.toFixed(2)})
                              </p>
                            </div>
                            <span className="font-bold text-slate-900 shrink-0">
                              ₺{item.totalPrice.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Son Durum Notu */}
                      {ord.timeline && ord.timeline.length > 0 && (
                        <div className="p-3 bg-slate-50 rounded border border-slate-100 text-xs flex items-center gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-[#1B84F8] shrink-0" />
                          <span>
                            <strong>Son Güncelleme:</strong> {ord.timeline[ord.timeline.length - 1].title}
                            {ord.timeline[ord.timeline.length - 1].description && (
                              <span className="text-slate-500"> - {ord.timeline[ord.timeline.length - 1].description}</span>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="border border-slate-200 rounded-md p-6 bg-white shadow-xs max-w-xl">
              <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4">
                Hesap & Şifre Bilgilerini Güncelle
              </h2>

              {profileMsg && (
                <div
                  className={`p-3 mb-4 rounded text-xs font-semibold ${
                    profileMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Adınız</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Soyadınız</label>
                    <input
                      type="text"
                      required
                      value={editSurname}
                      onChange={(e) => setEditSurname(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-Posta (Değiştirilemez)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-500 rounded px-3 py-2 text-xs cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cep Telefonu</label>
                  <input
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-900">Şifre Değiştir (İsteğe Bağlı)</h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Mevcut Şifreniz</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Yeni Şifreniz</label>
                    <input
                      type="password"
                      placeholder="En az 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-2 text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-[#1B84F8] hover:bg-[#156cd1] text-white py-2.5 px-6 rounded text-xs font-bold flex items-center gap-2 transition cursor-pointer mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Değişiklikleri Kaydet</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}