import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculatePlissePrice(input: CalculationInput, settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;

  // En ve boy onluk üst sayıya tamamlanır (Örn: 85 -> 90)
  const calcWidth = Math.ceil(input.width / 10) * 10;
  const calcHeight = Math.ceil((input.height || 100) / 10) * 10;

  const rawSqm = (calcWidth * calcHeight) / 10000;
  let finalSqm = 1.0;

  if (rawSqm < 1.0) {
    // 1 m² altındaysa 1 m² alınır
    finalSqm = 1.0;
  } else {
    // 1 m² üzerindeyse 0.10 m² lik üst ondalığa yuvarlanır (Örn: 1.27 m² -> 1.30 m²)
    finalSqm = Math.ceil(rawSqm * 10) / 10;
  }

  const fabricCost = finalSqm * input.basePrice;
  const breakdown: PriceBreakdownItem[] = [
    {
      label: 'Plise Kumaş Tutarı',
      amount: Number(fabricCost.toFixed(2)),
      unit: `${finalSqm.toFixed(2)} m²`,
      description: `${calcWidth} cm x ${calcHeight} cm (Ham: ${rawSqm.toFixed(2)} m²) -> ${finalSqm.toFixed(2)} m² x ${input.basePrice} TL`,
    },
  ];

  let extraCost = 0;
  // Montaj seçeneği: Vidalı (PVC + Cam Balkon) (0 TL) / Kancalı (Cam Balkon) (+50 TL)
  if (input.mountingType === 'HOOK') {
    extraCost += settings.plisse_hook_extra_price;
    breakdown.push({
      label: 'Kancalı Montaj Aparatı (Cam Balkon)',
      amount: settings.plisse_hook_extra_price,
      unit: 'Sabit',
    });
  }

  const unitFinalPrice = Number((fabricCost + extraCost).toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: 'PLISSE',
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: calcHeight,
    calculatedArea: finalSqm,
    areaUnit: 'SQM',
    unitBasePrice: input.basePrice,
    unitFinalPrice,
    vatRate,
    vatAmount,
    subtotal,
    quantity,
    grandTotal,
    breakdown,
    selectedOptionsSnapshot: {
      mountingType: input.mountingType || 'SCREW',
      mountingLabel: input.mountingType === 'HOOK' ? 'Kancalı (Cam Balkon)' : 'Vidalı (PVC + Cam Balkon)',
      rawSqm: Number(rawSqm.toFixed(2)),
      finalSqm,
    },
  };
}
