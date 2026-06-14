'use client';

import { useState } from 'react';

export default function ImageLightbox({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 mb-6">
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={alt}
            onClick={() => setActive(src)}
            className="h-56 w-56 object-cover rounded-2xl shrink-0 bg-slate-100 cursor-zoom-in"
          />
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setActive(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active}
            alt={alt}
            className="max-w-full max-h-full object-contain rounded-xl"
          />
        </div>
      )}
    </>
  );
}
