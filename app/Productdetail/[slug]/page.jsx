"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Image from "next/image";
import Link from "next/link";
import { MdFlashOn } from "react-icons/md";
import ProductReviews from "./ProductReviews";
import toast from "react-hot-toast";

export default function Productdetail() {
  const params = useParams();
  const slug = params.slug;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Load saved quantity for this product once slug is known
  useEffect(() => {
    if (!slug) return;

    const saved = sessionStorage.getItem(`qty_${slug}`);

    if (saved) {
      setQuantity(Number(saved));
    }
  }, [slug]);

  // Save quantity every time it changes
  useEffect(() => {
    if (slug) {
      sessionStorage.setItem(`qty_${slug}`, quantity);
    }
  }, [quantity, slug]);

  // Fetch product whenever slug changes
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setProduct(null);
      setError(null);

      try {
        const res = await fetch(`${API_BASE_URL}/api/product/${slug}`);

        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await res.json();
        const p = data.data || data;

        setProduct(p);

        // Reset variant selection
        if (p.variants?.length) {
          setSelectedColor(p.variants[0].color_name);
          setSelectedSize(p.variants[0].size);
        } else {
          setSelectedColor(null);
          setSelectedSize(null);
        }

        setCurrentIndex(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  // Add to cart
  const handleAddToCart = async () => {
    if (!activeVariant) {
      toast.error("Please select a color and size.");
      return;
    }

    if (activeVariant.stock < quantity) {
      toast.error("Not enough stock available.");
      return;
    }

    setAddingToCart(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },
        body: JSON.stringify({
          product_id: product.id,
          variant_id: activeVariant.id,
          qty: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.status === false) {
        throw new Error(data.message || "Failed to add to cart");
      }

      toast.success(data.message || "Added to cart!");

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  // --------------------------------------------------
  // LOADING SKELETON
  // --------------------------------------------------

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 py-5 sm:py-8 animate-pulse">
        {/* Breadcrumb */}
        <div className="h-4 w-40 sm:w-52 bg-gray-200 rounded mb-5 sm:mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10">
          {/* Images */}
          <div className="flex flex-col gap-3 sm:gap-4 md:col-span-1 lg:col-span-5">
            <div
              className="
                w-full
                h-[300px]
                sm:h-[380px]
                md:h-[420px]
                lg:h-[490px]
                xl:h-[520px]
                bg-gray-200
                rounded-lg
                sm:rounded-xl
                border
                border-gray-200
              "
            />

            <div className="flex gap-2 sm:gap-3 overflow-hidden">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="
                    w-[64px]
                    h-[56px]
                    sm:w-[80px]
                    sm:h-[68px]
                    md:w-[86px]
                    md:h-[72px]
                    bg-gray-200
                    rounded-md
                    flex-shrink-0
                  "
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 md:col-span-1 lg:col-span-7">
            <div className="h-7 sm:h-9 w-full sm:w-4/5 bg-gray-200 rounded" />

            <div className="h-4 w-32 sm:w-40 bg-gray-200 rounded" />

            <div className="flex items-center gap-3">
              <div className="h-7 w-24 bg-gray-200 rounded" />
              <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>

            <div className="h-7 w-28 bg-gray-200 rounded-full" />

            {/* Description */}
            <div className="mt-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-full bg-gray-200 rounded" />
              <div className="h-3 w-4/5 bg-gray-200 rounded" />
            </div>

            {/* Colors */}
            <div className="mt-2 space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />

              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-20 bg-gray-200 rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mt-2 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />

              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-9 w-10 bg-gray-200 rounded-md"
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-2 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-10 w-28 bg-gray-200 rounded-md" />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
              <div className="h-10 w-full sm:w-36 bg-gray-200 rounded-md" />
              <div className="h-10 w-full sm:w-36 bg-gray-200 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <p className="text-sm sm:text-base text-gray-600">
          Something went wrong: {error}
        </p>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  // --------------------------------------------------
  // PRODUCT DATA
  // --------------------------------------------------

  const productImages =
    product.images?.length > 0
      ? product.images
          .slice()
          .sort((a, b) => b.is_main - a.is_main)
          .map((img) => `${IMAGE_BASE_URL}/${img.image_path}`)
      : [];

  const colors = Array.from(
    new Set(
      (product.variants || [])
        .map((v) => v.color_name)
        .filter(Boolean)
    )
  );

  const sizes = Array.from(
    new Set(
      (product.variants || [])
        .filter((v) => v.color_name === selectedColor)
        .map((v) => v.size)
        .filter(Boolean)
    )
  );

  const activeVariant = (product.variants || []).find(
    (v) =>
      v.color_name === selectedColor &&
      v.size === selectedSize
  );

  const price = activeVariant
    ? Number(activeVariant.price)
    : null;

  const cutPrice = activeVariant
    ? Number(activeVariant.cut_price)
    : null;

  const stock = activeVariant
    ? activeVariant.stock
    : 0;

  const avgRating = product.avg_rating ?? 0;
  const totalReviews = product.total_reviews ?? 0;

  // --------------------------------------------------
  // QUANTITY
  // --------------------------------------------------

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 10) {
      setQuantity(quantity + 1);
    }
  };

  // --------------------------------------------------
  // IMAGE NAVIGATION
  // --------------------------------------------------

  const handlePrevImage = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? productImages.length - 1
        : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) =>
      prev === productImages.length - 1
        ? 0
        : prev + 1
    );
  };

  // --------------------------------------------------
  // RETURN
  // --------------------------------------------------

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-0 py-4 sm:py-6 lg:py-8">

      {/* ==========================================
          BREADCRUMB
      ========================================== */}

      <div className="text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6 lg:mb-8 overflow-hidden">
        <div className="flex items-center gap-1 min-w-0 whitespace-nowrap">
          <Link
            href="/"
            className="hover:underline flex-shrink-0"
          >
            Home
          </Link>

          <span>/</span>

          <span className="flex-shrink-0">
            Products
          </span>

          <span>/</span>

          <span className="text-gray-800 font-bold truncate">
            {product.name}
          </span>
        </div>
      </div>

      {/* ==========================================
          PRODUCT MAIN SECTION
      ========================================== */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-12
          gap-6
          sm:gap-8
          lg:gap-10
          xl:gap-12
        "
      >

        {/* ========================================
            LEFT - PRODUCT IMAGES
        ======================================== */}

        <div
          className="
            flex
            flex-col
            gap-3
            sm:gap-4
            md:col-span-1
            lg:col-span-5
            min-w-0
          "
        >

          {/* Main Image */}

          <div
            className="
              relative
              w-full
              h-[300px]
              sm:h-[380px]
              md:h-[420px]
              lg:h-[490px]
              xl:h-[520px]
              bg-gray-100
              rounded-lg
              sm:rounded-xl
              overflow-hidden
              border
              border-gray-200
              group
            "
          >
            <Image
              src={
                productImages[currentIndex] ||
                "/placeholder.png"
              }
              alt={product.name}
              fill
              unoptimized
              priority
              sizes="
                (max-width: 640px) 100vw,
                (max-width: 1024px) 50vw,
                42vw
              "
              className="object-cover"
            />

            {/* Image Navigation */}

            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="
                    absolute
                    left-2
                    sm:left-3
                    top-1/2
                    -translate-y-1/2
                    bg-black/50
                    hover:bg-black/70
                    text-white
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    flex
                    items-center
                    justify-center
                    text-xs
                    sm:text-sm
                    rounded-full
                    opacity-100
                    sm:opacity-0
                    sm:group-hover:opacity-100
                    transition-opacity
                    z-10
                  "
                  aria-label="Previous image"
                >
                  ❮
                </button>

                <button
                  onClick={handleNextImage}
                  className="
                    absolute
                    right-2
                    sm:right-3
                    top-1/2
                    -translate-y-1/2
                    bg-black/50
                    hover:bg-black/70
                    text-white
                    w-8
                    h-8
                    sm:w-9
                    sm:h-9
                    flex
                    items-center
                    justify-center
                    text-xs
                    sm:text-sm
                    rounded-full
                    opacity-100
                    sm:opacity-0
                    sm:group-hover:opacity-100
                    transition-opacity
                    z-10
                  "
                  aria-label="Next image"
                >
                  ❯
                </button>
              </>
            )}
          </div>

          {/* ========================================
              THUMBNAILS
          ======================================== */}

          {productImages.length > 1 && (
            <div
              className="
                flex
                gap-2
                sm:gap-3
                overflow-x-auto
                overflow-y-hidden
                pb-2
                px-1
                scrollbar-thin
                snap-x
              "
            >
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    relative
                    w-[64px]
                    h-[56px]
                    sm:w-[80px]
                    sm:h-[68px]
                    md:w-[86px]
                    md:h-[72px]
                    lg:w-[90px]
                    lg:h-[75px]
                    rounded-lg
                    overflow-hidden
                    border
                    cursor-pointer
                    flex-shrink-0
                    snap-start
                    transition-all
                    ${
                      currentIndex === index
                        ? "border-gray-500 ring-1 ring-gray-400"
                        : "border-gray-300 hover:opacity-80"
                    }
                  `}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    unoptimized
                    sizes="90px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================
            RIGHT - PRODUCT DETAILS
        ======================================== */}

        <div
          className="
            flex
            flex-col
            min-w-0
            md:col-span-1
            lg:col-span-7
          "
        >

          {/* Product Name */}

          <h1
            className="
              text-xl
              sm:text-2xl
              md:text-2xl
              lg:text-[30px]
              xl:text-[32px]
              leading-tight
              font-bold
              text-gray-900
              break-words
            "
          >
            {product.name}
          </h1>

          {/* ========================================
              RATING
          ======================================== */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-2
              gap-y-1
              mt-2
            "
          >
            <span className="text-yellow-500 text-xs sm:text-sm tracking-wide">
              {"★".repeat(Math.round(avgRating))}
              {"☆".repeat(
                5 - Math.round(avgRating)
              )}
            </span>

            <span className="text-xs sm:text-sm text-gray-500">
              ({avgRating.toFixed(1)}) ·{" "}
              {totalReviews} reviews
            </span>
          </div>

          {/* ========================================
              PRICE
          ======================================== */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-3
              gap-y-1
              mt-2
            "
          >
            {price !== null && (
              <span
                className="
                  text-xl
                  sm:text-2xl
                  lg:text-[25px]
                  font-bold
                  text-green-600
                "
              >
                Rs {price.toLocaleString()}
              </span>
            )}

            {cutPrice !== null &&
              cutPrice > price && (
                <span
                  className="
                    text-sm
                    sm:text-base
                    text-gray-400
                    line-through
                  "
                >
                  Rs {cutPrice.toLocaleString()}
                </span>
              )}
          </div>

          {/* ========================================
              STOCK
          ======================================== */}

          <span
            className="
              w-fit
              max-w-full
              rounded-full
              mt-3
              px-3
              py-1
              bg-green-100
              text-xs
              sm:text-sm
              text-green-600
              font-medium
            "
          >
            {stock > 0
              ? `${stock} In Stock`
              : "Out of Stock"}
          </span>

          {/* ========================================
              DESCRIPTION
          ======================================== */}

          <div className="mt-4 sm:mt-5">
            <h3
              className="
                font-semibold
                text-sm
                sm:text-[15px]
                text-gray-700
              "
            >
              Description
            </h3>

            <div
              className="
                text-xs
                sm:text-sm
                text-gray-600
                mt-1.5
                leading-relaxed
                break-words
                overflow-hidden
              "
              dangerouslySetInnerHTML={{
                __html: product.description || "",
              }}
            />
          </div>

          {/* ========================================
              COLOR SELECTION
          ======================================== */}

          {colors.length > 0 && (
            <div className="mt-5">
              <label
                className="
                  block
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Select Color
              </label>

              <div className="flex gap-2 flex-wrap">
                {colors.map((color) => {
                  const colorVariant =
                    (product.variants || []).find(
                      (v) => v.color_name === color
                    );

                  const colorImagePath =
                    colorVariant?.variant_image
                      ?.image_path;

                  const colorImageUrl =
                    colorImagePath
                      ? `${IMAGE_BASE_URL}/${colorImagePath}`
                      : "/placeholder.png";

                  return (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);

                        const firstSize =
                          (product.variants || []).find(
                            (v) =>
                              v.color_name === color
                          )?.size;

                        setSelectedSize(firstSize);

                        const imgIndex =
                          productImages.findIndex(
                            (img) =>
                              img === colorImageUrl
                          );

                        if (imgIndex !== -1) {
                          setCurrentIndex(imgIndex);
                        }
                      }}
                      className={`
                        min-h-9
                        flex
                        items-center
                        gap-2
                        px-2
                        sm:px-2.5
                        rounded-md
                        border
                        text-[11px]
                        sm:text-xs
                        font-medium
                        transition-all
                        ${
                          selectedColor === color
                            ? "border-gray-400 bg-gray-100 shadow-sm"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }
                      `}
                    >
                      <div
                        className="
                          relative
                          w-[26px]
                          h-[26px]
                          rounded
                          overflow-hidden
                          flex-shrink-0
                          border
                          border-gray-200
                        "
                      >
                        <Image
                          src={colorImageUrl}
                          alt={color}
                          fill
                          unoptimized
                          sizes="26px"
                          className="object-cover"
                        />
                      </div>

                      <span className="max-w-[100px] truncate">
                        {color}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================
              SIZE SELECTION
          ======================================== */}

          {sizes.length > 0 && (
            <div className="mt-5">
              <label
                className="
                  block
                  text-xs
                  sm:text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                "
              >
                Select Size
              </label>

              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelectedSize(size)
                    }
                    className={`
                      min-w-10
                      h-9
                      px-2
                      flex
                      items-center
                      justify-center
                      rounded-md
                      border
                      text-xs
                      sm:text-sm
                      font-semibold
                      transition-all
                      ${
                        selectedSize === size
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
          )}

          {/* ========================================
              QUANTITY
          ======================================== */}

          <div className="mt-5">
            <label
              className="
                block
                text-xs
                sm:text-sm
                font-semibold
                text-gray-700
                mb-2
              "
            >
              Quantity
            </label>

            <div
              className="
                flex
                items-center
                border
                border-gray-300
                rounded-md
                w-[110px]
                h-10
                overflow-hidden
              "
            >
              <button
                onClick={handleDecrement}
                className="
                  w-[35px]
                  h-full
                  flex
                  items-center
                  justify-center
                  text-gray-600
                  hover:bg-gray-100
                  text-sm
                  transition-colors
                "
                aria-label="Decrease quantity"
              >
                -
              </button>

              <span
                className="
                  flex-1
                  h-full
                  flex
                  items-center
                  justify-center
                  text-sm
                  font-medium
                  text-gray-800
                  border-l
                  border-r
                  border-slate-300
                "
              >
                {quantity}
              </span>

              <button
                onClick={handleIncrement}
                className="
                  w-[35px]
                  h-full
                  flex
                  items-center
                  justify-center
                  text-gray-600
                  hover:bg-gray-100
                  text-sm
                  transition-colors
                "
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* ========================================
              ACTION BUTTONS
          ======================================== */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              gap-2
              sm:gap-3
              mt-5
              w-full
            "
          >
            {/* Add To Cart */}

            <button
              onClick={handleAddToCart}
              disabled={
                addingToCart ||
                !activeVariant ||
                activeVariant.stock === 0
              }
              className="
                w-full
                sm:w-[140px]
                h-10
                flex
                items-center
                justify-center
                bg-black
                text-white
                rounded-md
                text-xs
                sm:text-sm
                font-medium
                hover:bg-gray-900
                transition-colors
                shadow-sm
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {addingToCart
                ? "Adding..."
                : "Add To Cart"}
            </button>

            {/* Buy Now */}

            <button
              className="
                w-full
                sm:w-[140px]
                h-10
                flex
                items-center
                justify-center
                gap-1
                bg-orange-600
                text-white
                rounded-md
                text-xs
                sm:text-sm
                font-medium
                hover:bg-orange-700
                transition-colors
                shadow-sm
              "
            >
              <MdFlashOn className="w-4 h-4" />

              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* ==========================================
          PRODUCT REVIEWS
      ========================================== */}

      <div className="mt-8 sm:mt-10 lg:mt-12">
        <ProductReviews product={product} />
      </div>
    </div>
  );
}