"use client";
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const FALLBACK = 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80';

export default function ApartmentGallery({ images, name }: { images: string[]; name: string }) {
  if (!images.length) return (
    <section className="max-w-7xl mx-auto px-6 pb-6">
      <div className="rounded-3xl overflow-hidden h-[420px] bg-stone-200 flex items-center justify-center text-stone-400">
        No photos yet
      </div>
    </section>
  );

  return (
    <section className="max-w-7xl mx-auto px-6 pb-6">
      <PhotoProvider>
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-3xl overflow-hidden h-[420px] md:h-[520px]">
          <div className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group">
            <PhotoView src={images[0]}>
              <img src={images[0]} alt={name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
            </PhotoView>
          </div>
          {images.slice(1, 5).map((src, i) => (
            <div key={i} className="relative overflow-hidden cursor-pointer group">
              <PhotoView src={src}>
                <img src={src} alt={`${name} ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={e => { (e.target as HTMLImageElement).src = FALLBACK; }} />
              </PhotoView>
              {i === 3 && images.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">+{images.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
          {images.slice(5).map((src, i) => (
            <PhotoView key={`h${i}`} src={src}><span /></PhotoView>
          ))}
        </div>
      </PhotoProvider>
    </section>
  );
}
