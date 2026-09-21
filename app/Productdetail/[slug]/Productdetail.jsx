"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import RelatedProducts from "../../RelatedProducts/RelatedProducts";
import {
  MdFlashOn,
  MdChevronLeft,
  MdChevronRight,
  MdDescription,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { FaShoppingCart } from "react-icons/fa";
import toast from "react-hot-toast";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import ProductReviews from "./ProductReviews";
import ProductDeliverySidebar from "./ProductDeliverySidebar";
import WishlistButton from "@/app/Wishlist/WishlistButton";

import "swiper/css";
import "swiper/css/navigation";

export default function Productdetail() {
  const params = useParams();
  const slug = params?.slug;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const [showFullDescription, setShowFullDescription] = useState(false);
  const descriptionRef = useRef(null);
  const [descHeight, setDescHeight] = useState(0);
  const COLLAPSED_DESCRIPTION_HEIGHT = 110;

  const mainSwiperRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  // Zoom logic & dynamic wheel zoom level
  const zoomContainerRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(3.5);
  const cursorCoordsRef = useRef({ clientX: 0, clientY: 0 });

  const [lensBox, setLensBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [zoomPane, setZoomPane] = useState({
    width: 0,
    height: 0,
    backgroundSize: "0px 0px",
    backgroundPosition: "0px 0px",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const getUserId = () => localStorage.getItem("userId");

  useEffect(() => {
    if (!slug) return;
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/product/${slug}`);
        if (!response.ok) throw new Error("Failed to fetch product");
        const data = await response.json();
        const p = data.data || data;

        setProduct(p);
        setActiveImage(0);
        setShowFullDescription(false);

        if (p.variants?.length > 0) {
          setSelectedColor(p.variants[0].color_name);
          setSelectedSize(p.variants[0].size);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!descriptionRef.current) return;
    const measure = () => {
      if (descriptionRef.current) {
        setDescHeight(descriptionRef.current.scrollHeight);
      }
    };
    measure();
    const images = descriptionRef.current.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.complete) img.addEventListener("load", measure);
    });
    return () => {
      images.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [product?.description]);

  const productImages =
    product?.images?.length > 0
      ? product.images
        .slice()
        .sort((a, b) => Number(b.is_main) - Number(a.is_main))
        .map((img) =>
          img.image_path.startsWith("http")
            ? img.image_path
            : `${IMAGE_BASE_URL}/${img.image_path}`
        )
      : [];

  const colors = Array.from(
    new Set((product?.variants || []).map((v) => v.color_name).filter(Boolean))
  );

  const sizes = Array.from(
    new Set(
      (product?.variants || [])
        .filter((v) => v.color_name === selectedColor)
        .map((v) => v.size)
        .filter(Boolean)
    )
  );

  const activeVariant = (product?.variants || []).find(
    (v) => v.color_name === selectedColor && v.size === selectedSize
  );

  // Raw fields coming from the API (variant-level, with product-level fallback)
  const rawPrice = activeVariant ? Number(activeVariant.price) : Number(product?.price || 0);
  const rawCutPrice = activeVariant?.cut_price
    ? Number(activeVariant.cut_price)
    : product?.cut_price
      ? Number(product.cut_price)
      : null;

  // discount_percentage comes from the flash_sale object (only present for flash sale products)
  const discountPercentage = Number(product?.flash_sale?.discount_percentage || 0);

  let price = rawPrice;
  let cutPrice = rawCutPrice || 0;
  let discountPercent = null;

  if (discountPercentage > 0 && rawCutPrice) {
    // CASE 1: discount_percentage is present -> calculate actual price from cut_price
    cutPrice = rawCutPrice;
    price = Math.round((rawCutPrice - (rawCutPrice * discountPercentage) / 100) * 100) / 100;
    discountPercent = Math.round(discountPercentage);
  } else if (rawCutPrice && rawCutPrice > rawPrice) {
    // CASE 2: no discount_percentage -> just show price & cut_price as they are
    cutPrice = rawCutPrice;
    price = rawPrice;
    discountPercent = Math.round(((rawCutPrice - rawPrice) / rawCutPrice) * 100);
  } else {
    // No discount at all
    price = rawPrice;
    cutPrice = 0;
    discountPercent = null;
  }

  const stock = activeVariant ? Number(activeVariant.stock) : Number(product?.stock || 0);
  const avgRating = Number(product?.avg_rating ?? 0);
  const totalReviews = Number(product?.total_reviews ?? 0);

  // Zoom calculation handler
  const updateZoom = useCallback((clientX, clientY, currentZoom = zoomLevel) => {
    const container = zoomContainerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const lensWidth = rect.width / currentZoom;
    const lensHeight = rect.height / currentZoom;
    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    const lensLeft = Math.min(Math.max(cursorX - lensWidth / 2, 0), rect.width - lensWidth);
    const lensTop = Math.min(Math.max(cursorY - lensHeight / 2, 0), rect.height - lensHeight);

    setLensBox({ left: lensLeft, top: lensTop, width: lensWidth, height: lensHeight });
    setZoomPane({
      width: rect.width,
      height: rect.height,
      backgroundSize: `${rect.width * currentZoom}px ${rect.height * currentZoom}px`,
      backgroundPosition: `-${lensLeft * currentZoom}px -${lensTop * currentZoom}px`,
    });
  }, [zoomLevel]);

  // Wheel zoom handler: intercept wheel scroll and adjust zoom ratio
  useEffect(() => {
    const container = zoomContainerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      if (!isZooming) return;
      e.preventDefault(); // Stop page scrolling during zoom

      setZoomLevel((prev) => {
        const delta = e.deltaY < 0 ? 0.35 : -0.35;
        const newZoom = Math.min(Math.max(Number((prev + delta).toFixed(2)), 1.8), 6.0);
        updateZoom(cursorCoordsRef.current.clientX, cursorCoordsRef.current.clientY, newZoom);
        return newZoom;
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [isZooming, updateZoom]);

  const changeImage = (index) => {
    setActiveImage(index);
    if (mainSwiperRef.current && !mainSwiperRef.current.destroyed) {
      mainSwiperRef.current.slideTo(index);
    }
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    const firstVariant = (product?.variants || []).find((v) => v.color_name === color);
    if (firstVariant) setSelectedSize(firstVariant.size);

    const colorImagePath = firstVariant?.variant_image?.image_path;
    if (!colorImagePath) return;
    const colorImageUrl = colorImagePath.startsWith("http")
      ? colorImagePath
      : `${IMAGE_BASE_URL}/${colorImagePath}`;
    const imgIndex = productImages.findIndex((img) => img === colorImageUrl);
    if (imgIndex !== -1) changeImage(imgIndex);
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserId();
    if (!token) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
      return;
    }
    if (!userId) {
      toast.error("User information not found. Please log in again.");
      return;
    }
    if (!activeVariant) {
      toast.error("Please select a variant.");
      return;
    }
    setAddingToCart(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: Number(userId),
          product_id: product.id,
          variant_id: activeVariant.id,
          qty: quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) throw new Error(data.message || "Failed to add to cart");
      toast.success(data.message || "Added to cart!");
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    const token = localStorage.getItem("token");
    const userId = getUserId();
    if (!token) {
      window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
      return;
    }
    if (!userId) {
      toast.error("User information not found. Please log in again.");
      return;
    }
    if (!activeVariant) {
      toast.error("Please select a variant.");
      return;
    }
    setBuyingNow(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/add-to-cart`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          user_id: Number(userId),
          product_id: product.id,
          variant_id: activeVariant.id,
          qty: quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) throw new Error(data.message || "Failed to buy item");
      window.dispatchEvent(new Event("cartUpdated"));
      router.push("/Checkout");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBuyingNow(false);
    }
  };

  // Full detailed shimmer skeleton
  if (loading) {
    return (
      <main className="w-full bg-gray-100 min-h-screen">
        <div className="container mx-auto px-3 sm:px-4 py-4 pb-16 sm:py-6">
          {/* Breadcrumbs Shimmer */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-3.5 w-12 bg-gray-200 animate-pulse rounded" />
            <span className="text-gray-300">/</span>
            <div className="h-3.5 w-16 bg-gray-200 animate-pulse rounded" />
            <span className="text-gray-300">/</span>
            <div className="h-3.5 w-32 bg-gray-200 animate-pulse rounded" />
          </div>

          {/* 3 Columns Shimmer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            {/* Col 1: Images */}
            <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
              <div className="w-full h-[380px] sm:h-[450px] lg:h-[500px] bg-gray-200 animate-pulse rounded-2xl border border-gray-300/60" />
              <div className="flex gap-2.5 overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="w-16 h-16 sm:w-18 sm:h-18 bg-gray-200 animate-pulse rounded-xl shrink-0" />
                ))}
              </div>
            </div>

            {/* Col 2: Info & Details */}
            <div className="lg:col-span-5 flex flex-col space-y-4 min-w-0">
              <div className="h-7 sm:h-8 bg-gray-200 animate-pulse rounded-lg w-11/12" />
              <div className="h-3.5 bg-gray-200 animate-pulse rounded w-1/3" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4" />
              <div className="flex items-center gap-3 pt-2">
                <div className="h-8 w-28 bg-gray-200 animate-pulse rounded-md" />
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-md" />
              </div>
              <div className="h-6 w-32 bg-gray-200 animate-pulse rounded-full" />

              {/* Color swatches */}
              <div className="space-y-2 pt-2">
                <div className="h-3.5 w-20 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              </div>

              {/* Size swatches */}
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="flex gap-2">
                  <div className="h-9 w-12 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-9 w-12 bg-gray-200 animate-pulse rounded-lg" />
                  <div className="h-9 w-12 bg-gray-200 animate-pulse rounded-lg" />
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <div className="h-3.5 w-16 bg-gray-200 animate-pulse rounded" />
                <div className="h-9 w-28 bg-gray-200 animate-pulse rounded-lg" />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <div className="h-11 flex-1 bg-gray-200 animate-pulse rounded-lg" />
                <div className="h-11 flex-1 bg-gray-200 animate-pulse rounded-lg" />
              </div>
            </div>

            {/* Col 3: Delivery Sidebar */}
            <div className="lg:col-span-3 w-full h-[460px] bg-gray-200 animate-pulse rounded-2xl" />
          </div>

          {/* Description Section Shimmer */}
          <div className="mt-12 pt-8 border-t border-gray-200 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
              <div className="h-5 w-40 bg-gray-200 animate-pulse rounded" />
            </div>
            <div className="space-y-2.5 max-w-4xl">
              <div className="h-3.5 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-3.5 bg-gray-200 animate-pulse rounded w-5/6" />
              <div className="h-3.5 bg-gray-200 animate-pulse rounded w-4/6" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-gray-500">
        {error || "Product not found."}
      </div>
    );
  }

  return (
    <main className="w-full bg-gray-100">
      <div className="container mx-auto px-3 sm:px-4 py-4 pb-16 sm:py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 overflow-hidden">
          <Link href="/" className="hover:text-black">Home</Link>
          <span>/</span>
          <Link href="/Products" className="hover:text-black">Products</Link>
          <span>/</span>
          <span className="truncate text-gray-900 font-bold">{product.name}</span>
        </nav>

        {/* Product Section 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

          {/* COLUMN 1: Images */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-w-0">
            <div className="relative">
              <div
                ref={zoomContainerRef}
                onMouseEnter={(e) => {
                  if (typeof window !== "undefined" && window.innerWidth >= 1024) {
                    setIsZooming(true);
                    cursorCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
                    updateZoom(e.clientX, e.clientY);
                  }
                }}
                onMouseMove={(e) => {
                  cursorCoordsRef.current = { clientX: e.clientX, clientY: e.clientY };
                  if (isZooming) updateZoom(e.clientX, e.clientY);
                }}
                onMouseLeave={() => setIsZooming(false)}
                className="relative w-full h-[380px] sm:h-[450px] lg:h-[500px] bg-white rounded-2xl overflow-hidden border border-gray-200 group cursor-zoom-in"
              >
                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 ">
                  <WishlistButton productId={product.id} />
                </div>

                {productImages.length > 0 ? (
                  <>
                    <Swiper
                      key={slug}
                      modules={[Navigation]}
                      onSwiper={(swiper) => {
                        mainSwiperRef.current = swiper;
                      }}
                      onSlideChange={(swiper) => setActiveImage(swiper.activeIndex)}
                      onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = prevButtonRef.current;
                        swiper.params.navigation.nextEl = nextButtonRef.current;
                      }}
                      navigation={{
                        prevEl: prevButtonRef.current,
                        nextEl: nextButtonRef.current,
                      }}
                      slidesPerView={1}
                      className="w-full h-full"
                    >
                      {productImages.map((image, idx) => (
                        <SwiperSlide key={idx}>
                          <div className="relative w-full h-full">
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              unoptimized
                              priority={idx === 0}
                              className="object-cover object-center main-product-image"
                            />
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {productImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          ref={prevButtonRef}
                          aria-label="Previous"
                          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white"
                        >
                          <MdChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          ref={nextButtonRef}
                          aria-label="Next"
                          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/90 shadow text-gray-700 flex items-center justify-center hover:bg-white"
                        >
                          <MdChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {isZooming && (
                      <div
                        className="hidden lg:block absolute z-20 border border-emerald-500 bg-emerald-500/20 pointer-events-none transition-[width,height] duration-75 ease-out"
                        style={{
                          left: `${lensBox.left}px`,
                          top: `${lensBox.top}px`,
                          width: `${lensBox.width}px`,
                          height: `${lensBox.height}px`,
                        }}
                      />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    No image available
                  </div>
                )}
              </div>

              {/* Magnifier preview pane */}
              {isZooming && productImages[activeImage] && (
                <div
                  className="hidden lg:block absolute top-0 left-full ml-4 z-40 rounded-2xl border border-gray-200 shadow-2xl bg-white overflow-hidden"
                  style={{
                    width: `${zoomPane.width}px`,
                    height: `${zoomPane.height}px`,
                    backgroundImage: `url(${productImages[activeImage]})`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: zoomPane.backgroundSize,
                    backgroundPosition: zoomPane.backgroundPosition,
                  }}
                />
              )}
            </div>

            {/* Thumbnail Navigation */}
            {productImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {productImages.map((image, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => changeImage(idx)}
                    className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden border cursor-pointer transition shrink-0 ${activeImage === idx
                        ? "border-emerald-600 ring-2 ring-gray-500/40"
                        : "border-gray-200 hover:opacity-80"
                      }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUMN 2: Product Info & Choices */}
          <div className="lg:col-span-5 flex flex-col min-w-0">
            <h1 className="text-[#212121] text-[22px] font-bold break-words capitalize">
              {product.name}
            </h1>

            <p className="text-xs text-gray-500 mt-1">
              Brand: <span className="font-semibold text-gray-800">{product.brand || "Loremipsum"}</span>
            </p>

            {/* Rating Stars */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="text-gray-300 text-sm">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </span>
              <span className="text-xs text-gray-500">
                ({avgRating.toFixed(1)} - {totalReviews} Reviews)
              </span>
            </div>

            {/* Pricing Section */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-xl sm:text-2xl font-bold text-emerald-700">
                Rs {price ? price.toLocaleString() : "0"}
              </span>

              {cutPrice > price && (
                <span className="text-xs sm:text-base text-gray-500 line-through font-medium">
                  Rs {cutPrice.toLocaleString()}
                </span>
              )}

              {discountPercent && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded uppercase">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Stock Badge */}
            <div className="mt-2.5">
              <span className="inline-block bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-semibold px-3 py-1 rounded-full">
                {stock > 0 ? `${stock} Items In Stock` : "Out of Stock"}
              </span>
            </div>

            {/* Color Swatches */}
            {colors.length > 0 && (
              <div className="mt-5">
                <span className="text-sm font-bold text-gray-900 block mb-2.5">
                  Select Color
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((color) => {
                    const variant = (product.variants || []).find((v) => v.color_name === color);
                    const colorImg = variant?.variant_image?.image_path;
                    const isSelected = selectedColor === color;

                    return (
                      <button
                        type="button"
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className={`flex items-center gap-3 px-2 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${isSelected
                            ? "border-slate-400 bg-slate-200/70 text-gray-900"
                            : "border-slate-200 bg-transparent text-gray-700 hover:border-slate-300"
                          }`}
                      >
                        {colorImg && (
                          <div className="relative w-8 h-8 rounded-md overflow-hidden bg-gray-100 shrink-0">
                            <Image
                              src={
                                colorImg.startsWith("http")
                                  ? colorImg
                                  : `${IMAGE_BASE_URL}/${colorImg}`
                              }
                              alt={color}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="pr-1">{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Swatches */}
            {sizes.length > 0 && (
              <div className="mt-5">
                <span className="text-sm font-bold text-gray-900 block mb-2.5">
                  Select Size
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;
                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-11 h-10 px-3 rounded-lg border text-xs font-bold cursor-pointer transition-colors ${isSelected
                            ? "border-slate-400 bg-slate-200/70 text-gray-900"
                            : "border-slate-200 bg-transparent text-gray-800 hover:border-slate-300"
                          }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description Preview */}
            <div className="mt-5">
              <span className="font-bold text-xs sm:text-sm mb-1 text-gray-900">
                Description
              </span>
              <div
                className="text-gray-700 font-medium text-xs sm:text-sm leading-5 sm:leading-6 line-clamp-1"
                dangerouslySetInnerHTML={{ __html: product.description || "" }}
              />
            </div>

            {/* Quantity */}
            <div className="mt-5">
              <span className="text-sm font-bold text-gray-900 block mb-2">
                Quantity
              </span>
              <div className="inline-flex items-center border border-slate-400 rounded-lg h-10 overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
                  className="w-9 h-full flex items-center justify-center text-gray-700 hover:bg-slate-200/50 text-sm font-medium transition-colors"
                >
                  -
                </button>
                <span className="w-12 h-full flex items-center justify-center text-xs font-bold text-gray-900 border-x border-slate-300">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => quantity < 10 && setQuantity((q) => q + 1)}
                  className="w-9 h-full flex items-center justify-center text-gray-700 hover:bg-slate-200/50 text-sm font-medium transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-1 mt-5">
              <button
                type="button"
                id="addToCartBtn"
                onClick={handleAddToCart}
                disabled={addingToCart || stock === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-black text-white px-2 sm:px-7 py-2.5 cursor-pointer rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-800 transition shadow-sm whitespace-nowrap disabled:opacity-50"
              >
                <FaShoppingCart className="text-sm" />
                <span>{addingToCart ? "Adding..." : "Add To Cart"}</span>
              </button>

              <button
                type="button"
                id="buyNowBtn"
                onClick={handleBuyNow}
                disabled={buyingNow || stock === 0}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#ff4d2d] text-white px-2 sm:px-7 py-2.5 rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#e63e20] transition cursor-pointer shadow-sm whitespace-nowrap disabled:opacity-50"
              >
                <MdFlashOn className="text-lg" />
                <span>{buyingNow ? "Processing..." : "Buy Now"}</span>
              </button>
            </div>
          </div>

          {/* COLUMN 3: Delivery & Protection Sidebar */}
          <div className="lg:col-span-3 w-full">
            <ProductDeliverySidebar brandName={product.brand || "Loremipsum"} />
          </div>
        </div>

        {/* Detailed Description Dropdown Section */}
        <section className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700">
              <MdDescription className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-gray-900">Product Description</h2>
          </div>

          <div
            style={{
              maxHeight: showFullDescription
                ? `${descHeight}px`
                : `${COLLAPSED_DESCRIPTION_HEIGHT}px`,
            }}
            className="overflow-hidden transition-[max-height] duration-500 ease-in-out relative"
          >
            <div
              ref={descriptionRef}
              className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-3"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />
          </div>

          {product.description && descHeight > COLLAPSED_DESCRIPTION_HEIGHT && (
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => setShowFullDescription((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition cursor-pointer"
              >
                <span>{showFullDescription ? "Show Less" : "Read Full Description"}</span>
                <MdKeyboardArrowDown
                  className={`w-4 h-4 transition-transform duration-300 ${showFullDescription ? "rotate-180" : ""
                    }`}
                />
              </button>
            </div>
          )}
        </section>

        {/* Reviews Section */}
        <section className="mt-10">
          <ProductReviews product={product} />
        </section>

        {/* Related Products Section */}
        <section className="mt-10">
          <RelatedProducts slug={product.slug} />
        </section>
      </div>
    </main>
  );
}