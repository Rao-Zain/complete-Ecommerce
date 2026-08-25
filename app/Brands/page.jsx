"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";
import { Award } from "lucide-react";

import "swiper/css";
import "swiper/css/pagination";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

function Brands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/brands`);
        if (!res.ok) throw new Error("Failed to fetch brands");
        const response = await res.json();
        setBrands(Array.isArray(response) ? response : response.data || []);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return (
    <section className="container mx-auto bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto container">
        {/* Section Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              Our Top Brands
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Browse items from your favorite trustworthy labels
          </p>
        </div>

        {/* Loading — shimmer grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pb-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-36 w-full animate-pulse rounded-xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {/* Error / empty state */}
        {!loading && (error || brands.length === 0) && (
          <div className="h-36 w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            {error ? "Couldn't load brands." : "No brands available."}
          </div>
        )}

        {/* Brands Slider */}
        {!loading && !error && brands.length > 0 && (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={16}
            slidesPerView={6}
            grabCursor={true}
            allowTouchMove={true}
            touchRatio={1}
            simulateTouch={true}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
            }}
            loop={brands.length > 6}
            breakpoints={{
              640: { slidesPerView: 3 },
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 6 },
            }}
            className="brands-swiper pb-10"
          >
            {brands.map((brand) => (
              <SwiperSlide key={brand.id}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 h-36 flex flex-col items-center justify-center gap-3 p-4 cursor-pointer border border-gray-100">
                  {/* Brand Logo */}
                  <div className="relative w-full h-14 flex items-center justify-center pointer-events-none">
                    <Image
                      src={`${IMAGE_BASE_URL}/${brand.image}`}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      className="object-contain"
                    />
                  </div>

                  {/* Brand Name */}
                  <h3 className="text-gray-800 font-semibold text-sm text-center">
                    {brand.name}
                  </h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
<style jsx global>{`
  .brands-swiper {
    padding-bottom: 32px !important;
  }

  .brands-swiper .swiper-pagination {
    bottom: 0 !important;
    display: flex !important;
    justify-content: center;
    align-items: center;
    gap: 5px;
  }

  .brands-swiper .swiper-pagination-bullet {
    width: 8px !important;
    height: 8px !important;
    margin: 0 !important;
    background: #d9d9d9 !important;
    opacity: 1 !important;
    border-radius: 9999px;
    transition: all 0.3s ease;
  }

  .brands-swiper .swiper-pagination-bullet-active {
    width: 8px !important;
    height: 8px !important;
    background: #10b981 !important;
    opacity: 1 !important;
  }
`}</style>

    </section>
  );
}

export default Brands;