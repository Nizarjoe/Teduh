"use client";

import { useState } from "react";
import { ProductImage } from "@/components/product-image";

export function ProductGallery({ images }: { images: { url: string; alt: string }[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) return <div className="aspect-[4/5] bg-mist" />;
  return (
    <div>
      <div className="aspect-[4/5] bg-mist">
        <ProductImage src={current.url} alt={current.alt} priority sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2">
          {images.map((image, imageIndex) => (
            <button
              key={image.url}
              type="button"
              className={`h-20 w-16 border ${imageIndex === index ? "border-ink" : "border-transparent"}`}
              onClick={() => setIndex(imageIndex)}
              aria-label={`Gambar ${imageIndex + 1}`}
              aria-current={imageIndex === index}
            >
              <ProductImage src={image.url} alt="" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
