'use client';

import { useEffect, useRef } from 'react';

interface MetaPixelPurchaseTrackerProps {
  orderNumber: string;
  totalAmount: number;
  currency?: string;
  items?: Array<{
    id?: string;
    productId?: string;
    productSku?: string;
    productName?: string;
    quantity?: number;
    totalPrice?: number;
  }>;
}

export default function MetaPixelPurchaseTracker({
  orderNumber,
  totalAmount,
  currency = 'TRY',
  items = [],
}: MetaPixelPurchaseTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!orderNumber || firedRef.current) return;

    // Sayfa yenilendiğinde tekrar tetiklenmemesi için session kontrolü
    const storageKey = `fb_purchase_${orderNumber}`;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // sessionStorage erişilemezse devam et
    }

    const contentIds = items.map(
      (item) => item.productSku || item.productId || String(item.id)
    );

    const fireConversion = () => {
      if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
        (window as any).fbq('track', 'Purchase', {
          value: Number(totalAmount || 0),
          currency: currency,
          content_type: 'product',
          content_ids: contentIds.length > 0 ? contentIds : [String(orderNumber)],
          num_items: items.length > 0 ? items.length : 1,
          order_id: String(orderNumber),
        });

        firedRef.current = true;
        try {
          window.sessionStorage.setItem(storageKey, 'true');
        } catch {}
        return true;
      }
      return false;
    };

    // İlk deneme hemen çalıştırılır
    if (fireConversion()) {
      return;
    }

    // fbq scriptinin yüklenmesini bekleyen kontrol mekanizması
    let attempts = 0;
    const maxAttempts = 25; // 5 saniye boyunca (25 * 200ms) kontrol et
    const interval = setInterval(() => {
      attempts++;
      if (fireConversion() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [orderNumber, totalAmount, currency, items]);

  return null;
}
