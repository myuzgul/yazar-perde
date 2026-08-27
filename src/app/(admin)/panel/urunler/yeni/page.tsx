'use client';

import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ProductForm from '@/components/admin/ProductForm';

export default function YeniUrunPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-100 font-sans">
      <AdminSidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
        <ProductForm isEdit={false} />
      </main>
    </div>
  );
}
