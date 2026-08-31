import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateFonPrice(input: CalculationInput, settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;
  const wingType = input.fonWingType || 'LEFT_WING';
  const pleatType = input.tullePleatType || 'PLEAT_1X2_5';
  const allowance = settings.tulle_extra_allowance_cm || 20;

  // En onluk üst sayıya yuvarlanır (Örn: 78 -> 80, 121 -> 130)
  const calcWidth = Math.ceil(input.width / 10) * 10;
  const calcHeight = input.height || 260; // Boy fiyata dahil değil

  let multiplier = 2.5;
  let extraMeterCost = 0;
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
    case 'S_PLEAT':
      multiplier = 4.0;
      extraMeterCost += settings.tulle_s_pile_extra_price;
      pleatLabel = '1x4 S Pile';
      break;
    case 'AMERICAN_PLEAT':
      multiplier = 3.0;
      extraMeterCost += settings.tulle_american_pile_extra_price;
      pleatLabel = 'Amerikan Pile';
      break;
  }

  // 1 kanat için metre hesabı
  const singleWingMeters = ((calcWidth * multiplier) + allowance) / 100;
  const wingMultiplier = wingType === 'DOUBLE_WING' ? 2 : 1;
  const totalFabricMeters = singleWingMeters * wingMultiplier;

  const effectiveMeterPrice = input.basePrice + extraMeterCost;
  const fabricCost = totalFabricMeters * effectiveMeterPrice;

  const breakdown: PriceBreakdownItem[] = [
    {
      label: `Fon Kumaş Tutarı (${pleatLabel} - ${wingType === 'DOUBLE_WING' ? 'Çift Kanat' : 'Tek Kanat'})`,
      amount: Number(fabricCost.toFixed(2)),
      unit: `${totalFabricMeters.toFixed(2)} Metre`,
      description: `(${calcWidth} cm x ${multiplier} + ${allowance}cm) / 100 x ${wingMultiplier} Kanat x ${effectiveMeterPrice} TL`,
    },
  ];

  let extraCost = 0;

  // Renso Seçimi: Tek kanatta 1 adet (100 TL), Çift kanatta 2 adet (200 TL)
  if (input.withRenso) {
    const rensoCount = wingType === 'DOUBLE_WING' ? 2 : 1;
    const rensoCost = rensoCount * settings.renso_piece_price;
    extraCost += rensoCost;
    breakdown.push({
      label: `Renso Kol Bağı (${rensoCount} Adet)`,
      amount: rensoCost,
      unit: `${rensoCount} x ${settings.renso_piece_price} TL`,
    });
  }

  const unitFinalPrice = Number((fabricCost + extraCost).toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: 'FON',
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: calcHeight,
    calculatedArea: Number(totalFabricMeters.toFixed(2)),
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
      fonWingType: wingType,
      fonMountingType: input.fonMountingType || 'CORNICE',
      pleatType,
      pleatLabel,
      withRenso: !!input.withRenso,
      totalFabricMeters: Number(totalFabricMeters.toFixed(2)),
    },
  };
}
