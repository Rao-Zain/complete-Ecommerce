"use client";

import { Zap } from "lucide-react";
import { IMAGE_BASE_URL } from "@/lib/config";
import HoverImageScroll from "@/app/HoverImageScroll/HoverImageScroll";
import WishlistButton from "@/app/Wishlist/WishlistButton";

function extractImages(product) {
  const paths = [];

  if (product.main_variant_image?.image_path) {
    paths.push(product.main_variant_image.image_path);
  }
  if (Array.isArray(product.variant_images)) {
    product.variant_images.forEach((img) => img?.image_path && paths.push(img.image_path));
  }
  if (Array.isArray(product.variants)) {
    product.variants.forEach((v) => v?.variant_image?.image_path && paths.push(v.variant_image.image_path));
  }
  if (Array.isArray(product.images)) {
    product.images.forEach((img) => {
      const p = img?.image_path || img;
      if (typeof p === "string") paths.push(p);
    });
  }

  const unique = [...new Set(paths.filter(Boolean))];
  return unique.map((p) =>
    p.startsWith("http://") || p.startsWith("https://") ? p : `${IMAGE_BASE_URL}/${p}`
  );
}

export default function ProductCardImage({ product, discountPercent, badgeType }) {
  const images = extractImages(product);

  return (
    <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
      {/* 1. Badge Rendering Logic */}
      {badgeType === "top-seller" ? (
        <span className="absolute top-2 left-2 z-1 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
          TOP SELLER
        </span>
      ) : badgeType === "featured" ? (
        <span className="absolute top-2 left-2 z-10 bg-yellow-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
          FEATURED
        </span>
      ) : (
        discountPercent && (
          <div className="absolute top-2 -left-1 z-10 bg-gradient-to-r from-orange-600 to-amber-500 text-white pl-3 pr-3.5 py-1 rounded-r-full text-[10px] sm:text-[11px] font-extrabold shadow-md flex items-center gap-1 tracking-wide">
            <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" />
            <span>{discountPercent}% OFF</span>
          </div>
        )
      )}

      {/* 2. Self-contained Wishlist Trigger */}
      <WishlistButton productId={product.id} />

      {/* 3. Hover Scrub Gallery */}
      <HoverImageScroll
        images={images}
        alt={product.name || product.title || "Product"}
        className="aspect-square w-full bg-gray-100"
      />
    </div>
  );
}