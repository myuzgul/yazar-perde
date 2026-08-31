export interface SystemSettingsMap {
  // Tül
  tulle_extra_allowance_cm: number;
  tulle_s_pile_extra_price: number;
  tulle_american_pile_extra_price: number;
  tulle_kruvaze_mechanism_price: number;
  // Stor & Zebra
  closed_case_sqm_price: number;
  metal_chain_extra_price: number;
  metal_ceiling_bracket_step_cm: number;
  metal_ceiling_bracket_step_price: number;
  l_bracket_wall_step_cm: number;
  l_bracket_wall_step_price: number;
  skirt_cut_sqm_price: number;
  bead_sqm_price: number;
  blackout_sqm_price: number;
  // Plise
  plisse_hook_extra_price: number;
  plisse_adhesive_extra_sqm_price: number;
  // Fon
  renso_piece_price: number;
  // Genel & Kargo & Ödeme
  free_shipping_threshold: number;
  shipping_fee: number;
  cash_on_delivery_fee: number;
  default_vat_rate: number;
  site_title: string;
  site_phone: string;
  site_slogan: string;
  site_discount_bar_text: string;
  // PayTR
  paytr_merchant_id?: string;
  paytr_merchant_key?: string;
  paytr_merchant_salt?: string;
}

export const DEFAULT_SETTINGS: SystemSettingsMap = {
  tulle_extra_allowance_cm: 20,
  tulle_s_pile_extra_price: 60,
  tulle_american_pile_extra_price: 60,
  tulle_kruvaze_mechanism_price: 100,

  closed_case_sqm_price: 30,
  metal_chain_extra_price: 100,
  metal_ceiling_bracket_step_cm: 50,
  metal_ceiling_bracket_step_price: 5,
  l_bracket_wall_step_cm: 50,
  l_bracket_wall_step_price: 10,
  skirt_cut_sqm_price: 30,
  bead_sqm_price: 40,
  blackout_sqm_price: 250,

  plisse_hook_extra_price: 50,
  plisse_adhesive_extra_sqm_price: 100,
  renso_piece_price: 100,

  free_shipping_threshold: 1500,
  shipping_fee: 99.90,
  cash_on_delivery_fee: 100,
  default_vat_rate: 10,
  site_title: "Yazar Perde - Özel Ölçülü Perde Sistemleri",
  site_phone: "+90 212 510 22 55",
  site_slogan: "Evinize Özel Ölçü, Kusursuz Dikiş",
  site_discount_bar_text: "%40 İNDİRİM KAMPANYASI",
  paytr_merchant_id: "test_merchant_id",
  paytr_merchant_key: "test_merchant_key",
  paytr_merchant_salt: "test_merchant_salt",
};