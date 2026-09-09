'use client';

import React from 'react';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
  label?: string;
}

export default function PrintButton({ label = 'Yazdır (A5 Formatı)' }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className="bg-[#1B84F8] hover:bg-[#156cd1] text-white px-5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}
