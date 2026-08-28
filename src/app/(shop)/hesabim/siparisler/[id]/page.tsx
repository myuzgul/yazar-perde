'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  MapPin, 
  Building2, 
  CreditCard, 
  Scissors, 
  Sparkles,
  Info,
  Calendar,
  FileText
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  curtainType: string;
  width: number;
  height: number;
  quantity: number;
  calculatedArea?: number;
  selectedOptionsSnapshot?: string;
  pricingBreakdownSnapshot?: string;
  unitPrice: number;
  totalPrice: number;
  itemNote?: string | null;
  product?: {
    slug: string;
    images?: { imageUrl: string }[];
  } | null;
}

interface OrderAddress {
  id: string;
  isBilling: boolean;
  addressType: string;
  name: string;
  surname: string;
  companyName?: string | null;
  taxNo?: string | null;
  taxOffice?: string | null;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
}

interface OrderTimeline {
  id: string;
  status: string;
  title: string;
  description?: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  customerNote?: string | null;
  subtotal: number;
  shippingFee: number;
  paymentFee: number;
  discountTotal: number;
  grandTotal: number;
  createdAt: string;
  items: OrderItem[];
  addresses: OrderAddress[];
  timeline: OrderTimeline[];
}

export default function SiparisDetayPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const orderId = params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/shop/account/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrder(data.data);
        } else {
          setError(data.message || 'Sipariş bulunamadı.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Bağlantı hatası.');
        setLoading(false);
      });
  }, [orderId]);

  const parseJsonSafe = (str?: string) => {
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"><Clock className="w-4 h-4" /> Onay Bekliyor</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Sipariş Onaylandı</span>;
      case 'IN_PRODUCTION':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"><Scissors className="w-4 h-4" /> Terzide Hazırlanıyor</span>;
      case 'SHIPPED':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"><Truck className="w-4 h-4" /> Kargoya Verildi</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded text-xs font-bold flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Teslim Edildi</span>;
      default:
        return <span className="bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-6 h-6 border-2 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center border border-slate-200 rounded-lg bg-white">
        <p className="text-xs font-bold text-red-600 mb-4">{error || 'Sipariş bulunamadı.'}</p>
        <Link href="/hesabim/siparisler" className="text-xs font-bold text-[#1B84F8] hover:underline">
          ← Siparişlerime Dön
        </Link>
      </div>
    );
  }

  const deliveryAddress = order.addresses.find((a) => !a.isBilling) || order.addresses[0];
  const billingAddress = order.addresses.find((a) => a.isBilling) || order.addresses[0];

  return (
    <div className="space-y-6">
      {/* Üst Gezinme & Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <Link
            href="/hesabim/siparisler"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Siparişlerime Dön</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-extrabold text-slate-900 font-mono">
              Sipariş #{order.orderNumber}
            </h1>
            {getStatusBadge(order.status)}
          </div>
          <span className="text-xs text-slate-400 mt-0.5 block">
            Sipariş Tarihi: {new Date(order.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded border sm:border-0 border-slate-200">
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Ödenen Toplam Tutar</span>
          <span className="text-2xl font-black text-slate-950">₺{order.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Sipariş Zaman Çizelgesi (Timeline) */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-3">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1B84F8]" />
            <span>Sipariş Süreç Takibi</span>
          </h3>

          <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-blue-100">
            {order.timeline.map((step) => (
              <div key={step.id} className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#1B84F8] border-2 border-white flex items-center justify-center shadow-xs" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{step.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(step.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {step.description && (
                    <p className="text-xs text-slate-600 mt-0.5">{step.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sipariş Kalemleri & Özel Perde Teknik Detayları */}
      <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Package className="w-4 h-4 text-[#1B84F8]" />
          <span>Sipariş Kalemleri ve Özel Ölçü Detayları ({order.items.length})</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {order.items.map((item) => {
            const options = parseJsonSafe(item.selectedOptionsSnapshot);
            const breakdown = parseJsonSafe(item.pricingBreakdownSnapshot);

            return (
              <div key={item.id} className="py-4 first:pt-0 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.productName}</h4>
                    <span className="text-xs text-slate-500 font-mono">Stok Kodu: {item.productSku}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-950 block">₺{item.totalPrice.toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {item.quantity} Adet x ₺{item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Perde Teknik Seçimleri ve Ölçü Kutusu */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50 p-3.5 rounded border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Genişlik (En)</span>
                    <span className="font-extrabold text-slate-900">{item.width} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Yükseklik (Boy)</span>
                    <span className="font-extrabold text-slate-900">{item.height} cm</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Hesaplanan Alan</span>
                    <span className="font-bold text-slate-900 font-mono">{item.calculatedArea ? `${item.calculatedArea.toFixed(2)} m²` : '-'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Adet</span>
                    <span className="font-bold text-slate-900">{item.quantity} Adet</span>
                  </div>

                  {/* Dinamik Seçenekler */}
                  {options && typeof options === 'object' && Object.entries(options).map(([key, val]: [string, any]) => {
                    if (!val) return null;
                    const label = val.name || val.label || (typeof val === 'string' ? val : null);
                    if (!label) return null;
                    return (
                      <div key={key}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">{key}</span>
                        <span className="font-semibold text-slate-800">{label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Özel Ürün Notu */}
                {item.itemNote && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-100 rounded text-xs text-amber-900">
                    <strong>Bu Perde İçin Notunuz:</strong> {item.itemNote}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Adresler & Fiyat Kırılımı */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Teslimat ve Fatura Adresi */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#1B84F8]" />
            <span>Teslimat & Fatura Adresi</span>
          </h3>

          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Teslimat Adresi:</span>
              <p className="font-bold text-slate-900">{deliveryAddress?.name} {deliveryAddress?.surname}</p>
              <p className="text-slate-600 mt-0.5">{deliveryAddress?.fullAddress}</p>
              <p className="font-semibold text-slate-800 mt-0.5">{deliveryAddress?.district} / {deliveryAddress?.city}</p>
              <p className="text-slate-500 font-mono mt-0.5">Tel: {deliveryAddress?.phone}</p>
            </div>

            {billingAddress && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fatura Adresi:</span>
                <p className="font-bold text-slate-900">{billingAddress.name} {billingAddress.surname}</p>
                {billingAddress.companyName && (
                  <p className="font-semibold text-slate-800">{billingAddress.companyName} (Vergi D: {billingAddress.taxOffice} - VNo: {billingAddress.taxNo})</p>
                )}
                <p className="text-slate-600 mt-0.5">{billingAddress.fullAddress}</p>
                <p className="font-semibold text-slate-800">{billingAddress.district} / {billingAddress.city}</p>
              </div>
            )}

            {order.customerNote && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Sipariş Genel Notu:</span>
                <p className="text-slate-700 italic">"{order.customerNote}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Fiyat ve Ödeme Özeti */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#1B84F8]" />
            <span>Ödeme & Tutar Dökümü</span>
          </h3>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Ara Toplam:</span>
              <span className="font-bold text-slate-900">₺{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kargo Ücreti:</span>
              <span className="font-bold text-slate-900">{order.shippingFee === 0 ? 'Ücretsiz' : `₺${order.shippingFee.toFixed(2)}`}</span>
            </div>
            {order.paymentFee > 0 && (
              <div className="flex justify-between">
                <span>Hizmet / Kapıda Ödeme Bedeli:</span>
                <span className="font-bold text-slate-900">₺{order.paymentFee.toFixed(2)}</span>
              </div>
            )}
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>İndirim:</span>
                <span>-₺{order.discountTotal.toFixed(2)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-bold text-slate-900">Toplam Tutar:</span>
              <span className="text-xl font-black text-slate-950">₺{order.grandTotal.toFixed(2)}</span>
            </div>

            <div className="pt-2 text-[11px] text-slate-500">
              <p>Ödeme Yöntemi: <strong className="text-slate-800">{order.paymentMethod === 'PAYTR_CC' ? 'Kredi Kartı (PayTR 3D Secure)' : order.paymentMethod === 'BANK_TRANSFER' ? 'Banka Havalesi / EFT' : 'Kapıda Nakit Ödeme'}</strong></p>
              <p className="mt-0.5">Ödeme Durumu: <strong className="text-emerald-700">{order.paymentStatus === 'PAID' ? 'Ödendi' : 'Onay Bekliyor'}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}