'use client';

import React, { useMemo } from 'react';
import { generateBarcodeBars } from '@/lib/barcode';

interface BarcodeProps {
  value: string;
  height?: number;
  barWidth?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

export default function Barcode({
  value,
  height = 34,
  barWidth = 1.3,
  showText = true,
  className = '',
  textClassName = 'text-[9px] font-mono tracking-widest font-bold text-center mt-0.5 text-black',
}: BarcodeProps) {
  const { bars, totalWidth } = useMemo(() => {
    return generateBarcodeBars(value || '', barWidth);
  }, [value, barWidth]);

  if (!bars || bars.length === 0) {
    return null;
  }

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        width={totalWidth}
        height={height}
        viewBox={`0 0 ${totalWidth} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible block"
      >
        {bars.map((bar, index) => (
          <rect
            key={index}
            x={bar.x}
            y={0}
            width={bar.width}
            height={height}
            fill="#000000"
          />
        ))}
      </svg>
      {showText && (
        <span className={textClassName}>
          *{value}*
        </span>
      )}
    </div>
  );
}
