"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

/**
 * HoverImageScroll
 * -----------------
 * Standalone, reusable product-image component with the "scrub to
 * preview" hover effect used on Shopify and most e-commerce sites:
 * moving the cursor left→right across the image cycles through the
 * product's photos, cross-fading between them. On touch devices the
 * same thing happens by dragging a finger across the image.
 *
 * Drop this in place of a plain <Image> on any page — home, category,
 * search results, wishlist, etc. — and it behaves identically everywhere.
 *
 * Usage:
 *   <HoverImageScroll
 *     images={["https://.../img1.webp", "https://.../img2.webp"]}
 *     alt={product.name}
 *     className="aspect-square w-full"
 *   />
 *
 * If `images` has only one URL (or is empty), it just renders that one
 * image (or nothing) with no hover behavior — safe to use everywhere
 * even for products with a single photo.
 */
export default function HoverImageScroll({ images = [], alt = "", className = "" }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const containerRef = useRef(null);
  const resetTimeout = useRef(null);

  const changeImage = (targetIndex) => {
    if (targetIndex === currentIndex || nextIndex !== null) return;
    setNextIndex(targetIndex);
  };

  useEffect(() => {
    if (nextIndex === null) return;
    setRevealed(false);
    const raf = requestAnimationFrame(() => setRevealed(true));
    const done = setTimeout(() => {
      setCurrentIndex(nextIndex);
      setNextIndex(null);
      setRevealed(false);
    }, 300);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [nextIndex]);

  const handleMove = (clientX) => {
    if (images.length <= 1 || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const xPos = clientX - rect.left;
    const index = Math.floor((xPos / rect.width) * images.length);
    const targetIndex = Math.min(Math.max(index, 0), images.length - 1);
    changeImage(targetIndex);
  };

  const resetImage = () => {
    if (resetTimeout.current) clearTimeout(resetTimeout.current);
    setNextIndex(null);
    setRevealed(false);
    setCurrentIndex(0);
  };

  if (!images.length) return null;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${className}`}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseLeave={resetImage}
      onTouchStart={(e) => handleMove(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      <Image
        src={images[currentIndex]}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none"
      />

      {nextIndex !== null && (
        <Image
          src={images[nextIndex]}
          alt={alt}
          fill
          unoptimized
          sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
          className={`absolute inset-0 object-cover pointer-events-none transition-opacity duration-300 ease-in-out ${
            revealed ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}