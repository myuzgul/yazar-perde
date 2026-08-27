'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/lib/cart-context';
import { calculateCurtainPrice, CalculationResult } from '@/modules/pricing-engine';
import { DEFAULT_SETTINGS } from '@/lib/settings';
import { Star, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ProductGallery from './detail/ProductGallery';
import CurtainOptionsForm from './detail/CurtainOptionsForm';
import PriceSummaryBox from './detail/PriceSummaryBox';
import ProductTabs from './detail/ProductTabs';

interface ProductImage {
  id: string;
  imageUrl: string;
  isCover: boolean;
}

interface ProductData {
  id: string;
  name: string;
  sku: string;
  slug: string;
  curtainType: string;
  basePrice: number;
  discountPrice: number | null;
  vatRate: number;
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  shortDesc: string | null;
  descriptionHtml: string | null;
  category: { id: string; name: string; slug: string };
  brand: { id: string; name: string; logoUrl: string | null } | null;
  tag: { id: string; name: string; badgeColor: string } | null;
  images: ProductImage[];
}

interface ProductDetailClientProps {
  product: ProductData;
  similarProducts: any[];
}

export default function ProductDetailClient({ product, similarProducts }: ProductDetailClientProps) {
  const { addItem } = useCart();

  const [width, setWidth] = useState<number>(product.minWidth > 100 ? product.minWidth : 120);
  const [height, setHeight] = useState<number>(product.minHeight > 100 ? product.minHeight : 220);
  const [quantity, setQuantity] = useState<number>(1);
  const [note, setNote] = useState<string>('');

  const [tullePleatType, setTullePleatType] = useState<any>('PLEAT_1X2_5');
  const [mechanismDirection, setMechanismDirection] = useState<'LEFT' | 'RIGHT'>('RIGHT');
  const [caseType, setCaseType] = useState<'OPEN' | 'CLOSED'>('OPEN');
  const [chainType, setChainType] = useState<'PLASTIC' | 'METAL'>('PLASTIC');
  const [bracketType, setBracketType] = useState<'PLASTIC_CORNICE' | 'METAL_CEILING' | 'L_BRACKET_WALL'>('PLASTIC_CORNICE');
  const [skirtCut, setSkirtCut] = useState<boolean>(false);
  const [withBeads, setWithBeads] = useState<boolean>(false);
  const [rollerType, setRollerType] = useState<'NORMAL_ROLLER' | 'BLACKOUT_ROLLER'>('NORMAL_ROLLER');
  const [mountingType, setMountingType] = useState<'SCREW' | 'HOOK'>('SCREW');
  const [fonWingType, setFonWingType] = useState<'LEFT_WING' | 'RIGHT_WING' | 'DOUBLE_WING'>('DOUBLE_WING');
  const [fonMountingType, setFonMountingType] = useState<'CORNICE' | 'RUSTIC_RING' | 'RUSTIC_ROD_POCKET'>('CORNICE');
  const [withRenso, setWithRenso] = useState<boolean>(false);

  const [calcResult, setCalcResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const effectiveBasePrice = product.discountPrice || product.basePrice;
    try {
      const result = calculateCurtainPrice(
        {
          curtainType: product.curtainType as any,
          basePrice: effectiveBasePrice,
          width: Number(width) || 100,
          height: Number(height) || 200,
          quantity,
          tullePleatType,
          mechanismDirection,
          caseType,
          chainType,
          bracketType,
          skirtCut,
          withBeads,
          rollerType,
          mountingType,
          fonWingType,
          fonMountingType,
          withRenso,
          vatRate: product.vatRate,
        },
        DEFAULT_SETTINGS
      );
      setCalcResult(result);
    } catch (err) {
      console.error('Price calculate error:', err);
    }
  }, [
    product, width, height, quantity, tullePleatType, mechanismDirection,
    caseType, chainType, bracketType, skirtCut, withBeads, rollerType,
    mountingType, fonWingType, fonMountingType, withRenso
  ]);

  const handleAddToCart = () => {
    if (!calcResult) return;
    const coverImage = product.images[0]?.imageUrl || '/static/sample/tulle_sample.jpg';

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      curtainType: product.curtainType,
      imageUrl: coverImage,
      width,
      height,
      quantity,
      unitPrice: calcResult.unitFinalPrice,
      totalPrice: calcResult.grandTotal,
      note,
      calculationResult: calcResult,
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
        <Link href="/" className="hover:text-slate-900 transition">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/kategori/${product.category?.slug}`} className="hover:text-slate-900 transition">
          {product.category?.name}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-900 truncate max-w-xs">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
        {/* SOL: Fotoğraf Galerisi & Lightbox */}
        <div className="lg:col-span-6">
          <ProductGallery productName={product.name} images={product.images} tag={product.tag} />
        </div>

        {/* SAĞ: Ölçü Alanları, Dinamik Form & Anlık Hesaplama */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-semibold text-slate-700">{product.category?.name}</span>
              <span className="font-mono text-slate-400">Kod: {product.sku}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950 leading-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-slate-600">(177 Değerlendirme)</span>
              {product.brand && (
                <span className="ml-auto text-xs font-semibold text-slate-600 border border-slate-200 px-2 py-0.5 rounded-sm">
                  Marka: {product.brand.name}
                </span>
              )}
            </div>
          </div>

          {/* Perde Ölçü ve Ek Özellikler Formu */}
          <CurtainOptionsForm
            curtainType={product.curtainType}
            minWidth={product.minWidth}
            maxWidth={product.maxWidth}
            minHeight={product.minHeight}
            maxHeight={product.maxHeight}
            width={width}
            setWidth={setWidth}
            height={height}
            setHeight={setHeight}
            tullePleatType={tullePleatType}
            setTullePleatType={setTullePleatType}
            mechanismDirection={mechanismDirection}
            setMechanismDirection={setMechanismDirection}
            caseType={caseType}
            setCaseType={setCaseType}
            chainType={chainType}
            setChainType={setChainType}
            bracketType={bracketType}
            setBracketType={setBracketType}
            skirtCut={skirtCut}
            setSkirtCut={setSkirtCut}
            withBeads={withBeads}
            setWithBeads={setWithBeads}
            rollerType={rollerType}
            setRollerType={setRollerType}
            mountingType={mountingType}
            setMountingType={setMountingType}
            fonWingType={fonWingType}
            setFonWingType={setFonWingType}
            fonMountingType={fonMountingType}
            setFonMountingType={setFonMountingType}
            withRenso={withRenso}
            setWithRenso={setWithRenso}
          />

          {/* Dinamik Fiyat ve Sepete Ekle Kutusu */}
          <PriceSummaryBox
            calcResult={calcResult}
            quantity={quantity}
            setQuantity={setQuantity}
            note={note}
            setNote={setNote}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>

      {/* ALT SEKMELER */}
      <ProductTabs
        descriptionHtml={product.descriptionHtml}
        grandTotal={calcResult ? calcResult.grandTotal : product.basePrice}
      />

      {/* BENZER ÜRÜNLER */}
      {similarProducts.length > 0 && (
        <section className="mb-12">
          <h3 className="text-base font-extrabold text-slate-900 mb-4 border-b border-slate-200 pb-2">
            Benzer Perde Modelleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((sp) => (
              <Link
                key={sp.id}
                href={`/urun/${sp.slug}`}
                className="group bg-white border border-slate-200 hover:border-slate-400 p-2.5 rounded-sm transition flex flex-col justify-between"
              >
                <img
                  src={sp.images?.[0]?.imageUrl || '/static/sample/tulle_sample.jpg'}
                  alt={sp.name}
                  className="w-full aspect-4/5 object-cover rounded-sm mb-2"
                />
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#1B84F8] transition">
                  {sp.name}
                </h4>
                <span className="text-xs font-extrabold text-slate-950 mt-1">₺{sp.basePrice.toFixed(2)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}