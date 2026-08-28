"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Link from "next/link";

// Generates and persists a random guest token the first time a visitor
// with no user token loads the page, so their "for you" activity can be
// tracked across requests even before they log in.
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
      <div className="h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse bg-gray-200" />
      <div className="p-2 sm:p-3 space-y-2">
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

function Handpicked() {
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
        `${API_BASE_URL}/api/products/for-you?page=${pageToFetch}&per_page=${PER_PAGE}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(userToken && { Authorization: `Bearer ${userToken}` }),
            ...(!userToken && guestToken && { "X-Guest-Token": guestToken }),
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch For You Products");
      const response = await res.json();

      const items = response.data || [];
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
      console.error("Error fetching For You Products:", err);
      setError(true);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, []);

  // Initial load — first page
  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  // Infinite scroll: ONE IntersectionObserver for the component's whole
  // lifetime (created only after the initial load finishes, then never
  // recreated). This is the fix for "hits the API multiple times":
  // previously the observer was recreated whenever `hasMore`/`loadingMore`
  // changed, and a brand-new IntersectionObserver fires its callback
  // immediately if the target is already on-screen — so the instant one
  // fetch finished (loadingMore -> false) a fresh observer would fire
  // again right away, even though the user hadn't scrolled any further.
  // Reading `hasMoreRef`/`fetchingRef` inside the callback instead of
  // capturing `hasMore`/`loadingMore` lets a single long-lived observer
  // always act on the latest state without needing to be rebuilt.
  useEffect(() => {
    if (initialLoading || observerRef.current) return;
    const currentLoader = loaderRef.current;
    if (!currentLoader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !fetchingRef.current && hasMoreRef.current) {
          setPage((prev) => {
            const next = prev + 1;
            fetchProducts(next, false);
            return next;
          });
        }
      },
      { rootMargin: "200px" } // start loading a bit before it's fully in view
    );

    observer.observe(currentLoader);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [initialLoading, fetchProducts]);

  return (
    <main className="bg-gray-50 min-h-screen py-4">
      <div className="mx-auto container">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-red-500 text-2xl">🌠</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Handpicked For you
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top picks based on what's popular right now
          </p>
        </div>

        {/* Initial skeleton — first load only */}
        {initialLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {!initialLoading && error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            Couldn't load For You products.
          </div>
        )}

        {!initialLoading && !error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            No For you products available.
          </div>
        )}

        {/* Products Grid */}
        {!initialLoading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {products.map((product) => {
              const firstVariant = product.variants?.[0];
              const price = firstVariant ? Number(firstVariant.price) : null;
              const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

              const totalStock =
                product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

              const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);
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
                  <div className="bg-white rounded-lg sm:rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                    {/* Image & Badges Container */}
                    <div className="relative bg-gray-100 lg:h-52 xs:h-36 sm:h-44 md:h-48 w-full">
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
                        <div className="flex items-center mt-1.5 sm:mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                i < Math.floor(avgRating)
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
                          </div>

                          <span className="bg-emerald-100 mt-1.5 rounded-full text-emerald-700 text-[10px] sm:text-[11px] font-medium px-1 sm:px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap self-start">
                            <span className="text-emerald-800 font-bold text-[10px]">{totalStock}</span> In Stock
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

export default Handpicked;