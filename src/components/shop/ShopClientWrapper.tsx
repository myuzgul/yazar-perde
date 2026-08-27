'use client';

import React, { useState } from 'react';
import { CartProvider, useCart } from '@/lib/cart-context';
import CartDrawer from './CartDrawer';
import Header from './Header';
import AuthModal from './AuthModal';

function HeaderWithCart({ onOpenAuth }: { onOpenAuth: () => void }) {
  const { totalCount, openDrawer } = useCart();
  return <Header cartCount={totalCount} onOpenCart={openDrawer} onOpenAuth={onOpenAuth} />;
}

export default function ShopClientWrapper({
  children,
  freeShippingThreshold,
}: {
  children: React.ReactNode;
  freeShippingThreshold?: number;
}) {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <CartProvider>
      <HeaderWithCart onOpenAuth={() => setAuthModalOpen(true)} />
      {children}
      <CartDrawer freeShippingThreshold={freeShippingThreshold} />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </CartProvider>
  );
}