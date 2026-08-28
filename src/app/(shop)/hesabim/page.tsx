'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  MapPin, 
  Settings, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag,
  Scissors
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  createdAt: string;
  items: Array<{ id: string; productName: string; quantity: number; width: number; height: number }>;
}

export default function HesabimDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((res) => res.json()),
      fetch('/api/shop/account/orders').then((res) => res.json()),
    ])
      .then(([userData, ordersData]) => {
        if (userData.authenticated) setUser(userData.user);
        if (ordersData.success) setOrders(ordersData.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-6 h-6 border-2 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  // Giriş Yapılmamışsa
  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center border border-slate-200 rounded-lg p-8 bg-white shadow-xs">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 mb-2">Hesabınıza Giriş Yapın</h2>
        <p className="text-xs text-slate-500 mb-6">Siparişlerinizi, adreslerinizi ve hesap detaylarınızı yönetmek için giriş yapınız.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/giris" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded text-xs font-bold transition">
            Giriş Yap
          </Link>
          <Link href="/kayit" className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2.5 rounded text-xs font-bold transition">
            Üye Ol
          </Link>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => ['PENDING', 'CONFIRMED', 'IN_PRODUCTION'].includes(o.status));
  const shippedOrders = orders.filter((o) => o.status === 'SHIPPED');
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED');
  const lastOrder = orders[0] || null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">Onay Bekliyor</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-bold">Sipariş Onaylandı</span>;
      case 'IN_PRODUCTION':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">Terzide Hazırlanıyor</span>;
      case 'SHIPPED':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[10px] font-bold">Kargoya Verildi</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">Teslim Edildi</span>;
      default:
        return <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Özet İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-slate-200 rounded-lg p-4 bg-white flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1B84F8] flex items-center justify-center shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Toplam Sipariş</span>
            <span className="text-xl font-extrabold text-slate-900">{orders.length}</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Hazırlanan / Üretimde</span>
            <span className="text-xl font-extrabold text-slate-900">{pendingOrders.length}</span>
          </div>
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-white flex items-center gap-3.5 shadow-xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Teslim Edilen</span>
            <span className="text-xl font-extrabold text-slate-900">{deliveredOrders.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Son Sipariş Özeti */}
      <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Son Siparişiniz
          </h2>
          {lastOrder && (
            <Link href={`/hesabim/siparisler/${lastOrder.id}`} className="text-xs font-bold text-[#1B84F8] hover:underline flex items-center gap-1">
              <span>Tüm Detayları Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {lastOrder ? (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 font-mono">#{lastOrder.orderNumber}</span>
                  {getStatusBadge(lastOrder.status)}
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {new Date(lastOrder.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <span className="text-base font-extrabold text-slate-950">
                ₺{lastOrder.grandTotal.toFixed(2)}
              </span>
            </div>

            <div className="divide-y divide-slate-100 bg-slate-50 rounded p-3 text-xs text-slate-700">
              {lastOrder.items.slice(0, 2).map((item) => (
                <div key={item.id} className="py-1.5 first:pt-0 last:pb-0 flex justify-between">
                  <span className="font-semibold truncate max-w-xs">{item.productName}</span>
                  <span className="font-mono text-slate-500 shrink-0">{item.width}x{item.height} cm • {item.quantity} Adet</span>
                </div>
              ))}
              {lastOrder.items.length > 2 && (
                <span className="text-[11px] text-slate-400 block pt-1">+{lastOrder.items.length - 2} diğer perde kalemi</span>
              )}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-500">
            Henüz bir siparişiniz bulunmuyor.
          </div>
        )}
      </div>

      {/* 3. Hızlı Menü Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/hesabim/adresler"
          className="border border-slate-200 hover:border-[#1B84F8] rounded-lg p-4 bg-white transition group shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-50 text-[#1B84F8] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#1B84F8] transition">Kayıtlı Adreslerim</h3>
              <p className="text-[11px] text-slate-500">Teslimat ve fatura adreslerinizi yönetin</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#1B84F8] transition" />
        </Link>

        <Link
          href="/hesabim/profil"
          className="border border-slate-200 hover:border-[#1B84F8] rounded-lg p-4 bg-white transition group shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-blue-50 text-[#1B84F8] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#1B84F8] transition">Profil & Şifre Bilgileri</h3>
              <p className="text-[11px] text-slate-500">Kişisel bilgilerinizi ve şifrenizi güncelleyin</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-[#1B84F8] transition" />
        </Link>
      </div>
    </div>
  );
}