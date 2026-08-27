import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateTullePrice(input: CalculationInput, settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;
  const pleatType = input.tullePleatType || 'PLEAT_1X2_5';
  const allowance = settings.tulle_extra_allowance_cm || 20;

  // En üst 10'luk sayıya yuvarlanır (Örn: 104 cm -> 110 cm)
  const calcWidth = Math.ceil(input.width / 10) * 10;
  const calcHeight = input.height || 260; // Boy fiyata dahil değil

  let multiplier = 2.5;
  let extraMeterCost = 0;
  let fixedExtraCost = 0;
  let pleatLabel = '1x2.5 Normal Pile';

  switch (pleatType) {
    case 'FLAT_NO_PLEAT':
      multiplier = 1.0;
      pleatLabel = 'Pilesiz Düz';
      break;
    case 'PLEAT_1X2':
      multiplier = 2.0;
      pleatLabel = '1x2 Seyrek Pile';
      break;
    case 'PLEAT_1X2_5':
      multiplier = 2.5;
      pleatLabel = '1x2.5 Normal Pile';
      break;
    case 'PLEAT_1X3':
      multiplier = 3.0;
      pleatLabel = '1x3 Sık Pile';
      break;
    case 'KRUVAZE_MECHANISM':
      multiplier = 4.0;
      fixedExtraCost += settings.tulle_kruvaze_mechanism_price;
      pleatLabel = 'Kruvaze (Mekanizmalı)';
      break;
    case 'KRUVAZE_ROPE':
      multiplier = 4.0;
      pleatLabel = 'Kruvaze (İple Toplamalı)';
      break;
    case 'S_PLEAT':
      multiplier = 3.0;
      extraMeterCost += settings.tulle_s_pile_extra_price;
      pleatLabel = 'S Pile';
      break;
    case 'AMERICAN_PLEAT':
      multiplier = 3.0;
      extraMeterCost += settings.tulle_american_pile_extra_price;
      pleatLabel = 'Amerikan Pile';
      break;
  }

  // Kullanılan Kumaş Metresi = (En * Pile Katsayısı + Ek Pay) / 100
  const fabricMeters = ((calcWidth * multiplier) + allowance) / 100;
  const effectiveMeterPrice = input.basePrice + extraMeterCost;
  const fabricCost = fabricMeters * effectiveMeterPrice;
  const unitFinalPrice = Number((fabricCost + fixedExtraCost).toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  const breakdown: PriceBreakdownItem[] = [
    {
      label: `Kumaş Tutarı (${pleatLabel})`,
      amount: Number(fabricCost.toFixed(2)),
      unit: `${fabricMeters.toFixed(2)} Metre`,
      description: `(${calcWidth} cm x ${multiplier} + ${allowance}cm) / 100 x ${effectiveMeterPrice} TL`,
    },
  ];

  if (fixedExtraCost > 0) {
    breakdown.push({
      label: 'Kruvaze Mekanizma Ücreti',
      amount: fixedExtraCost,
      unit: 'Sabit',
    });
  }

  return {
    curtainType: 'TULLE',
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
      pleatType,
      pleatLabel,
      allowanceCm: allowance,
      fabricMeters: Number(fabricMeters.toFixed(2)),
      effectiveMeterPrice,
    },
  };
}
