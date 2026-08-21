"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

function Handpicked() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchfeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/for-you`);
        if (!res.ok) throw new Error("Failed to fetch For You Products");
        const response = await res.json();
        setProducts(response.data || []);
      } catch (err) {
        console.error("Error fetching For You Products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchfeatured();
  }, []);


  return (
    <main className="bg-gray-50  min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-2xl">🌠</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
             Handpicked For you
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

 {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="h-48 w-full animate-pulse bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-3 flex items-center justify-between pt-2">
                    <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

 {!loading && (error || products.length === 0) && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            {error
              ? "Couldn't load For You products."
              : "No For you products available."}
          </div>
        )}



        {/* Products Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
  {products.map((product) => {
    const firstVariant = product.variants?.[0];
    const price = firstVariant ? Number(firstVariant.price) : null;
    const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

    const totalStock =
      product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

    // Only count approved reviews
    const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const imagePath = product.main_variant_image?.image_path;

    return (
      <div
        key={product.id}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
      >
        {/* Image & Badges Container */}
        <div className="relative bg-gray-100 h-48 w-full">
          {product.product_type === "featured" && (
            <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10">
              Featured
            </span>
          )}

          <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {imagePath && (
            <Image
              src={`${IMAGE_BASE_URL}/${imagePath}`}
              alt={product.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover object-center"
            />
          )}
        </div>

        {/* Product Info */}
        <div className="p-3 flex flex-col flex-grow justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {product.name}
            </h3>
            <p
              className="text-xs text-gray-500 mt-0.5 line-clamp-1"
              dangerouslySetInnerHTML={{ __html: product.description || "" }}
            />

            {/* Rating + Review Count */}
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(avgRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300 fill-gray-200"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
              <span className="text-[10px] text-gray-500 ml-1">
                ({avgRating.toFixed(1)})
              </span>
              {reviews.length > 0 && (
                <span className="text-[10px] text-gray-400">
                  · {reviews.length} review{reviews.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            {/* Latest review snippet */}
            {reviews.length > 0 && (
              <p className="text-[11px] text-gray-500 italic mt-1.5 line-clamp-2">
                "{reviews[0].comment}"
              </p>
            )}
          </div>

          {/* Pricing & Stock */}
          <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
            <div className="flex items-baseline gap-1.5">
              {price !== null && (
                <span className="text-emerald-600 font-bold text-lg">
                  Rs {price.toLocaleString()}
                </span>
              )}
              {cutPrice !== null && cutPrice > price && (
                <span className="text-gray-400 text-[10px] line-through">
                  Rs {cutPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span className="bg-emerald-50 text-emerald-700 text-[9px] font-medium px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
              {totalStock} In Stock
            </span>
          </div>
        </div>
      </div>
    );
  })}
</div>
      </div>
    </main>
  );
}

export default Handpicked;