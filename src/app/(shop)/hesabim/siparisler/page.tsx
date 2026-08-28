'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  ShoppingBag, 
  ExternalLink,
  Eye,
  Scissors
} from 'lucide-react';

interface OrderItem {
  id: string;
  productName: string;
  productSku: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Order {
  id: string;
  orderNumber: string;
  grandTotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
}

export default function SiparislerPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/shop/account/orders')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Onay Bekliyor</span>;
      case 'CONFIRMED':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Onaylandı</span>;
      case 'IN_PRODUCTION':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><Scissors className="w-3.5 h-3.5" /> Terzide Hazırlanıyor</span>;
      case 'SHIPPED':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Kargoya Verildi</span>;
      case 'DELIVERED':
        return <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Teslim Edildi</span>;
      default:
        return <span className="bg-slate-50 text-slate-800 border border-slate-200 px-2.5 py-1 rounded text-xs font-bold">{status}</span>;
    }
  };

  const getPaymentMethodName = (pm: string) => {
    if (pm === 'PAYTR_CC' || pm === 'CREDIT_CARD') return 'Kredi Kartı';
    if (pm === 'BANK_TRANSFER') return 'Banka Havalesi';
    if (pm === 'CASH_ON_DELIVERY') return 'Kapıda Ödeme';
    return pm;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Siparişlerim ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Geçmişte verdiğiniz tüm siparişleri ve üretim durumlarını inceleyebilirsiniz.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-6 h-6 border-2 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 rounded-lg bg-white shadow-xs">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Henüz Siparişiniz Bulunmuyor</h3>
          <p className="text-xs text-slate-500 mb-4">Verdiğiniz tüm özel ölçülü perde siparişleri burada listelenecektir.</p>
          <Link
            href="/"
            className="inline-block bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2.5 rounded text-xs font-bold transition shadow-xs"
          >
            Alışverişe Başla
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="border border-slate-200 rounded-lg p-5 bg-white shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Sipariş Başlığı */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-extrabold text-sm text-slate-900 font-mono">
                      #{ord.orderNumber}
                    </span>
                    {getStatusBadge(ord.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>{new Date(ord.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>{getPaymentMethodName(ord.paymentMethod)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Toplam Tutar</span>
                    <span className="text-base font-extrabold text-slate-950">₺{ord.grandTotal.toFixed(2)}</span>
                  </div>

                  <Link
                    href={`/hesabim/siparisler/${ord.id}`}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Detayları İncele</span>
                  </Link>
                </div>
              </div>

              {/* Sipariş Kalemleri */}
              <div className="divide-y divide-slate-100 bg-slate-50/70 rounded p-3 text-xs">
                {ord.items.map((item) => (
                  <div key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900">{item.productName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.width}x{item.height} cm • {item.quantity} Adet • (Birim: ₺{item.unitPrice.toFixed(2)})
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      ₺{item.totalPrice.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}