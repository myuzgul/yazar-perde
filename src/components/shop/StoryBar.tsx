'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ChevronRight } from 'lucide-react';

interface StoryItem {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string | null;
  sortOrder: number;
}

export default function StoryBar() {
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);

  useEffect(() => {
    fetch('/api/shop/stories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.length > 0) {
          setStories(data.data);
        }
      })
      .catch(() => {});
  }, []);

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="py-4 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-1">
          {stories.map((story) => (
            <button
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer focus:outline-none"
            >
              {/* Hikaye Yuvarlak Çerçeve */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full p-[2px] border-2 border-slate-300 group-hover:border-[#1B84F8] transition-colors duration-200">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-100">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              <span className="text-[11px] font-semibold text-slate-700 group-hover:text-slate-950 transition max-w-[72px] truncate text-center">
                {story.title}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hikaye Tam Ekran / Pop-up Modalı */}
      {selectedStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white rounded-lg overflow-hidden shadow-2xl flex flex-col">
            {/* Üst Bar */}
            <div className="p-3.5 flex items-center justify-between bg-slate-900 text-white">
              <span className="text-xs font-bold tracking-wide">{selectedStory.title}</span>
              <button
                onClick={() => setSelectedStory(null)}
                className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Hikaye Görseli */}
            <div className="relative aspect-4/5 bg-slate-100 overflow-hidden flex items-center justify-center">
              <img
                src={selectedStory.imageUrl}
                alt={selectedStory.title}
                className="w-full h-full object-cover"
              />

              {/* Alt Buton & Başlık */}
              {selectedStory.targetUrl && (
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                  <Link
                    href={selectedStory.targetUrl}
                    onClick={() => setSelectedStory(null)}
                    className="w-full bg-[#1B84F8] hover:bg-[#156cd1] text-white py-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                  >
                    <span>Kampanyayı / Ürünü İncele</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}