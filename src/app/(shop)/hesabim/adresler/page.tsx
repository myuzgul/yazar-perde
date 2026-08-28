'use client';

import React, { useEffect, useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  Building2, 
  User, 
  Phone, 
  X, 
  Save, 
  Star
} from 'lucide-react';

interface AddressItem {
  id: string;
  title: string;
  addressType: 'INDIVIDUAL' | 'CORPORATE';
  name: string;
  surname: string;
  companyName?: string | null;
  taxNo?: string | null;
  taxOffice?: string | null;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  postalCode?: string | null;
  isDefaultDelivery: boolean;
  isDefaultBilling: boolean;
}

export default function AdreslerPage() {
  const [addresses, setAddresses] = useState<AddressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);

  // Form State
  const [title, setTitle] = useState('Ev Adresim');
  const [addressType, setAddressType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNo, setTaxNo] = useState('');
  const [isDefaultDelivery, setIsDefaultDelivery] = useState(false);
  const [isDefaultBilling, setIsDefaultBilling] = useState(false);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/shop/account/addresses');
      const data = await res.json();
      if (data.success) setAddresses(data.data || []);
    } catch {
      setMessage({ text: 'Adresler yüklenemedi.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openAddModal = () => {
    setEditingAddress(null);
    setTitle('Ev Adresim');
    setAddressType('INDIVIDUAL');
    setName('');
    setSurname('');
    setPhone('');
    setCity('');
    setDistrict('');
    setFullAddress('');
    setPostalCode('');
    setCompanyName('');
    setTaxOffice('');
    setTaxNo('');
    setIsDefaultDelivery(addresses.length === 0);
    setIsDefaultBilling(addresses.length === 0);
    setModalOpen(true);
    setMessage(null);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setTitle(addr.title);
    setAddressType(addr.addressType);
    setName(addr.name);
    setSurname(addr.surname);
    setPhone(addr.phone);
    setCity(addr.city);
    setDistrict(addr.district);
    setFullAddress(addr.fullAddress);
    setPostalCode(addr.postalCode || '');
    setCompanyName(addr.companyName || '');
    setTaxOffice(addr.taxOffice || '');
    setTaxNo(addr.taxNo || '');
    setIsDefaultDelivery(addr.isDefaultDelivery);
    setIsDefaultBilling(addr.isDefaultBilling);
    setModalOpen(true);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      id: editingAddress?.id,
      title,
      addressType,
      name,
      surname,
      phone,
      city,
      district,
      fullAddress,
      postalCode: postalCode || null,
      companyName: addressType === 'CORPORATE' ? companyName : null,
      taxOffice: addressType === 'CORPORATE' ? taxOffice : null,
      taxNo: addressType === 'CORPORATE' ? taxNo : null,
      isDefaultDelivery,
      isDefaultBilling,
    };

    try {
      const res = await fetch('/api/shop/account/addresses', {
        method: editingAddress ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: editingAddress ? 'Adres güncellendi.' : 'Yeni adres başarıyla kaydedildi.', type: 'success' });
        setModalOpen(false);
        fetchAddresses();
      } else {
        setMessage({ text: data.message || 'İşlem başarısız.', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Bağlantı hatası oluştu.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" adresini silmek istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/shop/account/addresses?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      } else {
        alert(data.message || 'Silinemedi');
      }
    } catch {
      alert('Hata oluştu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Kayıtlı Adreslerim ({addresses.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Siparişlerinizde hızlı seçim yapmak için teslimat ve fatura adreslerinizi kaydedin.</p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-3.5 py-2 bg-[#1B84F8] hover:bg-[#156cd1] text-white rounded text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Adres Ekle</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-6 h-6 border-2 border-[#1B84F8] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 rounded-lg bg-white shadow-xs">
          <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">Henüz Kayıtlı Adresiniz Yok</h3>
          <p className="text-xs text-slate-500 mb-4">Yeni bir teslimat veya fatura adresi ekleyerek siparişlerinizi hızlandırın.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-4 py-2 rounded text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>İlk Adresinizi Ekleyin</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="border border-slate-200 hover:border-slate-300 rounded-lg p-4 bg-white shadow-xs flex flex-col justify-between transition"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-900">{addr.title}</span>
                    {addr.addressType === 'CORPORATE' && (
                      <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        Kurumsal
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(addr)}
                      className="p-1 text-slate-400 hover:text-[#1B84F8] transition cursor-pointer"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addr.id, addr.title)}
                      className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-800">{addr.name} {addr.surname}</p>
                {addr.companyName && (
                  <p className="text-xs text-slate-600 font-semibold mt-0.5">{addr.companyName}</p>
                )}
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{addr.fullAddress}</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">{addr.district} / {addr.city} {addr.postalCode && `(${addr.postalCode})`}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">Tel: {addr.phone}</p>
              </div>

              {/* Rozetler */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                {addr.isDefaultDelivery && (
                  <span className="bg-blue-50 text-[#1B84F8] border border-blue-200 px-2 py-0.5 rounded font-bold">
                    Varsayılan Teslimat
                  </span>
                )}
                {addr.isDefaultBilling && (
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                    Varsayılan Fatura
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADRES EKLEME / DÜZENLEME MODALI */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-2xl p-6 overflow-y-auto max-h-[90vh] animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAddressType('INDIVIDUAL')}
                  className={`py-2 px-3 rounded border text-xs font-bold transition cursor-pointer ${
                    addressType === 'INDIVIDUAL'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  Bireysel Adres
                </button>
                <button
                  type="button"
                  onClick={() => setAddressType('CORPORATE')}
                  className={`py-2 px-3 rounded border text-xs font-bold transition cursor-pointer ${
                    addressType === 'CORPORATE'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  Kurumsal (Şirket)
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Adres Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Evim, Ofis, Yazlık"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Adınız *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Soyadınız *</label>
                  <input
                    type="text"
                    required
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cep Telefonu *</label>
                <input
                  type="tel"
                  required
                  placeholder="05XX XXX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                />
              </div>

              {addressType === 'CORPORATE' && (
                <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Firma Ünvanı *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Vergi Dairesi *</label>
                      <input
                        type="text"
                        required
                        value={taxOffice}
                        onChange={(e) => setTaxOffice(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Vergi No *</label>
                      <input
                        type="text"
                        required
                        value={taxNo}
                        onChange={(e) => setTaxNo(e.target.value)}
                        className="w-full border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">İl (Şehir) *</label>
                  <input
                    type="text"
                    required
                    placeholder="İstanbul"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                  <input
                    type="text"
                    required
                    placeholder="Kadıköy"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Posta Kodu</label>
                  <input
                    type="text"
                    placeholder="34710"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full border border-slate-300 rounded px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Mahalle, Bina No) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mahalle, Cadde/Sokak, Apartman ve Daire No"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full border border-slate-300 rounded p-2.5 text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefaultDelivery}
                    onChange={(e) => setIsDefaultDelivery(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#1B84F8] rounded border-slate-300"
                  />
                  <span>Varsayılan Teslimat Adresim Olarak Ayarla</span>
                </label>

                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefaultBilling}
                    onChange={(e) => setIsDefaultBilling(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#1B84F8] rounded border-slate-300"
                  />
                  <span>Varsayılan Fatura Adresim Olarak Ayarla</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1B84F8] hover:bg-[#156cd1] disabled:opacity-50 text-white rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Kaydediliyor...' : editingAddress ? 'Güncelle' : 'Adresi Kaydet'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}