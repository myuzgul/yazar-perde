'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, Check } from 'lucide-react';

interface CurtainOptionsFormProps {
  curtainType: string;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  width: number;
  setWidth: (v: number) => void;
  height: number;
  setHeight: (v: number) => void;
  tullePleatType: any;
  setTullePleatType: (v: any) => void;
  mechanismDirection: 'LEFT' | 'RIGHT';
  setMechanismDirection: (v: 'LEFT' | 'RIGHT') => void;
  caseType: 'OPEN' | 'CLOSED';
  setCaseType: (v: 'OPEN' | 'CLOSED') => void;
  chainType: 'PLASTIC' | 'METAL';
  setChainType: (v: 'PLASTIC' | 'METAL') => void;
  bracketType: 'PLASTIC_CORNICE' | 'METAL_CEILING' | 'L_BRACKET_WALL';
  setBracketType: (v: 'PLASTIC_CORNICE' | 'METAL_CEILING' | 'L_BRACKET_WALL') => void;
  skirtCut: boolean;
  setSkirtCut: (v: boolean) => void;
  withBeads: boolean;
  setWithBeads: (v: boolean) => void;
  rollerType: 'NORMAL_ROLLER' | 'BLACKOUT_ROLLER';
  setRollerType: (v: 'NORMAL_ROLLER' | 'BLACKOUT_ROLLER') => void;
  mountingType: 'SCREW' | 'HOOK' | 'ADHESIVE';
  setMountingType: (v: 'SCREW' | 'HOOK' | 'ADHESIVE') => void;
  plisseProfileColor?: 'WHITE' | 'CREAM' | 'GRAY' | 'ANTHRACITE' | 'BROWN' | 'BRONZE';
  setPlisseProfileColor?: (v: 'WHITE' | 'CREAM' | 'GRAY' | 'ANTHRACITE' | 'BROWN' | 'BRONZE') => void;
  plisseMeasurementType?: 'PROFILE_INCLUDED' | 'INNER_GLASS';
  setPlisseMeasurementType?: (v: 'PROFILE_INCLUDED' | 'INNER_GLASS') => void;
  fonWingType: 'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING';
  setFonWingType: (v: 'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING') => void;
  fonMountingType: 'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET';
  setFonMountingType: (v: 'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET') => void;
  withRenso: boolean;
  setWithRenso: (v: boolean) => void;
  settings?: any;
}

interface PreviewModalData {
  title: string;
  description: string;
  svgType: string;
  onSelect?: () => void;
  isSelected?: boolean;
}

export default function CurtainOptionsForm(props: CurtainOptionsFormProps) {
  const {
    curtainType, minWidth, maxWidth, minHeight, maxHeight,
    width, setWidth, height, setHeight,
    tullePleatType, setTullePleatType,
    mechanismDirection, setMechanismDirection,
    caseType, setCaseType, chainType, setChainType,
    bracketType, setBracketType, skirtCut, setSkirtCut,
    withBeads, setWithBeads, rollerType, setRollerType,
    mountingType, setMountingType,
    plisseProfileColor, setPlisseProfileColor,
    plisseMeasurementType, setPlisseMeasurementType,
    fonWingType, setFonWingType,
    fonMountingType, setFonMountingType, withRenso, setWithRenso,
    settings,
  } = props;

  // Dinamik Katsayı ve Fiyat Değerleri
  const s_pile_price = settings?.tulle_s_pile_extra_price ?? 60;
  const american_pile_price = settings?.tulle_american_pile_extra_price ?? 60;
  const kruvaze_price = settings?.tulle_kruvaze_mechanism_price ?? 100;
  const closed_case_price = settings?.closed_case_sqm_price ?? 30;
  const metal_chain_price = settings?.metal_chain_extra_price ?? 100;
  const metal_ceiling_price = settings?.metal_ceiling_bracket_step_price ?? 5;
  const metal_ceiling_cm = settings?.metal_ceiling_bracket_step_cm ?? 50;
  const l_bracket_price = settings?.l_bracket_wall_step_price ?? 10;
  const l_bracket_cm = settings?.l_bracket_wall_step_cm ?? 50;
  const skirt_cut_price = settings?.skirt_cut_sqm_price ?? 30;
  const bead_price = settings?.bead_sqm_price ?? 40;
  const blackout_price = settings?.blackout_sqm_price ?? 250;
  const plisse_hook_price = settings?.plisse_hook_extra_price ?? 50;
  const plisse_adhesive_price = settings?.plisse_adhesive_extra_sqm_price ?? 100;
  const renso_price = settings?.renso_piece_price ?? 100;

  // Akıllı Input String State
  const [widthInput, setWidthInput] = useState<string>(String(width || 120));
  const [heightInput, setHeightInput] = useState<string>(String(height || 220));
  const [inputMode, setInputMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');

  // Görsel Büyütme Modalı State
  const [modalData, setModalData] = useState<PreviewModalData | null>(null);

  useEffect(() => {
    setWidthInput(String(width));
  }, [width]);

  useEffect(() => {
    setHeightInput(String(height));
  }, [height]);

  // Ölçü adımı: Plise perde için 0.5 cm, diğerleri için 1 cm
  const isPlisse = curtainType === 'PLISSE';
  const step = isPlisse ? 0.5 : 1;

  // En için seçenek listesi (1'er cm veya 0.5 cm)
  const widthOptions: number[] = [];
  const startW = Math.max(minWidth, isPlisse ? 20 : 40);
  const endW = Math.min(maxWidth, 500);
  for (let w = startW; w <= endW; w = Math.round((w + step) * 10) / 10) {
    widthOptions.push(w);
  }
  if (!widthOptions.includes(width) && width >= minWidth && width <= maxWidth) {
    widthOptions.push(width);
    widthOptions.sort((a, b) => a - b);
  }

  // Boy için seçenek listesi (1'er cm veya 0.5 cm)
  const heightOptions: number[] = [];
  const startH = Math.max(minHeight, isPlisse ? 30 : 50);
  const endH = Math.min(maxHeight, 350);
  for (let h = startH; h <= endH; h = Math.round((h + step) * 10) / 10) {
    heightOptions.push(h);
  }
  if (!heightOptions.includes(height) && height >= minHeight && height <= maxHeight) {
    heightOptions.push(height);
    heightOptions.sort((a, b) => a - b);
  }

  const handleWidthChange = (val: string) => {
    setWidthInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setWidth(num);
    }
  };

  const handleWidthBlur = () => {
    const num = parseFloat(widthInput);
    if (isNaN(num) || num < minWidth) {
      setWidth(minWidth);
      setWidthInput(String(minWidth));
    } else if (num > maxWidth) {
      setWidth(maxWidth);
      setWidthInput(String(maxWidth));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeightInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setHeight(num);
    }
  };

  const handleHeightBlur = () => {
    const num = parseFloat(heightInput);
    if (isNaN(num) || num < minHeight) {
      setHeight(minHeight);
      setHeightInput(String(minHeight));
    } else if (num > maxHeight) {
      setHeight(maxHeight);
      setHeightInput(String(maxHeight));
    }
  };

  // Küçük Resimli Önizleme Kartı Bileşeni
  const OptionThumb = ({
    title,
    desc,
    selected,
    onSelect,
    svgType
  }: {
    title: string;
    desc: string;
    selected: boolean;
    onSelect: () => void;
    svgType: string;
  }) => {
    return (
      <button
        type="button"
        onClick={() => {
          setModalData({
            title,
            description: desc,
            svgType,
            isSelected: selected,
            onSelect: () => {
              onSelect();
              setModalData(null);
            }
          });
        }}
        className={`flex items-center gap-1.5 p-1.5 rounded border transition cursor-pointer text-left ${
          selected
            ? 'border-slate-900 bg-slate-100 ring-1 ring-slate-900'
            : 'border-slate-200 bg-white hover:border-slate-400'
        }`}
        title={`${title} - Görseli İncele`}
      >
        <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden relative">
          <RenderSvgIcon type={svgType} />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center transition">
            <ZoomIn className="w-3 h-3 text-slate-700 opacity-60" />
          </div>
        </div>
        <div className="min-w-0 pr-1">
          <span className="text-[10px] font-bold text-slate-800 block truncate leading-tight">{title}</span>
          <span className="text-[9px] text-slate-400 block truncate leading-none mt-0.5">Büyüt / İncele</span>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. ÖLÇÜ ALANLARI */}
      <div className="border-t border-slate-200 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            1. ÖLÇÜ SEÇİMİ
          </h3>
          <div className="flex items-center text-[11px] gap-2">
            <button
              type="button"
              onClick={() => setInputMode('SELECT')}
              className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                inputMode === 'SELECT'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Açılır Liste
            </button>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => setInputMode('CUSTOM')}
              className={`px-2 py-0.5 rounded transition cursor-pointer font-bold ${
                inputMode === 'CUSTOM'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Manuel Elle Yaz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* EN SEÇİMİ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              En (Genişlik)
            </label>

            {inputMode === 'SELECT' ? (
              <select
                value={width}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setWidth(val);
                  setWidthInput(String(val));
                }}
                className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 px-3 text-xs font-bold text-slate-900 bg-white"
              >
                {widthOptions.map((w) => (
                  <option key={w} value={w}>
                    {w} cm
                  </option>
                ))}
              </select>
            ) : (
              <div className="relative flex items-center">
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder={`${minWidth}-${maxWidth}`}
                  value={widthInput}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  onBlur={handleWidthBlur}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 pl-3 pr-8 text-xs font-bold text-slate-900 bg-white"
                />
                <span className="absolute right-3 text-xs text-slate-400 font-semibold pointer-events-none">cm</span>
              </div>
            )}

            <span className="text-[10px] text-slate-400 block mt-1">
              Min: {minWidth} cm - Max: {maxWidth} cm
            </span>
          </div>

          {/* BOY SEÇİMİ */}
          {curtainType !== 'STRING' && curtainType !== 'RUSTIC' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Boy (Yükseklik)
              </label>

              {inputMode === 'SELECT' ? (
                <select
                  value={height}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setHeight(val);
                    setHeightInput(String(val));
                  }}
                  className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 px-3 text-xs font-bold text-slate-900 bg-white"
                >
                  {heightOptions.map((h) => (
                    <option key={h} value={h}>
                      {h} cm
                    </option>
                  ))}
                </select>
              ) : (
                <div className="relative flex items-center">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder={`${minHeight}-${maxHeight}`}
                    value={heightInput}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    onBlur={handleHeightBlur}
                    className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 pl-3 pr-8 text-xs font-bold text-slate-900 bg-white"
                  />
                  <span className="absolute right-3 text-xs text-slate-400 font-semibold pointer-events-none">cm</span>
                </div>
              )}

              <span className="text-[10px] text-slate-400 block mt-1">
                {curtainType === 'TULLE' || curtainType === 'FON' || curtainType === 'BLACKOUT_FON_SUNSHADE'
                  ? 'Boy standart kumaş boyuna dahildir (atölye kesim ölçüsü için alınır)'
                  : `Min: ${minHeight} cm - Max: ${maxHeight} cm`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DİNAMİK EK ÖZELLİKLER & GÖRSEL KARTLAR */}
      <div className="border-t border-slate-200 pt-5 space-y-5">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          2. DİKİM & MEKANİZMA SEÇENEKLERİ
        </h3>

        {/* Karartma Fon ve Güneşlik Bilgilendirmesi */}
        {curtainType === 'BLACKOUT_FON_SUNSHADE' && (
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-2.5">
            <p className="text-xs text-slate-800 leading-relaxed font-semibold">
              Ürünlerimiz tek parça (1 kanat) olarak üretilmektedir. 2 parça istiyorsanız örneğin toplam ölçünüz 250 cm ise 125 cm girip 2 adet seçmelisiniz.
            </p>
            <div className="text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
              ✓ Korniş ruletleri takılı, ütülü ve montaja hazır şekilde kargolanır.
            </div>
          </div>
        )}

        {/* Tül ve Fon Pile Seçimi */}
        {(curtainType === 'TULLE' || curtainType === 'FON') && (
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Pile Sıklığı & Dikim Modeli
            </label>
            <select
              value={tullePleatType}
              onChange={(e) => setTullePleatType(e.target.value)}
              className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
            >
              <option value="FLAT_NO_PLEAT">Pilesiz Düz Dikim</option>
              <option value="PLEAT_1X2">1x2 Seyrek Pile</option>
              <option value="PLEAT_1X2_5">1x2.5 Normal Pile</option>
              <option value="PLEAT_1X3">1x3 Sık Pile</option>
              {curtainType === 'TULLE' && (
                <>
                  <option value="KRUVAZE_MECHANISM">Kruvaze (Mekanizmalı) (+{kruvaze_price} TL)</option>
                  <option value="KRUVAZE_ROPE">Kruvaze (İple Toplamalı)</option>
                </>
              )}
              <option value="S_PLEAT">1x4 S Pile (+{s_pile_price} TL/m)</option>
              <option value="AMERICAN_PLEAT">Amerikan Pile (+{american_pile_price} TL/m)</option>
            </select>

            {/* Görsel Önizleme Küçük Kartları */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <OptionThumb
                title="1x2 Seyrek Pile"
                desc="Geniş dalgalı, ekonomik tül dikim modelidir. 1 metre için 2 metre kumaş harcanır."
                selected={tullePleatType === 'PLEAT_1X2'}
                onSelect={() => setTullePleatType('PLEAT_1X2')}
                svgType="pleat-loose"
              />
              <OptionThumb
                title="1x2.5 Normal Pile"
                desc="En çok tercih edilen standart dökümlü salon tülü dikimidir. 1 metre için 2.5 metre kumaş kullanılır."
                selected={tullePleatType === 'PLEAT_1X2_5'}
                onSelect={() => setTullePleatType('PLEAT_1X2_5')}
                svgType="pleat-medium"
              />
              <OptionThumb
                title="1x3 Sık Pile"
                desc="Yoğun ve kusursuz dökümlü lüks dikimdir. 1 metre için 3 metre kumaş kullanılır."
                selected={tullePleatType === 'PLEAT_1X3'}
                onSelect={() => setTullePleatType('PLEAT_1X3')}
                svgType="pleat-tight"
              />
              <OptionThumb
                title="1x4 S Pile"
                desc="1 metre için 4 metre kumaş harcanır. Modern ray sistemlerine uyumlu, şık dalgalı boru pile görünümü sağlar."
                selected={tullePleatType === 'S_PLEAT'}
                onSelect={() => setTullePleatType('S_PLEAT')}
                svgType="pleat-s"
              />
            </div>
          </div>
        )}

        {/* Fon Perdeye Özel Kanat & Renso */}
        {curtainType === 'FON' && (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kanat Tipi</label>
                <select
                  value={fonWingType}
                  onChange={(e) => setFonWingType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="DOUBLE_WING">Çift Kanat (Fiyat x 2)</option>
                  <option value="LEFT_WING">Tek Sol Kanat</option>
                  <option value="RIGHT_WING">Tek Sağ Kanat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montaj Şekli</label>
                <select
                  value={fonMountingType}
                  onChange={(e) => setFonMountingType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="CORNICE">Kornişe Takılacak</option>
                  <option value="RUSTIC_RING">Rustik Halkalı</option>
                  <option value="RUSTIC_ROD_POCKET">Rustik Boruya Geçmeli</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <OptionThumb
                title="Korniş Dikimi"
                desc="Standart tavana monteli plastik veya alüminyum korniş raylarına doğrudan takılır."
                selected={fonMountingType === 'CORNICE'}
                onSelect={() => setFonMountingType('CORNICE')}
                svgType="fon-cornice"
              />
              <OptionThumb
                title="Rustik Halkalı"
                desc="Ahşap veya metal rustik boruları üzerinde kayan halkalarla şık görünüm sunar."
                selected={fonMountingType === 'RUSTIC_RING'}
                onSelect={() => setFonMountingType('RUSTIC_RING')}
                svgType="fon-rustic-ring"
              />
              <OptionThumb
                title="Rustik Borulu"
                desc="Rustik borusunun kumaşın içindeki tünelden geçtiği modern büzgülü modeldir."
                selected={fonMountingType === 'RUSTIC_ROD_POCKET'}
                onSelect={() => setFonMountingType('RUSTIC_ROD_POCKET')}
                svgType="fon-rustic-pocket"
              />
            </div>

            <div className="border border-slate-200 p-2.5 rounded-sm bg-slate-50 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withRenso}
                  onChange={(e) => setWithRenso(e.target.checked)}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]"
                />
                <span>Renso (Fon Kol Bağı Demiri) İstiyorum (+{fonWingType === 'DOUBLE_WING' ? `${renso_price * 2} TL / 2 Adet` : `${renso_price} TL / 1 Adet`})</span>
              </label>
              <button
                type="button"
                onClick={() => setModalData({
                  title: 'Renso (Fon Perde Kol Bağı Demiri)',
                  description: 'Duvara monte edilen, fon perdelerinizi gündüz şık ve düzenli bir şekilde toplamanızı sağlayan dekoratif metal tutucudur.',
                  svgType: 'renso',
                  isSelected: withRenso,
                  onSelect: () => {
                    setWithRenso(!withRenso);
                    setModalData(null);
                  }
                })}
                className="text-[10px] text-[#1B84F8] font-bold underline cursor-pointer"
              >
                Görseli Gör
              </button>
            </div>
          </div>
        )}

        {/* Stor, Zebra ve Çiftli Sistem */}
        {(curtainType === 'ROLLER' || curtainType === 'ZEBRA' || curtainType === 'DOUBLE_ROLLER') && (
          <div className="space-y-4">
            {curtainType === 'DOUBLE_ROLLER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stor Kumaş Seçimi</label>
                <select
                  value={rollerType}
                  onChange={(e) => setRollerType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="NORMAL_ROLLER">Normal Stor Perde (Tül Rengine Uygun)</option>
                  <option value="BLACKOUT_ROLLER">Blackout Karartma Stor (+{blackout_price} TL/m²)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mekanizma Yönü</label>
                <select
                  value={mechanismDirection}
                  onChange={(e) => setMechanismDirection(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="RIGHT">Sağ Yön</option>
                  <option value="LEFT">Sol Yön</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kasa Modeli</label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="OPEN">Açık Kasa (Standart)</option>
                  <option value="CLOSED">Kapalı Alüminyum Kasa (+{closed_case_price} TL/m²)</option>
                </select>
              </div>
            </div>

            {/* KASA ÖNİZLEME KARTLARI */}
            <div className="grid grid-cols-2 gap-2">
              <OptionThumb
                title="Açık Kasa"
                desc="Rulo kumaşın açıkta sarıldığı standart ve ekonomik perde mekanizmasıdır."
                selected={caseType === 'OPEN'}
                onSelect={() => setCaseType('OPEN')}
                svgType="case-open"
              />
              <OptionThumb
                title="Kapalı Alüminyum Kasa"
                desc="Kumaşın üst rulosunu tamamen örten, toza karşı koruyan estetik alüminyum kutu sistemidir."
                selected={caseType === 'CLOSED'}
                onSelect={() => setCaseType('CLOSED')}
                svgType="case-closed"
              />
            </div>

            {/* ZİNCİR TİPİ VE ÖNİZLEME */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Zincir Tipi</label>
              <select
                value={chainType}
                onChange={(e) => setChainType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
              >
                <option value="PLASTIC">Plastik Zincir (Standart)</option>
                <option value="METAL">
                  Metal Zincir (+{curtainType === 'DOUBLE_ROLLER' ? `${metal_chain_price * 2} TL / Çift` : `${metal_chain_price} TL`})
                </option>
              </select>

              {/* ZİNCİR TİPİ KÜÇÜK RESİM KARTLARI */}
              <div className="grid grid-cols-2 gap-2">
                <OptionThumb
                  title="Plastik Zincir"
                  desc="Kopmaya dayanıklı beyaz renkli standart perde zinciridir."
                  selected={chainType === 'PLASTIC'}
                  onSelect={() => setChainType('PLASTIC')}
                  svgType="chain-plastic"
                />
                <OptionThumb
                  title="Metal Zincir"
                  desc="1. sınıf parlak nikel kaplama, şık ve ömür boyu dayanıklı metal bilyeli zincirdir."
                  selected={chainType === 'METAL'}
                  onSelect={() => setChainType('METAL')}
                  svgType="chain-metal"
                />
              </div>
            </div>

            {/* MONTAJ APARATI */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">Montaj Aparatı</label>
              <select
                value={bracketType}
                onChange={(e) => setBracketType(e.target.value as any)}
                className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
              >
                <option value="PLASTIC_CORNICE">Plastik Korniş Aparatı (Ücretsiz)</option>
                <option value="METAL_CEILING">Metal Tavan Montaj Aparatı (+{metal_ceiling_price} TL / {metal_ceiling_cm}cm)</option>
                <option value="L_BRACKET_WALL">L Ayak Duvara Montaj Aparatı (+{l_bracket_price} TL / {l_bracket_cm}cm)</option>
              </select>

              <div className="grid grid-cols-3 gap-2">
                <OptionThumb
                  title="Korniş Aparatı"
                  desc="Korniş kanalına kolayca çevrilerek takılan, matkapsız pratik montaj aparatıdır."
                  selected={bracketType === 'PLASTIC_CORNICE'}
                  onSelect={() => setBracketType('PLASTIC_CORNICE')}
                  svgType="bracket-cornice"
                />
                <OptionThumb
                  title="Metal Tavan Klipsi"
                  desc="Beton veya ahşap tavana doğrudan vidalanan sağlam yaylı çelik klipstir."
                  selected={bracketType === 'METAL_CEILING'}
                  onSelect={() => setBracketType('METAL_CEILING')}
                  svgType="bracket-ceiling"
                />
                <OptionThumb
                  title="L Ayak Duvar"
                  desc="Korniş olmayan pencerelerde perdeyi duvara montajlamak için kullanılır."
                  selected={bracketType === 'L_BRACKET_WALL'}
                  onSelect={() => setBracketType('L_BRACKET_WALL')}
                  svgType="bracket-wall"
                />
              </div>
            </div>

            {/* ETEK VE BONCUK KESİMİ */}
            <div className="border border-slate-200 rounded-sm p-3 space-y-2 bg-slate-50">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={skirtCut}
                  onChange={(e) => {
                    setSkirtCut(e.target.checked);
                    if (!e.target.checked) setWithBeads(false);
                  }}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]"
                />
                <span>Dilimli Etek Kesimi İstiyorum (+{skirt_cut_price} TL/m²)</span>
              </label>

              {skirtCut && (
                <div className="space-y-2 pl-5 pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={withBeads}
                      onChange={(e) => setWithBeads(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]"
                    />
                    <span>Perdeye Uygun Kristal Boncuk İstiyorum (+{bead_price} TL/m²)</span>
                  </label>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <OptionThumb
                      title="Dilimli Etek"
                      desc="Stor ve zebra perdenin alt ucuna dalgalı lazer kesim dilim modeli uygulanır."
                      selected={skirtCut && !withBeads}
                      onSelect={() => { setSkirtCut(true); setWithBeads(false); }}
                      svgType="skirt-plain"
                    />
                    <OptionThumb
                      title="Boncuklu Etek"
                      desc="Dilimli eteğin uç kısımlarına şık kristal boncuk saçakları dikilir."
                      selected={skirtCut && withBeads}
                      onSelect={() => { setSkirtCut(true); setWithBeads(true); }}
                      svgType="skirt-beads"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plise Perde */}
        {curtainType === 'PLISSE' && (
          <div className="space-y-4">
            {/* 1. Ölçü Alma Şekli Seçimi */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Ölçüyü Nasıl Aldınız?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPlisseMeasurementType && setPlisseMeasurementType('PROFILE_INCLUDED')}
                  className={`p-3 rounded-sm border text-left transition cursor-pointer flex items-start gap-3 ${
                    (plisseMeasurementType || 'PROFILE_INCLUDED') === 'PROFILE_INCLUDED'
                      ? 'border-[#1B84F8] bg-blue-50/50 ring-1 ring-[#1B84F8]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    (plisseMeasurementType || 'PROFILE_INCLUDED') === 'PROFILE_INCLUDED'
                      ? 'border-[#1B84F8] bg-[#1B84F8]'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {(plisseMeasurementType || 'PROFILE_INCLUDED') === 'PROFILE_INCLUDED' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">Profil Dahil Ölçü Aldım</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Cam kanadının etrafındaki alüminyum/PVC profil dahil dıştan dışa net ölçü girdim.
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPlisseMeasurementType && setPlisseMeasurementType('INNER_GLASS')}
                  className={`p-3 rounded-sm border text-left transition cursor-pointer flex items-start gap-3 ${
                    plisseMeasurementType === 'INNER_GLASS'
                      ? 'border-[#1B84F8] bg-blue-50/50 ring-1 ring-[#1B84F8]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    plisseMeasurementType === 'INNER_GLASS'
                      ? 'border-[#1B84F8] bg-[#1B84F8]'
                      : 'border-slate-300 bg-white'
                  }`}>
                    {plisseMeasurementType === 'INNER_GLASS' && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">İç Cam Ölçüsü Aldım</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Sadece cam fitilleri arasındaki net iç cam alanının ölçüsünü girdim.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 2. Kasa / Profil Rengi Seçimi */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Kasa / Alüminyum Profil Rengi
                </label>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Ücretsiz Renk Seçimi
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {[
                  {
                    id: 'WHITE' as const,
                    name: 'Beyaz',
                    swatch: '#FFFFFF',
                    textColor: '#FFFFFF',
                    border: 'border-slate-300',
                  },
                  {
                    id: 'CREAM' as const,
                    name: 'Krem',
                    swatch: '#FDF5E6',
                    textColor: '#FDE047',
                    border: 'border-amber-300',
                  },
                  {
                    id: 'GRAY' as const,
                    name: 'Gri',
                    swatch: '#9CA3AF',
                    textColor: '#CBD5E1',
                    border: 'border-slate-400',
                  },
                  {
                    id: 'ANTHRACITE' as const,
                    name: 'Antrasit',
                    swatch: '#1F2937',
                    textColor: '#94A3B8',
                    border: 'border-slate-700',
                  },
                  {
                    id: 'BROWN' as const,
                    name: 'Kahve',
                    swatch: '#6B3E11',
                    textColor: '#FDBA74',
                    border: 'border-amber-800',
                  },
                  {
                    id: 'BRONZE' as const,
                    name: 'Bronz',
                    swatch: '#A05A2C',
                    textColor: '#FBBF24',
                    border: 'border-amber-600',
                  },
                ].map((color) => {
                  const isSelected = (plisseProfileColor || 'WHITE') === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setPlisseProfileColor && setPlisseProfileColor(color.id)}
                      className={`relative flex items-center justify-center gap-2 p-2.5 rounded-xl transition-all cursor-pointer bg-slate-900 border ${
                        isSelected
                          ? 'border-[#1B84F8] ring-2 ring-[#1B84F8]/50 shadow-md scale-[1.02]'
                          : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850 opacity-90 hover:opacity-100'
                      }`}
                    >
                      {/* Renk Yuvarlağı */}
                      <span
                        className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border ${color.border}`}
                        style={{ backgroundColor: color.swatch }}
                      />
                      {/* Seçilen Renge Özel Yazı Rengi */}
                      <span
                        className="text-xs font-black tracking-wide"
                        style={{ color: color.textColor }}
                      >
                        {color.name}
                      </span>
                      {isSelected && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#1B84F8] text-white flex items-center justify-center text-[9px] shadow-xs">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Montaj Şekli */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Montaj Şekli
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <OptionThumb
                  title="Vidalı Montaj (Standart)"
                  desc="Cam balkon kanat profiline veya PVC pencere kasasına küçük vidalarla sabitlenir. En sağlam ve uzun ömürlü montaj yöntemidir."
                  selected={mountingType === 'SCREW'}
                  onSelect={() => setMountingType('SCREW')}
                  svgType="plisse-screw"
                />
                <OptionThumb
                  title={`Kancalı Montaj (${plisse_hook_price > 0 ? `+${plisse_hook_price} TL` : 'Ücretsiz'})`}
                  desc="Cam balkon kanatlarının üzerine kancalarla asılır, camı veya profili delmeden pratik şekilde takılır."
                  selected={mountingType === 'HOOK'}
                  onSelect={() => setMountingType('HOOK')}
                  svgType="plisse-hook"
                />
                <OptionThumb
                  title={`Yapıştırmalı Montaj (+${plisse_adhesive_price} TL/m²)`}
                  desc="Özel çift taraflı güçlü yapıştırmalı alüminyum profil sistemi. Cam balkon veya PVC pencerelere vida ve delik açmadan kolayca yapıştırılır."
                  selected={mountingType === 'ADHESIVE'}
                  onSelect={() => setMountingType('ADHESIVE')}
                  svgType="plisse-adhesive"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BÜYÜK GÖRSEL VE AÇIKLAMA MODALI (POPUP - GENİŞLETİLMİŞ) */}
      {modalData && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-2xs flex items-center justify-center p-4"
          onClick={() => setModalData(null)}
        >
          <div 
            className="relative w-full max-w-lg bg-white rounded-sm border border-slate-300 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="py-3 px-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-sm font-bold tracking-wide">{modalData.title}</span>
              <button
                type="button"
                onClick={() => setModalData(null)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
                title="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Büyük Görsel Alanı - Ferah ve Yüksek Çözünürlüklü */}
            <div className="w-full h-72 sm:h-80 bg-slate-50 flex items-center justify-center p-6 border-b border-slate-200">
              <div className="w-full h-full rounded bg-white border border-slate-200/80 shadow-xs flex items-center justify-center p-4 overflow-hidden">
                <RenderSvgIcon type={modalData.svgType} large />
              </div>
            </div>

            {/* Açıklama & Buton */}
            <div className="p-5 space-y-4">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Özellik Bilgisi
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {modalData.description}
                </p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalData(null)}
                  className="flex-1 py-2.5 px-4 border border-slate-300 bg-white hover:bg-slate-100 rounded-sm text-xs font-bold text-slate-700 transition cursor-pointer"
                >
                  Kapat (X)
                </button>
                {modalData.onSelect && (
                  <button
                    type="button"
                    onClick={modalData.onSelect}
                    className="flex-1 py-2.5 px-4 bg-[#1B84F8] hover:bg-[#156cd1] text-white rounded-sm text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Bu Seçeneği Seç</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const OPTION_IMAGE_MAP: Record<string, string> = {
  'chain-metal': '/images/options/zincir-metal.jpg',
  'chain-plastic': '/images/options/zincir-plastik.jpg',
  'case-closed': '/images/options/kasa-kapali.jpg',
  'case-open': '/images/options/kasa-acik.jpg',
  'bracket-cornice': '/images/options/aparat-kornis.jpg',
  'bracket-ceiling': '/images/options/aparat-tavan.jpg',
  'bracket-wall': '/images/options/aparat-layak.jpg',
  'skirt-plain': '/images/options/etek-dilimli.jpg',
  'skirt-beads': '/images/options/etek-boncuklu.jpg',
  'plisse-screw': '/images/options/plise-vidali.jpg',
  'plisse-hook': '/images/options/plise-kancali.jpg',
  'plisse-adhesive': '/images/options/yapistirmali-plise.jpg',
  'renso': '/images/options/renso.jpg',
  'pleat-loose': '/images/options/pile-seyrek.jpg',
  'pleat-medium': '/images/options/pile-normal.jpg',
  'pleat-tight': '/images/options/pile-sik.jpg',
  'pleat-s': '/images/options/pile-s.jpg',
  'fon-cornice': '/images/options/fon-kornis.jpg',
  'fon-rustic-ring': '/images/options/fon-rustik-halka.jpg',
  'fon-rustic-pocket': '/images/options/fon-rustik-boru.jpg',
};

function RenderSvgIcon({ type, large }: { type: string; large?: boolean }) {
  const [imgError, setImgError] = React.useState(false);
  const realImgUrl = OPTION_IMAGE_MAP[type];
  const sz = large ? 'w-48 h-48 sm:w-56 sm:h-56' : 'w-7 h-7';

  // Eğer public/images/options içine fotoğraf konulmuşsa doğrudan o fotoğrafı göster
  if (realImgUrl && !imgError) {
    return (
      <img
        src={realImgUrl}
        alt={type}
        className={large ? 'max-h-68 max-w-full object-contain rounded' : 'w-7 h-7 object-cover rounded-xs'}
        onError={() => setImgError(true)}
      />
    );
  }
  
  if (type === 'chain-metal') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="6" r="2.5" fill="#94a3b8" />
        <circle cx="12" cy="6" r="2.5" fill="#94a3b8" />
        <circle cx="18" cy="6" r="2.5" fill="#94a3b8" />
        <circle cx="18" cy="18" r="2.5" fill="#94a3b8" />
        <circle cx="12" cy="18" r="2.5" fill="#94a3b8" />
        <circle cx="6" cy="18" r="2.5" fill="#94a3b8" />
        <path d="M8.5 6h1M14.5 6h1M18 8.5v7M15.5 18h-1M9.5 18h-1M6 15.5v-7" stroke="#64748b" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'chain-plastic') {
    return (
      <svg className={`${sz} text-slate-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="6" cy="2" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <circle cx="12" cy="2" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <circle cx="18" cy="2" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <circle cx="18" cy="18" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <circle cx="12" cy="18" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <circle cx="6" cy="18" r="2" fill="#e2e8f0" stroke="#94a3b8" />
        <path d="M8 2h2M14 2h2M18 4v12M16 18h-2M10 18H8M6 16V4" stroke="#cbd5e1" strokeWidth="1.5" />
      </svg>
    );
  }

  if (type === 'case-closed') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="7" rx="1.5" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
        <rect x="5" y="11" width="14" height="9" fill="#f8fafc" stroke="#94a3b8" strokeDasharray="2 2" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="#475569" strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'case-open') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="5" cy="7" r="3" fill="#cbd5e1" stroke="#475569" />
        <circle cx="19" cy="7" r="3" fill="#cbd5e1" stroke="#475569" />
        <line x1="5" y1="7" x2="19" y2="7" stroke="#475569" strokeWidth="3" />
        <rect x="5" y="8" width="14" height="12" fill="#f8fafc" stroke="#94a3b8" strokeDasharray="2 2" />
        <line x1="4" y1="20" x2="20" y2="20" stroke="#475569" strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'bracket-cornice') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="4" fill="#cbd5e1" />
        <path d="M8 8v6l4 4 4-4V8" fill="#e2e8f0" stroke="#475569" />
        <circle cx="12" cy="11" r="1.5" fill="#475569" />
      </svg>
    );
  }

  if (type === 'bracket-ceiling') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="4" x2="22" y2="4" stroke="#475569" strokeWidth="2.5" />
        <path d="M6 4v5h12V4" fill="#94a3b8" stroke="#334155" />
        <path d="M9 9v7h6V9" fill="#e2e8f0" stroke="#334155" />
      </svg>
    );
  }

  if (type === 'bracket-wall') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 2v18h16" stroke="#334155" strokeWidth="3" strokeLinecap="round" />
        <path d="M4 10l8 10" stroke="#94a3b8" strokeWidth="1.5" />
        <circle cx="16" cy="20" r="2" fill="#1B84F8" />
      </svg>
    );
  }

  if (type === 'skirt-plain') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="12" fill="#f8fafc" stroke="#94a3b8" />
        <path d="M4 15c2 3 4 3 6 0s4 3 6 0" fill="#e2e8f0" stroke="#334155" strokeWidth="2" />
      </svg>
    );
  }

  if (type === 'skirt-beads') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="4" y="3" width="16" height="11" fill="#f8fafc" stroke="#94a3b8" />
        <path d="M4 14c2 2 4 2 6 0s4 2 6 0" stroke="#334155" strokeWidth="1.5" />
        <circle cx="7" cy="18" r="1.5" fill="#38bdf8" />
        <circle cx="13" cy="18" r="1.5" fill="#38bdf8" />
        <circle cx="19" cy="18" r="1.5" fill="#38bdf8" />
      </svg>
    );
  }

  if (type === 'plisse-screw') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="1" fill="#f8fafc" stroke="#94a3b8" />
        <circle cx="7" cy="7" r="1.5" fill="#334155" />
        <circle cx="17" cy="7" r="1.5" fill="#334155" />
        <circle cx="7" cy="17" r="1.5" fill="#334155" />
        <circle cx="17" cy="17" r="1.5" fill="#334155" />
      </svg>
    );
  }

  if (type === 'plisse-hook') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 3v6a3 3 0 0 0 6 0V6a2 2 0 0 1 4 0v12" stroke="#334155" strokeWidth="2.5" fill="none" />
        <circle cx="15" cy="18" r="2" fill="#1B84F8" />
      </svg>
    );
  }

  if (type === 'renso') {
    return (
      <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h8a4 4 0 0 1 4 4v4" stroke="#334155" strokeWidth="2.5" />
        <circle cx="4" cy="12" r="2" fill="#1B84F8" />
      </svg>
    );
  }

  // Varsayılan Pile
  return (
    <svg className={`${sz} text-slate-700`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4c1 0 1 16 3 16s2-16 3-16 1 16 3 16 2-16 3-16 1 16 3 16 2-16 3-16" stroke="#475569" strokeWidth="2" />
      <line x1="2" y1="4" x2="22" y2="4" stroke="#94a3b8" strokeWidth="2" />
    </svg>
  );
}