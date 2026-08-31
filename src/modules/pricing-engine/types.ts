export type CurtainType =
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
export type MountingType = 'SCREW' | 'HOOK' | 'ADHESIVE'; // Plise montajı (Vidalı / Kancalı / Yapıştırmalı)
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
  plisse_adhesive_extra_sqm_price?: number;
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
  mountingType?: MountingType; // Plise için (SCREW / HOOK / ADHESIVE)
  plisseProfileColor?: 'WHITE' | 'CREAM' | 'GRAY' | 'ANTHRACITE' | 'BROWN' | 'BRONZE'; // Plise Kasa Rengi
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
