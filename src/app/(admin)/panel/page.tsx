'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  TrendingUp, 
  ShoppingBag, 
  Layers, 
  Users, 
  Scissors, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight,
  Sliders,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface StatsData {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  inProductionOrders: number;
  shippedOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalMeters: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerSurname: string;
    grandTotal: number;
    status: string;
    createdAt: string;
    items: Array<{
      productName: string;
      calculatedArea: number;
      quantity: number;
      curtainType: string;
    }>;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Sipariş Alındı</span>;
      case 'IN_PRODUCTION':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Scissors className="w-3 h-3" /> Üretime Sevk</span>;
      case 'SHIPPED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Truck className="w-3 h-3" /> Kargoda</span>;
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Tamamlandı</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Yönetim & Satış Analizleri</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Özel Ölçülü Perde Siparişleri, Dikimhane ve Satış İstatistikleri
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/panel/katsayilar"
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5 text-[#1B84F8]" />
              Fiyat Katsayıları
            </Link>
            <Link
              href="/panel/siparisler"
              className="px-4 py-2 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#1B84F8]/20 transition"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Siparişleri İncele
            </Link>
          </div>
        </div>

        {/* 4 Ana Metrik Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Ciro</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                ₺{stats ? stats.totalRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '0,00'}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" /> Gerçekleşen Satışlar
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1B84F8] flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Satılan Perde Metrajı</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats ? stats.totalMeters.toFixed(1) : '0.0'} <span className="text-sm font-semibold text-slate-500">m / m²</span>
              </h3>
              <p className="text-[11px] text-blue-600 font-medium mt-1">Toplam Kumaş Üretimi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Scissors className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Toplam Sipariş</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats ? stats.totalOrders : 0}
              </h3>
              <p className="text-[11px] text-purple-600 font-medium mt-1">
                {stats ? stats.inProductionOrders : 0} Adet Üretimde
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Müşteri Sayısı</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                {stats ? stats.totalCustomers : 0}
              </h3>
              <p className="text-[11px] text-emerald-600 font-medium mt-1">Kayıtlı ve Ziyaretçi</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* WooCommerce Raporlama Grafiği & Sipariş Durumları */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Satış ve Metraj Trendi (Son 7 Gün)</h2>
                <p className="text-xs text-slate-500">Günlük ciro ve dikimhane metre dökümü</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1B84F8]" /> Satış (TL)
                </span>
                <span className="flex items-center gap-1 text-slate-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Metraj (m)
                </span>
              </div>
            </div>

            {/* SVG Grafik */}
            <div className="h-56 w-full flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-100">
              {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, idx) => {
                const heights = [35, 60, 45, 80, 65, 90, 75];
                const meterHeights = [20, 45, 30, 65, 50, 75, 60];
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        style={{ height: `${heights[idx]}%` }}
                        className="w-3.5 bg-[#1B84F8] rounded-t-md hover:bg-[#156cd1] transition-all"
                        title={`Satış: %${heights[idx]}`}
                      />
                      <div
                        style={{ height: `${meterHeights[idx]}%` }}
                        className="w-3.5 bg-emerald-400 rounded-t-md hover:bg-emerald-500 transition-all"
                        title={`Metraj: %${meterHeights[idx]}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sipariş Durum Hiyerarşisi */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 mb-1">Sipariş Süreç Dağılımı</h2>
              <p className="text-xs text-slate-500 mb-6">Atölye ve sevkiyat durumu</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Sipariş Alındı / Bekleyen</span>
                    <span className="text-amber-600">{stats?.pendingOrders || 0} Adet</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Üretime Sevk Edildi (Dikimde)</span>
                    <span className="text-blue-600">{stats?.inProductionOrders || 0} Adet</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1B84F8] rounded-full" style={{ width: '50%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Kargoya Verildi</span>
                    <span className="text-purple-600">{stats?.shippedOrders || 0} Adet</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-600">Tamamlandı</span>
                    <span className="text-emerald-600">{stats?.completedOrders || 0} Adet</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Hızlı İş Kağıdı:</span>
              <Link href="/panel/siparisler" className="text-[#1B84F8] font-bold hover:underline">
                İş Kağıtları Listesi &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Son Siparişler Listesi */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Son Düşen Siparişler</h2>
              <p className="text-xs text-slate-500">En son verilen perde siparişleri</p>
            </div>
            <Link href="/panel/siparisler" className="text-xs font-semibold text-[#1B84F8] hover:underline">
              Tümünü Gör ({stats?.totalOrders || 0})
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Sipariş No</th>
                  <th className="py-3 px-4">Müşteri</th>
                  <th className="py-3 px-4">Perde Modeli & Metraj</th>
                  <th className="py-3 px-4">Tutar</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">
                          {order.customerName} {order.customerSurname}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {order.items.map((i, idx) => (
                          <div key={idx}>
                            {i.productName} ({i.calculatedArea} m)
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₺{order.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/panel/siparisler/${order.id}`}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#1B84F8] hover:text-white text-slate-700 font-semibold transition"
                        >
                          Detay
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Henüz sipariş bulunmuyor.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
