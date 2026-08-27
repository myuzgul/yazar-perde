'use client';

import React, { useState } from 'react';
import { Video, Star } from 'lucide-react';

interface ProductTabsProps {
  descriptionHtml: string | null;
  mountingVideoUrl?: string | null;
  mountingGuideHtml?: string | null;
  grandTotal: number;
}

function getYouTubeEmbedUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.includes('embed/')) return trimmed;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return match && match[2].length === 11 ? `https://www.youtube-nocookie.com/embed/${match[2]}` : null;
}

export default function ProductTabs({ descriptionHtml, mountingVideoUrl, mountingGuideHtml, grandTotal }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<'DESC' | 'VIDEO' | 'REVIEWS' | 'INSTALLMENT' | 'SHIPPING'>('DESC');

  const youtubeEmbed = getYouTubeEmbedUrl(mountingVideoUrl);

  return (
    <div className="border border-slate-200 rounded-sm p-6 mb-16 bg-white">
      {/* Yatay Sekme Başlıkları */}
      <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-3 mb-6">
        {[
          { id: 'DESC', label: 'Ürün Bilgileri & Özellikler' },
          { id: 'VIDEO', label: 'Montaj & Kurulum Videosu' },
          { id: 'REVIEWS', label: 'Müşteri Yorumları (177)' },
          { id: 'INSTALLMENT', label: 'Taksit Tablosu' },
          { id: 'SHIPPING', label: 'Teslimat & İade' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`text-xs font-bold transition pb-1 border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'DESC' && (
        <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed text-xs sm:text-sm">
          {descriptionHtml ? (
            <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          ) : (
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">1. Sınıf Kumaş & Dayanıklı Mekanizma</h3>
              <p>Tüm perdelerimiz ISO standartlarında kumaş ve alüminyum mekanizmalar kullanılarak atölyemizde üretilmektedir.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'VIDEO' && (
        <div className="space-y-6">
          {/* YouTube Video Oynatıcı */}
          <div className="max-w-3xl mx-auto">
            {youtubeEmbed ? (
              <div className="aspect-video w-full rounded-sm overflow-hidden border border-slate-300 shadow-sm bg-black">
                <iframe
                  src={youtubeEmbed}
                  title="Perde Montaj ve Kurulum Videosu"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>
            ) : (
              <div className="aspect-video w-full rounded-sm overflow-hidden border border-slate-300 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center space-y-3">
                <Video className="w-12 h-12 text-[#1B84F8]" />
                <div>
                  <h4 className="text-sm font-bold">Kolay ve Hızlı Perde Montajı</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-md">
                    Özel ölçülü perdeleriniz pratik montaj aparatları ile birlikte gönderilir. Matkap veya vida kullanmadan kornişe 5 dakikada takabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Zengin Montaj ve Kurulum Rehberi */}
          <div className="border-t border-slate-200 pt-6 max-w-3xl mx-auto">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span>🛠️ Adım Adım Kurulum ve Montaj Talimatları</span>
            </h3>

            {mountingGuideHtml ? (
              <div 
                className="prose prose-sm max-w-none text-slate-700 text-xs sm:text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: mountingGuideHtml }}
              />
            ) : (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">1. Korniş Montajı (Pratik Çevir-Tak)</h4>
                  <p className="text-slate-600">Paketinizden çıkan plastik montaj aparatlarını her 40-50 cm aralıkla korniş kanalına takıp saat yönünde çevirerek kilitleyin.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">2. Perde Profilini Oturtma</h4>
                  <p className="text-slate-600">Perdenizin üst alüminyum kasasını aparatların ön tırnağına oturtup hafifçe yukarı doğru bastırarak &quot;çıt&quot; sesini duyana kadar itin.</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded border border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-1">3. Mekanizma Testi</h4>
                  <p className="text-slate-600">Yan zinciri yavaşça çekerek perdenin aşağı ve yukarı akıcı hareket ettiğini kontrol edin.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'REVIEWS' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-800">4.9 / 5.0 (177 Doğrulanmış Sipariş)</span>
          </div>

          <div className="divide-y divide-slate-100 space-y-3 text-xs">
            <div className="pt-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Ahmet Y.</span>
                <span className="text-[10px] text-slate-400 font-normal">12 Ağustos 2026</span>
              </div>
              <p className="text-slate-600 mt-0.5">Ölçüleri tam verdiğim gibi geldi, dikim kalitesi ve pile aralıkları harika.</p>
            </div>

            <div className="pt-2">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Elif K.</span>
                <span className="text-[10px] text-slate-400 font-normal">8 Ağustos 2026</span>
              </div>
              <p className="text-slate-600 mt-0.5">Cam balkon için plise perde aldım, kancalı montaj sayesinde delmeden 10 dakikada taktım.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'INSTALLMENT' && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2 px-3">Banka / Kart</th>
                <th className="py-2 px-3">Taksit</th>
                <th className="py-2 px-3 text-right">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {['Bonus (Garanti)', 'World (Yapı Kredi)', 'Maximum (İş Bankası)', 'Axess (Akbank)'].map((bank) => (
                <tr key={bank}>
                  <td className="py-2 px-3 font-semibold text-slate-900">{bank}</td>
                  <td className="py-2 px-3">3 / 6 / 12 Taksit</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    ₺{grandTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'SHIPPING' && (
        <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
          <p><strong>Kargo Süresi:</strong> Özel dikim perdeleriniz ortalama 3-5 iş günü içerisinde üretilip sigortalı kargo ile sevk edilir.</p>
          <p><strong>Garanti:</strong> 24 ay mekanizma garantisi kapsamındadır.</p>
        </div>
      )}
    </div>
  );
}