'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CalculationResult } from '@/modules/pricing-engine/types';

export interface CartItem {
  id: string; // Unique cart item ID (timestamp + rand)
  productId: string;
  name: string;
  slug: string;
  sku: string;
  curtainType: string;
  imageUrl: string;
  width: number;
  height: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  calculationResult: CalculationResult;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  totalCount: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('perde_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('perde_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem: CartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    };
    setItems((prev) => [newItem, ...prev]);
    setIsDrawerOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              quantity,
              totalPrice: Number((i.unitPrice * quantity).toFixed(2)),
            }
          : i
      )
    );
  };

  const clearCart = () => setItems([]);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal: Number(subtotal.toFixed(2)),
        totalCount,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}