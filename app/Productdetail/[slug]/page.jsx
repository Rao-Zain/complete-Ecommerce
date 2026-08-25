"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";
import { MdFlashOn } from "react-icons/md";

export default function Productdetail() {
  const params = useParams();
  const slug = params.slug;
  console.log({ slug })
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProduct() {
      try {
        console.log("Fetching:", `${API_BASE_URL}/api/product/${slug}`);
        const res = await fetch(`${API_BASE_URL}/api/product/${slug}`);
        console.log("Status:", res.status);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        console.log("Data:", data);
        const p = data.data || data;
        setProduct(p);

        // Set sensible defaults once product loads
        if (p.variants?.length) {
          setSelectedColor(p.variants[0].color_name);
          setSelectedSize(p.variants[0].size);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 w-48 bg-gray-200 rounded mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left: Images */}
          <div className="flex flex-col gap-4">
            <div className="w-full h-[350px] bg-gray-200 rounded-lg border border-gray-200" />
            <div className="flex gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-20 h-20 bg-gray-200 rounded-md border border-gray-200 flex-shrink-0" />
              ))}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="h-8 w-3/4 bg-gray-200 rounded" />

            {/* Rating */}
            <div className="h-4 w-40 bg-gray-200 rounded" />

            {/* Price */}
            <div className="flex items-center gap-4">
              <div className="h-7 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-16 bg-gray-200 rounded" />
            </div>

            {/* Stock */}
            <div className="h-4 w-20 bg-gray-200 rounded" />

            {/* Description */}
            <div className="mt-2 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-2/3 bg-gray-200 rounded" />
            </div>

            {/* Color Selection */}
            <div className="mt-3 space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-8 w-16 bg-gray-200 rounded-md" />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div className="mt-3 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="flex gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 w-12 bg-gray-200 rounded-md" />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-3 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-10 w-32 bg-gray-200 rounded-md" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <div className="h-10 w-32 bg-gray-200 rounded-md" />
              <div className="h-10 w-32 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 border-t border-gray-200 pt-8">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center md:items-start gap-2 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 pr-0 md:pr-6">
              <div className="h-10 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-28 bg-gray-200 rounded" />
            </div>
            <div className="col-span-2 flex flex-col gap-3 w-full">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full" />
                  <div className="h-3 w-4 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="h-5 w-36 bg-gray-200 rounded" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-3 w-full bg-gray-200 rounded" />
                <div className="h-3 w-3/4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Build image list: unique variant_image_ids -> image paths
  const uniqueImages = Array.from(
    new Map(
      (product.variants || [])
        .filter((v) => v.variant_image_id)
        .map((v) => [v.variant_image_id, v])
    ).values()
  );

  const productImages =
    product.images?.length > 0
      ? product.images
        .slice() // avoid mutating original
        .sort((a, b) => b.is_main - a.is_main) // main image first
        .map((img) => `${IMAGE_BASE_URL}/${img.image_path}`)
      : [];

  // Colors available (unique)
  const colors = Array.from(new Set((product.variants || []).map((v) => v.color_name)));
  // Sizes available for the currently selected color
  const sizes = Array.from(
    new Set(
      (product.variants || [])
        .filter((v) => v.color_name === selectedColor)
        .map((v) => v.size)
    )
  );

  const activeVariant = (product.variants || []).find(
    (v) => v.color_name === selectedColor && v.size === selectedSize
  );

  const price = activeVariant ? Number(activeVariant.price) : null;
  const cutPrice = activeVariant ? Number(activeVariant.cut_price) : null;
  const stock = activeVariant ? activeVariant.stock : 0;

  const avgRating = product.avg_rating ?? 0;
  const totalReviews = product.total_reviews ?? 0;
  const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);

  const handleDecrement = () => quantity > 1 && setQuantity(quantity - 1);
  const handleIncrement = () => quantity < 10 && setQuantity(quantity + 1);
  const handlePrevImage = () =>
    setCurrentIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  const handleNextImage = () =>
    setCurrentIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));

  // Star bar breakdown
  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { star: `${star} Star`, count, pct };
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-0 py-4 sm:py-8">
      {/* Breadcrumb */}
      <div className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
        <Link href="/" className="hover:underline">Home</Link> / Products /{" "}
        <span className="text-gray-800 font-bold">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10">
        {/* Left: Images */}
        <div className="flex flex-col col-span-5 gap-5 sm:gap-4">
          <div className="relative w-full h-[350px] sm:h-[420px] lg:h-[490px] object-cover bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
            <Image
              src={productImages[currentIndex] || "/placeholder.png"}
              alt={product.name}
              fill
              unoptimized
              priority
              className="object-cover"
            />
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              ❮
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-full opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              ❯
            </button>
          </div>

          <div className="flex gap-3 sm:gap-3 overflow-x-auto pb-2">
            {productImages.map((img, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-[90px] h-[75px] rounded-lg overflow-hidden border cursor-pointer flex-shrink-0 transition-all ${currentIndex === index
                  ? "border-gray-300 ring-1 ring-gray-400"
                  : "border-gray-300 hover:opacity-80"
                  }`}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Details */}
        <div className="flex flex-col col-span-7">
          <h1 className="text-2xl lg:text-[32px] leading-tight font-bold text-gray-900">
            {product.name}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500 text-xs sm:text-sm">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(5 - Math.round(avgRating))}
            </span>
            <span className="text-xs sm:text-sm text-gray-500">
              ({avgRating.toFixed(1)}) · {totalReviews} reviews
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2 mt-2 sm:mt-2">
            {price !== null && (
              <span className="text-2xl lg:text-[25px] font-bold text-green-600">
                Rs {price.toLocaleString()}
              </span>)}
            {cutPrice !== null && cutPrice > price && (
              <span className="text-base mt-2 text-gray-400 line-through">Rs {cutPrice.toLocaleString()}</span>
            )}
          </div>

          <span className="w-fit rounded-full mt-3 px-3 bg-green-100 text-xs sm:text-sm text-green-600 font-medium mt-1">
            {stock > 0 ? `${stock} In Stock` : "Out of Stock"}
          </span>

          {/* Description */}
          <div className="mt-3">
            <h3 className="font-semibold text-sm text-gray-700">
              Description
            </h3>

            <div
              className="text-xs text-gray-600 mt-1 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />
          </div>


          {/* Color Selection */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Color
            </label>

            <div className="flex gap-2 flex-wrap">
              {colors.map((color) => {
                const colorVariant = (product.variants || []).find(
                  (v) => v.color_name === color
                );

                const colorImagePath =
                  colorVariant?.variant_image?.image_path;

                const colorImageUrl = colorImagePath
                  ? `${IMAGE_BASE_URL}/${colorImagePath}`
                  : "/placeholder.png";

                return (
                  <button
                    key={color}
                    onClick={() => {
                      setSelectedColor(color);

                      const firstSize = (product.variants || []).find(
                        (v) => v.color_name === color
                      )?.size;

                      setSelectedSize(firstSize);

                      const imgIndex = productImages.findIndex(
                        (img) => img === colorImageUrl
                      );

                      if (imgIndex !== -1) {
                        setCurrentIndex(imgIndex);
                      }
                    }}
                    className={`
            h-[36px]
            flex items-center gap-2
            px-2
            rounded-md
            border
            text-[11px]
            font-medium
            transition-all
            ${selectedColor === color
                        ? "border-gray-400 bg-gray-100"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                      }
          `}
                  >
                    <div className="relative w-[28px] h-[28px] rounded overflow-hidden flex-shrink-0 border border-gray-200">
                      <Image
                        src={colorImageUrl}
                        alt={color}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {color}
                  </button>
                );
              })}
            </div>
          </div>


          {/* Size Selection */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Size
            </label>

            <div className="flex gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`
          w-[35px]
          h-[32px]
          flex items-center justify-center
          rounded-md
          border
          text-xs
          font-semibold
          transition-all
          ${selectedSize === size
                      ? "border-gray-400 bg-gray-100 shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }
        `}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>


          {/* Quantity */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Quantity
            </label>

            <div className="flex items-center border border-gray-300 rounded-md w-[93px] h-[32px] overflow-hidden">

              <button
                onClick={handleDecrement}
                className="w-[30px] h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
              >
                -
              </button>

              <span className="w-[33px] h-full flex items-center justify-center text-xs font-medium text-gray-800 border-l border-r border-slate-300">
                {quantity}
              </span>

              <button
                onClick={handleIncrement}
                className="w-[30px] h-full flex items-center justify-center text-gray-600 hover:bg-gray-100 text-sm"
              >
                +
              </button>

            </div>
          </div>


          {/* Buttons */}
          <div className="flex items-center gap-2 mt-[17px]">

            <Link
              href="/CartProduct"
              className="
      w-[105px]
      h-[32px]
      flex items-center justify-center
      bg-black
      text-white
      rounded-md
      text-xs
      font-medium
      hover:bg-gray-900
      transition-colors
      shadow-sm
    "
            >
              Add To Cart
            </Link>

            <button
              className="
      w-[109px]
      h-[32px]
      flex items-center justify-center
      gap-1
      bg-orange-600
      text-white
      rounded-md
      text-xs
      font-medium
      hover:bg-orange-700
      transition-colors
      shadow-sm
    "
            >
              <MdFlashOn className="w-4 h-4 text-white" />
              Buy Now
            </button>

          </div>
        </div>
      </div>

      {/* Reviews Section */}
    <div className="mt-10 border-t border-gray-200 pt-6">

  {/* Heading */}
  <h2 className="text-lg font-bold text-gray-800 mb-5">
    Customer Reviews
  </h2>


  {/* Rating Summary */}
  <div className="w-full bg-gray-50 rounded-lg border border-gray-200 px-4 py-5">

    <div className="flex items-center">

      {/* Overall Rating */}
      <div className="w-[155px] shrink-0 flex flex-col items-center justify-center border-r border-gray-200 pr-6">

        <span className="text-4xl font-extrabold leading-none text-gray-900">
          {avgRating.toFixed(1)}
        </span>

        <div className="flex text-yellow-400 text-sm mt-2">
          {"★".repeat(Math.round(avgRating))}
          {"☆".repeat(5 - Math.round(avgRating))}
        </div>

        <span className="text-[10px] text-gray-500 mt-1">
          Based on {totalReviews} Review{totalReviews !== 1 ? "s" : ""}
        </span>

      </div>


      {/* Rating Bars */}
      <div className="flex-1 pl-6 flex flex-col gap-[6px]">

        {starCounts.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 text-[11px] text-gray-600"
          >

            {/* Star Label */}
            <span className="w-[40px] shrink-0">
              {row.star}
            </span>


            {/* Progress Bar */}
            <div className="flex-1 h-[8px] bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 rounded-full"
                style={{
                  width: `${row.pct}%`,
                }}
              />
            </div>


            {/* Count */}
            <span className="w-4 text-right shrink-0">
              {row.count}
            </span>

          </div>
        ))}

      </div>

    </div>

  </div>


  {/* Recent Reviews */}
  <div className="mt-6">

    <h3 className="text-base font-semibold text-gray-800 mb-3">
      Recent Reviews
    </h3>


    {reviews.length === 0 && (
      <p className="text-xs text-gray-500">
        No reviews yet.
      </p>
    )}


    <div className="flex flex-col gap-3">

      {reviews.map((review) => (

        <div
          key={review.id}
          className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm"
        >

          {/* User + Verified */}
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              {/* Avatar */}
              <div className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                {review.user_id ? "U" : "?"}
              </div>


              {/* Name + Rating */}
              <div>

                <p className="text-[10px] font-medium text-gray-800">
                  {review.user?.name || "User"}
                </p>

                <div className="flex items-center">

                  <span className="text-yellow-400 text-[10px]">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </span>

                  <span className="text-gray-400 text-[9px] ml-2">
                    • 1 month ago
                  </span>

                </div>

              </div>

            </div>


            {/* Verified */}
            <span className="text-[8px] bg-green-50 text-green-600 border border-green-200 px-2 py-[2px] rounded-full font-medium">
              ● Verified
            </span>

          </div>


          {/* Comment */}
          <p className="text-[10px] text-gray-600 mt-2 leading-relaxed">
            {review.comment}
          </p>


          {/* Review Product Image */}
          {review.product_image && (
            <div className="mt-2">

              <div className="relative w-[32px] h-[32px] rounded overflow-hidden border border-gray-200">
                <Image
                  src={review.product_image}
                  alt="Reviewed product"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>

            </div>
          )}

        </div>

      ))}

    </div>

  </div>

</div>
    </div>
  );
}