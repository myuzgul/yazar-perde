import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

/**
 * Karartma Fon ve Güneşlik Hesaplaması:
 * - En üst 10'luk sayıya yuvarlanır (Örn: 121 cm -> 130 cm)
 * - Müşterinin girdiği ölçüye sadece 20 cm eklenir: (calcWidth + 20) / 100 = Kumaş Metresi
 * - Hesaplamada boy fiyata dahil değildir (üretim ve kesim için saklanır)
 * - Tutar = Kumaş Metresi * Kumaş Birim Metre Fiyatı
 */
export function calculateBlackoutSunshadePrice(
  input: CalculationInput,
  settings: PricingSettings
): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;
  const allowance = settings.tulle_extra_allowance_cm || 20;

  // En üst 10'luk sayıya yuvarlanır (Örn: 121 cm -> 130 cm)
  const calcWidth = Math.ceil(input.width / 10) * 10;
  const calcHeight = input.height || 260; // Boy fiyata dahil değil, atölye kesim ölçüsü için tutulur

  // Kullanılan Kumaş Metresi = (En + 20 cm ek pay) / 100
  const fabricMeters = (calcWidth + allowance) / 100;
  const fabricCost = fabricMeters * input.basePrice;

  const unitFinalPrice = Number(fabricCost.toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  const breakdown: PriceBreakdownItem[] = [
    {
      label: 'Kumaş Tutarı (Karartma Fon & Güneşlik)',
      amount: Number(fabricCost.toFixed(2)),
      unit: `${fabricMeters.toFixed(2)} Metre`,
      description: `(${calcWidth} cm + ${allowance}cm) / 100 = ${fabricMeters.toFixed(2)} Metre x ${input.basePrice} TL`,
    },
  ];

  return {
    curtainType: input.curtainType,
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: calcHeight,
    calculatedArea: Number(fabricMeters.toFixed(2)),
    areaUnit: 'METRE',
    unitBasePrice: input.basePrice,
    unitFinalPrice,
    vatRate,
    vatAmount,
    subtotal,
    quantity,
    grandTotal,
    breakdown,
    selectedOptionsSnapshot: {
      modelType: 'Karartma Fon ve Güneşlik',
      allowanceCm: allowance,
      fabricMeters: Number(fabricMeters.toFixed(2)),
    },
  };
}
