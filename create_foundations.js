const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

// 1. src/lib/prisma.ts
ensureDir(path.join(process.cwd(), 'src', 'lib'));
const prismaTs = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'lib', 'prisma.ts'), prismaTs);

// 2. src/lib/auth.ts
const authTs = `import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-perde-jwt-key-change-in-production-2026'
);

export const ADMIN_COOKIE_NAME = 'perde_admin_token';
export const CUSTOMER_COOKIE_NAME = 'perde_customer_token';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  surname: string;
  role: string;
}

export async function createSessionToken(payload: TokenPayload, expiresIn = '7d'): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function getAdminSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  if (!payload || (payload.role !== 'ADMIN' && payload.role !== 'STAFF')) {
    return null;
  }
  return payload;
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'lib', 'auth.ts'), authTs);

// 3. src/lib/settings.ts
const settingsTs = `import prisma from './prisma';

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
  renso_piece_price: 100,

  free_shipping_threshold: 1500,
  shipping_fee: 99.90,
  cash_on_delivery_fee: 100,
  default_vat_rate: 10,
  site_title: "PerdeSiparisi.com - Özel Ölçülü Perde Mağazası",
  site_phone: "+90 212 510 22 55",
  site_slogan: "Evinize Özel Ölçü, Kusursuz Dikiş",
  site_discount_bar_text: "%40 İNDİRİM KAMPANYASI"
};

export async function getSystemSettings(): Promise<SystemSettingsMap> {
  try {
    const settings = await prisma.systemSetting.findMany();
    const result = { ...DEFAULT_SETTINGS };

    for (const item of settings) {
      if (item.key in result) {
        const val = item.value;
        const numVal = Number(val);
        (result as Record<string, unknown>)[item.key] = isNaN(numVal) ? val : numVal;
      }
    }
    return result;
  } catch (err) {
    console.error('Error fetching system settings, using defaults:', err);
    return DEFAULT_SETTINGS;
  }
}
`;
fs.writeFileSync(path.join(process.cwd(), 'src', 'lib', 'settings.ts'), settingsTs);

console.log('Foundation library files created successfully.');
