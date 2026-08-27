import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateWoodenJalousiePrice(input: CalculationInput, _settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;

  // En ve boy onluk üste yuvarlanır (Örn: 71x111 -> 80x120)
  const calcWidth = Math.ceil(input.width / 10) * 10;
  const calcHeight = Math.ceil((input.height || 100) / 10) * 10;

  const rawSqm = (calcWidth * calcHeight) / 10000;
  // En ve boy çarpımı 1 m² altında kalırsa 1 m² sayılır
  const finalSqm = Math.max(1.0, rawSqm);

  const fabricCost = finalSqm * input.basePrice;

  const breakdown: PriceBreakdownItem[] = [
    {
      label: 'Ahşap Jaluzi Mekanizma & Kumaş Tutarı',
      amount: Number(fabricCost.toFixed(2)),
      unit: `${finalSqm.toFixed(2)} m²`,
      description: `${calcWidth} cm x ${calcHeight} cm (${rawSqm.toFixed(2)} m²) -> ${finalSqm.toFixed(2)} m² x ${input.basePrice} TL`,
    },
  ];

  const unitFinalPrice = Number(fabricCost.toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: 'WOODEN_JALOUSIE',
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: calcHeight,
    calculatedArea: Number(finalSqm.toFixed(2)),
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
      mechanismDirection: input.mechanismDirection || 'RIGHT',
      rawSqm: Number(rawSqm.toFixed(2)),
      finalSqm: Number(finalSqm.toFixed(2)),
    },
  };
}
