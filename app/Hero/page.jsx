"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const Hero = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sliders`);
        if (!res.ok) throw new Error("Failed to fetch sliders");
        const response = await res.json();
        setSliders(response.data || []);
      } catch (err) {
        console.error("Error fetching sliders:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, []);

  if (loading) {
  return (
    <div className="relative w-full h-[180px] xs:h-[220px] sm:h-[320px] md:h-[380px] lg:h-[435px] overflow-hidden bg-gray-200">
      {/* Shimmer layer */}
      <div className="absolute inset-0 shimmer" />

      {/* Fake content to resemble the actual hero */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-2xl px-6 text-center">
          {/* Heading skeleton */}
          <div className="mx-auto h-8 lg:h-12 w-2/3 rounded-md bg-gray-300" />

          {/* Description skeleton */}
          <div className="mx-auto mt-4 h-4 lg:h-6 w-1/2 rounded-md bg-gray-300" />
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
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}

  if (error || sliders.length === 0) {
    return (
      <div className="h-[220px] lg:h-[68vh] lg:mt-0 mt-[40px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        {error ? "Couldn't load slider images." : "No slider images available."}
      </div>
    );
  }

  return (
    <div >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop={sliders.length > 1}
        className="w-full h-[180px] xs:h-[220px] sm:h-[320px] md:h-[380px] lg:h-[435px] object-cover"
      >
        {sliders.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full h-full">
              <Image
                src={`${IMAGE_BASE_URL}/${item.image}`}
                alt={item.heading}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                <div className="text-center text-white px-6">
                  <h1 className="text-3xl lg:text-5xl font-bold">
                    {item.heading}
                  </h1>
                  <p className="mt-4 text-base lg:max-w-4xl lg:text-xl">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Hero;