const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

const engineDir = path.join(process.cwd(), 'src', 'modules', 'pricing-engine');
const calculatorsDir = path.join(engineDir, 'calculators');
ensureDir(calculatorsDir);

// 1. types.ts
const typesTs = `export type CurtainType =
  | 'TULLE'
  | 'ROLLER'
  | 'ZEBRA'
  | 'DOUBLE_ROLLER'
  | 'PLISSE'
  | 'FON'
  | 'STRING'
  | 'WOODEN_JALOUSIE'
  | 'RUSTIC';

export type TullePleatType =
  | 'FLAT_NO_PLEAT'           // Pilesiz Düz (+20cm)
  | 'PLEAT_1X2'               // 1x2 Seyrek Pile (*2 + 20cm)
  | 'PLEAT_1X2_5'             // 1x2.5 Normal Pile (*2.5 + 20cm)
  | 'PLEAT_1X3'               // 1x3 Sık Pile (*3 + 20cm)
  | 'KRUVAZE_MECHANISM'       // Kruvaze (Mekanizmalı) (*4 + 20cm + Mekanizma Fiyatı)
  | 'KRUVAZE_ROPE'            // Kruvaze (İple Toplamalı) (*4 + 20cm)
  | 'S_PLEAT'                 // S Pile (*3 + 20cm, Metre Fiyatına +60TL)
  | 'AMERICAN_PLEAT';         // Amerikan Pile (*3 + 20cm, Metre Fiyatına +60TL)

export type MechanismDirection = 'LEFT' | 'RIGHT';
export type CaseType = 'OPEN' | 'CLOSED';
export type ChainType = 'PLASTIC' | 'METAL';
export type BracketType = 'PLASTIC_CORNICE' | 'METAL_CEILING' | 'L_BRACKET_WALL';
export type RollerType = 'NORMAL_ROLLER' | 'BLACKOUT_ROLLER';
export type MountingType = 'SCREW' | 'HOOK'; // Plise montajı (Vidalı PVC+Cam Balkon / Kancalı Cam Balkon)
export type FonWingType = 'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING';
export type FonMountingType = 'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET';

export interface PricingSettings {
  tulle_extra_allowance_cm: number;
  tulle_s_pile_extra_price: number;
  tulle_american_pile_extra_price: number;
  tulle_kruvaze_mechanism_price: number;
  closed_case_sqm_price: number;
  metal_chain_extra_price: number;
  metal_ceiling_bracket_step_price: number;
  l_bracket_wall_step_price: number;
  skirt_cut_sqm_price: number;
  bead_sqm_price: number;
  blackout_sqm_price: number;
  plisse_hook_extra_price: number;
  renso_piece_price: number;
}

export interface CalculationInput {
  curtainType: CurtainType;
  basePrice: number; // Kumaş birim fiyatı (TL/metre veya TL/m²)
  width: number;     // En (cm)
  height?: number;    // Boy (cm)
  quantity?: number;  // Adet (varsayılan 1)

  // Seçenekler
  tullePleatType?: TullePleatType;
  mechanismDirection?: MechanismDirection;
  caseType?: CaseType;
  chainType?: ChainType;
  bracketType?: BracketType;
  skirtCut?: boolean;          // Etek dilimi istiyor mu?
  withBeads?: boolean;         // Boncuk istiyor mu? (etek dilimi varsa)
  rollerType?: RollerType;     // Çiftli sistem için
  mountingType?: MountingType; // Plise için (SCREW / HOOK)
  fonWingType?: FonWingType;   // Fon için (LEFT / RIGHT / DOUBLE)
  fonMountingType?: FonMountingType;
  withRenso?: boolean;         // Fon için Renso istiyor mu?
  vatRate?: number;            // KDV Oranı (%10 veya %20)
}

export interface PriceBreakdownItem {
  label: string;
  amount: number;
  unit?: string;
  description?: string;
}

export interface CalculationResult {
  curtainType: CurtainType;
  inputWidth: number;
  inputHeight: number;
  calculatedWidth: number;    // Yuvarlama sonrası işleme giren En (cm)
  calculatedHeight: number;   // Yuvarlama sonrası işleme giren Boy (cm)
  calculatedArea: number;     // Metre veya m²
  areaUnit: 'METRE' | 'SQM';
  unitBasePrice: number;      // Ham kumaş birim fiyatı
  unitFinalPrice: number;     // 1 adet perde toplam birim fiyatı (ek özellikler dahil, KDV dahil)
  vatRate: number;
  vatAmount: number;
  subtotal: number;           // KDV hariç toplam
  quantity: number;
  grandTotal: number;         // Toplam Fiyat (Adet x unitFinalPrice)
  breakdown: PriceBreakdownItem[];
  selectedOptionsSnapshot: Record<string, unknown>;
}
`;
fs.writeFileSync(path.join(engineDir, 'types.ts'), typesTs);

// 2. calculators/tulle.calculator.ts (Tül Perde)
const tulleCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      label: \`Kumaş Tutarı (\${pleatLabel})\`,
      amount: Number(fabricCost.toFixed(2)),
      unit: \`\${fabricMeters.toFixed(2)} Metre\`,
      description: \`(\${calcWidth} cm x \${multiplier} + \${allowance}cm) / 100 x \${effectiveMeterPrice} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'tulle.calculator.ts'), tulleCalcTs);

// 3. calculators/roller-zebra.calculator.ts (Stor ve Zebra Perde)
const rollerZebraCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      unit: \`\${sqm} m²\`,
      description: \`\${calcWidth} cm x \${calcHeight} cm / 10.000 x \${input.basePrice} TL\`,
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
      unit: \`\${sqm} m² x \${settings.closed_case_sqm_price} TL\`,
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
      unit: \`\${steps} Adet (\${calcWidth} cm)\`,
    });
  } else if (input.bracketType === 'L_BRACKET_WALL') {
    // 50 cm de bir 10 TL
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.l_bracket_wall_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'L Ayak Duvar Aparatı',
      amount: bracketCost,
      unit: \`\${steps} Adet (\${calcWidth} cm)\`,
    });
  }

  // 4. Etek Dilimi (+30 TL/m²)
  if (input.skirtCut) {
    const skirtCost = Number((sqm * settings.skirt_cut_sqm_price).toFixed(2));
    extraCost += skirtCost;
    breakdown.push({
      label: 'Etek Dilimi Modeli',
      amount: skirtCost,
      unit: \`\${sqm} m² x \${settings.skirt_cut_sqm_price} TL\`,
    });

    // 5. Boncuk (+40 TL/m² - sadece etek dilimi varsa)
    if (input.withBeads) {
      const beadCost = Number((sqm * settings.bead_sqm_price).toFixed(2));
      extraCost += beadCost;
      breakdown.push({
        label: 'Boncuk Modeli',
        amount: beadCost,
        unit: \`\${sqm} m² x \${settings.bead_sqm_price} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'roller-zebra.calculator.ts'), rollerZebraCalcTs);

// 4. calculators/double-roller.calculator.ts (Çiftli Sistem Tül + Stor)
const doubleRollerCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      unit: \`\${sqm} m²\`,
      description: \`\${calcWidth} cm x \${calcHeight} cm / 10.000 x \${input.basePrice} TL\`,
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
      unit: \`\${sqm} m² x \${settings.blackout_sqm_price} TL\`,
    });
  }

  // Kapalı Kasa (+30 TL/m²)
  if (input.caseType === 'CLOSED') {
    const caseCost = Number((sqm * settings.closed_case_sqm_price).toFixed(2));
    extraCost += caseCost;
    breakdown.push({
      label: 'Kapalı Kasa Farkı',
      amount: caseCost,
      unit: \`\${sqm} m² x \${settings.closed_case_sqm_price} TL\`,
    });
  }

  // Metal Zincir: Çiftli sistemde 2 adet zincir hesaplanır (2 x 100 TL = 200 TL)
  if (input.chainType === 'METAL') {
    const chainCost = settings.metal_chain_extra_price * 2;
    extraCost += chainCost;
    breakdown.push({
      label: 'Çift Metal Zincir Farkı (Tül + Stor İçin 2 Adet)',
      amount: chainCost,
      unit: \`2 x \${settings.metal_chain_extra_price} TL\`,
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
      unit: \`\${steps} Adet (\${calcWidth} cm)\`,
    });
  } else if (input.bracketType === 'L_BRACKET_WALL') {
    const steps = Math.ceil(calcWidth / 50);
    const bracketCost = steps * settings.l_bracket_wall_step_price;
    extraCost += bracketCost;
    breakdown.push({
      label: 'L Ayak Duvar Aparatı',
      amount: bracketCost,
      unit: \`\${steps} Adet (\${calcWidth} cm)\`,
    });
  }

  // Etek Dilimi & Boncuk (PDF Uyarısı: Sadece tüle etek ve boncuk yapılmaktadır)
  if (input.skirtCut) {
    const skirtCost = Number((sqm * settings.skirt_cut_sqm_price).toFixed(2));
    extraCost += skirtCost;
    breakdown.push({
      label: 'Etek Dilimi Modeli (Sadece Tül İçin)',
      amount: skirtCost,
      unit: \`\${sqm} m² x \${settings.skirt_cut_sqm_price} TL\`,
    });

    if (input.withBeads) {
      const beadCost = Number((sqm * settings.bead_sqm_price).toFixed(2));
      extraCost += beadCost;
      breakdown.push({
        label: 'Boncuk Modeli (Sadece Tül İçin)',
        amount: beadCost,
        unit: \`\${sqm} m² x \${settings.bead_sqm_price} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'double-roller.calculator.ts'), doubleRollerCalcTs);

// 5. calculators/plisse.calculator.ts (Plise Perde)
const plisseCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      unit: \`\${finalSqm.toFixed(2)} m²\`,
      description: \`\${calcWidth} cm x \${calcHeight} cm (Ham: \${rawSqm.toFixed(2)} m²) -> \${finalSqm.toFixed(2)} m² x \${input.basePrice} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'plisse.calculator.ts'), plisseCalcTs);

// 6. calculators/fon.calculator.ts (Fon Perde)
const fonCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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

  // 1 kanat için metre hesabı
  const singleWingMeters = ((calcWidth * multiplier) + allowance) / 100;
  const wingMultiplier = wingType === 'DOUBLE_WING' ? 2 : 1;
  const totalFabricMeters = singleWingMeters * wingMultiplier;

  const effectiveMeterPrice = input.basePrice + extraMeterCost;
  const fabricCost = totalFabricMeters * effectiveMeterPrice;

  const breakdown: PriceBreakdownItem[] = [
    {
      label: \`Fon Kumaş Tutarı (\${pleatLabel} - \${wingType === 'DOUBLE_WING' ? 'Çift Kanat' : 'Tek Kanat'})\`,
      amount: Number(fabricCost.toFixed(2)),
      unit: \`\${totalFabricMeters.toFixed(2)} Metre\`,
      description: \`(\${calcWidth} cm x \${multiplier} + \${allowance}cm) / 100 x \${wingMultiplier} Kanat x \${effectiveMeterPrice} TL\`,
    },
  ];

  let extraCost = 0;

  // Renso Seçimi: Tek kanatta 1 adet (100 TL), Çift kanatta 2 adet (200 TL)
  if (input.withRenso) {
    const rensoCount = wingType === 'DOUBLE_WING' ? 2 : 1;
    const rensoCost = rensoCount * settings.renso_piece_price;
    extraCost += rensoCost;
    breakdown.push({
      label: \`Renso Kol Bağı (\${rensoCount} Adet)\`,
      amount: rensoCost,
      unit: \`\${rensoCount} x \${settings.renso_piece_price} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'fon.calculator.ts'), fonCalcTs);

// 7. calculators/string.calculator.ts & rustic.calculator.ts (İp Perde & Rustik)
const stringRusticCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      unit: \`\${meters.toFixed(2)} Metre\`,
      description: \`\${calcWidth} cm (\${meters.toFixed(2)} m) x \${input.basePrice} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'string.calculator.ts'), stringRusticCalcTs);

// 8. calculators/wooden-jalousie.calculator.ts (Ahşap Jaluzi)
const woodenJalousieCalcTs = `import { CalculationInput, CalculationResult, PricingSettings, PriceBreakdownItem } from '../types';

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
      unit: \`\${finalSqm.toFixed(2)} m²\`,
      description: \`\${calcWidth} cm x \${calcHeight} cm (\${rawSqm.toFixed(2)} m²) -> \${finalSqm.toFixed(2)} m² x \${input.basePrice} TL\`,
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
`;
fs.writeFileSync(path.join(calculatorsDir, 'wooden-jalousie.calculator.ts'), woodenJalousieCalcTs);

// 9. index.ts (Ana Motor Dağıtıcı)
const indexTs = `import { CalculationInput, CalculationResult, PricingSettings } from './types';
import { calculateTullePrice } from './calculators/tulle.calculator';
import { calculateRollerZebraPrice } from './calculators/roller-zebra.calculator';
import { calculateDoubleRollerPrice } from './calculators/double-roller.calculator';
import { calculatePlissePrice } from './calculators/plisse.calculator';
import { calculateFonPrice } from './calculators/fon.calculator';
import { calculateStringRusticPrice } from './calculators/string.calculator';
import { calculateWoodenJalousiePrice } from './calculators/wooden-jalousie.calculator';

export * from './types';

export function calculateCurtainPrice(
  input: CalculationInput,
  settings: PricingSettings
): CalculationResult {
  switch (input.curtainType) {
    case 'TULLE':
      return calculateTullePrice(input, settings);

    case 'ROLLER':
    case 'ZEBRA':
      return calculateRollerZebraPrice(input, settings);

    case 'DOUBLE_ROLLER':
      return calculateDoubleRollerPrice(input, settings);

    case 'PLISSE':
      return calculatePlissePrice(input, settings);

    case 'FON':
      return calculateFonPrice(input, settings);

    case 'STRING':
    case 'RUSTIC':
      return calculateStringRusticPrice(input, settings);

    case 'WOODEN_JALOUSIE':
      return calculateWoodenJalousiePrice(input, settings);

    default:
      throw new Error(\`Bilinmeyen perde türü: \${input.curtainType}\`);
  }
}
`;
fs.writeFileSync(path.join(engineDir, 'index.ts'), indexTs);

console.log('Domain Pricing Engine modules successfully created.');
