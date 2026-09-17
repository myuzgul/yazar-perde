export interface FormattedCurtainOption {
  label: string;
  value: string;
}

const PLISSE_COLOR_MAP: Record<string, string> = {
  WHITE: 'Beyaz Kasa',
  CREAM: 'Krem Kasa',
  GRAY: 'Gri Kasa',
  ANTHRACITE: 'Antrasit Kasa',
  BROWN: 'Kahve Kasa',
  BRONZE: 'Bronz Kasa',
};

const PLISSE_MOUNT_MAP: Record<string, string> = {
  SCREW: 'Vidalı (Standart)',
  HOOK: 'Kancalı Montaj (Cam Balkon)',
  ADHESIVE: 'Yapıştırmalı Montaj',
};

const BRACKET_MAP: Record<string, string> = {
  PLASTIC_CORNICE: 'Plastik Korniş Aparatı',
  METAL_CEILING: 'Metal Tavan Montaj Aparatı',
  L_BRACKET_WALL: 'L Ayak Duvara Montaj Aparatı',
};

const FON_WING_MAP: Record<string, string> = {
  DOUBLE_WING: 'Çift Kanat',
  LEFT_WING: 'Tek Sol Kanat',
  RIGHT_WING: 'Tek Sağ Kanat',
};

const FON_MOUNT_MAP: Record<string, string> = {
  CORNICE: 'Korniş Dikimi',
  RUSTIC_RING: 'Rustik Halkalı',
  RUSTIC_ROD_POCKET: 'Rustik Borulu',
};

/**
 * Parses and returns all configured curtain options as user-friendly label/value pairs.
 */
export function formatCurtainOptions(item: {
  curtainType?: string;
  selectedOptionsSnapshot?: any;
}): FormattedCurtainOption[] {
  let snap: Record<string, any> = {};
  if (typeof item.selectedOptionsSnapshot === 'string') {
    try {
      snap = JSON.parse(item.selectedOptionsSnapshot);
    } catch {
      snap = {};
    }
  } else if (typeof item.selectedOptionsSnapshot === 'object' && item.selectedOptionsSnapshot !== null) {
    snap = item.selectedOptionsSnapshot;
  }

  const options: FormattedCurtainOption[] = [];
  const type = item.curtainType;

  // 1. PLİSE PERDEYE ÖZEL ALANLAR
  if (
    type === 'PLISSE' ||
    snap.plisseMeasurementType ||
    snap.plisseMeasurementLabel ||
    snap.plisseProfileColor ||
    snap.plisseColorLabel
  ) {
    // Ölçü Alma Şekli
    const mType =
      snap.plisseMeasurementLabel ||
      (snap.plisseMeasurementType === 'INNER_GLASS'
        ? 'İç Cam Ölçüsü Aldım'
        : snap.plisseMeasurementType
        ? 'Profil Dahil Ölçü Aldım'
        : null);
    if (mType) {
      options.push({ label: 'Ölçü Şekli', value: mType });
    }

    // Kasa / Profil Rengi
    const cColor =
      snap.plisseColorLabel ||
      (snap.plisseProfileColor ? PLISSE_COLOR_MAP[snap.plisseProfileColor] || snap.plisseProfileColor : null);
    if (cColor) {
      options.push({ label: 'Kasa Rengi', value: cColor });
    }

    // Montaj Şekli
    const mMount =
      snap.mountingLabel ||
      (snap.mountingType ? PLISSE_MOUNT_MAP[snap.mountingType] || snap.mountingType : null);
    if (mMount) {
      options.push({ label: 'Montaj', value: mMount });
    }
  } else if (snap.mountingLabel || snap.mountingType) {
    // Genel Montaj
    const mMount =
      snap.mountingLabel ||
      (snap.mountingType ? PLISSE_MOUNT_MAP[snap.mountingType] || snap.mountingType : null);
    if (mMount) {
      options.push({ label: 'Montaj', value: mMount });
    }
  }

  // 2. TÜL & FON PİLE
  if (snap.pleatLabel) {
    options.push({ label: 'Pile', value: snap.pleatLabel });
  }

  // 3. FON PERDEYE ÖZEL
  if (snap.fonWingType) {
    options.push({ label: 'Kanat', value: FON_WING_MAP[snap.fonWingType] || snap.fonWingType });
  }

  if (snap.fonMountingType) {
    options.push({ label: 'Fon Montajı', value: FON_MOUNT_MAP[snap.fonMountingType] || snap.fonMountingType });
  }

  if (snap.withRenso) {
    const rensoText =
      snap.fonWingType === 'DOUBLE_WING'
        ? 'Renso Kol Bağı İstendi (2 Adet)'
        : 'Renso Kol Bağı İstendi (1 Adet)';
    options.push({ label: 'Renso', value: rensoText });
  }

  // 4. STOR / ZEBRA / ÇİFTLİ SİSTEM
  if (type !== 'PLISSE' && snap.caseType) {
    options.push({
      label: 'Kasa',
      value: snap.caseType === 'CLOSED' ? 'Kapalı Alüminyum Kasa' : 'Açık Kasa',
    });
  }

  if (snap.rollerType) {
    options.push({
      label: 'Stor Tipi',
      value: snap.rollerType === 'BLACKOUT_ROLLER' ? 'Blackout Karartma Stor' : 'Normal Stor',
    });
  }

  if (snap.chainType) {
    const chainLabel = snap.chainType === 'METAL' ? 'Metal Zincir' : 'Plastik Zincir';
    const dirLabel = snap.mechanismDirection
      ? snap.mechanismDirection === 'RIGHT'
        ? ' (Sağ Yön)'
        : ' (Sol Yön)'
      : '';
    options.push({ label: 'Zincir', value: `${chainLabel}${dirLabel}` });
  } else if (snap.mechanismDirection && type !== 'PLISSE') {
    options.push({
      label: 'Mekanizma Yönü',
      value: snap.mechanismDirection === 'RIGHT' ? 'Sağ Yön' : 'Sol Yön',
    });
  }

  if (snap.bracketType) {
    options.push({
      label: 'Montaj Aparatı',
      value: BRACKET_MAP[snap.bracketType] || snap.bracketType,
    });
  }

  if (snap.skirtCut) {
    options.push({
      label: 'Etek Kesimi',
      value: snap.withBeads ? 'Dilimli Etek + Kristal Boncuk' : 'Dilimli Etek',
    });
  }

  if (snap.skirtNote) {
    options.push({ label: 'Etek Notu', value: snap.skirtNote });
  }

  // 5. KUMAŞ METRESİ BİLGİSİ
  if (snap.fabricMeters && (type === 'TULLE' || type === 'BLACKOUT_FON_SUNSHADE')) {
    options.push({ label: 'Harcanan Kumaş', value: `${snap.fabricMeters} Metre` });
  } else if (snap.totalFabricMeters && type === 'FON') {
    options.push({ label: 'Harcanan Kumaş', value: `${snap.totalFabricMeters} Metre` });
  }

  return options;
}
