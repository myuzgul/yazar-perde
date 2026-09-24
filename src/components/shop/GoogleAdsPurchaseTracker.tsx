'use client';

import { useEffect, useRef } from 'react';

interface GoogleAdsPurchaseTrackerProps {
  orderNumber: string;
  totalAmount: number;
  currency?: string;
  conversionId?: string;
}

export default function GoogleAdsPurchaseTracker({
  orderNumber,
  totalAmount,
  currency = 'TRY',
  conversionId = 'AW-18472192661/IX4ACKijhoQdEJWVnehE',
}: GoogleAdsPurchaseTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!orderNumber || firedRef.current) return;

    // Sayfa yenilendiğinde tekrar tetiklenmemesi için session kontrolü
    const storageKey = `gads_purchase_${orderNumber}`;
    try {
      if (typeof window !== 'undefined' && window.sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      // sessionStorage erişilemezse devam et
    }

    const fireConversion = () => {
      if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
        (window as any).gtag('event', 'conversion', {
          send_to: conversionId,
          value: Number(totalAmount || 0),
          currency: currency,
          transaction_id: String(orderNumber),
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

    // gtag scriptinin yüklenmesini bekleyen güvenli kontrol mekanizması
    let attempts = 0;
    const maxAttempts = 25; // 5 saniye boyunca (25 * 200ms) kontrol et
    const interval = setInterval(() => {
      attempts++;
      if (fireConversion() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [orderNumber, totalAmount, currency, conversionId]);

  return null;
}
