"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import Image from "next/image";

import "swiper/css";
import "swiper/css/pagination";

const Hero = () => {
  // Static slider data using local images from the public folder
  const staticSliders = [
    {
      id: 1,
      image: "/bag.jpg",
      heading: "Discover Our New Collection",
      description: "Upgrade your style with our latest arrivals and exclusive deals.",
    },
    {
      id: 2,
      image: "/glasses.jpg", // Aap yahan koi aur image bhi de sakte hain misal ke taur par /banner2.jpg
      heading: "Big Summer Sale",
      description: "Get up to 50% off on selected items across all categories.",
    },
    {
      id: 3,
      image: "/promo.jpg",
      heading: "Premium Quality Products",
      description: "Shop with confidence and enjoy fast delivery nationwide.",
    },
  ];

  return (
    <div>
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        loop={staticSliders.length > 1}
        className="h-[220px] lg:h-[78vh] lg:mt-0 mt-[40px]"
      >
        {staticSliders.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full h-full">
              <Image
                src={item.image}
                alt={item.heading}
                fill
                priority
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