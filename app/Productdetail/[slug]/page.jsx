"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import { MdFlashOn, MdChevronLeft, MdChevronRight } from "react-icons/md";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import ProductReviews from "./ProductReviews";

import toast from "react-hot-toast";

import "swiper/css";
import "swiper/css/navigation";

export default function Productdetail() {
  const params = useParams();
  const slug = params.slug;
const router = useRouter();
  // =========================================================
  // STATE
  // =========================================================

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [addingToCart, setAddingToCart] = useState(false);

  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Active image
  const [activeImage, setActiveImage] = useState(0);

  // Main Swiper
  const mainSwiperRef = useRef(null);

  // Thumbnail Swiper
  const thumbnailSwiperRef = useRef(null);

  // Custom navigation button refs
  // (FIX: navigation={{ enabled: true }} does not reliably render
  // nav buttons in React. We render our own buttons and bind them
  // to Swiper via onBeforeInit instead.)
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  // =========================================================
  // AUTH HEADERS
  // =========================================================

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      Accept: "application/json",

      ...(token
        ? {
          Authorization: `Bearer ${token}`,
        }
        : {}),
    };
  };

  // =========================================================
  // USER ID
  // =========================================================

  const getUserId = () => {
    const userId = localStorage.getItem("userId");
    return userId;
  };

  // =========================================================
  // LOAD SAVED QUANTITY
  // =========================================================

  useEffect(() => {
    if (!slug) return;

    const saved = sessionStorage.getItem(`qty_${slug}`);

    if (saved) {
      setQuantity(Number(saved));
    }
  }, [slug]);

  // =========================================================
  // SAVE QUANTITY
  // =========================================================

  useEffect(() => {
    if (!slug) return;

    sessionStorage.setItem(`qty_${slug}`, String(quantity));
  }, [quantity, slug]);

  // =========================================================
  // FETCH PRODUCT
  // =========================================================

  useEffect(() => {
    if (!slug) return;

    async function fetchProduct() {
      setLoading(true);
      setProduct(null);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/product/${slug}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();

        const p = data.data || data;

        setProduct(p);

        // Reset image
        setActiveImage(0);

        // Set first variant
        if (p.variants?.length > 0) {
          setSelectedColor(p.variants[0].color_name);
          setSelectedSize(p.variants[0].size);
        } else {
          setSelectedColor(null);
          setSelectedSize(null);
        }
      } catch (err) {
        console.error("PRODUCT ERROR:", err);

        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  // =========================================================
  // PRODUCT IMAGES
  // =========================================================

  const productImages =
    product?.images?.length > 0
      ? product.images
        .slice()
        .sort((a, b) => Number(b.is_main) - Number(a.is_main))
        .map((img) => `${IMAGE_BASE_URL}/${img.image_path}`)
      : [];

  // =========================================================
  // COLORS
  // =========================================================

  const colors = Array.from(
    new Set(
      (product?.variants || [])
        .map((variant) => variant.color_name)
        .filter(Boolean)
    )
  );

  // =========================================================
  // SIZES
  // =========================================================

  const sizes = Array.from(
    new Set(
      (product?.variants || [])
        .filter((variant) => variant.color_name === selectedColor)
        .map((variant) => variant.size)
        .filter(Boolean)
    )
  );

  // =========================================================
  // ACTIVE VARIANT
  // =========================================================

  const activeVariant = (product?.variants || []).find(
    (variant) =>
      variant.color_name === selectedColor && variant.size === selectedSize
  );

  // =========================================================
  // PRICE
  // =========================================================

  const price = activeVariant ? Number(activeVariant.price) : null;

  const cutPrice = activeVariant ? Number(activeVariant.cut_price) : null;

  // =========================================================
  // STOCK
  // =========================================================

  const stock = activeVariant ? Number(activeVariant.stock) : 0;

  // =========================================================
  // RATING
  // =========================================================

  const avgRating = Number(product?.avg_rating ?? 0);

  const totalReviews = Number(product?.total_reviews ?? 0);

  // =========================================================
  // IMAGE CHANGE
  // =========================================================

  const changeImage = (index) => {
    setActiveImage(index);

    if (mainSwiperRef.current && !mainSwiperRef.current.destroyed) {
      mainSwiperRef.current.slideTo(index);
    }
  };

  // =========================================================
  // WHEN MAIN SWIPER CHANGES
  // =========================================================

  const handleSlideChange = (swiper) => {
    const index = swiper.activeIndex;

    setActiveImage(index);

    // Make thumbnail visible
    if (
      thumbnailSwiperRef.current &&
      !thumbnailSwiperRef.current.destroyed
    ) {
      thumbnailSwiperRef.current.slideTo(index);
    }
  };

  // =========================================================
  // COLOR CHANGE
  // =========================================================

  const handleColorChange = (color) => {
    setSelectedColor(color);

    const firstVariant = (product?.variants || []).find(
      (variant) => variant.color_name === color
    );

    if (firstVariant) {
      setSelectedSize(firstVariant.size);
    }

    // -----------------------------------------
    // Find color image
    // -----------------------------------------

    const colorImagePath = firstVariant?.variant_image?.image_path;

    if (!colorImagePath) return;

    const colorImageUrl = `${IMAGE_BASE_URL}/${colorImagePath}`;

    const imageIndex = productImages.findIndex(
      (image) => image === colorImageUrl
    );

    if (imageIndex !== -1) {
      changeImage(imageIndex);
    }
  };

  // =========================================================
  // QUANTITY
  // =========================================================

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((previous) => previous - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < 10) {
      setQuantity((previous) => previous + 1);
    }
  };

  // =========================================================
  // ADD TO CART
  // =========================================================

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserId();

    if (!token) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
      return;
    }

    if (!userId || userId === "undefined" || userId === "null") {
      toast.error("User information not found. Please log in again.");
      return;
    }

    if (!activeVariant) {
      toast.error("Please select a color and size.");
      return;
    }

    if (Number(activeVariant.stock) < quantity) {
      toast.error("Not enough stock available.");
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: Number(userId),
          product_id: product.id,
          variant_id: activeVariant.id,
          qty: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.status === false) {
        throw new Error(data.message || "Failed to add product to cart");
      }

      toast.success(data.message || "Added to cart!");

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      console.error("CART ERROR:", err);

      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  };

  // =========================================================
  // BUY NOW
  // =========================================================

  const handleBuyNow = () => {
  const token = localStorage.getItem("token");
  const userId = getUserId();

  if (!token) {
    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
    return;
  }

  if (!userId || userId === "undefined" || userId === "null") {
    toast.error("User information not found. Please log in again.");
    return;
  }

  if (!activeVariant) {
    toast.error("Please select a color and size.");
    return;
  }

  if (Number(activeVariant.stock) < quantity) {
    toast.error("Not enough stock available.");
    return;
  }

   const buyNowItem = {
    id: product.id,
    quantity,
    variant: {
      id: activeVariant.id,
      price: activeVariant.price,
      cut_price: activeVariant.cut_price,
      color_name: activeVariant.color_name,
      size: activeVariant.size,
      variant_image: activeVariant.variant_image,
      product: {
        id: product.id,
        name: product.name,
      },
    },
  };

  // Buy Now bypasses the existing cart — checkout shows only this item.
  localStorage.setItem("cart", JSON.stringify([buyNowItem]));
  window.dispatchEvent(new Event("cartUpdated"));

  router.push("/Checkout");

    toast.success("Ready for checkout!");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-[300px] sm:h-[420px] lg:h-[540px] bg-gray-200 rounded-xl animate-pulse" />

          <div className="space-y-5">
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-48 bg-gray-200 rounded animate-pulse" />
            <div className="h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center px-4">
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  // =========================================================
  // NO PRODUCT
  // =========================================================

  if (!product) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="w-full overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-0 py-4 sm:py-6 lg:py-8">
        {/* ==================================================
            BREADCRUMB
        ================================================== */}

        <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 mb-5 sm:mb-7 overflow-hidden">
          <Link href="/" className="flex-shrink-0 hover:text-black">
            Home
          </Link>

          <span>/</span>

          <Link href="/products" className="flex-shrink-0 hover:text-black">
            Products
          </Link>

          <span>/</span>

          <span className="truncate text-gray-800 font-medium">
            {product.name}
          </span>
        </div>

        {/* ==================================================
            PRODUCT SECTION
        ================================================== */}

        <div className="g grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-12
          gap-6
          sm:gap-8
          lg:gap-10
          xl:gap-12">
          {/* =================================================
              IMAGE AREA
          ================================================= */}

          <section className="flex
            flex-col
            gap-3
            sm:gap-4
            md:col-span-1
            lg:col-span-5
            min-w-0">


            <div className="relative
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
              group">
              {productImages.length > 0 ? (
                <>
                  <Swiper
                    key={slug}
                    modules={[Navigation]}
                    onSwiper={(swiper) => {
                      mainSwiperRef.current = swiper;
                    }}
                    onSlideChange={handleSlideChange}
                    onBeforeInit={(swiper) => {
                      // FIX: bind custom nav buttons to Swiper here.
                      // This is the reliable way to wire navigation
                      // in React — passing navigation={{ enabled: true }}
                      // alone does not consistently render/attach buttons.
                      swiper.params.navigation.prevEl = prevButtonRef.current;
                      swiper.params.navigation.nextEl = nextButtonRef.current;
                    }}
                    navigation={{
                      prevEl: prevButtonRef.current,
                      nextEl: nextButtonRef.current,
                    }}
                    slidesPerView={1}
                    spaceBetween={0}
                    speed={450}
                    grabCursor={true}
                    allowTouchMove={true}
                    loop={true}
                    className="product-main-swiper w-full h-full"
                  >
                    {productImages.map((image, index) => (
                      <SwiperSlide key={`${image}-${index}`}>
                        <div className="relative w-full h-full flex items-center justify-center">
                          <Image
                            src={image}
                            alt={`${product.name} image ${index + 1}`}
                            fill
                            unoptimized
                            priority={index === 0}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                            className="object-cover"
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Custom nav buttons — only useful with 2+ images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        type="button"
                        ref={prevButtonRef}
                        aria-label="Previous image"
                        className="
                          absolute left-2 top-1/2 -translate-y-1/2 z-10
                          w-8 h-8 sm:w-10 sm:h-10
                          flex items-center justify-center
                          rounded-full bg-white/90 shadow-md
                          text-gray-700 hover:bg-white
                          opacity-0 group-hover:opacity-100
                          sm:opacity-100
                          transition-opacity
                        "
                      >
                        <MdChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>

                      <button
                        type="button"
                        ref={nextButtonRef}
                        aria-label="Next image"
                        className="
                          absolute right-2 top-1/2 -translate-y-1/2 z-10
                          w-8 h-8 sm:w-10 sm:h-10
                          flex items-center justify-center
                          rounded-full bg-white/90 shadow-md
                          text-gray-700 hover:bg-white
                          opacity-0 group-hover:opacity-100
                          sm:opacity-100
                          transition-opacity
                        "
                      >
                        <MdChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    No image available
                  </span>
                </div>
              )}
            </div>

            {/* ===============================================
                THUMBNAILS
            =============================================== */}

            {productImages.length > 1 && (
              <div className="flex
                gap-2
                sm:gap-3
                overflow-x-auto
                overflow-y-hidden
                pb-2
                px-1
                scrollbar-thin
                snap-x">
                <Swiper
                  key={`thumbs-${slug}`}
                  onSwiper={(swiper) => {
                    thumbnailSwiperRef.current = swiper;
                  }}
                  slidesPerView="auto"
                  spaceBetween={8}
                  freeMode={true}
                  watchSlidesProgress={true}
                  grabCursor={true}
                  className="product-thumbnail-swiper w-full"
                >
                  {productImages.map((image, index) => (
                    <SwiperSlide
                      key={`thumb-${index}`}
                      className="
                        !w-[56px] !h-[56px]
                        sm:!w-[78px] sm:!h-[78px]
                        md:!w-[86px] md:!h-[86px]
                        lg:!w-[82px] lg:!h-[82px]
                        xl:!w-[90px] xl:!h-[90px]
                      "
                      onClick={() => changeImage(index)}
                    >
                      <button
                        type="button"
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
                    ${currentIndex === index
                            ? "border-gray-500 ring-1 ring-gray-400"
                            : "border-gray-300 hover:opacity-80"
                          }
                  `}
                      >
                        <Image
                          src={image}
                          alt={`${product.name} thumbnail ${index + 1}`}
                          fill
                          unoptimized
                          sizes="90px"
                          className="object-cover"
                        />
                      </button>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
          </section>

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <section className="flex
            flex-col
            min-w-0
            md:col-span-1
            lg:col-span-7">
            {/* PRODUCT NAME */}

            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold leading-tight text-gray-900 break-words">
              {product.name}
            </h1>

            {/* RATING */}

            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="text-yellow-500 text-sm sm:text-base">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </span>

              <span className="text-xs sm:text-sm text-gray-500">
                {avgRating.toFixed(1)} ({totalReviews} reviews)
              </span>
            </div>

            {/* PRICE */}

            <div className="flex flex-wrap items-center gap-1 mt-3">
              {price !== null && (
                <span className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">
                  Rs {price.toLocaleString()}
                </span>
              )}

              {cutPrice !== null && price !== null && cutPrice > price && (
                <span className="text-sm sm:text-base text-gray-400 line-through mt-2">
                  Rs {cutPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* STOCK */}

            <div className="mt-3">
              <span
                className={`
                  inline-flex items-center px-3 py-1 rounded-full
                  text-xs sm:text-sm font-medium
                  ${stock > 0
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }
                `}
              >
                {stock > 0 ? `${stock} In Stock` : "Out of Stock"}
              </span>
            </div>

            {/* DESCRIPTION */}

            <div className="mt-5 sm:mt-4">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Description
              </h2>

              <div
                className="text-xs sm:text-sm text-gray-600 leading-6 break-words"
                dangerouslySetInnerHTML={{
                  __html: product.description || "",
                }}
              />
            </div>

            {/* COLOR */}

            {colors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
                  Color
                </h3>

                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const variant = (product.variants || []).find(
                      (item) => item.color_name === color
                    );

                    const imagePath = variant?.variant_image?.image_path;

                    const imageUrl = imagePath
                      ? `${IMAGE_BASE_URL}/${imagePath}`
                      : null;

                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`
                        min-h-9
                        flex
                        items-center
                        gap-2 cursor-pointer
                        px-2
                        sm:px-2.5
                        rounded-md
                        border
                        text-[11px]
                        sm:text-xs
                        font-medium
                        transition-all
                        ${selectedColor === color
                            ? "border-gray-400 bg-gray-100 shadow-sm"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                          }
                      `}
                      >
                        {imageUrl && (
                          <div className=" relative
                          w-[26px]
                          h-[26px]
                          rounded
                          overflow-hidden
                          flex-shrink-0
                          border
                          border-gray-200">
                            <Image
                              src={imageUrl}
                              alt={color}
                              fill
                              unoptimized
                              sizes="28px"
                              className="object-cover"
                            />
                          </div>
                        )}

                        <span className="text-xs sm:text-sm font-medium truncate max-w-[100px]">
                          {color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE */}

            {sizes.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
                  Size
                </h3>

                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      type="button"
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`
                      min-w-10
                      h-9
                      px-2
                      flex
                      items-center
                      justify-center
                      rounded-md
                      border
                      text-xs cursor-pointer
                      sm:text-sm
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
            )}

            {/* QUANTITY */}

            <div className="mt-6">
              <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
                Quantity
              </h3>

              <div className="flex
                items-center
                border
                border-gray-300
                rounded-md
                w-[110px]
                h-10
                overflow-hidden">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                >
                  -
                </button>

                <span className="flex-1 h-full flex items-center justify-center text-sm font-medium border-x border-gray-300">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={handleIncrement}
                  className="w-10 h-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={addingToCart || !activeVariant || stock === 0}
                className="
                  w-full sm:w-[180px] h-11 rounded-md bg-black text-white
                  text-sm font-medium hover:bg-gray-800 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed transition
                "
              >
                {addingToCart ? "Adding..." : "Add To Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!activeVariant || stock === 0}
                className="
    w-full sm:w-[180px] h-11 rounded-md bg-orange-600 text-white
    text-sm font-medium hover:bg-orange-700 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed transition
    flex items-center justify-center gap-1
  "
              >
                <MdFlashOn className="w-5 h-5" />
                Buy Now
              </button>
            </div>
          </section>
        </div>

        {/* ==================================================
            REVIEWS
        ================================================== */}

        <section className="mt-8 sm:mt-12 lg:mt-16">
          <ProductReviews product={product} />
        </section>
      </div>
    </main>
  );
}