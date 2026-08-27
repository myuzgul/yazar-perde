import { NextRequest, NextResponse } from 'next/server';
import { calculateCurtainPrice } from '@/modules/pricing-engine';
import { getSystemSettings } from '@/lib/settings';
import { z } from 'zod';

const calculationSchema = z.object({
  curtainType: z.enum([
    'TULLE',
    'ROLLER',
    'ZEBRA',
    'DOUBLE_ROLLER',
    'PLISSE',
    'FON',
    'STRING',
    'WOODEN_JALOUSIE',
    'RUSTIC',
  ]),
  basePrice: z.number().positive('Fiyat 0 dan büyük olmalıdır'),
  width: z.number().positive('En ölçüsü geçerli olmalıdır'),
  height: z.number().optional(),
  quantity: z.number().int().positive().optional().default(1),

  tullePleatType: z.enum([
    'FLAT_NO_PLEAT',
    'PLEAT_1X2',
    'PLEAT_1X2_5',
    'PLEAT_1X3',
    'KRUVAZE_MECHANISM',
    'KRUVAZE_ROPE',
    'S_PLEAT',
    'AMERICAN_PLEAT',
  ]).optional(),
  mechanismDirection: z.enum(['LEFT', 'RIGHT']).optional(),
  caseType: z.enum(['OPEN', 'CLOSED']).optional(),
  chainType: z.enum(['PLASTIC', 'METAL']).optional(),
  bracketType: z.enum(['PLASTIC_CORNICE', 'METAL_CEILING', 'L_BRACKET_WALL']).optional(),
  skirtCut: z.boolean().optional(),
  withBeads: z.boolean().optional(),
  rollerType: z.enum(['NORMAL_ROLLER', 'BLACKOUT_ROLLER']).optional(),
  mountingType: z.enum(['SCREW', 'HOOK']).optional(),
  fonWingType: z.enum(['LEFT_WING', 'RIGHT_WING', 'DOUBLE_WING']).optional(),
  fonMountingType: z.enum(['CORNICE', 'RUSTIC_RING', 'RUSTIC_ROD_POCKET']).optional(),
  withRenso: z.boolean().optional(),
  vatRate: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = calculationSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: 'Geçersiz parametreler', errors: parseResult.error.issues },
        { status: 400 }
      );
    }

    const settings = await getSystemSettings();
    const result = calculateCurtainPrice(parseResult.data, settings);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Price calculation API error:', error);
    return NextResponse.json(
      { success: false, message: 'Hesaplama sırasında hata oluştu' },
      { status: 500 }
    );
  }
}
