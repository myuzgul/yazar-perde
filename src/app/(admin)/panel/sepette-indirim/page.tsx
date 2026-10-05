'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { 
  Percent, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  ShoppingBag, 
  FolderTree, 
  Search, 
  Calendar,
  Clock,
  Flame,
  HelpCircle,
  Tag,
  Volume2,
  AlertCircle
} from 'lucide-react';
import { parseCategoryIds, isDiscountDateValid } from '@/lib/cart-discount';

interface CategoryItem {
  id: string;
  name: string;
  parentId?: string | null;
  parent?: { name: string } | null;
  _count?: { products: number; productCategories?: number };
}

export default function SepetteIndirimPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Kampanya State
  const [isActive, setIsActive] = useState<boolean>(false);
  const [discountRate, setDiscountRate] = useState<number>(10);
  const [title, setTitle] = useState<string>('Sepette %10 İndirim');
  const [targetType, setTargetType] = useState<'ALL' | 'CATEGORIES'>('ALL');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState<number>(0);

  // Tarih ve Zamanlama State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Site Geneli Duyuru Çubuğu State
  const [showTopBar, setShowTopBar] = useState<boolean>(true);
  const [bannerText, setBannerText] = useState<string>(
    '🎉 SEPETTE BÜYÜK FIRSAT! Tüm özel dikim perde siparişlerinizde sepette anında net indirim avantajını kaçırmayın!'
  );

  // Kategori Listesi & Arama
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>('');

  const fetchSettingsAndCategories = async () => {
    setLoading(true);
    try {
      const [settingsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/settings').then((r) => r.json()),
        fetch('/api/admin/categories').then((r) => r.json()),
      ]);

      if (categoriesRes.success && Array.isArray(categoriesRes.data)) {
        setCategories(categoriesRes.data);
      }

      if (settingsRes.success && Array.isArray(settingsRes.data)) {
        const map: Record<string, string> = {};
        settingsRes.data.forEach((s: any) => {
          map[s.key] = s.value;
        });

        if (map.cart_discount_active !== undefined) {
          setIsActive(Number(map.cart_discount_active) === 1);
        }
        if (map.cart_discount_rate !== undefined) {
          setDiscountRate(Number(map.cart_discount_rate) || 10);
        }
        if (map.cart_discount_title !== undefined) {
          setTitle(map.cart_discount_title || 'Sepette %10 İndirim');
        }
        if (map.cart_discount_target_type !== undefined) {
          setTargetType(map.cart_discount_target_type === 'CATEGORIES' ? 'CATEGORIES' : 'ALL');
        }
        if (map.cart_discount_category_ids !== undefined) {
          setSelectedCategoryIds(parseCategoryIds(map.cart_discount_category_ids));
        }
        if (map.cart_discount_min_amount !== undefined) {
          setMinAmount(Number(map.cart_discount_min_amount) || 0);
        }
        if (map.cart_discount_start_date !== undefined) {
          setStartDate(map.cart_discount_start_date || '');
        }
        if (map.cart_discount_end_date !== undefined) {
          setEndDate(map.cart_discount_end_date || '');
        }
        if (map.cart_discount_banner_text !== undefined) {
          setBannerText(map.cart_discount_banner_text || '');
        }
        if (map.cart_discount_show_top_bar !== undefined) {
          setShowTopBar(Number(map.cart_discount_show_top_bar) === 1);
        }
      }
    } catch (err) {
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettingsAndCategories();
  }, []);

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryIds(categories.map((c) => c.id));
  };

  const handleClearCategories = () => {
    setSelectedCategoryIds([]);
  };

  // Hızlı Tarih Seçimleri
  const setQuickDateRange = (days: number) => {
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    end.setHours(23, 59, 0, 0);
    const endStr = end.toISOString().slice(0, 16);

    setStartDate(startStr);
    setEndDate(endStr);
  };

  const clearDates = () => {
    setStartDate('');
    setEndDate('');
  };

  // Tarih Durumu Kontrolü
  const isDateValid = isDiscountDateValid(startDate, endDate);
  const nowTime = new Date().getTime();
  const startTime = startDate ? new Date(startDate).getTime() : null;
  const endTime = endDate ? new Date(endDate).getTime() : null;

  let dateStatusBadge = {
    color: 'bg-slate-100 text-slate-600',
    text: 'Süresiz (Manuel Aç/Kapa)',
  };

  if (startTime && nowTime < startTime) {
    const diffDays = Math.ceil((startTime - nowTime) / (1000 * 60 * 60 * 24));
    dateStatusBadge = {
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      text: `⏳ Başlamasına ${diffDays} gün var`,
    };
  } else if (endTime && nowTime > endTime) {
    dateStatusBadge = {
      color: 'bg-red-100 text-red-800 border-red-200',
      text: '⛔ Kampanya Süresi Doldu',
    };
  } else if (startTime || endTime) {
    if (endTime) {
      const remainingDays = Math.ceil((endTime - nowTime) / (1000 * 60 * 60 * 24));
      dateStatusBadge = {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        text: `🟢 Aktif (${remainingDays} gün kaldı)`,
      };
    } else {
      dateStatusBadge = {
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        text: '🟢 Aktif',
      };
    }
  }

  const isActuallyRunning = isActive && isDateValid;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = [
      {
        key: 'cart_discount_active',
        value: isActive ? '1' : '0',
        label: 'Sepette İndirim Kampanyası Durumu',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_rate',
        value: String(discountRate),
        label: 'Sepette İndirim Oranı (%)',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_title',
        value: title.trim() || `Sepette %${discountRate} İndirim`,
        label: 'Sepette İndirim Başlığı',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_target_type',
        value: targetType,
        label: 'Sepette İndirim Kapsamı',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_category_ids',
        value: JSON.stringify(selectedCategoryIds),
        label: 'Sepette İndirim Uygulanacak Kategoriler',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_min_amount',
        value: String(minAmount || 0),
        label: 'Sepette İndirim Minimum Sepet Tutarı',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_start_date',
        value: startDate,
        label: 'Sepette İndirim Başlangıç Tarihi',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_end_date',
        value: endDate,
        label: 'Sepette İndirim Bitiş Tarihi',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_show_top_bar',
        value: showTopBar ? '1' : '0',
        label: 'Site Geneli Üst Kampanya Çubuğu Gösterimi',
        group: 'CAMPAIGN',
      },
      {
        key: 'cart_discount_banner_text',
        value: bannerText.trim(),
        label: 'Site Geneli Kampanya Duyuru Metni',
        group: 'CAMPAIGN',
      },
    ];

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Sepette indirim kampanyası ayarları başarıyla kaydedildi!');
        setTimeout(() => setMessage(null), 4000);
      } else {
        alert(data.message || 'Kayıt sırasında hata oluştu');
      }
    } catch {
      alert('İşlem başarısız');
    } finally {
      setSaving(false);
    }
  };

  // Canlı Simülasyon Değerleri
  const samplePrice = 1000;
  const sampleDiscountAmount = isActuallyRunning ? (samplePrice * discountRate) / 100 : 0;
  const sampleGrandTotal = samplePrice - sampleDiscountAmount;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-6xl">
        {/* Üst Başlık & Kaydet Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>OTOMATİK KAMPANYA VE DUYURU MOTORU</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Sepette İndirim & Kampanya Yönetimi</h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Tarih aralıklı sepet indirimi tanımlayın ve site genelinde geri sayımlı duyuru havası oluşturun.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2.5 rounded-xl bg-[#1B84F8] hover:bg-[#156cd1] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#1B84F8]/20 transition cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}</span>
          </button>
        </div>

        {message && (
          <div className="p-4 rounded-xl mb-6 text-sm flex items-center gap-3 border bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span className="font-semibold">{message}</span>
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-slate-400">Ayarlar yükleniyor...</div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. KAMPANYA DURUMU VE ANA KONTROL KARTI */}
            <div className={`p-6 rounded-2xl border transition-all shadow-sm ${
              isActuallyRunning 
                ? 'bg-emerald-50/50 border-emerald-200' 
                : isActive && !isDateValid
                ? 'bg-amber-50/50 border-amber-200'
                : 'bg-white border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    isActuallyRunning 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' 
                      : isActive && !isDateValid
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Percent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">Kampanya Durumu</h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${dateStatusBadge.color}`}>
                        {dateStatusBadge.text}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isActuallyRunning
                        ? 'Sepette indirim kampanyası şu an sitede AKTİF ve müşterilere uygulanıyor.'
                        : isActive && !isDateValid
                        ? 'Anahtar AÇIK ancak seçili tarih aralığı dışında olduğu için indirim henüz veya artık uygulanmıyor.'
                        : 'Sepette indirim kampanyası şu an KAPALI.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isActive ? '● AÇIK' : '○ KAPALI'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* SOL: AYARLAR FORMU (8 Kolon) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 2. TARİH ARALIĞI VE ZAMANLAMA KARTI */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#1B84F8]" />
                      <span>Kampanya Geçerlilik Tarihleri (Zamanlama)</span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Opsiyonel</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Başlangıç Tarihi & Saati
                      </label>
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Boş bırakılırsa kampanya hemen başlar.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Bitiş Tarihi & Saati (Geri Sayım Sayacı)
                      </label>
                      <input
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Tarih dolduğunda kampanya ve duyuru otomatik kapanır.
                      </span>
                    </div>
                  </div>

                  {/* Hızlı Tarih Seçim Butonları */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Hızlı Süre Tanımla:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setQuickDateRange(3)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        ⚡ 3 Günlük Flaş İndirim
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDateRange(7)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        📅 1 Hafta
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuickDateRange(15)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        📅 15 Gün
                      </button>
                      {(startDate || endDate) && (
                        <button
                          type="button"
                          onClick={clearDates}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition cursor-pointer"
                        >
                          Süresiz Yap (Tarihleri Temizle)
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. SİTE GENELİ DUYURU ÇUBUĞU (TOP BAR) KARTI */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[#1B84F8]" />
                      <span>Site Geneli Kampanya Duyuru Çubuğu (Top Bar)</span>
                    </h3>
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTopBar}
                        onChange={(e) => setShowTopBar(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1B84F8]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Duyuru Çubuğu Metni *
                    </label>
                    <input
                      type="text"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder="Örn: 🎉 BÜYÜK FIRSAT! Tüm perde siparişlerinizde sepette anında net indirim avantajını kaçırmayın!"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Bu metin sitenin en tepesinde renkli ve hareketli duyuru çubuğu olarak tüm ziyaretçilere gösterilir. Kampanya kapatıldığında veya süresi bittiğinde otomatik kaybolur.
                    </span>
                  </div>
                </div>

                {/* 4. İNDİRİM DETAYLARI KARTI */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#1B84F8]" />
                    <span>İndirim Oranı ve Rozet Metni</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Sepette İndirim Oranı (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="90"
                          step="1"
                          required
                          value={discountRate}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setDiscountRate(val);
                            if (title.startsWith('Sepette %')) {
                              setTitle(`Sepette %${val} İndirim`);
                            }
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                          %
                        </span>
                      </div>

                      {/* Hızlı Seçim Butonları */}
                      <div className="flex items-center gap-1.5 mt-2">
                        {[5, 10, 15, 20, 25, 30].map((rate) => (
                          <button
                            key={rate}
                            type="button"
                            onClick={() => {
                              setDiscountRate(rate);
                              if (title.startsWith('Sepette %') || title === '') {
                                setTitle(`Sepette %${rate} İndirim`);
                              }
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              discountRate === rate
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            %{rate}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Minimum Sepet Tutarı (₺)
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="10"
                          value={minAmount}
                          onChange={(e) => setMinAmount(Number(e.target.value))}
                          placeholder="0 = Tüm tutarlar için geçerli"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                          ₺
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        0 girilirse herhangi bir alt sınır olmadan her sepette indirim uygulanır.
                      </span>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Kampanya Rozet / Başlık Metni *
                      </label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Örn: Sepette %10 İndirim Kampanyası"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#1B84F8]"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Bu metin ürün kartlarında rozet olarak ve sepet / sipariş özetinde indirim kalemi olarak gösterilecektir.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. UYGULANACAK KATEGORİ KAPSAMI KARTI */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-5">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-[#1B84F8]" />
                    <span>Uygulanacak Kapsam (Hedef Kategoriler)</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      onClick={() => setTargetType('ALL')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                        targetType === 'ALL'
                          ? 'border-[#1B84F8] bg-blue-50/50 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'ALL'}
                        onChange={() => setTargetType('ALL')}
                        className="mt-0.5 text-[#1B84F8] focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block">🌐 Tüm Ürünlerde Geçerli</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Sitedeki tüm perde modellerinde ve hazır ürünlerde sepette indirim uygulanır.
                        </span>
                      </div>
                    </label>

                    <label
                      onClick={() => setTargetType('CATEGORIES')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                        targetType === 'CATEGORIES'
                          ? 'border-[#1B84F8] bg-blue-50/50 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="targetType"
                        checked={targetType === 'CATEGORIES'}
                        onChange={() => setTargetType('CATEGORIES')}
                        className="mt-0.5 text-[#1B84F8] focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold block">🎯 Sadece Seçili Kategorilerde</span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          İndirim yalnızca belirlediğiniz kategorilere ait ürünler sepete eklendiğinde devreye girer.
                        </span>
                      </div>
                    </label>
                  </div>

                  {/* Kategori Seçim Kutusu (Sadece Kategoriler Seçildiğinde) */}
                  {targetType === 'CATEGORIES' && (
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">Kategorileri Seçin</span>
                          <span className="text-xs font-extrabold text-[#1B84F8] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                            {selectedCategoryIds.length} / {categories.length} Seçili
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllCategories}
                            className="text-[11px] text-[#1B84F8] hover:underline font-bold cursor-pointer"
                          >
                            Tümünü Seç
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            type="button"
                            onClick={handleClearCategories}
                            className="text-[11px] text-slate-500 hover:text-red-600 font-semibold cursor-pointer"
                          >
                            Temizle
                          </button>
                        </div>
                      </div>

                      {/* Arama Kutusu */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={(e) => setCategorySearch(e.target.value)}
                          placeholder="Kategori adı ara..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1B84F8]"
                        />
                      </div>

                      {/* Kategoriler Listesi */}
                      <div className="border border-slate-200 rounded-xl bg-white max-h-64 overflow-y-auto p-2 space-y-1 divide-y divide-slate-50 shadow-2xs">
                        {categories
                          .filter(
                            (c) =>
                              !categorySearch ||
                              c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
                              (c.parent?.name && c.parent.name.toLowerCase().includes(categorySearch.toLowerCase()))
                          )
                          .map((c) => {
                            const isChecked = selectedCategoryIds.includes(c.id);
                            return (
                              <label
                                key={c.id}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition text-xs ${
                                  isChecked
                                    ? 'bg-blue-50/80 text-blue-900 font-bold'
                                    : 'hover:bg-slate-50 text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => handleToggleCategory(c.id)}
                                    className="w-4 h-4 rounded border-slate-300 text-[#1B84F8] focus:ring-0 cursor-pointer"
                                  />
                                  <span className="truncate">
                                    {c.parentId
                                      ? `↳ ${c.name} (${c.parent?.name || 'Alt Kategori'})`
                                      : `📁 ${c.name}`}
                                  </span>
                                </div>
                                {isChecked && (
                                  <span className="text-[10px] text-blue-600 font-bold bg-blue-100/70 px-2 py-0.5 rounded-full shrink-0">
                                    Seçildi
                                  </span>
                                )}
                              </label>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SAĞ: CANLI ÖNİZLEME KARTI (4 Kolon) */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4 sticky top-6">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-600" />
                    <span>Canlı Kampanya Önizlemesi</span>
                  </h3>

                  {/* Üst Duyuru Çubuğu Önizlemesi */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Site Tepesi Duyuru Şeridi
                    </span>
                    {showTopBar && isActuallyRunning ? (
                      <div className="p-3 bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl text-xs space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1 font-black text-[11px]">
                          <Flame className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
                          <span>FIRSAT KAMPANYASI</span>
                        </div>
                        <p className="text-[11px] leading-snug font-bold">
                          {bannerText || `🎉 Tüm siparişlerinizde ${title} fırsatı!`}
                        </p>
                        {endDate && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-mono bg-black/30 px-2 py-0.5 rounded text-amber-200">
                            <Clock className="w-3 h-3" />
                            <span>Geri sayım sayacı aktif</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-100 text-slate-500 rounded-xl text-xs text-center italic">
                        {isActive && !isDateValid ? 'Tarih aralığı dışında (Gösterilmiyor)' : 'Duyuru Çubuğu Kapalı'}
                      </div>
                    )}
                  </div>

                  {/* Örnek Ürün Rozeti */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ürün Detay Fiyat Alanı
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs text-slate-400 line-through">₺1.000,00</span>
                        <span className="text-lg font-black text-emerald-600">
                          ₺{(sampleGrandTotal).toFixed(2)}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-xs">
                        <Sparkles className="w-3 h-3" />
                        <span>{title || `Sepette %${discountRate} İndirim`}</span>
                      </div>
                    </div>
                  </div>

                  {/* Örnek Sepet Fiyat Hesabı */}
                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3 text-xs">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 pb-1.5 flex items-center justify-between">
                      <span>Örnek Sepet Hesabı</span>
                      <span className="text-emerald-400">%{discountRate} İNDİRİM</span>
                    </div>

                    <div className="space-y-1.5 text-slate-300">
                      <div className="flex justify-between">
                        <span>Örnek Sipariş Tutarı:</span>
                        <span className="font-bold text-white">₺{samplePrice.toFixed(2)}</span>
                      </div>

                      {isActuallyRunning ? (
                        <div className="flex justify-between text-emerald-400 font-bold">
                          <span>{title}:</span>
                          <span>-₺{sampleDiscountAmount.toFixed(2)}</span>
                        </div>
                      ) : (
                        <div className="flex justify-between text-slate-500 italic text-[11px]">
                          <span>Kampanya Pasif</span>
                          <span>₺0,00</span>
                        </div>
                      )}

                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Kargo Bedeli:</span>
                        <span className="text-emerald-400 font-bold">ÜCRETSİZ</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="font-bold text-white text-xs">Ödenecek Tutar:</span>
                      <span className="text-xl font-black text-emerald-400">
                        ₺{sampleGrandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-[11px] text-blue-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-[#1B84F8] shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      Belirlenen bitiş tarihine ulaşıldığında indirim motoru ve üst duyuru çubuğu otomatik olarak kapanacaktır.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving || loading}
                    className="w-full py-3 bg-[#1B84F8] hover:bg-[#156cd1] text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Kaydediliyor...' : 'Kampanyayı Kaydet'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
