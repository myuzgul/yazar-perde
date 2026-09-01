import { CalculationInput, CalculationResult, PricingSettings } from '../types';

/**
 * Hesaplamasız (Sabit / Hazır Ölçü) Fiyatlandırma:
 * - Kumaş/ürün için herhangi bir ek en/boy/pile/mekanizma hesaplaması yapılmaz
 * - Ürünün girilen taban birim fiyatı (veya indirimli fiyatı) doğrudan kullanılır
 * - Toplam = Birim Fiyat x Adet
 */
export function calculateFixedPrice(
  input: CalculationInput,
  settings: PricingSettings
): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;
  const unitPrice = input.basePrice;

  const grandTotal = Number((unitPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: input.curtainType,
    inputWidth: input.width || 0,
    inputHeight: input.height || 0,
    calculatedWidth: input.width || 0,
    calculatedHeight: input.height || 0,
    calculatedArea: quantity,
    areaUnit: 'SQM',
    unitBasePrice: unitPrice,
    unitFinalPrice: unitPrice,
    vatRate,
    vatAmount,
    subtotal,
    quantity,
    grandTotal,
    breakdown: [
      {
        label: 'Sabit / Hazır Ürün Fiyatı',
        amount: unitPrice,
        unit: `${quantity} Adet`,
        description: 'Herhangi bir ek kesim/dikim payı uygulanmadan doğrudan sabit fiyat',
      },
    ],
    selectedOptionsSnapshot: {
      modelType: 'Hesaplamasız (Sabit Fiyat)',
    },
  };
}
