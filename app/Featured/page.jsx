"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Wishlist state — synced with localStorage "wishlist" key (same key Navbar/Wishlist/Bestselling use)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Safely read + trim auth token from localStorage
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    const rawToken = localStorage.getItem("token");
    return rawToken ? rawToken.trim() : null;
  };

  useEffect(() => {
    const fetchfeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/featured`);
        if (!res.ok) throw new Error("Failed to fetch Best Selling Products");
        const response = await res.json();
        setProducts(response.data || []);
      } catch (err) {
        console.error("Error fetching Best Selling Products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchfeatured();
  }, []);

  // Load current wishlist ids on mount + keep in sync if changed elsewhere
  useEffect(() => {
    const loadWishlist = () => {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistIds(stored);
    };
    loadWishlist();
    window.addEventListener("wishlistUpdated", loadWishlist);
    window.addEventListener("storage", loadWishlist);
    return () => {
      window.removeEventListener("wishlistUpdated", loadWishlist);
      window.removeEventListener("storage", loadWishlist);
    };
  }, []);

  const toggleWishlist = async (productId) => {
    const userId = localStorage.getItem("userId");
    const token = getAuthToken();

    if (!userId || !token) {
      alert("Wishlist mein add karne ke liye pehle login karein");
      return;
    }

    const numericUserId = Number(userId);
    const numericProductId = Number(productId);

    const isWishlisted = wishlistIds.includes(numericProductId);
    const updated = isWishlisted
      ? wishlistIds.filter((id) => id !== numericProductId)
      : [...wishlistIds, numericProductId];

    // 1. UI + localStorage turant update (heart fill + navbar counter dono sync)
    setWishlistIds(updated);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));

    // 2. Backend ko toggle bhejo — Authorization header zaroori hai warna 401 aata hai
    try {
      const res = await fetch(`${API_BASE_URL}/api/wish-list-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: numericUserId,
          product_id: numericProductId,
        }),
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.message || "Wishlist update failed");
      }
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      // Rollback on failure
      setWishlistIds(wishlistIds);
      localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  return (
<<<<<<< HEAD
    <main className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
=======
    <main className=" container mx-auto bg-gray-50 min-hx-screen pb-4 ">
      <div className=" mx-auto">
>>>>>>> 65b50acb50177747f98ff57508108957f9185176

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: '#fe9900' }}>⭐</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Collections
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
              ? "Couldn't load bestselling products."
              : "No bestselling products available."}
          </div>
        )}

        {/* Products Grid */}
<<<<<<< HEAD
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
           {products.map((product) => {
                        // Variants hold price/stock — use the first variant as the
                        // "default" one shown on the card (adjust this logic if you
                        // want e.g. the cheapest variant or a specific color/size).
                        const firstVariant = product.variants?.[0];
                        const price = firstVariant ? Number(firstVariant.price) : null;
                        const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;
          
                        // Total stock across all variants
                        const totalStock =
                          product.variants?.reduce(
                            (sum, v) => sum + (Number(v.stock) || 0),
                            0
                          ) || 0;
          
                        // Average rating from reviews array
                        const reviews = product.reviews || [];
                        const avgRating =
                          reviews.length > 0
                            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                            : 0;
          
                        const imagePath = product.main_variant_image?.image_path;
                        const isWishlisted = wishlistIds.includes(product.id);
          
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
          
                              <button
                                onClick={() => toggleWishlist(product.id)}
                                className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                              >
                                <svg
                                  className={`w-4 h-4 ${
                                    isWishlisted
                                      ? "fill-red-500 stroke-red-500"
                                      : "fill-none stroke-current"
                                  }`}
                                  viewBox="0 0 24 24"
                                >
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
                                  dangerouslySetInnerHTML={{
                                    __html: product.description || "",
                                  }}
                                />
          
                                {/* Rating */}
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
                                </div>
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
=======
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 ">
            {products.map((product) => {
              const firstVariant = product.variants?.[0];
              const price = firstVariant ? Number(firstVariant.price) : null;
              const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

              const totalStock =
                product.variants?.reduce(
                  (sum, v) => sum + (Number(v.stock) || 0),
                  0
                ) || 0;

              const reviews = product.reviews || [];
              const avgRating =
                reviews.length > 0
                  ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                  : 0;

              const imagePath = product.main_variant_image?.image_path;

              return (

                 <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                >
                  <div
                    key={product.id}
                    className="bg-white rounded-lg sm:rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
                  >
                    {/* Image & Badges Container */}
                    <div className="relative bg-gray-100 h-34 xs:h-36 sm:h-44 md:h-48 w-full">
                      {product.product_type === "featured" && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-yellow-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider z-10">
                          Featured
                        </span>
                      )}

                      <button className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1 sm:p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          sizes="(max-width: 480px) 50vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover object-center"
                        />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between">
                      <div>
                        <h4 className="font-medium xs:text-[14px] md:text-[16px] text-gray-800 truncate group-hover:text-black capitalize">
                          {product.name}
                        </h4>
                        <p
                          className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-1"
                          dangerouslySetInnerHTML={{
                            __html: product.description || "",
                          }}
                        />

                        {/* Rating */}
                        <div className="flex items-center  mt-1.5 sm:mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(avgRating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 fill-gray-200"
                                }`}
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          ))}
                          <span className="text-[11px] sm:text-[12px] text-gray-500 ml-1">
                            ({avgRating.toFixed(1)})
                          </span>
                        </div>
                      </div>

                      {/* Pricing & Stock */}
                      <div className="mt-1.5 border-gray-100">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex flex-col">
                            {price !== null && (
                              <span className="text-emerald-600 font-bold text-sm sm:text-lg md:text-md lg:text-sm leading-tight">
                                Rs {price.toLocaleString()}
                              </span>
                            )}
                            {cutPrice !== null && cutPrice > price && (
                              <span className="text-gray-500 text-[9px] sm:text-[12px] line-through leading-tight">
                                Rs {cutPrice.toLocaleString()}
                              </span>
                            )}
>>>>>>> 65b50acb50177747f98ff57508108957f9185176
                          </div>

                          <span className="bg-emerald-100 mt-1.5 rounded-full text-emerald-700 text-[10px] sm:text-[11px] font-medium px-1 sm:px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap self-start">
                            <span className="text-emerald-800 font-bold text-[10px]">{totalStock}</span>  In Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}

export default Featured;