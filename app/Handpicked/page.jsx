"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";

// Generates and persists a random guest token
function getOrCreateGuestToken() {
  if (typeof window === "undefined") return "";
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
      <div className="aspect-square w-full animate-pulse bg-gray-200" />
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

// Map a raw API product (variants[], reviews[], etc.) into the flat shape ProductCardContent expects
function mapToCardProduct(product) {
  const firstVariant = product.variants?.[0];
  const price = firstVariant ? Number(firstVariant.price) : Number(product.price || 0);
  const cutPrice = firstVariant?.cut_price ? Number(firstVariant.cut_price) : (product.cut_price ? Number(product.cut_price) : null);

  const discountPercent =
    cutPrice !== null && cutPrice > price
      ? Math.round(((cutPrice - price) / cutPrice) * 100)
      : (product.discount_percent ? Number(product.discount_percent) : null);

  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? (product.stock || 0);
  const inStock = totalStock > 0;

  const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);
  const avgRating =
    product.avg_rating !== undefined && product.avg_rating !== null
      ? Number(product.avg_rating)
      : reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const ratingCount =
    product.total_reviews ??
    product.reviews_count ??
    product.review_count ??
    reviews.length;

  return {
    title: product.name,
    rating: avgRating,
    ratingCount: Number(ratingCount) || 0,
    sold: Number(product.order_items_count ?? product.sold_count ?? product.sold ?? 0),
    price,
    originalPrice: cutPrice && cutPrice > price ? cutPrice : undefined,
    discountPercent: discountPercent || undefined,
    inStock,
    freeDelivery: product.free_delivery ?? inStock,
  };
}

function Handpicked() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const fetchedPages = useRef(new Set());
  const loaderRef = useRef(null);
  const observerRef = useRef(null);

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

  useEffect(() => {
    fetchProducts(page, page === 1);
  }, [page, fetchProducts]);

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
      { threshold: 0.5 }
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
      <div className="mx-auto container px-3 sm:px-4">
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

        {/* Initial Skeleton */}
        {initialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full w-full"
                >
                  {/* Shared Image Component (Hover-Scrub + Badges + WishlistButton) */}
                  <ProductCardImage
                    product={product}
                    
                  />

                  {/* Shared Card Content Section */}
                  <ProductCardContent product={cardProduct} />
                </Link>
              );
            })}

            {loadingMore &&
              Array.from({ length: PER_PAGE }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
          </div>
        )}

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