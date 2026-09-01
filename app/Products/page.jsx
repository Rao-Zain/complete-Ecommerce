"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Link from "next/link";
import Image from "next/image";

// Generates and persists a random guest token the first time a visitor
// with no user token loads the page, so their activity can be tracked
// across requests even before they log in.


function getOrCreateGuestToken() {
  let guestToken = localStorage.getItem("guest_unique_token");
  if (!guestToken) {
    guestToken =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `guest-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("guest_unique_token", guestToken);
  }
  return guestToken;
}

const PER_PAGE = 12;

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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
  );
}

function Products() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  // Prevents the same page from being fetched twice (e.g. fast scroll + StrictMode double-effect)
  const fetchedPages = useRef(new Set());
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

  // Mirrors of state that the IntersectionObserver callback reads. The
  // callback is created ONCE (see the observer effect below) so it can't
  // rely on state values from the render it was created in — it needs a
  // ref to always see the latest value.
  const hasMoreRef = useRef(true);
  const fetchingRef = useRef(false);

  // Wishlist state — synced with localStorage "wishlist" key (same key Navbar/Bestselling use)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Safely read + trim auth token from localStorage
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    const rawToken = localStorage.getItem("token");
    return rawToken ? rawToken.trim() : null;
  };

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  const fetchProducts = useCallback(async (pageToFetch, isInitial) => {
    if (fetchedPages.current.has(pageToFetch) || fetchingRef.current) return;
    fetchedPages.current.add(pageToFetch);
    fetchingRef.current = true;

    if (isInitial) setInitialLoading(true);
    else setLoadingMore(true);

    try {
      const userToken = localStorage.getItem("token") || "";
      const guestToken = userToken ? "" : getOrCreateGuestToken();

      const res = await fetch(
        `${API_BASE_URL}/api/all-products?page=${pageToFetch}&per_page=${PER_PAGE}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(userToken && { Authorization: `Bearer ${userToken}` }),
            ...(!userToken && guestToken && { "X-Guest-Token": guestToken }),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch products");
      const response = await res.json();

      // depends on your Laravel response shape (paginated vs plain array)
      const items = response.data || response || [];
      const meta = response.meta || {};

      setProducts((prev) => {
        // Guard against duplicates if a page ever gets fetched twice
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = items.filter((p) => !existingIds.has(p.id));
        return [...prev, ...newOnes];
      });

      const more =
        typeof meta.has_more === "boolean"
          ? meta.has_more
          : meta.current_page && meta.last_page
          ? meta.current_page < meta.last_page
          : items.length === PER_PAGE;

      setHasMore(more);
      hasMoreRef.current = more;
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(true);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
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

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-red-500 text-2xl">🛒</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Products
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

        {/* Initial skeleton — first load only */}
        {initialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!initialLoading && error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            Couldn't load products.
          </div>
        )}

        {!initialLoading && !error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            No products available.
          </div>
        )}

        {/* Products Grid */}
        {!initialLoading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {products.map((product) => {

              const firstVariant = product.variants?.[0];
              const price = firstVariant ? Number(firstVariant.price) : null;
              const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

              const totalStock =
                product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

              const avgRating = product.avg_rating ?? 0;

              const imagePath = product.main_variant_image?.image_path;

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                >
                  <div>
                    {/* Image & Badges Container */}
                    <div className="relative bg-gray-100 lg:h-56 xs:h-36 sm:h-44 md:h-48 w-full">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                        }}
                        className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1 sm:p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>

                      <div className="w-full h-full relative">
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
                    </div>

                    {/* Product Info */}
                    <div className="p-2 sm:p-3">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <p
                        className="text-[10px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: product.description || "" }}
                      />

                      {/* Rating */}
                      <div className="flex items-center mt-1.5 sm:mt-2">
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
                        <span className="text-[9px] sm:text-[10px] text-gray-500 ml-1">
                          ({avgRating.toFixed(1)})
                        </span>
                      </div>

                      {/* Pricing & Stock */}
                      <div className="mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex flex-col">
                            {price !== null && (
                              <span className="text-emerald-600 font-bold text-sm sm:text-lg leading-tight">
                                Rs {price.toLocaleString()}
                              </span>
                            )}
                            {cutPrice !== null && cutPrice > price && (
                              <span className="text-gray-400 text-[9px] sm:text-[10px] line-through leading-tight">
                                Rs {cutPrice.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <span className="bg-emerald-50 text-emerald-700 mt-3 text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap self-start">
                            {totalStock} In Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Shimmer placeholders for the page currently being fetched —
                rendered inside the SAME grid so they line up like real
                cards instead of a spinner below the grid. */}
            {loadingMore &&
              Array.from({ length: PER_PAGE }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
          </div>
        )}

        {/* Sentinel — observed by the single IntersectionObserver above */}
        {!initialLoading && products.length > 0 && (
          <div ref={loaderRef} className="w-full h-4" />
        )}

        {!initialLoading && !loadingMore && !hasMore && products.length > 0 && (
          <p className="text-center text-xs sm:text-sm text-gray-400 py-8">
            You've seen it all — no more products.
          </p>
        )}

      </div>
    </main>
  );
}

export default Products;