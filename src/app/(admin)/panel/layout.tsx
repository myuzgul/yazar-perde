import React from 'react';

export const metadata = {
  title: 'Yönetici Paneli - PerdeSiparisi.com',
  description: 'Özel Ölçülü Perde & Sipariş Yönetim Sistemi',
};

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {children}
    </div>
  );
}
