'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Phone,
  CheckSquare,
  Square,
  AlertCircle,
  FileCheck2,
  Layers,
  FileText,
  MessageSquare,
  StickyNote,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPrintFilter, setSelectedPrintFilter] = useState<'ALL' | 'NOT_PRINTED' | 'PRINTED'>('ALL');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Silme Onay Modal State'leri
  const [orderToDelete, setOrderToDelete] = useState<{ id: string; orderNumber: string } | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isDeletingLoading, setIsDeletingLoading] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedStatus !== 'ALL') params.set('status', selectedStatus);
    if (selectedPrintFilter !== 'ALL') params.set('printStatus', selectedPrintFilter);
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
  }, [selectedStatus, selectedPrintFilter]);

  // Checkbox Seçimleri
  const isAllSelected = orders.length > 0 && selectedOrderIds.length === orders.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkPrint = () => {
    if (selectedOrderIds.length === 0) return;
    const idsQuery = selectedOrderIds.join(',');
    window.open(`/panel/siparisler/toplu-yazdir?ids=${idsQuery}`, '_blank');
  };

  const handleMarkSelectedPrinted = async () => {
    if (selectedOrderIds.length === 0) return;
    try {
      const res = await fetch('/api/admin/orders/mark-printed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`${selectedOrderIds.length} sipariş 'Yazdırıldı' olarak işaretlendi.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setSelectedOrderIds([]);
        fetchOrders();
      }
    } catch (e) {
      alert('İşlem sırasında hata oluştu.');
    }
  };

  const handleConfirmDeleteSingle = async () => {
    if (!orderToDelete) return;
    setIsDeletingLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?id=${orderToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Sipariş #${orderToDelete.orderNumber} başarıyla silindi.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setOrderToDelete(null);
        setSelectedOrderIds((prev) => prev.filter((id) => id !== orderToDelete.id));
        fetchOrders();
      } else {
        alert(data.error || 'Silme işlemi başarısız');
      }
    } catch {
      alert('Silme sırasında bir hata oluştu');
    } finally {
      setIsDeletingLoading(false);
    }
  };

  const handleConfirmDeleteBulk = async () => {
    if (selectedOrderIds.length === 0) return;
    setIsDeletingLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrderIds }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`${selectedOrderIds.length} adet sipariş başarıyla silindi.`);
        setTimeout(() => setActionSuccess(null), 3500);
        setIsBulkDeleting(false);
        setSelectedOrderIds([]);
        fetchOrders();
      } else {
        alert(data.error || 'Toplu silme işlemi başarısız');
      }
    } catch {
      alert('Silme sırasında bir hata oluştu');
    } finally {
      setIsDeletingLoading(false);
    }
  };

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

  const getPrintBadge = (isPrinted: boolean, printCount: number, printedAt?: string) => {
    if (isPrinted) {
      return (
        <span 
          className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1 shadow-2xs"
          title={printedAt ? `Son Yazdırma: ${new Date(printedAt).toLocaleString('tr-TR')}` : undefined}
        >
          <Printer className="w-3 h-3 text-emerald-600" />
          <span>Yazdırıldı</span>
        </span>
      );
    }
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-extrabold inline-flex items-center gap-1">
        <Clock className="w-3 h-3 text-amber-600" />
        <span>Yazdırılmadı</span>
      </span>
    );
  };

  const getPaymentBadge = (method: string, pStatus: string) => {
    if (method === 'BANK_TRANSFER') {
      const isPaid = pStatus === 'PAID';
      return (
        <div className="flex flex-col text-[10px]">
          <span className="font-bold text-slate-800">Havale / EFT</span>
          {isPaid ? (
            <span className="text-emerald-600 font-extrabold flex items-center gap-0.5">
              ● Ödendi
            </span>
          ) : (
            <span className="text-amber-700 font-extrabold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded text-[9px] w-fit mt-0.5">
              ○ Ödeme Bekliyor
            </span>
          )}
        </div>
      );
    }

    if (method === 'PAYTR_CC') {
      return (
        <div className="flex flex-col text-[10px]">
          <span className="font-bold text-slate-800">Kredi Kartı (PayTR)</span>
        </div>
      );
    }

    if (method === 'CASH_ON_DELIVERY') {
      return (
        <div className="flex flex-col text-[10px]">
          <span className="font-bold text-slate-800">Kapıda Ödeme</span>
        </div>
      );
    }

    return (
      <div className="flex flex-col text-[10px]">
        <span className="font-bold text-slate-800">{method}</span>
      </div>
    );
  };

  const notPrintedCount = orders.filter((o) => !o.isPrinted).length;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans pb-24">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Bildirim Barı */}
        {actionSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Üst Başlık & Arama */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Sipariş Yönetimi</h1>
            <p className="text-xs text-slate-500">Müşteri siparişleri, üretim durumları, iş kağıtları ve toplu yazdırma</p>
          </div>

          <div className="flex items-center gap-3">
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
        </div>

        {/* İkili Filtreler: Durum Sekmeleri & Yazdırma Durumu Filtresi */}
        <div className="space-y-3 mb-6">
          {/* Sipariş Durumları */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedStatus === tab.id
                    ? 'bg-[#1B84F8] text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Yazdırma Durumu Filtresi */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-200">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Yazdırma Filtresi:</span>
              <button
                onClick={() => setSelectedPrintFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  selectedPrintFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedPrintFilter('NOT_PRINTED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedPrintFilter === 'NOT_PRINTED'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Yazdırılmayanlar ({notPrintedCount})</span>
              </button>
              <button
                onClick={() => setSelectedPrintFilter('PRINTED')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  selectedPrintFilter === 'PRINTED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                <Printer className="w-3 h-3" />
                <span>Yazdırılanlar</span>
              </button>
            </div>

            {selectedOrderIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkPrint}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Seçilenleri Toplu Yazdır ({selectedOrderIds.length})</span>
                </button>
              </div>
            )}
          </div>
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
                    <th className="py-3 px-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                        title="Tümünü Seç / Kaldır"
                      />
                    </th>
                    <th className="py-3 px-4">Sipariş No</th>
                    <th className="py-3 px-4">Müşteri</th>
                    <th className="py-3 px-4">Kalemler</th>
                    <th className="py-3 px-4">Tutar</th>
                    <th className="py-3 px-4">Ödeme Yöntemi</th>
                    <th className="py-3 px-4">Yazdırma Durumu</th>
                    <th className="py-3 px-4">Sipariş Durumu</th>
                    <th className="py-3 px-4">Tarih</th>
                    <th className="py-3 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const shippingAddr = order.addresses?.find((a: any) => !a.isBilling);
                    const isSelected = selectedOrderIds.includes(order.id);

                    return (
                      <tr 
                        key={order.id} 
                        className={`transition ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'}`}
                      >
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                          />
                        </td>

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

                          {/* YÖNETİCİ / ATÖLYE NOTU */}
                          {order.adminNote && (
                            <div 
                              className="mt-1 text-[10px] bg-purple-50 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-md font-semibold flex items-start gap-1 max-w-[220px] shadow-2xs"
                              title={`Yönetici / Atölye Notu: ${order.adminNote}`}
                            >
                              <StickyNote className="w-3 h-3 text-purple-600 shrink-0 mt-0.5" />
                              <span className="truncate"><strong>Yön. Notu:</strong> {order.adminNote}</span>
                            </div>
                          )}

                          {/* MÜŞTERİ SİPARİŞ NOTU */}
                          {order.customerNote && (
                            <div 
                              className="mt-0.5 text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-md font-medium flex items-start gap-1 max-w-[220px]"
                              title={`Müşteri Notu: ${order.customerNote}`}
                            >
                              <MessageSquare className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                              <span className="truncate"><strong>Müşteri:</strong> {order.customerNote}</span>
                            </div>
                          )}
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

                        {/* ÖDEME YÖNTEMİ & DURUMU */}
                        <td className="py-3 px-4">
                          {getPaymentBadge(order.paymentMethod, order.paymentStatus)}
                        </td>

                        {/* YAZDIRMA DURUMU */}
                        <td className="py-3 px-4">
                          {getPrintBadge(order.isPrinted, order.printCount, order.printedAt)}
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
                              className={`p-1.5 rounded-lg transition ${
                                order.isPrinted
                                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-800 hover:text-white'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                              }`}
                              title={order.isPrinted ? "Tekrar Yazdır" : "İş Kağıdını Yazdır"}
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setOrderToDelete({ id: order.id, orderNumber: order.orderNumber })}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                              title="Siparişi Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

        {/* Çoklu Seçim Yüzen Eylem Çubuğu (Floating Bulk Actions Bar) */}
        {selectedOrderIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
            <span className="text-xs font-black bg-[#1B84F8] text-white px-2.5 py-1 rounded-lg">
              {selectedOrderIds.length} Sipariş Seçildi
            </span>

            <button
              type="button"
              onClick={handleBulkPrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <Printer className="w-4 h-4" />
              <span>Seçilenleri Toplu Yazdır ({selectedOrderIds.length})</span>
            </button>

            <button
              type="button"
              onClick={handleMarkSelectedPrinted}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Yazdırıldı Olarak İşaretle
            </button>

            <button
              type="button"
              onClick={() => setIsBulkDeleting(true)}
              className="bg-red-600 hover:bg-red-500 text-white px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-red-600/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Seçilenleri Sil ({selectedOrderIds.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedOrderIds([])}
              className="text-slate-400 hover:text-white text-xs font-semibold px-2 py-1 transition cursor-pointer"
            >
              Seçimi Kaldır
            </button>
          </div>
        )}

        {/* TEKİL SİPARİŞ SİLME ONAY MODALI */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  Siparişi Silmek İstediğinize Emin Misiniz?
                </h3>
                <p className="text-xs text-slate-500">
                  <strong className="font-mono text-slate-900">#{orderToDelete.orderNumber}</strong> numaralı sipariş ve içerisindeki tüm perde kalemleri, adres ve geçmiş bilgileriyle birlikte kalıcı olarak silinecektir.
                </p>
                <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-[11px] font-bold">
                  ⚠️ Bu işlem geri alınamaz!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingLoading}
                  onClick={() => setOrderToDelete(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={isDeletingLoading}
                  onClick={handleConfirmDeleteSingle}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isDeletingLoading ? 'Siliniyor...' : 'Evet, Siparişi Sil'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ÇOKLU / TOPLU SİPARİŞ SİLME ONAY MODALI */}
        {isBulkDeleting && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  {selectedOrderIds.length} Siparişi Toplu Sil
                </h3>
                <p className="text-xs text-slate-500">
                  Seçtiğiniz <strong className="text-slate-900">{selectedOrderIds.length} adet</strong> sipariş ve bu siparişlere ait tüm kalemler kalıcı olarak sistemden silinecektir.
                </p>
                <div className="p-2.5 bg-red-50 text-red-800 rounded-xl text-[11px] font-bold">
                  ⚠️ Bu işlem geri alınamaz!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingLoading}
                  onClick={() => setIsBulkDeleting(false)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={isDeletingLoading}
                  onClick={handleConfirmDeleteBulk}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isDeletingLoading ? 'Siliniyor...' : `Evet, ${selectedOrderIds.length} Siparişi Sil`}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}