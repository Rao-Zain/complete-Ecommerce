"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.1.5:8008";
const IMAGE_BASE_URL = `${API_BASE_URL}/storage`;

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
      <div className="h-[220px] lg:h-[78vh] lg:mt-0 mt-[40px] w-full animate-pulse bg-gray-200" />
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
    <div>
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
                  <p className="mt-4 text-base lg:text-xl">
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