"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import { FaBagShopping } from "react-icons/fa6";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const Hero = () => {
  const [sliders, setSliders] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const initializeHero = async () => {
      try {
        // 1. Verify if sliders are enabled
        const settingsRes = await fetch("https://stores.hexalogicx.com/api/store-settings");
        if (!settingsRes.ok) throw new Error("Failed to fetch store settings");

        const settingsData = await settingsRes.json();
        const isSlidersEnabled = Boolean(
          settingsData?.data?.is_sliders ?? settingsData?.is_sliders
        );

        if (!isSlidersEnabled) {
          setIsEnabled(false);
          setLoading(false);
          return;
        }

        setIsEnabled(true);

        // 2. Fetch sliders
        const slidersRes = await fetch(`${API_BASE_URL}/api/sliders`);
        if (!slidersRes.ok) throw new Error("Failed to fetch sliders");

        const slidersData = await slidersRes.json();
        const activeList = (slidersData.data || [])
          .filter((s) => s.is_active === 1 || s.is_active === true)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

        setSliders(activeList);
      } catch (err) {
        console.error("Error initializing hero slider:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    initializeHero();
  }, []);

  if (!loading && !isEnabled) return null;

  if (loading) {
    return (
      <div className="w-full">
        <div className="relative w-full aspect-[4/1.5] sm:aspect-[16/6] md:aspect-[4/1] overflow-hidden bg-gray-200">
          <div className="absolute inset-0 shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-2xl px-6 text-center">
              <div className="mx-auto h-6 sm:h-10 w-2/3 rounded-md bg-gray-300" />
              <div className="mx-auto mt-3 h-3 sm:h-5 w-1/2 rounded-md bg-gray-300" />
            </div>
          </div>
        </div>
        <style jsx>{`
          .shimmer {
            background: linear-gradient(
              90deg,
              rgba(229, 231, 235, 0) 0%,
              rgba(255, 255, 255, 0.6) 50%,
              rgba(229, 231, 235, 0) 100%
            );
            background-size: 200% 100%;
            animation: shimmer 1.8s infinite;
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error || sliders.length === 0) {
    return (
      <div className="w-full aspect-[4/1.5] sm:aspect-[16/6] md:aspect-[4/1] flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        {error ? "Couldn't load slider images." : "No slider images available."}
      </div>
    );
  }

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={sliders.length > 1}
        className="heroSwiper w-full aspect-[4/1.5] sm:aspect-[16/6] md:aspect-[4/1] relative overflow-hidden"
      >
        {sliders.map((item) => {
          const showImage = Boolean(Number(item.is_image) && item.image);
          const showTitle = Boolean(Number(item.is_title) && item.heading);
          const showDescription = Boolean(Number(item.is_description) && item.description);
          const showOverlay = showTitle || showDescription;

          return (
            <SwiperSlide key={item.id} className="relative w-full h-full overflow-hidden">
              <div className="relative w-full h-full bg-gray-900">
                {/* Background Image */}
                {showImage ? (
                  <Image
                    src={`${IMAGE_BASE_URL}/${item.image}`}
                    alt={item.heading || "Slider image"}
                    fill
                    priority
                    unoptimized
                    sizes="100vw"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-900" />
                )}

                {/* Overlay Content Matching Reference Design */}
                {showOverlay && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                    <div className="text-center text-white px-3 sm:px-6 max-w-3xl mx-auto pointer-events-auto">
                      {showTitle && (
                        <h1 className="text-sm xs:text-base sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-3 drop-shadow-md">
                          {item.heading}
                        </h1>
                      )}

                      {showDescription && (
                        <p className="text-[10px] xs:text-xs sm:text-sm md:text-base max-w-xs sm:max-w-xl mx-auto mb-2 sm:mb-5 line-clamp-2 sm:line-clamp-none opacity-90">
                          {item.description}
                        </p>
                      )}

                      <Link
                        href="/Product"
                        className="inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black text-[10px] sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition group shadow-lg"
                      >
                        <FaBagShopping className="text-[10px] sm:text-sm group-hover:scale-105 transition-transform" />
                        <span>Shop Now</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Scoped Swiper Arrow & Dot Adjustments */}
      <style jsx global>{`
        .heroSwiper .swiper-button-next,
        .heroSwiper .swiper-button-prev {
          color: white !important;
          width: 1.5rem !important;
          height: 1.5rem !important;
        }
        @media (min-width: 640px) {
          .heroSwiper .swiper-button-next,
          .heroSwiper .swiper-button-prev {
            width: 2.5rem !important;
            height: 2.5rem !important;
          }
        }
        .heroSwiper .swiper-button-next::after,
        .heroSwiper .swiper-button-prev::after {
          font-size: 0.75rem !important;
        }
        @media (min-width: 640px) {
          .heroSwiper .swiper-button-next::after,
          .heroSwiper .swiper-button-prev::after {
            font-size: 1.125rem !important;
          }
        }
        .heroSwiper .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.6;
        }
        .heroSwiper .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default Hero;