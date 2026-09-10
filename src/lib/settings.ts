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
        const defaultVal = (DEFAULT_SETTINGS as any)[item.key];

        if (typeof defaultVal === 'number') {
          const numVal = Number(val);
          (result as any)[item.key] = isNaN(numVal) ? defaultVal : numVal;
        } else {
          (result as any)[item.key] = val != null ? String(val) : '';
        }
      }
    }
    return result;
  } catch (err) {
    console.error('Error fetching system settings, using defaults:', err);
    return DEFAULT_SETTINGS;
  }
}