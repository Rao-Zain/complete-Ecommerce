"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import {
  MdFlashOn,
  MdChevronLeft,
  MdChevronRight,
  MdDescription,
  MdKeyboardArrowDown,
} from "react-icons/md";

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

  // Full description expand/collapse
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Measured height of the full description content, so we can
  // animate max-height smoothly instead of an abrupt clamp toggle.
  const descriptionRef = useRef(null);
  const [descHeight, setDescHeight] = useState(0);

  // Collapsed preview height in px (roughly a few lines of text).
  const COLLAPSED_DESCRIPTION_HEIGHT = 110;

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
  // IMAGE ZOOM (magnifier)
  // =========================================================

  // How much the side panel magnifies the lens area. 2.2 means the
  // lens shows a region that's displayed 2.2x larger in the panel.
 const MIN_ZOOM_LEVEL = 3.5;
  const MAX_ZOOM_LEVEL = 7;
  const [zoomLevel, setZoomLevel] = useState(3.5);

  // Tracks last cursor position so we can re-run updateZoom when the
  // zoom level changes via the wheel, without needing a new mouse move.
  const lastMousePos = useRef({ x: 0, y: 0 });

    // Mirrors zoomLevel so the wheel listener effect below doesn't need
  // zoomLevel in its dependency array (which was causing the native
  // listener to be removed/re-added on every single scroll tick).
  const zoomLevelRef = useRef(zoomLevel);

  useEffect(() => {
    zoomLevelRef.current = zoomLevel;
  }, [zoomLevel]);

    const zoomContainerRef = useRef(null);
  const [isZooming, setIsZooming] = useState(false);
  const [lensBox, setLensBox] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [zoomPane, setZoomPane] = useState({
    width: 0,
    height: 0,
    backgroundSize: "0px 0px",
    backgroundPosition: "0px 0px",
  });

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

        // Reset description toggle for the new product
        setShowFullDescription(false);

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
  // MEASURE FULL DESCRIPTION HEIGHT (for smooth expand/collapse)
  // =========================================================

  useEffect(() => {
    if (!descriptionRef.current) return;

    const measure = () => {
      if (descriptionRef.current) {
        setDescHeight(descriptionRef.current.scrollHeight);
      }
    };

    measure();

    // Images inside the description HTML don't have a height until
    // they load, so re-measure once each one finishes loading —
    // otherwise the expanded height would be measured too short.
    const images = descriptionRef.current.querySelectorAll("img");

    images.forEach((img) => {
      if (!img.complete) {
        img.addEventListener("load", measure);
      }
    });

    return () => {
      images.forEach((img) => img.removeEventListener("load", measure));
    };
  }, [product?.description]);

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
  // IMAGE ZOOM (magnifier) HANDLERS
  // =========================================================

  const updateZoom = (clientX, clientY) => {
    const container = zoomContainerRef.current;
    if (!container) return;

    lastMousePos.current = { x: clientX, y: clientY };

    const rect = container.getBoundingClientRect();

    const lensWidth = rect.width / zoomLevel;
    const lensHeight = rect.height / zoomLevel;

    const cursorX = clientX - rect.left;
    const cursorY = clientY - rect.top;

    // Clamp so the lens never travels outside the image bounds.
    const lensLeft = Math.min(
      Math.max(cursorX - lensWidth / 2, 0),
      rect.width - lensWidth
    );
    const lensTop = Math.min(
      Math.max(cursorY - lensHeight / 2, 0),
      rect.height - lensHeight
    );

    setLensBox({ left: lensLeft, top: lensTop, width: lensWidth, height: lensHeight });

    setZoomPane({
      width: rect.width,
      height: rect.height,
      backgroundSize: `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`,
      backgroundPosition: `-${lensLeft * zoomLevel}px -${lensTop * zoomLevel}px`,
    });
  };

  const handleZoomEnter = (e) => {
    // Only worth it when there's an image, and only on screens wide
    // enough to actually show the side panel (matches the lg:block
    // below), otherwise there'd be nothing to see.
    if (productImages.length === 0) return;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    setIsZooming(true);
    updateZoom(e.clientX, e.clientY);
  };

  const handleZoomMove = (e) => {
    if (!isZooming) return;
    updateZoom(e.clientX, e.clientY);
  };

  const handleZoomLeave = () => {
    setIsZooming(false);
  };

  const handleZoomWheel = (e) => {
    if (productImages.length === 0) return;
    if (typeof window !== "undefined" && window.innerWidth < 1024) return;

    // Stop the page from scrolling while the user zooms in/out.
    e.preventDefault();

       setZoomLevel((prev) => {
      const next = prev - e.deltaY * 0.006;
      return Math.min(MAX_ZOOM_LEVEL, Math.max(MIN_ZOOM_LEVEL, next));
    });

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  // Re-run updateZoom whenever zoomLevel changes (from the wheel),
  // using the last known cursor position instead of waiting for
  // another mousemove event.
  useEffect(() => {
    if (isZooming) {
      updateZoom(lastMousePos.current.x, lastMousePos.current.y);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoomLevel]);

  // React's onWheel prop is attached as a passive listener, so
  // e.preventDefault() inside it silently fails and the page still
  // scrolls. Attaching the listener manually with { passive: false }
  // is the only reliable way to actually block page scroll while
  // zooming.
   useEffect(() => {
    const node = zoomContainerRef.current;
    if (!node) return;

    node.addEventListener("wheel", handleZoomWheel, { passive: false });

    return () => {
      node.removeEventListener("wheel", handleZoomWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isZooming, productImages.length]);

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

  const [buyingNow, setBuyingNow] = useState(false);

  const handleBuyNow = async () => {
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

    setBuyingNow(true);

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

      // Let Navbar and any other cart-count listeners know — this is a
      // real cart mutation now, so it should behave like Add to Cart.
      window.dispatchEvent(new Event("cartUpdated"));

      // Only navigate once the item is confirmed saved server-side.
      router.push("/Checkout");
    } catch (err) {
      console.error("BUY NOW ERROR:", err);
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBuyingNow(false);
    }
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
    <main className="w-full overflow-x-hidden bg-gray-100">
      <div className=" jsx-1f9b9be4d21d2b8f w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8">
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

        <div className={`g grid
          grid-cols-1
          md:grid-cols-2
          lg:grid-cols-12
          gap-6
          sm:gap-8
          lg:gap-10
          xl:gap-12`}>
          {/* =================================================
              IMAGE AREA
          ================================================= */}

          <section className={`flex
            flex-col
            gap-3
            sm:gap-4
            md:col-span-1
            lg:col-span-5
            min-w-0`}>


            {/* Outer wrapper has no overflow-hidden, so the zoom
                pane (positioned just outside the image box) isn't
                clipped by the image's own rounded-corner overflow. */}
            <div className="relative">
                                       <div
                ref={zoomContainerRef}
                onMouseEnter={handleZoomEnter}
                onMouseMove={handleZoomMove}
                onMouseLeave={handleZoomLeave}
                className={`relative
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
                lg:cursor-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22 viewBox=%220 0 28 28%22><circle cx=%2214%22 cy=%2214%22 r=%2211%22 fill=%22white%22 stroke=%22%23222%22 stroke-width=%222%22/><circle cx=%2214%22 cy=%2214%22 r=%222%22 fill=%22%23222%22/><line x1=%2214%22 y1=%224%22 x2=%2214%22 y2=%228%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2214%22 y1=%2220%22 x2=%2214%22 y2=%2224%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%224%22 y1=%2214%22 x2=%228%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2220%22 y1=%2214%22 x2=%2224%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/></svg>')_14_14,zoom-in]`}> 
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
                          className={`
                            absolute left-2 top-1/2 -translate-y-1/2 z-10
                            w-8 h-8 sm:w-10 sm:h-10
                            flex items-center justify-center
                            rounded-full bg-white/90 shadow-md
                            text-gray-700 hover:bg-white
                            opacity-0 group-hover:opacity-100
                            sm:opacity-100
                            transition-opacity
                          `}
                        >
                          <MdChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>

                        <button
                          type="button"
                          ref={nextButtonRef}
                          aria-label="Next image"
                          className={`
                            absolute right-2 top-1/2 -translate-y-1/2 z-10
                            w-8 h-8 sm:w-10 sm:h-10
                            flex items-center justify-center
                            rounded-full bg-white/90 shadow-md
                            text-gray-700 hover:bg-white
                            opacity-0 group-hover:opacity-100
                            sm:opacity-100
                            transition-opacity
                          `}
                        >
                          <MdChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      </>
                    )}

                    {/* Lens — the highlighted square on the original
                        image that shows which part is being magnified. */}
                {isZooming && (
                      <div
                        className="hidden lg:block absolute z-20 border-2 border-green-500 bg-green-500/25 pointer-events-none"
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
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-sm">
                      No image available
                    </span>
                  </div>
                )}
              </div>

              {/* Zoom pane — magnified view of whatever's under the
                  lens, shown beside the image on large screens only. */}
              {isZooming && productImages[activeImage] && (
                <div
                  className="hidden lg:block absolute top-0 left-full ml-4 z-30 rounded-lg border border-gray-200 shadow-xl bg-white overflow-hidden"
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


            {/* ===============================================
                THUMBNAILS
            =============================================== */}

            {productImages.length > 1 && (
              <div className={`flex
                gap-2
                sm:gap-3
                overflow-x-auto
                overflow-y-hidden
                pb-2
                px-1
                scrollbar-thin
                snap-x`}>
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
                      className={`
                        !w-[56px] !h-[56px]
                        sm:!w-[78px] sm:!h-[78px]
                        md:!w-[86px] md:!h-[86px]
                        lg:!w-[82px] lg:!h-[82px]
                        xl:!w-[90px] xl:!h-[90px]
                      `}
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
                                       ${activeImage === index
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

          <section className={`flex
            flex-col
            min-w-0
            md:col-span-1
            lg:col-span-7`}>
            {/* PRODUCT NAME */}

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 capitalize">
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

            {/* SHORT DESCRIPTION (teaser, clamped to 2 lines) */}
            {/* This is intentionally always clamped — it's just a
                preview. The full description with images/headings
                lives in the "Product Description" section below the
                buttons, with its own show more / show less toggle. */}

            <div className="mt-5 sm:mt-4">
              <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                Description
              </h2>

              <div
                className="mt-1 text-xs sm:text-sm text-gray-600 leading-6 break-words line-clamp-2"
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
                          <div className={` relative
                          w-[26px]
                          h-[26px]
                          rounded
                          overflow-hidden
                          flex-shrink-0
                          border
                          border-gray-200`}>
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

              <div className={`flex
                items-center
                border
                border-gray-300
                rounded-md
                w-[110px]
                h-10
                overflow-hidden`}>
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
                className={`
                  w-full sm:w-[180px] h-11 rounded-md bg-black text-white
                  text-sm font-medium hover:bg-gray-800 cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed transition
                `}
              >
                {addingToCart ? "Adding..." : "Add To Cart"}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={buyingNow || !activeVariant || stock === 0}
                className={`
    w-full sm:w-[180px] h-11 rounded-md bg-orange-600 text-white
    text-sm font-medium hover:bg-orange-700 cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed transition
    flex items-center justify-center gap-1
  `}
              >
                <MdFlashOn className="w-5 h-5" />
                {buyingNow ? "Processing..." : "Buy Now"}
              </button>
            </div>
          </section>
        </div>

        {/* ==================================================
            FULL PRODUCT DESCRIPTION (with images/headings/text)
            Collapsed by default, expands on "Read Full Description".
        ================================================== */}

       <section className="mt-8 sm:mt-10 lg:mt-12">
  <div className="rounded-xl bg-gray-100 ">
    {/* Header row: icon + title on the left, badge on the right */}
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 text-green-700">
          <MdDescription className="w-5 h-5" />
        </span>

        <h2 className="text-base sm:text-lg font-bold text-gray-900">
          Product Description
        </h2>
      </div>

      <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-700">
        OVERVIEW
      </span>
    </div>

    {/* Description content — full HTML from the backend
        (headings, paragraphs, images, lists, etc). The
        outer wrapper animates max-height smoothly between
        a collapsed preview and the full measured height. */}
    <div className="relative">
      <div
        style={{
          maxHeight: showFullDescription
            ? `${descHeight}px`
            : `${COLLAPSED_DESCRIPTION_HEIGHT}px`,
        }}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
      >
        <div
          ref={descriptionRef}
          className="product-description-content text-gray-600 text-xs sm:text-sm leading-6 break-words"
          dangerouslySetInnerHTML={{
            __html: product.description || "",
          }}
        />
      </div>
    </div>

    {/* Toggle button — only worth showing if there's actually
        more content than the collapsed preview reveals. */}
    {product.description && descHeight > COLLAPSED_DESCRIPTION_HEIGHT && (
      <div className="flex justify-center mt-4">
        <button
          type="button"
          onClick={() => setShowFullDescription((prev) => !prev)}
          className={`
            inline-flex items-center gap-1.5
            px-4 py-2 rounded-full
            bg-gray-900 text-white
            text-xs sm:text-sm font-medium
            hover:bg-black cursor-pointer
            transition-colors duration-200
          `}
        >
          {showFullDescription ? "Show Less" : "Read Full Description"}
          <MdKeyboardArrowDown
            className={`w-4 h-4 transition-transform duration-500 ease-in-out ${
              showFullDescription ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
    )}
  </div>
</section>
        {/* Scoped styling for the raw HTML injected via
            dangerouslySetInnerHTML above. Since there's no
            tailwind.config.js / typography plugin, headings,
            lists, images, and links from the backend are styled
            here instead — :global() lets styled-jsx reach inside
            content it didn't compile itself. */}
               <style jsx>{`
          /* Swiper's grabCursor prop sets cursor:grab on its own
             internal element, which overrides our custom zoom
             cursor on the parent container since it's more deeply
             nested. Force it back to our cursor at lg breakpoint,
             where the zoom feature is active. */
          @media (min-width: 1024px) {
            :global(.product-main-swiper.swiper-grab-cursor) {
              cursor: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22 viewBox=%220 0 28 28%22><circle cx=%2214%22 cy=%2214%22 r=%2211%22 fill=%22white%22 stroke=%22%23222%22 stroke-width=%222%22/><circle cx=%2214%22 cy=%2214%22 r=%222%22 fill=%22%23222%22/><line x1=%2214%22 y1=%224%22 x2=%2214%22 y2=%228%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2214%22 y1=%2220%22 x2=%2214%22 y2=%2224%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%224%22 y1=%2214%22 x2=%228%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2220%22 y1=%2214%22 x2=%2224%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/></svg>') 14 14, zoom-in !important;
            }
            :global(.product-main-swiper.swiper-grab-cursor.swiper-grabbing) {
              cursor: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2228%22 height=%2228%22 viewBox=%220 0 28 28%22><circle cx=%2214%22 cy=%2214%22 r=%2211%22 fill=%22white%22 stroke=%22%23222%22 stroke-width=%222%22/><circle cx=%2214%22 cy=%2214%22 r=%222%22 fill=%22%23222%22/><line x1=%2214%22 y1=%224%22 x2=%2214%22 y2=%228%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2214%22 y1=%2220%22 x2=%2214%22 y2=%2224%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%224%22 y1=%2214%22 x2=%228%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/><line x1=%2220%22 y1=%2214%22 x2=%2224%22 y2=%2214%22 stroke=%22%23222%22 stroke-width=%222%22/></svg>') 14 14, zoom-in !important;
            }
          }

          .product-description-content :global(h1),
          .product-description-content :global(h2),
          .product-description-content :global(h3),
          .product-description-content :global(h4) {
            font-weight: 700;
            color: #111827;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .product-description-content :global(p) {
            margin-bottom: 0.75rem;
          }
          .product-description-content :global(ul) {
            list-style: disc;
            margin: 0.5rem 0 0.75rem 1.25rem;
          }
          .product-description-content :global(ol) {
            list-style: decimal;
            margin: 0.5rem 0 0.75rem 1.25rem;
          }
          .product-description-content :global(li) {
            margin-bottom: 0.25rem;
          }
          .product-description-content :global(img) {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 0.75rem 0;
          }
          .product-description-content :global(a) {
            color: #16a34a;
            text-decoration: underline;
          }
          .product-description-content :global(strong),
          .product-description-content :global(b) {
            font-weight: 600;
            color: #111827;
          }
        `}</style>

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