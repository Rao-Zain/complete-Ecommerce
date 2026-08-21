"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaShoppingCart, FaStar, FaHeart } from "react-icons/fa";

// 👇 Apni API base yahan set karein (jaisa Navbar mein tha)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://192.168.1.2:8008";

// Shimmer Loader Component for Smooth Loading Experience
const ShimmerLoader = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6 sm:pb-10 sm:pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            {/* 1. BADA BANNER SHIMMER */}
            <div className="w-full bg-gray-300 rounded-2xl p-8 sm:p-12 mb-6 h-48 sm:h-64"></div>

            {/* 2. SUB-CATEGORIES SECTION SHIMMER */}
            <div className="mb-8">
              <div className="w-48 h-6 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-3 flex flex-col items-center">
                    <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. PRODUCTS SECTION SHIMMER (10 Cards) */}
            <div className="mb-6">
              <div className="w-56 h-6 bg-gray-300 rounded mb-4"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl overflow-hidden p-3 shadow-sm">
                    <div className="w-full h-48 lg:h-56 bg-gray-200 rounded-lg mb-3"></div>
                    <div className="w-3/4 h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded mb-3"></div>
                    <div className="flex justify-between items-center">
                      <div className="w-1/3 h-5 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FashionCategory = () => {
  const params = useParams();
  const id = params?.id;

  const [currentCategory, setCurrentCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and products from API based on current id
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/categories/products/${id || 1}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.categories) {
            const matchedCategory = data.categories.find(
              (cat) => cat.id.toString() === id
            );
            setCurrentCategory(matchedCategory || data.categories[0]);
          }

          if (data.products) {
            setProducts(data.products);
          } else if (data.category && data.category.products) {
            setProducts(data.category.products);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, [id]);

  // Agar loading true hai toh Shimmer component render hoga
  if (loading) {
    return <ShimmerLoader />;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6 sm:pb-10 sm:pt-6">
        <div className="flex flex-col gap-6">
          <div className="flex-1">
            {/* 1. BADA BANNER CARD */}
            {currentCategory ? (
              <>
                <div
                  className="relative w-full bg-cover bg-center rounded-2xl p-8 sm:p-12 mb-6 text-white shadow-lg overflow-hidden flex flex-col justify-center"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('http://192.168.1.19:8000/storage/${currentCategory.image}')`,
                    minHeight: "200px",
                  }}
                >
                  <div className="relative z-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-wide">
                      {currentCategory.name}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-200 max-w-xl">
                      Explore our exclusive items and latest trends in {currentCategory.name}. Shop now for the best deals!
                    </p>
                  </div>
                </div>

                {/* 2. CHOTE CARDS SECTION (Sub-Categories) */}
                {currentCategory.children && currentCategory.children.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4 pb-2">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                        <span className="w-2 h-5 bg-pink-600 rounded-full inline-block"></span>
                        Explore Sub-Categories
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                      {currentCategory.children.map((subCat) => (
                        <Link
                          key={subCat.id}
                          href={`/ExploreProducts/${currentCategory.slug}/${subCat.slug}`}
                          className="group bg-white rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                        >
                          <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden mb-2">
                            <img
                              src={`${BASE_URL}/storage/cat_image/${subCat.image}`}
                              alt={subCat.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <h4 className="font-semibold text-xs sm:text-sm text-gray-800 transition-colors line-clamp-1">
                            {subCat.name}
                          </h4>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">All Products</h2>
              </div>
            )}

            {/* 3. PRODUCTS SECTION */}
            <div className="mb-6">
              <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 tracking-tight flex items-center gap-2">
                <span className="w-2 h-5 bg-pink-600 rounded-full inline-block flex-shrink-0"></span>
                <span>{currentCategory ? `Products in ${currentCategory.name}` : "All Products"}</span>
              </h3>

              {products.length === 0 ? (
                <p className="text-gray-500 text-sm">No products found in this category.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {products.map((product) => {
                    const variant = product.main_variant || product.variants?.[0];
                    const imagePath = product.main_variant_image?.image_path
                      ? `${BASE_URL}/storage/${product.main_variant_image.image_path}`
                      : product.image
                        ? `${BASE_URL}/${product.image}`
                        : "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500";

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group w-full flex flex-col justify-between relative"
                      >
                        {/* Top Seller Badge & Heart Icon Over Image */}
                        <div className="relative bg-gray-100 overflow-hidden">
                          <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider uppercase shadow">
                            Top Seller
                          </div>
                          <button
                            type="button"
                            className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-600 shadow hover:text-red-500 transition cursor-pointer border-none"
                          >
                            <FaHeart className="text-xs" />
                          </button>

                          <Link href={`/product/${product.slug}`}>
                            <img
                              src={imagePath}
                              alt={product.name}
                              className="w-full h-48 lg:h-56 object-cover group-hover:scale-105 transition duration-300"
                            />
                          </Link>
                        </div>

                        {/* Card Content */}
                        <div className="p-3 flex flex-col justify-between flex-grow">
                          <div>
                            <Link href={`/product/${product.slug}`}>
                              <h2 className="text-sm font-bold text-gray-800 line-clamp-1 hover:text-black">
                                {product.name}
                              </h2>
                            </Link>
                            <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                              {product.short_description || "Explore high quality and comfortable material..."}
                            </p>

                            {/* Rating Stars */}
                            <div className="flex items-center gap-1 mt-1 text-yellow-400 text-[10px]">
                              {[...Array(5)].map((_, i) => (
                                <FaStar key={i} />
                              ))}
                              <span className="text-gray-400 ml-1">(5.0)</span>
                            </div>
                          </div>

                          {/* Price and Stock Section in One Line */}
                          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                            <div className="flex items-baseline gap-1.5 overflow-hidden">
                              <h3 className="text-sm font-extrabold text-emerald-600 whitespace-nowrap">
                                Rs {Math.floor(Number(variant?.price || product.price)) || "N/A"}
                              </h3>
                              {variant?.cut_price && (
                                <span className="text-[10px] text-gray-400 line-through whitespace-nowrap">
                                  Rs {Math.floor(Number(variant.cut_price))}
                                </span>
                              )}
                            </div>

                            {/* Stock Badge - Compact */}
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
                              {variant?.stock || product.stock || "216"} In Stock
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FashionCategory;