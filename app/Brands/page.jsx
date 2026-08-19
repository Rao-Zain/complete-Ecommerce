'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const brands = [
  {
    id: 1,
    name: "Sana Safinaz",
    category: "Luxury Lawn",
    image: "/sana.png",
  },
  {
    id: 2,
    name: "Khaadi",
    category: "Premium Brand",
    image: "/khaadi.png",
  },
  {
    id: 3,
    name: "Adidas",
    category: "Premium Brand",
    image: "/addidas.png",
  },
  {
    id: 4,
    name: "J.",
    category: "Premium Brand",
    image: "/j..png",
  },
  {
    id: 5,
    name: "Riwaj",
    category: "Premium Brand",
    image: "/logo.jfif",
  },
  {
    id: 6,
    name: "Bata",
    category: "Premium Brand",
    image: "/bata logo.png",
  },
  {
    id: 7,
    name: "Stylo",
    category: "Premium Brand",
    image: "/stylo logo.jfif",
  },
];

function Brands() {
  return (
    <section className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto ">
        
        {/* Section Header */}
        <div className="mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Brands
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Explore the trusted brands we offer
          </p>
        </div>

        {/* Brands Slider */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
          className="pb-10"
        >
          {brands.map((brand) => (
            <SwiperSlide key={brand.id}>
              <div 
                className="relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-56 group cursor-pointer flex flex-col justify-end p-4 text-left border border-gray-100"
              >
                {/* Brand Image */}
                <div className="absolute inset-0 z-0">
                  <Image 
                    src={brand.image} 
                    alt={brand.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                </div>

                {/* Brand Info Content */}
                <div className="relative z-10">
                  <h3 className="text-white font-bold text-base sm:text-lg tracking-wide drop-shadow-sm">
                    {brand.name}
                  </h3>
                  <p className="text-gray-300 text-[11px] mt-0.5 font-medium">
                    {brand.category}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}

export default Brands;