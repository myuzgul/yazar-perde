'use client';

import React from 'react';
import { CartProvider, useCart } from '@/lib/cart-context';
import CartDrawer from './CartDrawer';
import Header from './Header';

function HeaderWithCart() {
  const { totalCount, openDrawer } = useCart();
  return <Header cartCount={totalCount} onOpenCart={openDrawer} />;
}

export default function ShopClientWrapper({
  children,
  freeShippingThreshold,
}: {
  children: React.ReactNode;
  freeShippingThreshold?: number;
}) {
  return (
    <CartProvider>
      <HeaderWithCart />
      {children}
      <CartDrawer freeShippingThreshold={freeShippingThreshold} />
    </CartProvider>
  );
}