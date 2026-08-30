'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Printer, 
  Clock, 
  CheckCircle2, 
  Truck, 
  User, 
  Building2, 
  FileText, 
  Save,
  MessageSquare
} from 'lucide-react';

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchOrder = () => {
    if (!id) return;
    fetch(`/api/admin/orders?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrder(data.data);
          setStatus(data.data.status);
          setPaymentStatus(data.data.paymentStatus);
          setAdminNote(data.data.adminNote || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status,
          paymentStatus,
          adminNote,
          timelineTitle: `Durum Güncellendi: ${status}`,
          timelineDesc: `Yönetici tarafından güncellendi.`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center text-slate-500">Sipariş verisi yükleniyor...</main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
        <AdminSidebar />
        <main className="flex-1 p-8 text-center text-red-500">Sipariş bulunamadı.</main>
      </div>
    );
  }

  const shippingAddr = order.addresses?.find((a: any) => !a.isBilling);
  const billingAddr = order.addresses?.find((a: any) => a.isBilling);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {/* Üst Bar: Geri Dön, Başlık & İş Kağıdı Yazdır Butonu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/panel/siparisler"
              className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-black text-slate-900">Sipariş #{order.orderNumber}</h1>
                <span className="bg-blue-50 text-[#1B84F8] text-[10px] font-extrabold px-2 py-0.5 rounded">
                  {order.status}
                </span>
                {order.isPrinted ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                    <Printer className="w-3 h-3 text-emerald-600" />
                    Yazdırıldı
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Yazdırılmadı
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                {order.printedAt && (
                  <span className="text-emerald-700 font-semibold ml-2">
                    • Son Yazdırma: {new Date(order.printedAt).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <Link
            href={`/panel/siparisler/${order.id}/yazdir`}
            target="_blank"
            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>İş Kağıdını Yazdır {order.isPrinted && '(Tekrar)'}</span>
          </Link>
        </div>

        {saveSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs font-bold mb-6 animate-in fade-in">
            ✓ Sipariş durumu ve yönetici notu başarıyla güncellendi.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SOL: Perde Kalemleri & Snapshot Dökümleri */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#1B84F8]" />
                <span>Siparişteki Özel Ölçülü Perdeler ({order.items?.length || 0})</span>
              </h2>

              <div className="divide-y divide-slate-100 space-y-4">
                {order.items?.map((item: any) => {
                  let snap: Record<string, any> = {};
                  let breakdown: any[] = [];
                  try {
                    if (item.selectedOptionsSnapshot) snap = JSON.parse(item.selectedOptionsSnapshot);
                    if (item.pricingBreakdownSnapshot) breakdown = JSON.parse(item.pricingBreakdownSnapshot);
                  } catch {}

                  return (
                    <div key={item.id} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2">
                        <div>
                          <span className="font-mono text-[10px] text-slate-400 block">{item.productSku}</span>
                          <h3 className="text-sm font-bold text-slate-900">{item.productName}</h3>
                          <span className="text-[10px] font-bold text-[#1B84F8] bg-blue-50 px-2 py-0.5 rounded inline-block mt-0.5">
                            {item.curtainType}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-slate-900">₺{item.totalPrice.toFixed(2)}</span>
                          <span className="text-[10px] text-slate-400 block">{item.quantity} Adet x ₺{item.unitPrice.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Teknik Snapshot Detayları */}
                      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
                        <div className="flex items-center gap-4 text-slate-900 font-extrabold text-[11px]">
                          <span>Net Ölçü: {item.width} x {item.height} cm</span>
                          <span className="text-[#1B84F8]">Hesaplanan Alan: {item.calculatedArea} m²</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 pt-1">
                          {snap.pleatLabel && <div><strong>Pile:</strong> {snap.pleatLabel}</div>}
                          {snap.caseType && <div><strong>Kasa:</strong> {snap.caseType === 'CLOSED' ? 'Kapalı Kasa' : 'Açık Kasa'}</div>}
                          {snap.chainType && <div><strong>Zincir:</strong> {snap.chainType === 'METAL' ? 'Metal' : 'Plastik'}</div>}
                          {snap.mechanismDirection && <div><strong>Yön:</strong> {snap.mechanismDirection === 'RIGHT' ? 'Sağ' : 'Sol'}</div>}
                          {snap.mountingLabel && <div><strong>Montaj:</strong> {snap.mountingLabel}</div>}
                          {snap.rollerType && <div><strong>Stor:</strong> {snap.rollerType === 'BLACKOUT_ROLLER' ? 'Blackout' : 'Normal'}</div>}
                          {snap.skirtCut && <div><strong>Etek:</strong> Dilimli {snap.withBeads ? '+ Boncuk' : ''}</div>}
                          {snap.fonWingType && <div><strong>Kanat:</strong> {snap.fonWingType === 'DOUBLE_WING' ? 'Çift Kanat' : 'Tek Kanat'}</div>}
                        </div>

                        {item.itemNote && (
                          <div className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200/60 mt-2">
                            <strong>Müşteri Notu:</strong> {item.itemNote}
                          </div>
                        )}

                        {/* Maliyet Dökümü */}
                        {breakdown.length > 0 && (
                          <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                            <span className="font-bold text-slate-700 block">Fiyat Kırılımı:</span>
                            {breakdown.map((b: any, bIdx: number) => (
                              <div key={bIdx} className="flex justify-between">
                                <span>• {b.label}</span>
                                <span className="font-mono font-bold">₺{Number(b.amount).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sipariş Toplamları */}
              <div className="pt-4 border-t border-slate-200 space-y-1 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Ara Toplam:</span>
                  <span className="font-bold text-slate-900">₺{order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo Ücreti:</span>
                  <span className="font-bold text-slate-900">₺{order.shippingFee.toFixed(2)}</span>
                </div>
                {order.paymentFee > 0 && (
                  <div className="flex justify-between text-purple-600 font-bold">
                    <span>Kapıda Ödeme Bedeli:</span>
                    <span>₺{order.paymentFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span>Genel Toplam:</span>
                  <span className="text-[#1B84F8]">₺{order.grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Müşteri ve Fatura Bilgileri */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Teslimat Adresi */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Truck className="w-3.5 h-3.5 text-[#1B84F8]" />
                  <span>Teslimat Adresi</span>
                </h3>
                <p className="font-bold text-slate-900">{shippingAddr?.name} {shippingAddr?.surname}</p>
                <p className="text-slate-600">{shippingAddr?.fullAddress}</p>
                <p className="text-slate-600">{shippingAddr?.district} / {shippingAddr?.city}</p>
                <p className="text-slate-500 font-mono">Tel: {shippingAddr?.phone}</p>
              </div>

              {/* Fatura Adresi */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2 text-xs">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building2 className="w-3.5 h-3.5 text-[#1B84F8]" />
                  <span>Fatura Bilgileri ({billingAddr?.addressType === 'CORPORATE' ? 'Kurumsal' : 'Bireysel'})</span>
                </h3>
                {billingAddr?.companyName && <p className="font-bold text-slate-900">{billingAddr.companyName}</p>}
                {billingAddr?.taxOffice && (
                  <p className="text-slate-600">{billingAddr.taxOffice} V.D. - {billingAddr.taxNo}</p>
                )}
                {!billingAddr?.companyName && (
                  <p className="font-bold text-slate-900">{billingAddr?.name} {billingAddr?.surname}</p>
                )}
                <p className="text-slate-600">{billingAddr?.fullAddress}</p>
                <p className="text-slate-600">{billingAddr?.district} / {billingAddr?.city}</p>
              </div>
            </div>
          </div>

          {/* SAĞ: Durum Güncelleme, Yönetici Notu & Timeline */}
          <div className="lg:col-span-4 space-y-6">
            {/* Durum & Ödeme Güncelleme Paneli */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Sipariş Yönetim Durumu
              </h3>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sipariş Durumu</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="PENDING">Beklemede (İşlem Bekliyor)</option>
                  <option value="CONFIRMED">Onaylandı (Sipariş Teyit Edildi)</option>
                  <option value="IN_PRODUCTION">Üretimde (Atölyede Dikiliyor)</option>
                  <option value="SHIPPED">Kargoya Verildi</option>
                  <option value="DELIVERED">Teslim Edildi</option>
                  <option value="CANCELLED">İptal Edildi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ödeme Durumu</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="PENDING">Ödeme Bekliyor</option>
                  <option value="PAID">Ödendi (Tahsil Edildi)</option>
                  <option value="FAILED">Başarısız / İptal</option>
                  <option value="REFUNDED">İade Edildi</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Atölye / Yönetici Notu</label>
                <textarea
                  rows={3}
                  placeholder="Atölye veya kurye için dahili notlar..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={isUpdating}
                onClick={handleUpdate}
                className="w-full bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</span>
              </button>
            </div>

            {/* Sipariş Geçmişi / Timeline */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Sipariş Hareket Geçmişi
              </h3>

              <div className="space-y-3 pl-2 border-l-2 border-slate-200 ml-2">
                {order.timeline?.map((t: any) => (
                  <div key={t.id} className="relative pl-3">
                    <div className="w-2 h-2 rounded-full bg-[#1B84F8] absolute -left-[17px] top-1" />
                    <span className="font-bold text-slate-900 block">{t.title}</span>
                    {t.description && <p className="text-[11px] text-slate-500 mt-0.5">{t.description}</p>}
                    <span className="text-[9px] text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}