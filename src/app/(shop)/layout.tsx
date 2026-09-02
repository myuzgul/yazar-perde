import React from 'react';
import PreHeader from '@/components/shop/PreHeader';
import Navbar from '@/components/shop/Navbar';
import Footer from '@/components/shop/Footer';
import FloatingWhatsApp from '@/components/shop/FloatingWhatsApp';
import ShopClientWrapper from '@/components/shop/ShopClientWrapper';
import { getSystemSettings } from '@/lib/settings';

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSystemSettings();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-[#1B84F8] selection:text-white">
      <PreHeader
        slogan={settings.site_slogan}
        discountText={settings.site_discount_bar_text}
        phone={settings.site_phone}
      />
      <ShopClientWrapper freeShippingThreshold={settings.free_shipping_threshold}>
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
      </ShopClientWrapper>
      <FloatingWhatsApp phone={settings.site_phone || '0541 494 51 73'} />
      <Footer />
    </div>
  );
}