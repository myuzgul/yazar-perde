'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Ticket, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  Percent, 
  DollarSign, 
  Truck, 
  AlertTriangle, 
  Sparkles,
  Layers,
  Users,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';

interface CouponUsage {
  id: string;
  orderId?: string;
  userEmail: string;
  discount: number;
  createdAt: string;
}

interface Coupon {
  id: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING';
  discountValue: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  perUserLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  firstOrderOnly: boolean;
  createdAt: string;
  usages?: CouponUsage[];
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [summary, setSummary] = useState<any>({
    totalCoupons: 0,
    activeCoupons: 0,
    totalUsagesCount: 0,
    totalDiscountGiven: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PASSIVE'>('ALL');
  
  // Modal State'leri
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form Verileri
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_SHIPPING',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    firstOrderOnly: false,
  });

  const fetchCoupons = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    fetch(`/api/admin/coupons?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCoupons(data.data);
          if (data.summary) setSummary(data.summary);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCoupons();
  };

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      perUserLimit: '1',
      startDate: '',
      endDate: '',
      isActive: true,
      firstOrderOnly: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      title: coupon.title || '',
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minOrderAmount: coupon.minOrderAmount ? coupon.minOrderAmount.toString() : '',
      maxDiscountAmount: coupon.maxDiscountAmount ? coupon.maxDiscountAmount.toString() : '',
      usageLimit: coupon.usageLimit ? coupon.usageLimit.toString() : '',
      perUserLimit: coupon.perUserLimit ? coupon.perUserLimit.toString() : '1',
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : '',
      isActive: coupon.isActive,
      firstOrderOnly: coupon.firstOrderOnly,
    });
    setIsModalOpen(true);
  };

  const handleGenerateRandomCode = () => {
    const prefixes = ['YAZAR', 'PERDE', 'FIRSAT', 'INDIRIM', 'HOSGELDIN', 'YENISEZON'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setFormData((prev) => ({ ...prev, code: `${randomPrefix}${randomNum}` }));
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Kupon durumu güncellendi: ${!coupon.isActive ? 'Aktif' : 'Pasif'}`);
        setTimeout(() => setActionSuccess(null), 3000);
        fetchCoupons();
      }
    } catch {
      alert('Durum güncellenirken hata oluştu');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.discountValue) {
      alert('Lütfen kupon kodu ve indirim değerini giriniz.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit, 10) : null,
        perUserLimit: formData.perUserLimit ? parseInt(formData.perUserLimit, 10) : 1,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isActive: formData.isActive,
        firstOrderOnly: formData.firstOrderOnly,
      };

      let res;
      if (editingCoupon) {
        payload.id = editingCoupon.id;
        res = await fetch('/api/admin/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setActionSuccess(editingCoupon ? 'Kupon başarıyla güncellendi.' : 'Yeni kupon başarıyla oluşturuldu.');
        setTimeout(() => setActionSuccess(null), 3500);
        fetchCoupons();
      } else {
        alert(data.error || 'İşlem başarısız oldu');
      }
    } catch {
      alert('Kupon kaydedilirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async () => {
    if (!couponToDelete) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${couponToDelete.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`'${couponToDelete.code}' kuponu silindi.`);
        setTimeout(() => setActionSuccess(null), 3000);
        setCouponToDelete(null);
        fetchCoupons();
      } else {
        alert(data.error || 'Silme işlemi başarısız');
      }
    } catch {
      alert('Silme sırasında hata oluştu');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans pb-16">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Başlık & Kupon Ekle Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket className="w-6 h-6 text-[#1B84F8]" />
              <span>Kupon & İndirim Yönetimi</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Promosyon kodları, sepet limitleri ve şarta bağlı indirim kurallarını yönetin
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Kupon Oluştur</span>
          </button>
        </div>

        {/* Bildirim Uyarısı */}
        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold mb-6 animate-in fade-in flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* 4 Özet İstatistik Kartı */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Toplam Kupon</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{summary.totalCoupons}</h3>
              <p className="text-[10px] text-slate-500 font-bold mt-1">Tanımlı Kampanyalar</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B84F8] flex items-center justify-center">
              <Ticket className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Aktif Kuponlar</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{summary.activeCoupons}</h3>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">Kullanıma Açık</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Toplam Kullanım</p>
              <h3 className="text-2xl font-black text-purple-600 mt-1">{summary.totalUsagesCount}</h3>
              <p className="text-[10px] text-purple-700 font-bold mt-1">Siparişlerde Uygulandı</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Sağlanan İndirim</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                ₺{summary.totalDiscountGiven.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[10px] text-blue-600 font-bold mt-1">Müşteri Tasarrufu</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Arama ve Filtreleme */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-2xs mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Kupon kodu veya başlık ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#1B84F8] transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </form>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
              {[
                { key: 'ALL' as const, label: 'Tümü' },
                { key: 'ACTIVE' as const, label: 'Aktif Kuponlar' },
                { key: 'PASSIVE' as const, label: 'Pasif Kuponlar' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    statusFilter === tab.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Kupon Listesi Tablosu */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Kupon verileri yükleniyor...</div>
          ) : coupons.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 text-[10px] uppercase">
                  <tr>
                    <th className="py-3.5 px-4">Kupon Kodu</th>
                    <th className="py-3.5 px-4">İndirim Türü & Değeri</th>
                    <th className="py-3.5 px-4">Uygulama Şartları & Kurallar</th>
                    <th className="py-3.5 px-4 text-center">Kullanım Kotası</th>
                    <th className="py-3.5 px-4">Geçerlilik Tarihleri</th>
                    <th className="py-3.5 px-4 text-center">Durum</th>
                    <th className="py-3.5 px-4 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {coupons.map((coupon) => {
                    const now = new Date();
                    const isExpired = coupon.endDate && now > new Date(coupon.endDate);
                    const isLimitReached = coupon.usageLimit && coupon.usageCount >= coupon.usageLimit;

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/80 transition">
                        {/* Kupon Kodu */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-[#1B84F8] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 tracking-wider">
                              {coupon.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="p-1 text-slate-400 hover:text-[#1B84F8] transition cursor-pointer"
                              title="Kodu Kopyala"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {coupon.title && (
                            <p className="text-[11px] font-bold text-slate-700 mt-1">{coupon.title}</p>
                          )}
                        </td>

                        {/* İndirim Türü ve Değeri */}
                        <td className="py-3.5 px-4">
                          {coupon.discountType === 'PERCENTAGE' && (
                            <div className="font-black text-slate-900 flex items-center gap-1">
                              <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-black">
                                %{coupon.discountValue} İndirim
                              </span>
                            </div>
                          )}
                          {coupon.discountType === 'FIXED_AMOUNT' && (
                            <div className="font-black text-slate-900 flex items-center gap-1">
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-black">
                                ₺{coupon.discountValue} Sabit İndirim
                              </span>
                            </div>
                          )}
                          {coupon.discountType === 'FREE_SHIPPING' && (
                            <div className="font-black text-slate-900 flex items-center gap-1">
                              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-black flex items-center gap-1">
                                <Truck className="w-3 h-3" /> Ücretsiz Kargo
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Şartlar & Kısıtlamalar */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {coupon.minOrderAmount && (
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-200">
                                Min: ₺{coupon.minOrderAmount}
                              </span>
                            )}
                            {coupon.maxDiscountAmount && (
                              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[10px] font-semibold border border-amber-200">
                                Tavan: ₺{coupon.maxDiscountAmount}
                              </span>
                            )}
                            {coupon.firstOrderOnly && (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-bold border border-indigo-200">
                                ⚡ İlk Sipariş Özel
                              </span>
                            )}
                            {coupon.perUserLimit && coupon.perUserLimit > 1 && (
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-medium">
                                Limit: {coupon.perUserLimit} kez/kişi
                              </span>
                            )}
                            {!coupon.minOrderAmount && !coupon.maxDiscountAmount && !coupon.firstOrderOnly && (
                              <span className="text-[10px] text-slate-400 font-medium">Koşulsuz</span>
                            )}
                          </div>
                        </td>

                        {/* Kullanım Kotası */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="font-bold text-slate-900 text-xs">
                              {coupon.usageCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'Kullanım'}
                            </span>
                            {coupon.usageLimit && (
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div 
                                  className={`h-full rounded-full ${isLimitReached ? 'bg-red-500' : 'bg-[#1B84F8]'}`}
                                  style={{ width: `${Math.min((coupon.usageCount / coupon.usageLimit) * 100, 100)}%` }}
                                />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Geçerlilik Tarihleri */}
                        <td className="py-3.5 px-4 text-[11px]">
                          {coupon.startDate || coupon.endDate ? (
                            <div className="space-y-0.5">
                              {coupon.startDate && (
                                <span className="text-slate-500 block">
                                  Başlangıç: {new Date(coupon.startDate).toLocaleDateString('tr-TR')}
                                </span>
                              )}
                              {coupon.endDate && (
                                <span className={`block font-bold ${isExpired ? 'text-red-600' : 'text-slate-700'}`}>
                                  Bitiş: {new Date(coupon.endDate).toLocaleDateString('tr-TR')}
                                  {isExpired && ' (Süresi Doldu)'}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-bold">Süresiz</span>
                          )}
                        </td>

                        {/* Aktif/Pasif Durumu */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(coupon)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black transition cursor-pointer border ${
                              coupon.isActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {coupon.isActive ? '● Aktif' : '○ Pasif'}
                          </button>
                        </td>

                        {/* İşlemler */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(coupon)}
                              className="p-1.5 rounded-lg bg-blue-50 text-[#1B84F8] hover:bg-[#1B84F8] hover:text-white transition cursor-pointer"
                              title="Düzenle"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setCouponToDelete(coupon)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition cursor-pointer"
                              title="Sil"
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
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <Ticket className="w-8 h-8 mx-auto text-slate-300" />
              <p>Arama kriterlerine uygun kupon bulunamadı.</p>
            </div>
          )}
        </div>

        {/* KUPON EKLE / DÜZENLE MODALI */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-200 space-y-5 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-[#1B84F8]" />
                  <h3 className="text-base font-black text-slate-900">
                    {editingCoupon ? 'Kuponu Düzenle' : 'Yeni İndirim Kuponu Oluştur'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Kupon Kodu ve Rastgele Üretici */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Kupon Kodu <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Örn: YAZAR2026, BAHAR15"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      className="flex-1 font-mono uppercase bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-black text-slate-900 text-sm tracking-wider focus:outline-hidden focus:border-[#1B84F8]"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateRandomCode}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Rastgele Üret</span>
                    </button>
                  </div>
                </div>

                {/* Başlık ve Açıklama */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kampanya Başlığı</label>
                    <input
                      type="text"
                      placeholder="Örn: Yeni Sezon Hoş Geldin İndirimi"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dahili Açıklama</label>
                    <input
                      type="text"
                      placeholder="Örn: Instagram fenomen iş birliği için"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                    />
                  </div>
                </div>

                {/* İndirim Türü ve Değeri */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <label className="block font-bold text-slate-800">
                    İndirim Türü & Oranı <span className="text-red-500">*</span>
                  </label>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { type: 'PERCENTAGE' as const, label: '% Yüzde İndirim', icon: Percent },
                      { type: 'FIXED_AMOUNT' as const, label: '₺ Sabit Tutar', icon: DollarSign },
                      { type: 'FREE_SHIPPING' as const, label: 'Ücretsiz Kargo', icon: Truck },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = formData.discountType === t.type;
                      return (
                        <button
                          key={t.type}
                          type="button"
                          onClick={() => setFormData({ ...formData, discountType: t.type })}
                          className={`p-2.5 rounded-xl border text-center font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-[#1B84F8] text-[#1B84F8] shadow-xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-[11px]">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {formData.discountType !== 'FREE_SHIPPING' && (
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {formData.discountType === 'PERCENTAGE' ? 'İndirim Yüzdesi (%)' : 'İndirim Tutarı (₺)'}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        placeholder={formData.discountType === 'PERCENTAGE' ? '15' : '150'}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-black text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                      />
                    </div>
                  )}
                </div>

                {/* Koşullar & Kısıtlamalar (Sepet, Tavan, Limitler) */}
                <div className="border border-slate-200 p-4 rounded-2xl space-y-3">
                  <h4 className="font-black text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Kullanım Koşulları & Kısıtlamalar</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Minimum Sepet Tutarı (₺)</label>
                      <input
                        type="number"
                        placeholder="Örn: 1000 (Boşsa sınırsız)"
                        value={formData.minOrderAmount}
                        onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                      />
                    </div>

                    {formData.discountType === 'PERCENTAGE' && (
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Maksimum İndirim Limiti (₺)</label>
                        <input
                          type="number"
                          placeholder="Örn: 500 (Tavan tıkacı)"
                          value={formData.maxDiscountAmount}
                          onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Toplam Kullanım Kotası</label>
                      <input
                        type="number"
                        placeholder="Örn: 100 (İlk 100 kişi için)"
                        value={formData.usageLimit}
                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Müşteri Başına Kullanım Limiti</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.perUserLimit}
                        onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                      />
                    </div>
                  </div>

                  {/* Sadece İlk Sipariş Switch'i */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="font-bold text-slate-900 block">Sadece İlk Siparişte Geçerli</span>
                      <span className="text-[10px] text-slate-500">
                        Yalnızca daha önce sitemizden alışveriş yapmamış yeni müşteriler kullanabilir
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.firstOrderOnly}
                      onChange={(e) => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                      className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Tarih Aralıkları */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Başlangıç Tarihi</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bitiş Tarihi (Son Kullanma)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-hidden focus:border-[#1B84F8]"
                    />
                  </div>
                </div>

                {/* Kupon Durumu Switch */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="isActiveCoupon"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#1B84F8] rounded border-slate-300 cursor-pointer"
                  />
                  <label htmlFor="isActiveCoupon" className="font-bold text-slate-800 cursor-pointer">
                    Kupon anında aktif edilsin ve müşteriler tarafından kullanılabilsin
                  </label>
                </div>

                {/* Modal Alt Butonlar */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white font-black shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : (editingCoupon ? 'Değişiklikleri Güncelle' : 'Kuponu Oluştur')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* KUPON SİLME ONAY MODALI */}
        {couponToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-base font-black text-slate-900">
                  Kuponu Silmek İstediğinize Emin Misiniz?
                </h3>
                <p className="text-xs text-slate-500">
                  <strong className="font-mono text-slate-900">#{couponToDelete.code}</strong> kuponu kalıcı olarak silinecektir. Artık sepetlerde kullanılamaz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCouponToDelete(null)}
                  className="w-full py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCoupon}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-lg shadow-red-600/30 transition cursor-pointer"
                >
                  Evet, Kuponu Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
