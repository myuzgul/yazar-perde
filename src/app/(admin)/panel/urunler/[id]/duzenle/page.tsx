'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductForm from '@/components/admin/ProductForm';

export default function UrunDuzenlePage() {
  const params = useParams();
  const id = params?.id as string;
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/products?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setProductData(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500">Ürün verisi yükleniyor...</div>
        ) : productData ? (
          <ProductForm initialData={productData} isEdit={true} />
        ) : (
          <div className="p-12 text-center text-red-500">Ürün bulunamadı.</div>
        )}
      </main>
    </div>
  );
}