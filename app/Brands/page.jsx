"use client";

import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useState, useEffect } from "react";

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
        // this endpoint returns a plain array, not { data: [...] }
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
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Brands
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Explore the trusted brands we offer
          </p>
        </div>

        {/* Loading — shimmer grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 pb-10">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-56 w-full animate-pulse rounded-2xl bg-gray-200"
              />
            ))}
          </div>
        )}

        {/* Error / empty state */}
        {!loading && (error || brands.length === 0) && (
          <div className="h-56 w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-2xl">
            {error ? "Couldn't load brands." : "No brands available."}
          </div>
        )}

        {/* Brands Slider */}
        {!loading && !error && brands.length > 0 && (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            pagination={{ clickable: true }}
            loop={brands.length > 5}
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 5 },
            }}
            className="pb-10"
          >
            {brands.map((brand) => (
              <SwiperSlide key={brand.id}>
                <div className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-56 group cursor-pointer flex flex-col justify-end p-4 text-left border border-gray-100">
                  {/* Brand Image */}
                  <div className="absolute inset-0 z-0 bg-gray-200">
                    <Image
                      src={`${IMAGE_BASE_URL}/${brand.image}`}
                      alt={brand.name}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>

                  {/* Brand Info Content */}
                  <div className="relative z-10">
                    <h3 className="text-white font-bold text-base sm:text-lg tracking-wide drop-shadow-sm">
                      {brand.name}
                    </h3>
                    <p className="text-gray-300 text-[11px] mt-0.5 font-medium">
                      {brand.slug}
                    </p>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}

export default Brands;