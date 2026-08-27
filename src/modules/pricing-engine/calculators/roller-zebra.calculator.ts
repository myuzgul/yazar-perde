import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

export function calculateRollerZebraPrice(input: CalculationInput, settings: PricingSettings): CalculationResult {
  const quantity = Math.max(1, input.quantity || 1);
  const vatRate = input.vatRate ?? 10;

  // 10'luk üste yuvarlama
  let calcWidth = Math.ceil(input.width / 10) * 10;
  let calcHeight = Math.ceil((input.height || 200) / 10) * 10;

  // Minimum sınırlar: En en az 100cm, Boy en az 200cm
  calcWidth = Math.max(100, calcWidth);
  calcHeight = Math.max(200, calcHeight);

  // Özel Kural: En > 150 cm VE Boy > 200 cm ise -> En otomatik 200 cm'e tamamlanır
  if (input.width > 150 && (input.height || 0) > 200) {
    calcWidth = Math.max(200, calcWidth);
  }

  const sqm = Number(((calcWidth * calcHeight) / 10000).toFixed(2));
  const fabricCost = sqm * input.basePrice;

  const breakdown: PriceBreakdownItem[] = [
    {
      label: 'Kumaş Tutarı',
      amount: Number(fabricCost.toFixed(2)),
      unit: `${sqm} m²`,
      description: `${calcWidth} cm x ${calcHeight} cm / 10.000 x ${input.basePrice} TL`,
    },
  ];

  let extraCost = 0;

  // 1. Kapalı Kasa (+30 TL/m²)
  if (input.caseType === 'CLOSED') {
    const caseCost = Number((sqm * settings.closed_case_sqm_price).toFixed(2));
    extraCost += caseCost;
    breakdown.push({
      label: 'Kapalı Kasa Farkı',
      amount: caseCost,
      unit: `${sqm} m² x ${settings.closed_case_sqm_price} TL`,
    });
  }

  // 2. Metal Zincir (+100 TL sabit)
  if (input.chainType === 'METAL') {
    extraCost += settings.metal_chain_extra_price;
    breakdown.push({
      label: 'Metal Zincir Farkı',
      amount: settings.metal_chain_extra_price,
      unit: 'Sabit',
    });
  }

  // 3. Montaj Aparatı
  if (input.bracketType === 'METAL_CEILING') {
    // 50 cm ve katlarına göre 5 TL
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.metal_ceiling_bracket_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'Metal Tavan Aparatı',
      amount: bracketCost,
      unit: `${steps} Adet (${calcWidth} cm)`,
    });
  } else if (input.bracketType === 'L_BRACKET_WALL') {
    // 50 cm de bir 10 TL
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.l_bracket_wall_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'L Ayak Duvar Aparatı',
      amount: bracketCost,
      unit: `${steps} Adet (${calcWidth} cm)`,
    });
  }

  // 4. Etek Dilimi (+30 TL/m²)
  if (input.skirtCut) {
    const skirtCost = Number((sqm * settings.skirt_cut_sqm_price).toFixed(2));
    extraCost += skirtCost;
    breakdown.push({
      label: 'Etek Dilimi Modeli',
      amount: skirtCost,
      unit: `${sqm} m² x ${settings.skirt_cut_sqm_price} TL`,
    });

    // 5. Boncuk (+40 TL/m² - sadece etek dilimi varsa)
    if (input.withBeads) {
      const beadCost = Number((sqm * settings.bead_sqm_price).toFixed(2));
      extraCost += beadCost;
      breakdown.push({
        label: 'Boncuk Modeli',
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
    curtainType: input.curtainType,
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
      caseType: input.caseType || 'OPEN',
      chainType: input.chainType || 'PLASTIC',
      bracketType: input.bracketType || 'PLASTIC_CORNICE',
      mechanismDirection: input.mechanismDirection || 'RIGHT',
      skirtCut: !!input.skirtCut,
      withBeads: input.skirtCut ? !!input.withBeads : false,
      sqm,
    },
  };
}
