'use client';

import { useRef } from 'react';

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  aspect?: 'square' | 'landscape';
};

async function compressImage(file: File, maxDim = 800, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxDim / img.width, maxDim / img.height, 1);
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ImageUpload({ images, onChange, max = 5, aspect = 'square' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    const toAdd = Math.min(files.length, max - images.length);
    const compressed = await Promise.all(
      Array.from(files).slice(0, toAdd).map((f) => compressImage(f))
    );
    onChange([...images, ...compressed]);
  }

  function remove(i: number) {
    onChange(images.filter((_, j) => j !== i));
  }

  const thumbClass = aspect === 'square' ? 'aspect-square' : 'aspect-video';

  return (
    <div className="flex flex-wrap gap-3">
      {images.map((src, i) => (
        <div key={i} className={`relative ${thumbClass} w-28 rounded-xl overflow-hidden bg-slate-100`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => remove(i)}
            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600"
          >
            ✕
          </button>
        </div>
      ))}

      {images.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`${thumbClass} w-28 rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-400 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-500 transition-colors`}
        >
          <span className="text-2xl">+</span>
          <span className="text-xs">Add photo</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
