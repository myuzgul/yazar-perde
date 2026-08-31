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
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  Sparkles,
  Package,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import Link from 'next/link';

interface PeriodStat {
  ordersCount: number;
  revenue: number;
  meters: number;
  itemCount: number;
}

interface CategorySale {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  quantityTotal: number;
  revenue: number;
  totalArea: number;
  percent: number;
}

interface TopProduct {
  productName: string;
  curtainType: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  totalArea: number;
}

interface DailyTrendItem {
  dayName: string;
  dayDateStr: string;
  ordersCount: number;
  revenue: number;
  meters: number;
}

interface StatsData {
  periods: {
    today: PeriodStat;
    yesterday: PeriodStat;
    thisWeek: PeriodStat;
    thisMonth: PeriodStat;
    thisYear: PeriodStat;
    allTime: PeriodStat;
  };
  summary: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    inProductionOrders: number;
    shippedOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    printedOrdersCount: number;
    totalCustomers: number;
    totalProducts: number;
    totalMeters: number;
  };
  categorySales: CategorySale[];
  topSellingProducts: TopProduct[];
  dailyTrend: DailyTrendItem[];
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerSurname: string;
    grandTotal: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    isPrinted: boolean;
    createdAt: string;
    items: Array<{
      productName: string;
      calculatedArea: number;
      quantity: number;
      curtainType: string;
    }>;
  }>;
}

type PeriodKey = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'thisYear' | 'allTime';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>('today');
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

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
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Beklemede</span>;
      case 'IN_PRODUCTION':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Scissors className="w-3 h-3" /> Üretimde</span>;
      case 'SHIPPED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1"><Truck className="w-3 h-3" /> Kargoda</span>;
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Teslim Edildi</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  const periodLabels: Record<PeriodKey, { title: string; subtitle: string }> = {
    today: { title: 'Bugünkü Satışlar', subtitle: 'Bugün verilen siparişlerin anlık performansı' },
    yesterday: { title: 'Dünkü Satışlar', subtitle: 'Dün tamamlanan siparişlerin dökümü' },
    thisWeek: { title: 'Haftalık Satışlar', subtitle: 'Son 7 gün içerisindeki satış dökümü' },
    thisMonth: { title: 'Bu Ayki Satışlar', subtitle: 'Cari ay içerisindeki toplam performans' },
    thisYear: { title: 'Bu Yılki Satışlar', subtitle: 'Cari yıl içerisindeki toplam satışlar' },
    allTime: { title: 'Tüm Zamanlar', subtitle: 'Sistemin açılışından bu yana toplam veriler' },
  };

  const currentPeriodData: PeriodStat = stats?.periods[selectedPeriod] || {
    ordersCount: 0,
    revenue: 0,
    meters: 0,
    itemCount: 0,
  };

  const maxDailyRevenue = Math.max(...(stats?.dailyTrend.map((d) => d.revenue) || [1]), 1);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans pb-16">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık & Hızlı Erişim Butonları */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Satış & Üretim İstatistikleri</span>
              <span className="bg-[#1B84F8] text-white text-[10px] font-bold px-2 py-0.5 rounded-lg">Canlı</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Dönem bazlı siparişler, dikimhane metrajları ve kategori satış analizleri
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/panel/siparisler"
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Sipariş Yönetimi</span>
            </Link>
            <Link
              href="/panel/kategoriler"
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-[#1B84F8]" />
              <span>Kategoriler</span>
            </Link>
          </div>
        </div>

        {/* 1. DÖNEM SEÇİCİ SEKMELERİ (Bugün, Dün, Bu Hafta, Bu Ay, Bu Yıl, Tüm Zamanlar) */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs mb-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <div className="px-3 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[#1B84F8]" />
            <span>Zaman Aralığı:</span>
          </div>

          {[
            { key: 'today' as PeriodKey, label: 'Bugün' },
            { key: 'yesterday' as PeriodKey, label: 'Dün' },
            { key: 'thisWeek' as PeriodKey, label: 'Haftalık (Son 7 Gün)' },
            { key: 'thisMonth' as PeriodKey, label: 'Bu Ay' },
            { key: 'thisYear' as PeriodKey, label: 'Bu Yıl' },
            { key: 'allTime' as PeriodKey, label: 'Tüm Zamanlar' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedPeriod(tab.key)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedPeriod === tab.key
                  ? 'bg-[#1B84F8] text-white shadow-sm shadow-[#1B84F8]/30'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 2. DÖNEM BAZLI 4 ANA PERFORMANS METRİĞİ */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">
              {periodLabels[selectedPeriod].title}
            </h2>
            <span className="text-[11px] text-slate-500 font-medium">
              {periodLabels[selectedPeriod].subtitle}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ciro Kartı */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Dönem Cirosu</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  ₺{currentPeriodData.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </h3>
                <p className="text-[10px] text-emerald-600 font-bold mt-1 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> Gerçekleşen Net Satış
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B84F8] flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Sipariş Sayısı Kartı */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sipariş Sayısı</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {currentPeriodData.ordersCount} <span className="text-xs font-bold text-slate-400">Sipariş</span>
                </h3>
                <p className="text-[10px] text-purple-600 font-bold mt-1">
                  Toplam {currentPeriodData.itemCount} Kalem Perde
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag className="w-6 h-6" />
              </div>
            </div>

            {/* Üretilen Metraj Kartı */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">İmalat Metrajı</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {currentPeriodData.meters.toFixed(1)} <span className="text-xs font-bold text-slate-400">m / m²</span>
                </h3>
                <p className="text-[10px] text-amber-600 font-bold mt-1">Atölye Kumaş Alanı</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Scissors className="w-6 h-6" />
              </div>
            </div>

            {/* Genel Sipariş / Atölye Durumu Kartı */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Atölye & Üretim</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {stats?.summary.inProductionOrders || 0} <span className="text-xs font-bold text-slate-400">Üretimde</span>
                </h3>
                <p className="text-[10px] text-blue-600 font-bold mt-1">
                  {stats?.summary.printedOrdersCount || 0} Sipariş Yazdırıldı
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* 3. KATEGORİ BAZLI SATIŞ ANALİZİ & GÜNLÜK TREND GRAFİĞİ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Kategori Bazlı Satış Dağılımı Tablosu */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <PieChart className="w-4 h-4 text-[#1B84F8]" />
                  <span>Kategori Bazlı Satış Analizi</span>
                </h2>
                <p className="text-[11px] text-slate-500">Hangi perde kategorisinden ne kadar satıldı ve ciro payı</p>
              </div>
              <span className="text-[11px] font-black text-[#1B84F8] bg-blue-50 px-2.5 py-1 rounded-lg">
                {stats?.categorySales?.length || 0} Kategori
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase">
                    <th className="py-2.5 px-2">Kategori</th>
                    <th className="py-2.5 px-2 text-center">Adet</th>
                    <th className="py-2.5 px-2 text-center">Metraj</th>
                    <th className="py-2.5 px-2 text-right">Toplam Ciro</th>
                    <th className="py-2.5 px-2 text-right w-28">Ciro Payı (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.categorySales && stats.categorySales.length > 0 ? (
                    stats.categorySales.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-2 font-bold text-slate-900">
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-700">
                          {cat.quantityTotal} Adet
                        </td>
                        <td className="py-3 px-2 text-center font-semibold text-slate-600">
                          {cat.totalArea.toFixed(1)} m²
                        </td>
                        <td className="py-3 px-2 text-right font-black text-slate-900">
                          ₺{cat.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#1B84F8] rounded-full"
                                style={{ width: `${Math.min(cat.percent, 100)}%` }}
                              />
                            </div>
                            <span className="font-bold text-[11px] text-slate-800 w-9 text-right">
                              %{cat.percent}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Kategori satış verisi bulunamadı.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Son 7 Günlük Günlük Ciro Trend Grafiği */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <div>
                  <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#1B84F8]" />
                    <span>Son 7 Günlük Satış Trendi</span>
                  </h2>
                  <p className="text-[11px] text-slate-500">Günlük ciro ve sipariş yoğunluğu</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">7 Gün Toplamı</span>
                  <span className="text-xs font-black text-[#1B84F8]">
                    ₺{stats?.periods.thisWeek.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) || '0,00'}
                  </span>
                </div>
              </div>

              {/* Seçili / Üzerine Gelinen Gün Bilgi Paneli */}
              {(() => {
                const activeDay = (hoveredDayIndex !== null && stats?.dailyTrend[hoveredDayIndex])
                  ? stats.dailyTrend[hoveredDayIndex]
                  : stats?.dailyTrend.find((d) => d.revenue > 0) || stats?.dailyTrend[stats.dailyTrend.length - 1];

                return activeDay ? (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 px-3 mb-3 flex items-center justify-between transition-all">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#1B84F8] animate-pulse" />
                      <span className="text-xs font-bold text-slate-800">
                        {activeDay.dayName} ({activeDay.dayDateStr})
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-500 font-medium">
                        <strong>{activeDay.ordersCount}</strong> Sipariş ({activeDay.meters.toFixed(1)} m²)
                      </span>
                      <span className="font-black text-[#1B84F8] bg-blue-50 px-2 py-0.5 rounded-md">
                        ₺{activeDay.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Günlük Çubuk Grafik Alanı */}
              <div className="relative h-48 pt-6 pb-2 border-b border-slate-100 flex items-end justify-between gap-2.5">
                {/* Arka Plan Kılavuz Çizgileri */}
                <div className="absolute inset-x-0 top-6 border-b border-dashed border-slate-100 pointer-events-none" />
                <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 pointer-events-none" />

                {stats?.dailyTrend && stats.dailyTrend.map((day, idx) => {
                  const barHeight = maxDailyRevenue > 0 ? (day.revenue / maxDailyRevenue) * 100 : 0;
                  const isHovered = hoveredDayIndex === idx;
                  const hasRevenue = day.revenue > 0;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDayIndex(idx)}
                      onMouseLeave={() => setHoveredDayIndex(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group relative z-10"
                    >
                      {/* Sütun Üstü Fiyat Etiketi (Kalıcı ve Net) */}
                      {hasRevenue && (
                        <div className={`mb-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-black transition-all shadow-xs ${
                          isHovered 
                            ? 'bg-[#1B84F8] text-white scale-110' 
                            : 'bg-blue-50 text-[#1B84F8] border border-blue-200/80'
                        }`}>
                          ₺{day.revenue >= 1000 ? `${(day.revenue / 1000).toFixed(1)}k` : day.revenue.toFixed(0)}
                        </div>
                      )}

                      {/* Çubuk (Bar) */}
                      <div className="w-full flex items-end justify-center h-full max-h-32">
                        <div
                          style={{ height: `${Math.max(barHeight, hasRevenue ? 14 : 6)}%` }}
                          className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 ${
                            isHovered
                              ? 'bg-[#156cd1] ring-4 ring-blue-100 scale-x-105'
                              : hasRevenue
                              ? 'bg-[#1B84F8] hover:bg-[#156cd1]'
                              : 'bg-slate-200 hover:bg-slate-300'
                          }`}
                        />
                      </div>

                      {/* Gün ve Tarih Bilgisi */}
                      <span className={`text-[11px] font-black mt-2 transition ${
                        isHovered ? 'text-[#1B84F8]' : 'text-slate-800'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">
                        {day.dayDateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Süreç Dağılım Sayaçları (Kompakt ve Şık) */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="bg-amber-50/70 border border-amber-200/60 p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-amber-800 block uppercase">Bekleyen</span>
                  <span className="text-xs font-black text-amber-900">{stats?.summary.pendingOrders || 0} Adet</span>
                </div>
              </div>

              <div className="bg-blue-50/70 border border-blue-200/60 p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-blue-800 block uppercase">Üretimde</span>
                  <span className="text-xs font-black text-blue-900">{stats?.summary.inProductionOrders || 0} Adet</span>
                </div>
              </div>

              <div className="bg-purple-50/70 border border-purple-200/60 p-2.5 rounded-2xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-purple-800 block uppercase">Kargoda</span>
                  <span className="text-xs font-black text-purple-900">{stats?.summary.shippedOrders || 0} Adet</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. EN ÇOK SATAN ÜRÜNLER & SON SİPARİŞLER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* En Çok Satan Ürünler */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>En Çok Satan Perde Modelleri</span>
                </h2>
                <p className="text-[11px] text-slate-500">Müşterilerin en çok tercih ettiği modeller</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {stats?.topSellingProducts && stats.topSellingProducts.length > 0 ? (
                stats.topSellingProducts.map((p, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-[11px] flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 truncate max-w-[180px] sm:max-w-[220px]">
                          {p.productName}
                        </h3>
                        <span className="text-[10px] text-slate-400">{p.categoryName} • {p.totalArea} m²</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-slate-900 block">
                        ₺{p.revenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-[#1B84F8] font-bold">{p.quantity} Adet Satış</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">Henüz satış verisi oluşmadı.</div>
              )}
            </div>
          </div>

          {/* Son Düşen Siparişler */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-[#1B84F8]" />
                  <span>Son Düşen Siparişler</span>
                </h2>
                <p className="text-[11px] text-slate-500">En son verilen müşteri siparişleri</p>
              </div>
              <Link href="/panel/siparisler" className="text-xs font-bold text-[#1B84F8] hover:underline">
                Tümünü İncele ({stats?.summary.totalOrders || 0}) &rarr;
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100 text-[10px] font-black uppercase">
                    <th className="py-2.5 px-2">Sipariş No</th>
                    <th className="py-2.5 px-2">Müşteri</th>
                    <th className="py-2.5 px-2 text-right">Tutar</th>
                    <th className="py-2.5 px-2 text-center">Durum</th>
                    <th className="py-2.5 px-2 text-right">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-2 font-mono font-bold text-[#1B84F8]">
                          <Link href={`/panel/siparisler/${order.id}`} className="hover:underline">
                            {order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3 px-2 font-bold text-slate-800">
                          {order.customerName} {order.customerSurname}
                        </td>
                        <td className="py-3 px-2 text-right font-black text-slate-900">
                          ₺{order.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Link
                            href={`/panel/siparisler/${order.id}`}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1B84F8] hover:bg-[#1B84F8] hover:text-white font-bold transition text-[11px]"
                          >
                            İncele
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Henüz sipariş bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

