import { CalculationInput, CalculationResult, PricingSettings } from './types';
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
      throw new Error(`Bilinmeyen perde türü: ${input.curtainType}`);
  }
}
