import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateStringRusticPrice(input: CalculationInput, _settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;

  // Onluk sayılara yuvarlanır (Örn: 121 -> 130), 1 metreye kadar (100 cm) 1 metre alınır
  let calcWidth = Math.ceil(input.width / 10) * 10;
  calcWidth = Math.max(100, calcWidth);

  const meters = calcWidth / 100;
  const totalPrice = meters * input.basePrice;

  const label = input.curtainType === 'RUSTIC' ? 'Rustik Ray / Boru Tutarı' : 'İp Perde Tutarı';

  const breakdown: PriceBreakdownItem[] = [
    {
      label,
      amount: Number(totalPrice.toFixed(2)),
      unit: `${meters.toFixed(2)} Metre`,
      description: `${calcWidth} cm (${meters.toFixed(2)} m) x ${input.basePrice} TL`,
    },
  ];

  const unitFinalPrice = Number(totalPrice.toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: input.curtainType,
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: input.height || 0,
    calculatedArea: meters,
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
      meters,
      calcWidth,
    },
  };
}
