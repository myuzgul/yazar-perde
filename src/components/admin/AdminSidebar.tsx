'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Sliders, 
  Users, 
  Settings, 
  LogOut, 
  Bell, 
  FolderTree, 
  Award, 
  Tag, 
  FileText,
  MessageSquare,
  Ticket,
  Sparkles
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/panel/login');
    router.refresh();
  };

  const menuItems = [
    { label: 'Dashboard & Raporlar', href: '/panel', icon: TrendingUp },
    { label: 'Sipariş Yönetimi', href: '/panel/siparisler', icon: ShoppingBag },
    { label: 'Kuponlar & İndirim', href: '/panel/kuponlar', icon: Ticket },
    { label: 'Ürün Yönetimi', href: '/panel/urunler', icon: Layers },
    { label: 'Toplu Fiyat Güncelle', href: '/panel/urunler/toplu-guncelle', icon: Sparkles },
    { label: 'Kategoriler', href: '/panel/kategoriler', icon: FolderTree },
    { label: 'Markalar', href: '/panel/markalar', icon: Award },
    { label: 'Müşteri Yorumları', href: '/panel/yorumlar', icon: MessageSquare },
    { label: 'Perde Katsayıları', href: '/panel/katsayilar', icon: Sliders },
    { label: 'Müşteriler & Üyeler', href: '/panel/uyeler', icon: Users },
    { label: 'SMS & E-Posta Şablonları', href: '/panel/bildirimler', icon: Bell },
    { label: 'Hikaye (Story) Vitrini', href: '/panel/hikayeler', icon: Sparkles },
    { label: 'Kurumsal Sayfalar', href: '/panel/sayfalar', icon: FileText },
    { label: 'Genel & Kargo Ayarları', href: '/panel/ayarlar', icon: Settings },
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <Link href="/panel" className="flex items-center gap-2">
          <div className="bg-white p-1.5 rounded-sm">
            <img
              src="/images/logo.jpg"
              alt="Yazar Perde"
              className="h-7 w-auto object-contain"
            />
          </div>
          <span className="text-[10px] text-[#1B84F8] font-bold bg-[#1B84F8]/10 px-1.5 py-0.5 rounded border border-[#1B84F8]/20">
            PANEL
          </span>
        </Link>
      </div>

      <nav className="p-3 space-y-1 flex-1 text-xs font-medium overflow-y-auto">
        <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-wider text-slate-500">
          Ana Menü
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm transition-all ${
                isActive
                  ? 'bg-[#1B84F8] text-white shadow-sm font-semibold'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
            A
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Yönetici</p>
            <p className="text-[10px] text-emerald-400 font-medium">● Çevrimiçi</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Çıkış Yap"
          className="p-2 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}