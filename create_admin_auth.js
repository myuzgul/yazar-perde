const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

// 1. API: src/app/api/auth/admin-login/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'admin-login'));
const adminLoginRoute = `import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz.'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır.'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.errors[0]?.message || 'Geçersiz veri' },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return NextResponse.json(
        { success: false, message: 'Bu panele giriş yetkiniz bulunmamaktadır.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'E-posta veya şifre hatalı.' },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
      },
      message: 'Giriş başarılı.',
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası oluştu.' },
      { status: 500 }
    );
  }
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'admin-login', 'route.ts'), adminLoginRoute);

// 2. API: src/app/api/auth/logout/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'logout'));
const logoutRoute = `import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, CUSTOMER_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Çıkış yapıldı.' });
  response.cookies.delete(ADMIN_COOKIE_NAME);
  response.cookies.delete(CUSTOMER_COOKIE_NAME);
  return response;
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'logout', 'route.ts'), logoutRoute);

// 3. API: src/app/api/auth/me/route.ts
ensureDir(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'me'));
const meRoute = `import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session });
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'me', 'route.ts'), meRoute);

// 4. Admin Login Page: src/app/(admin)/panel/login/page.tsx
ensureDir(path.join(process.cwd(), 'src', 'app', '(admin)', 'panel', 'login'));
const loginPage = `'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@perdesiparisi.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Giriş yapılamadı.');
      } else {
        setSuccess('Giriş başarılı! Yönetim paneline yönlendiriliyorsunuz...');
        setTimeout(() => {
          router.push('/panel');
          router.refresh();
        }, 1000);
      }
    } catch {
      setError('Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700 p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1B84F8]/10 text-[#1B84F8] border border-[#1B84F8]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Yönetici Paneli</h1>
          <p className="text-slate-400 text-sm mt-1">Özel Ölçülü Perde & Sipariş Yönetimi</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Yönetici E-Posta
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@perdesiparisi.com"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#1B84F8] focus:ring-2 focus:ring-[#1B84F8]/20 transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Şifre
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#1B84F8] focus:ring-2 focus:ring-[#1B84F8]/20 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1B84F8] hover:bg-[#156cd1] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#1B84F8]/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Giriş Yap</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
          <p className="text-xs text-slate-500">
            Varsayılan Bilgiler: <code className="text-slate-400 font-mono">admin@perdesiparisi.com</code> / <code className="text-slate-400 font-mono">admin123456</code>
          </p>
        </div>
      </div>
    </div>
  );
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', '(admin)', 'panel', 'login', 'page.tsx'), loginPage);

// 5. Admin Panel Shell Layout: src/app/(admin)/panel/layout.tsx
ensureDir(path.join(process.cwd(), 'src', 'app', '(admin)', 'panel'));
const panelLayout = `import React from 'react';

export const metadata = {
  title: 'Yönetici Paneli - PerdeSiparisi.com',
  description: 'Özel Ölçülü Perde & Sipariş Yönetim Sistemi',
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {children}
    </div>
  );
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', '(admin)', 'panel', 'layout.tsx'), panelLayout);

// 6. Admin Panel Overview Page: src/app/(admin)/panel/page.tsx
const panelDashboardPage = `'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  Layers, 
  Sliders, 
  Printer, 
  Settings, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Scissors
} from 'lucide-react';

interface UserSession {
  name: string;
  surname: string;
  email: string;
  role: string;
}

export default function PanelDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => {
        if (!res.ok) {
          router.push('/panel/login');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push('/panel/login');
      });
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/panel/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1B84F8]/20 border-t-[#1B84F8] rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Yönetim paneli yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B84F8] text-white flex items-center justify-center font-bold">
              YP
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">YAZAR PERDE</h2>
              <span className="text-[11px] text-[#1B84F8] font-medium bg-[#1B84F8]/10 px-1.5 py-0.5 rounded">
                YÖNETİM v1.0
              </span>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1 text-sm font-medium">
          <a href="/panel" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#1B84F8] text-white">
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard & İstatistik</span>
          </a>
          <a href="/panel/siparisler" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <ShoppingBag className="w-4 h-4" />
            <span>Sipariş Yönetimi</span>
          </a>
          <a href="/panel/urunler" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <Layers className="w-4 h-4" />
            <span>Ürünler & Modeller</span>
          </a>
          <a href="/panel/katsayilar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <Sliders className="w-4 h-4" />
            <span>Perde Fiyat Katsayıları</span>
          </a>
          <a href="/panel/uyeler" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <Users className="w-4 h-4" />
            <span>Müşteriler & Üyeler</span>
          </a>
          <a href="/panel/ayarlar" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition">
            <Settings className="w-4 h-4" />
            <span>Genel Ayarlar & Kargo</span>
          </a>
        </nav>

        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-white">{user?.name} {user?.surname}</p>
            <p className="text-[11px] text-slate-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Yönetim Paneli & Raporlama</h1>
            <p className="text-sm text-slate-500">FAZ 1 Altyapısı: Veritabanı ve Yönetici Yetkilendirmesi Aktif</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Sistem Çevrimiçi (FAZ 1 Başarılı)
            </span>
          </div>
        </div>

        {/* 4 Özet Kart */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Günlük Satış</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">₺0,00</h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">0 Adet Sipariş</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1B84F8] flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Üretimdeki Perdeler</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">0</h3>
              <p className="text-[11px] text-amber-600 font-medium mt-1">0 Metre Kumaş</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kargoya Verilenler</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">0</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Son 7 günde</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Truck className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Toplam Müşteri</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">1</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Admin Yetkili</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Bilgilendirme ve Hızlı İşlem Kutusu */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">FAZ 1 Durum Özeti</h2>
          <p className="text-sm text-slate-600 mb-4">
            Next.js 15, Prisma ORM, SQLite/PostgreSQL şeması, sistem ayarları tablosu ve yönetici kimlik doğrulama katmanı başarıyla devreye alındı.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">✓ Veritabanı Şeması</span>
              <span className="text-slate-500">Kullanıcı, Ürün, Kategori, Sipariş, Snapshot ve Katsayı tabloları hazır.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">✓ Dinamik Katsayılar</span>
              <span className="text-slate-500">PDF'teki tüm S pile, kruvaze, kapalı kasa, aparat, blackout fiyatları tohumlandı.</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-semibold text-slate-800 block mb-1">✓ Admin Güvenliği</span>
              <span className="text-slate-500">Bcrypt hashleme + JWT HttpOnly Cookie session koruması aktif.</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'app', '(admin)', 'panel', 'page.tsx'), panelDashboardPage);

console.log('Admin auth and dashboard components written successfully.');
