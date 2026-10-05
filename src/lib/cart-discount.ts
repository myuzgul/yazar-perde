export interface CartDiscountItem {
  id?: string;
  productId?: string;
  categoryId?: string;
  categoryIds?: string[];
  totalPrice: number;
}

export interface CartDiscountResult {
  isActive: boolean;
  rate: number;
  title: string;
  isEligible: boolean;
  eligibleSubtotal: number;
  discountAmount: number;
  targetType: 'ALL' | 'CATEGORIES';
  categoryIds: string[];
  minAmount: number;
}

export function parseCategoryIds(raw: any): string[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch {
      return raw.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

export function isItemEligibleForCartDiscount(
  item: { categoryId?: string; categoryIds?: string[] },
  targetType: string,
  allowedCategoryIds: string[]
): boolean {
  if (targetType === 'ALL') return true;
  if (!allowedCategoryIds || allowedCategoryIds.length === 0) return false;

  const itemCategories = new Set<string>();
  if (item.categoryId) itemCategories.add(item.categoryId);
  if (item.categoryIds && Array.isArray(item.categoryIds)) {
    item.categoryIds.forEach((id) => itemCategories.add(id));
  }

  for (const catId of itemCategories) {
    if (allowedCategoryIds.includes(catId)) return true;
  }
  return false;
}

export function calculateCartDiscount(
  items: CartDiscountItem[],
  settings: any
): CartDiscountResult {
  const active = Number(settings?.cart_discount_active ?? 0) === 1;
  const rate = Number(settings?.cart_discount_rate ?? 0);
  const title = settings?.cart_discount_title || `Sepette %${rate} İndirim`;
  const targetType = (settings?.cart_discount_target_type === 'CATEGORIES' ? 'CATEGORIES' : 'ALL') as 'ALL' | 'CATEGORIES';
  const categoryIds = parseCategoryIds(settings?.cart_discount_category_ids);
  const minAmount = Number(settings?.cart_discount_min_amount ?? 0);

  if (!active || rate <= 0 || !items || items.length === 0) {
    return {
      isActive: false,
      rate,
      title,
      isEligible: false,
      eligibleSubtotal: 0,
      discountAmount: 0,
      targetType,
      categoryIds,
      minAmount,
    };
  }

  const subtotal = items.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);
  if (minAmount > 0 && subtotal < minAmount) {
    return {
      isActive: true,
      rate,
      title,
      isEligible: false,
      eligibleSubtotal: 0,
      discountAmount: 0,
      targetType,
      categoryIds,
      minAmount,
    };
  }

  let eligibleSubtotal = 0;
  for (const item of items) {
    const itemTotal = Number(item.totalPrice) || 0;
    if (targetType === 'ALL') {
      eligibleSubtotal += itemTotal;
    } else {
      if (isItemEligibleForCartDiscount(item, targetType, categoryIds)) {
        eligibleSubtotal += itemTotal;
      }
    }
  }

  const discountAmount = Number(((eligibleSubtotal * rate) / 100).toFixed(2));

  return {
    isActive: true,
    rate,
    title,
    isEligible: discountAmount > 0,
    eligibleSubtotal: Number(eligibleSubtotal.toFixed(2)),
    discountAmount,
    targetType,
    categoryIds,
    minAmount,
  };
}
