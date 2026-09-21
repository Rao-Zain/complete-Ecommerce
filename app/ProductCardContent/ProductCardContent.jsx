import { Star, Truck } from "lucide-react";

export default function ProductCardContent({ product }) {
  const {
    title,
    rating = 0,
    ratingCount = 0,
    price = 0,
    originalPrice,
    discountPercent,
    inStock = true,
    freeDelivery = true,
  } = product;

  // Reads 'sold' directly, with fallbacks if an unmapped raw product object is passed
  const soldCount = Number(
    product.sold ??
    product.order_items_count ??
    product.sales_count ??
    product.sold_count ??
    0
  );

  return (
    <div className="p-1.5 sm:p-2.5 flex-grow flex flex-col justify-between gap-2">
      {/* 1. Title */}
      <div>
        <h4 className="font-medium text-[12px] md:text-[16px] text-gray-800 truncate group-hover:text-black -mt-1 capitalize">
          {title}
        </h4>
      </div>

      {/* 2. Middle Section: Left (3-Tier Price Stack) & Right (Stock & Free Delivery) */}
   <div className="flex items-center justify-between gap-1.5 -mt-2">
  {/* Left Column: Price + (Original Price & Discount Inline) */}
  <div className="flex flex-col">
    {/* Line 1: Current Price */}
    <span className="text-base sm:text-lg font-bold text-emerald-700 whitespace-nowrap">
      Rs {price.toLocaleString()}
    </span>

    {/* Line 2: Original Strikethrough Price & Discount Inline */}
    <div className="flex items-center gap-1.5">
      {originalPrice && originalPrice > price ? (
        <span className="text-[10px] sm:text-xs text-gray-400 line-through whitespace-nowrap">
          Rs {originalPrice.toLocaleString()}
        </span>
      ) : (
        <span className="text-[10px] sm:text-xs invisible select-none">Rs 0</span>
      )}

      {discountPercent && discountPercent > 0 ? (
        <span className="text-[10px] sm:text-xs font-bold text-red-600 whitespace-nowrap">
          -{discountPercent}%
        </span>
      ) : (
        <span className="text-[10px] sm:text-xs invisible select-none">-0%</span>
      )}
    </div>
  </div>

  {/* Right Column: In Stock & Free Delivery */}
  <div className="flex flex-col items-end flex-shrink-0">
    {/* In Stock Badge */}
    {inStock ? (
      <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-sm font-semibold text-gray-800 whitespace-nowrap">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        In Stock
      </span>
    ) : (
      <span className="inline-flex items-center text-[11px] sm:text-sm invisible select-none">
        In Stock
      </span>
    )}

    {/* Free Delivery Truck */}
    {freeDelivery ? (
      <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
        <Truck className="w-3.5 h-3.5 text-gray-500" />
        Free Delivery
      </span>
    ) : (
      <span className="text-[10px] sm:text-xs invisible select-none">Free Delivery</span>
    )}
  </div>
</div>

      {/* 3. Bottom Row: Rating Stars + Count & Sold Count */}
      <div className="flex items-center justify-between gap-1 -mt-1.5 pb-0">
        {/* Rating Stars & Count */}
        <div className="flex items-center gap-1">
          <div className="flex text-yellow-500 text-[10px] sm:text-xs gap-0.5">
            <StarRating rating={rating} />
          </div>
          <span className="text-[10px] sm:text-xs text-gray-700 font-semibold">
            {rating.toFixed(1)}{" "}
            <span className="text-gray-500 font-normal">({ratingCount})</span>
          </span>
        </div>

        {/* Sold Count */}
        <span className="text-[10px] sm:text-xs text-gray-500 font-medium whitespace-nowrap">
          {soldCount} sold
        </span>
      </div>
    </div>
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