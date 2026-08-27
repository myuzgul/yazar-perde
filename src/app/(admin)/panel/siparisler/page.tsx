'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { 
  Search, 
  Eye, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Scissors,
  CreditCard,
  Building2,
  Phone
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (search) params.set('search', search);

    fetch(`/api/admin/orders?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><Clock className="w-3 h-3" /> Beklemede</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-[#1B84F8] border border-blue-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Onaylandı</span>;
      case 'IN_PRODUCTION':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><Scissors className="w-3 h-3" /> Üretimde</span>;
      case 'SHIPPED':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><Truck className="w-3 h-3" /> Kargoda</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Teslim Edildi</span>;
      case 'CANCELLED':
        return <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1"><XCircle className="w-3 h-3" /> İptal Edildi</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{status}</span>;
    }
  };

  const getPaymentBadge = (method: string, pStatus: string) => {
    const isPaid = pStatus === 'PAID';
    return (
      <div className="flex flex-col text-[10px]">
        <span className="font-bold text-slate-800">
          {method === 'PAYTR_CC' && 'Kredi Kartı (PayTR)'}
          {method === 'BANK_TRANSFER' && 'Havale / EFT'}
          {method === 'CASH_ON_DELIVERY' && 'Kapıda Ödeme'}
        </span>
        <span className={isPaid ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
          {isPaid ? '● Ödendi' : '○ Ödeme Bekliyor'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık & Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sipariş Yönetimi</h1>
            <p className="text-xs text-slate-500">Müşteri siparişleri, üretim durumları ve iş kağıtları</p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchOrders();
            }}
            className="relative w-full sm:w-72"
          >
            <input
              type="text"
              placeholder="Sipariş no, müşteri veya tel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1B84F8]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Durum Filtre Sekmeleri */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {[
            { id: 'ALL', label: 'Tüm Siparişler' },
            { id: 'PENDING', label: 'Beklemede' },
            { id: 'CONFIRMED', label: 'Onaylananlar' },
            { id: 'IN_PRODUCTION', label: 'Üretimde' },
            { id: 'SHIPPED', label: 'Kargoda' },
            { id: 'DELIVERED', label: 'Teslim Edilenler' },
            { id: 'CANCELLED', label: 'İptaller' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-[#1B84F8] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sipariş Tablosu */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Siparişler yükleniyor...</div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Sipariş No</th>
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">Kalemler</th>
                    <th className="py-3 px-4">Tutar</th>
                    <th className="py-3 px-4">Ödeme</th>
                    <th className="py-3 px-4">Sipariş Durumu</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const shippingAddr = order.addresses?.find((a: any) => !a.isBilling);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <Link
                            href={`/panel/siparisler/${order.id}`}
                            className="font-mono font-bold text-[#1B84F8] hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{order.customerName} {order.customerSurname}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{order.customerPhone}</span>
                            {shippingAddr?.city && <span className="text-slate-400">• {shippingAddr.city}</span>}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800">{order.items?.length || 0} Perde</span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                            {order.items?.[0]?.productName}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-black text-slate-900">
                          ₺{order.grandTotal.toFixed(2)}
                        </td>

                        <td className="py-3 px-4">
                          {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                        </td>

                        <td className="py-3 px-4">
                          {getStatusBadge(order.status)}
                        </td>

                        <td className="py-3 px-4 text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/panel/siparisler/${order.id}`}
                              className="p-1.5 rounded-lg bg-blue-50 text-[#1B84F8] hover:bg-[#1B84F8] hover:text-white transition"
                              title="Sipariş Detayı"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <Link
                              href={`/panel/siparisler/${order.id}/yazdir`}
                              target="_blank"
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white transition"
                              title="İş Kağıdı Yazdır"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-xs text-slate-400">
              Arama kriterlerine uygun sipariş bulunamadı.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}