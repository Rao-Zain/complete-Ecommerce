"use client";

import { useState, useRef } from "react";
import Image from "next/image";

export default function HoverImageScroll({ images = [], alt = "", className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!images || images.length <= 1 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const progress = Math.max(0, Math.min(xPos / rect.width, 0.999));
    const targetIndex = Math.floor(progress * images.length);

    if (targetIndex !== activeIndex) {
      setActiveIndex(targetIndex);
    }
  };

  const handleLeave = () => {
    setActiveIndex(0);
  };

  if (!images || images.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={handleLeave}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleLeave}
    >
      {/* Active Scrubbed Image */}
      <Image
        src={images[activeIndex]}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover object-center pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105"
      />

      {/* Progress Dash Indicators (Only visible when multi-image) */}
      {images.length > 1 && (
        <div className="absolute bottom-2 inset-x-2 flex gap-1 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-150 ${
                i === activeIndex ? "bg-white shadow" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}