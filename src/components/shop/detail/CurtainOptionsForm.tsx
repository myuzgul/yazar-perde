'use client';

import React, { useState, useEffect } from 'react';

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
  mountingType: 'SCREW' | 'HOOK';
  setMountingType: (v: 'SCREW' | 'HOOK') => void;
  fonWingType: 'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING';
  setFonWingType: (v: 'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING') => void;
  fonMountingType: 'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET';
  setFonMountingType: (v: 'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET') => void;
  withRenso: boolean;
  setWithRenso: (v: boolean) => void;
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
    mountingType, setMountingType, fonWingType, setFonWingType,
    fonMountingType, setFonMountingType, withRenso, setWithRenso,
  } = props;

  // Akıllı Input String State (0 yapışmasını önler)
  const [widthInput, setWidthInput] = useState<string>(String(width || 120));
  const [heightInput, setHeightInput] = useState<string>(String(height || 220));
  const [inputMode, setInputMode] = useState<'SELECT' | 'CUSTOM'>('SELECT');

  useEffect(() => {
    setWidthInput(String(width));
  }, [width]);

  useEffect(() => {
    setHeightInput(String(height));
  }, [height]);

  // En için 10cm adımlı seçenek listesi
  const widthOptions: number[] = [];
  const startW = Math.max(minWidth, 40);
  const endW = Math.min(maxWidth, 400);
  for (let w = startW; w <= endW; w += (curtainType === 'PLISSE' ? 5 : 10)) {
    widthOptions.push(w);
  }
  if (!widthOptions.includes(width) && width >= minWidth && width <= maxWidth) {
    widthOptions.push(width);
    widthOptions.sort((a, b) => a - b);
  }

  // Boy için 10cm adımlı seçenek listesi
  const heightOptions: number[] = [];
  const startH = Math.max(minHeight, 100);
  const endH = Math.min(maxHeight, 320);
  for (let h = startH; h <= endH; h += 10) {
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

  return (
    <div className="space-y-6">
      {/* 1. ÖLÇÜ ALANLARI */}
      <div className="border-t border-slate-200 pt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            1. ÖLÇÜ SEÇİMİ
          </h3>
          {/* Seçim Modu Değiştirici */}
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
                {curtainType === 'TULLE' || curtainType === 'FON'
                  ? 'Boy standart kumaş enine dahildir'
                  : `Min: ${minHeight} cm - Max: ${maxHeight} cm`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. DİNAMİK EK ÖZELLİKLER */}
      <div className="border-t border-slate-200 pt-5 space-y-4">
        <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          2. DİKİM & MEKANİZMA SEÇENEKLERİ
        </h3>

        {/* Tül ve Fon Pile Seçimi */}
        {(curtainType === 'TULLE' || curtainType === 'FON') && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pile Sıklığı & Dikim Modeli
            </label>
            <select
              value={tullePleatType}
              onChange={(e) => setTullePleatType(e.target.value)}
              className="w-full border border-slate-300 focus:border-slate-800 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
            >
              <option value="FLAT_NO_PLEAT">Pilesiz Düz Dikim (En + 20cm ek pay)</option>
              <option value="PLEAT_1X2">1x2 Seyrek Pile (En x 2 + 20cm)</option>
              <option value="PLEAT_1X2_5">1x2.5 Normal Pile (En x 2.5 + 20cm) [Tavsiye Edilen]</option>
              <option value="PLEAT_1X3">1x3 Sık Pile (En x 3 + 20cm)</option>
              {curtainType === 'TULLE' && (
                <>
                  <option value="KRUVAZE_MECHANISM">Kruvaze (Mekanizmalı) (+100 TL Mekanizma)</option>
                  <option value="KRUVAZE_ROPE">Kruvaze (İple Toplamalı)</option>
                </>
              )}
              <option value="S_PLEAT">S Pile (Metreye +60 TL Ek Ücret)</option>
              <option value="AMERICAN_PLEAT">Amerikan Pile (Metreye +60 TL Ek Ücret)</option>
            </select>
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

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={withRenso}
                onChange={(e) => setWithRenso(e.target.checked)}
                className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]"
              />
              <span>Renso (Fon Kol Bağı Demiri) İstiyorum (+{fonWingType === 'DOUBLE_WING' ? '200 TL / 2 Adet' : '100 TL / 1 Adet'})</span>
            </label>
          </div>
        )}

        {/* Stor, Zebra ve Çiftli Sistem */}
        {(curtainType === 'ROLLER' || curtainType === 'ZEBRA' || curtainType === 'DOUBLE_ROLLER') && (
          <div className="space-y-3">
            {curtainType === 'DOUBLE_ROLLER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Stor Kumaş Seçimi</label>
                <select
                  value={rollerType}
                  onChange={(e) => setRollerType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="NORMAL_ROLLER">Normal Stor Perde (Tül Rengine Uygun)</option>
                  <option value="BLACKOUT_ROLLER">Blackout Karartma Stor (+250 TL/m²)</option>
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
                  <option value="CLOSED">Kapalı Alüminyum Kasa (+30 TL/m²)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zincir Tipi</label>
                <select
                  value={chainType}
                  onChange={(e) => setChainType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="PLASTIC">Plastik Zincir</option>
                  <option value="METAL">
                    Metal Zincir (+{curtainType === 'DOUBLE_ROLLER' ? '200 TL / Çift' : '100 TL'})
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Montaj Aparatı</label>
                <select
                  value={bracketType}
                  onChange={(e) => setBracketType(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-sm py-2 px-3 text-xs font-semibold text-slate-900 bg-white"
                >
                  <option value="PLASTIC_CORNICE">Plastik Korniş Aparatı (Ücretsiz)</option>
                  <option value="METAL_CEILING">Metal Tavan Montaj Aparatı (50cm adımlı)</option>
                  <option value="L_BRACKET_WALL">L Ayak Duvara Montaj Aparatı (50cm adımlı)</option>
                </select>
              </div>
            </div>

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
                <span>Dilimli Etek Kesimi İstiyorum (+30 TL/m²)</span>
              </label>

              {skirtCut && (
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer pl-5 pt-1">
                  <input
                    type="checkbox"
                    checked={withBeads}
                    onChange={(e) => setWithBeads(e.target.checked)}
                    className="w-3.5 h-3.5 rounded-sm border-slate-300 text-[#1B84F8]"
                  />
                  <span>Perdeye Uygun Kristal Boncuk İstiyorum (+40 TL/m²)</span>
                </label>
              )}
            </div>
          </div>
        )}

        {/* Plise Perde */}
        {curtainType === 'PLISSE' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Montaj Şekli
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMountingType('SCREW')}
                className={`p-3 rounded-sm border text-xs font-semibold text-left transition cursor-pointer ${
                  mountingType === 'SCREW'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="font-bold">Vidalı Montaj</div>
                <div className="text-[10px] opacity-80">(PVC + Cam Balkon)</div>
              </button>

              <button
                type="button"
                onClick={() => setMountingType('HOOK')}
                className={`p-3 rounded-sm border text-xs font-semibold text-left transition cursor-pointer ${
                  mountingType === 'HOOK'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Kancalı Montaj</span>
                  <span className="text-[10px]">+50 TL</span>
                </div>
                <div className="text-[10px] opacity-80">(Cam Balkon Delmeden)</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}