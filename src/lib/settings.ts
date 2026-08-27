import prisma from './prisma';
import { SystemSettingsMap, DEFAULT_SETTINGS } from './settings-constants';

export * from './settings-constants';

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