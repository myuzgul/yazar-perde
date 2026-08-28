'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Settings, 
  KeyRound, 
  LogOut, 
  ChevronRight, 
  LayoutDashboard,
  Truck
} from 'lucide-react';

interface CustomerUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
}

export default function HesabimLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    window.location.href = '/giris';
  };

  const navItems = [
    { label: 'Hesap Özeti', href: '/hesabim', icon: LayoutDashboard, exact: true },
    { label: 'Siparişlerim', href: '/hesabim/siparisler', icon: Package },
    { label: 'Kayıtlı Adreslerim', href: '/hesabim/adresler', icon: MapPin },
    { label: 'Profil Bilgilerim', href: '/hesabim/profil', icon: Settings },
    { label: 'Kargo Takibi', href: '/siparis-takip', icon: Truck },
  ];

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-16 min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#1B84F8] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  // Eğer giriş yapmamışsa doğrudan çocuk içeriği (Giriş/Kayıt yönlendirmesi) göster
  if (!user) {
    return <>{children}</>;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-[80vh]">
      {/* Üst Hoş Geldiniz Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-5 sm:p-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1B84F8] text-white flex items-center justify-center font-black text-base shadow-xs">
            {user.name.charAt(0).toUpperCase()}{user.surname.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-base font-bold">
              Hoş Geldiniz, {user.name} {user.surname}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{user.email} {user.phone && `• ${user.phone}`}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Çıkış Yap</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SOL: Hesap Menüsü (3 Kolon) */}
        <aside className="lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-lg p-2 divide-y divide-slate-100 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-50 text-[#1B84F8]'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#1B84F8]' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-[#1B84F8]' : 'text-slate-300'}`} />
                </Link>
              );
            })}
          </div>
        </aside>

        {/* SAĞ: Sayfa İçeriği (9 Kolon) */}
        <div className="lg:col-span-9">
          {children}
        </div>
      </div>
    </main>
  );
}