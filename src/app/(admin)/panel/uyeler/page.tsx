'use client';

import React, { useEffect, useState } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Users, Search, UserCheck, ShoppingBag, Mail, Phone, Calendar } from 'lucide-react';

interface RegisteredUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orders: Array<{ id: string; grandTotal: number }>;
}

interface GuestOrder {
  id: string;
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  grandTotal: number;
  createdAt: string;
}

export default function UyelerPage() {
  const [activeTab, setActiveTab] = useState<'REGISTERED' | 'GUESTS'>('REGISTERED');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/customers')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRegisteredUsers(data.data.registeredUsers);
          setGuestOrders(data.data.guestOrders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredRegistered = registeredUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.surname.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search))
  );

  const filteredGuests = guestOrders.filter(
    (g) =>
      g.customerName.toLowerCase().includes(search.toLowerCase()) ||
      g.customerSurname.toLowerCase().includes(search.toLowerCase()) ||
      g.customerEmail.toLowerCase().includes(search.toLowerCase()) ||
      g.customerPhone.includes(search)
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#1B84F8] text-xs font-semibold mb-1">
              <Users className="w-4 h-4" />
              <span>MÜŞTERİ VERİTABANI</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Müşteriler ve Üye Yönetimi</h1>
            <p className="text-sm text-slate-500">
              Kayıtlı üyeler ve üye olmadan sipariş veren tüm müşterilerin listesi
            </p>
          </div>

          {/* Arama */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="İsim, e-posta veya telefon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1B84F8] focus:ring-1 focus:ring-[#1B84F8] shadow-sm"
            />
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center gap-2 border-b border-slate-200 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('REGISTERED')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'REGISTERED'
                ? 'border-[#1B84F8] text-[#1B84F8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kayıtlı Üyeler ({registeredUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GUESTS')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'GUESTS'
                ? 'border-[#1B84F8] text-[#1B84F8]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Üyeliksiz Sipariş Verenler ({guestOrders.length})
          </button>
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Müşteri Ad Soyad</th>
                  <th className="py-3 px-4">İletişim Bilgileri</th>
                  <th className="py-3 px-4">Kayıt / Sipariş Tarihi</th>
                  <th className="py-3 px-4">Toplam Sipariş Adedi</th>
                  <th className="py-3 px-4 text-right">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeTab === 'REGISTERED' ? (
                  filteredRegistered.length > 0 ? (
                    filteredRegistered.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {user.name} {user.surname}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {user.orders.length} Sipariş
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1B84F8] border border-blue-100 inline-flex items-center gap-1">
                            <UserCheck className="w-3 h-3" /> Kayıtlı Üye
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Kayıtlı üye bulunamadı.
                      </td>
                    </tr>
                  )
                ) : filteredGuests.length > 0 ? (
                  filteredGuests.map((guest) => (
                    <tr key={guest.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {guest.customerName} {guest.customerSurname}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{guest.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{guest.customerPhone}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{new Date(guest.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₺{guest.grandTotal.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Hızlı Ziyaretçi Siparişi
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Üyeliksiz sipariş bulunamadı.
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
