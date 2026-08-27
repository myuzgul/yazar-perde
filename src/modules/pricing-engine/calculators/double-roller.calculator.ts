import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateDoubleRollerPrice(input: CalculationInput, settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;

  let calcWidth = Math.ceil(input.width / 10) * 10;
  let calcHeight = Math.ceil((input.height || 200) / 10) * 10;

  calcWidth = Math.max(100, calcWidth);
  calcHeight = Math.max(200, calcHeight);

  if (input.width > 150 && (input.height || 0) > 200) {
    calcWidth = Math.max(200, calcWidth);
  }

  const sqm = Number(((calcWidth * calcHeight) / 10000).toFixed(2));
  const fabricCost = sqm * input.basePrice;

  const breakdown: PriceBreakdownItem[] = [
    {
      label: 'Çiftli Sistem Kumaş & Kasa Tutarı',
      amount: Number(fabricCost.toFixed(2)),
      unit: `${sqm} m²`,
      description: `${calcWidth} cm x ${calcHeight} cm / 10.000 x ${input.basePrice} TL`,
    },
  ];

  let extraCost = 0;

  // Stor Türü: Blackout Stor (+250 TL/m²)
  if (input.rollerType === 'BLACKOUT_ROLLER') {
    const blackoutCost = Number((sqm * settings.blackout_sqm_price).toFixed(2));
    extraCost += blackoutCost;
    breakdown.push({
      label: 'Blackout Karartma Kumaş Farkı',
      amount: blackoutCost,
      unit: `${sqm} m² x ${settings.blackout_sqm_price} TL`,
    });
  }

  // Kapalı Kasa (+30 TL/m²)
  if (input.caseType === 'CLOSED') {
    const caseCost = Number((sqm * settings.closed_case_sqm_price).toFixed(2));
    extraCost += caseCost;
    breakdown.push({
      label: 'Kapalı Kasa Farkı',
      amount: caseCost,
      unit: `${sqm} m² x ${settings.closed_case_sqm_price} TL`,
    });
  }

  // Metal Zincir: Çiftli sistemde 2 adet zincir hesaplanır (2 x 100 TL = 200 TL)
  if (input.chainType === 'METAL') {
    const chainCost = settings.metal_chain_extra_price * 2;
    extraCost += chainCost;
    breakdown.push({
      label: 'Çift Metal Zincir Farkı (Tül + Stor İçin 2 Adet)',
      amount: chainCost,
      unit: `2 x ${settings.metal_chain_extra_price} TL`,
    });
  }

  // Montaj Aparatı
  if (input.bracketType === 'METAL_CEILING') {
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.metal_ceiling_bracket_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'Metal Tavan Aparatı',
      amount: bracketCost,
      unit: `${steps} Adet (${calcWidth} cm)`,
    });
  } else if (input.bracketType === 'L_BRACKET_WALL') {
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.l_bracket_wall_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'L Ayak Duvar Aparatı',
      amount: bracketCost,
      unit: `${steps} Adet (${calcWidth} cm)`,
    });
  }

  // Etek Dilimi & Boncuk (PDF Uyarısı: Sadece tüle etek ve boncuk yapılmaktadır)
  if (input.skirtCut) {
    const skirtCost = Number((sqm * settings.skirt_cut_sqm_price).toFixed(2));
    extraCost += skirtCost;
    breakdown.push({
      label: 'Etek Dilimi Modeli (Sadece Tül İçin)',
      amount: skirtCost,
      unit: `${sqm} m² x ${settings.skirt_cut_sqm_price} TL`,
    });

    if (input.withBeads) {
      const beadCost = Number((sqm * settings.bead_sqm_price).toFixed(2));
      extraCost += beadCost;
      breakdown.push({
        label: 'Boncuk Modeli (Sadece Tül İçin)',
        amount: beadCost,
        unit: `${sqm} m² x ${settings.bead_sqm_price} TL`,
      });
    }
  }

  const unitFinalPrice = Number((fabricCost + extraCost).toFixed(2));
  const grandTotal = Number((unitFinalPrice * quantity).toFixed(2));
  const vatAmount = Number(((grandTotal * vatRate) / (100 + vatRate)).toFixed(2));
  const subtotal = Number((grandTotal - vatAmount).toFixed(2));

  return {
    curtainType: 'DOUBLE_ROLLER',
    inputWidth: input.width,
    inputHeight: input.height || 0,
    calculatedWidth: calcWidth,
    calculatedHeight: calcHeight,
    calculatedArea: sqm,
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
      rollerType: input.rollerType || 'NORMAL_ROLLER',
      caseType: input.caseType || 'OPEN',
      chainType: input.chainType || 'PLASTIC',
      bracketType: input.bracketType || 'PLASTIC_CORNICE',
      mechanismDirection: input.mechanismDirection || 'RIGHT',
      skirtCut: !!input.skirtCut,
      withBeads: input.skirtCut ? !!input.withBeads : false,
      skirtNote: 'Sadece tüle etek ve boncuk yapılmaktadır',
      sqm,
    },
  };
}
