import { Star, Truck } from "lucide-react";

/**
 * ProductCardContent
 * -------------------
 * Standalone, reusable "content" section of a product card — built to
 * match the reference site's markup exactly (title, price/discount
 * stack on the left, stock/delivery stack on the right, then a rating
 * row). Drop this inside any card wrapper (image + this) on any page.
 *
 * Usage:
 *   <div className="rounded-lg overflow-hidden border border-gray-200 flex flex-col h-full">
 *     <img src={product.image} alt={product.title} className="aspect-square w-full object-cover" />
 *     <ProductCardContent product={product} />
 *   </div>
 *
 * Expected `product` shape (adjust field names to match your Laravel API,
 * or normalize the response before passing it in):
 *   {
 *     title: string,
 *     rating: number,        // 0-5
 *     ratingCount: number,
 *     sold: number,
 *     price: number,
 *     originalPrice?: number,   // omit if no discount
 *     discountPercent?: number, // omit if no discount
 *     inStock: boolean,
 *     freeDelivery?: boolean,
 *   }
 */
export default function ProductCardContent({ product }) {
  const {
    title,
    rating = 0,
    ratingCount = 0,
    sold = 0,
    price = 0,
    originalPrice,
    discountPercent,
    inStock,
    freeDelivery,
  } = product;

  return (
    <div className="p-1.5 sm:p-2.5 flex-grow flex flex-col justify-between gap-2">
      {/* Title */}
      <div>
        <h4 className="font-medium text-[12px] md:text-[16px] text-gray-800 truncate group-hover:text-black capitalize">
          {title}
        </h4>
      </div>
<div className="flex flex-col space-y-1">
  {/* Row 1: Current Price & In Stock */}
  <div className="flex items-center justify-between gap-2">
    <span className="text-xl font-bold text-emerald-800 tracking-tight whitespace-nowrap">
      Rs {price.toLocaleString()}
    </span>

    {/* In Stock Indicator */}
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-30"></span>
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
      </span>
      <span className="text-xs font-medium text-gray-700">In Stock</span>
    </div>
  </div>

  {/* Row 2: Strikethrough Original Price & Free Delivery */}
  <div className="flex items-center justify-between gap-2">
    {originalPrice && (
      <span className="text-xs text-gray-400 line-through whitespace-nowrap">
        Rs {originalPrice.toLocaleString()}
      </span>
    )}

    {/* Free Delivery Icon + Label */}
    <div className="flex items-center gap-1 text-gray-500 whitespace-nowrap ml-auto">
      {/* Truck Icon (SVG fallback if not using lucide-react) */}
      <svg 
        className="w-3.5 h-3.5 text-gray-500" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M18 18.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm-9 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm11-9.5h-2V5a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1.18a3 3 0 0 0 5.64 0h4.36a3 3 0 0 0 5.64 0H21a1 1 0 0 0 1-1v-4.5a1.5 1.5 0 0 0-1.5-1.5Zm-.5 2.5l1.35 2H18v-2h1.5Z" />
      </svg>
      <span className="text-xs font-normal text-gray-500">Free Delivery</span>
    </div>
  </div>

  {/* Row 3: Discount Percentage */}
  {discountPercent && (
    <span className="text-xs font-bold text-red-600 whitespace-nowrap">
      -{discountPercent}%
    </span>
  )}
</div>

      {/* Rating row */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-500 gap-0.5">
            <StarRating rating={rating} />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-700 font-semibold whitespace-nowrap">
            {rating.toFixed(1)}{" "}
            <span className="text-gray-500 font-normal">({ratingCount})</span>
          </span>
        </div>

        {sold > 0 && (
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
            {sold} sold
          </span>
        )}
      </div>
    </div>
  );
}

// Animated "live" indicator — solid dot with an expanding ping ring behind it.
function PulseDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
  );
}

function StarRating({ rating }) {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
            i < Math.round(rating)
              ? "fill-yellow-500 text-yellow-500"
              : "fill-gray-300 text-gray-300"
          }`}
        />
      ))}
    </>
  );
}