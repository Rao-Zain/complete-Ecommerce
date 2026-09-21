"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";

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

function mapToCardProduct(product) {
  const firstVariant = product.variants?.[0];

  // Raw fields coming from the API
  const rawPrice = firstVariant ? Number(firstVariant.price) : Number(product.price || 0);
  const rawCutPrice = firstVariant?.cut_price
    ? Number(firstVariant.cut_price)
    : product.cut_price
    ? Number(product.cut_price)
    : null;

  // discount_percentage comes from the flash_sale object (only present for flash sale products)
  const discountPercentage = Number(product.flash_sale?.discount_percentage || 0);

  let price = rawPrice;
  let originalPrice;
  let discountPercent;

  if (discountPercentage > 0 && rawCutPrice) {
    // CASE 1: discount_percentage is present -> calculate actual price from cut_price
    originalPrice = rawCutPrice;
    price = Math.round((rawCutPrice - (rawCutPrice * discountPercentage) / 100) * 100) / 100;
    discountPercent = Math.round(discountPercentage);
  } else if (rawCutPrice && rawCutPrice > rawPrice) {
    // CASE 2: no discount_percentage -> just show price & cut_price as they are
    originalPrice = rawCutPrice;
    price = rawPrice;
    discountPercent = Math.round(((rawCutPrice - rawPrice) / rawCutPrice) * 100);
  } else {
    // No discount at all
    price = rawPrice;
    originalPrice = undefined;
    discountPercent = undefined;
  }

  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) ?? (product.stock || 0);
  const inStock = totalStock > 0;

  return {
    title: product.name,
    rating: Number(product.avg_rating ?? product.rating ?? 0),
    ratingCount: Number(product.total_reviews ?? product.reviews_count ?? product.review_count ?? 0),
    sold: Number(product.order_items_count ?? product.sold_count ?? product.sold ?? 0),
    price,
    originalPrice: originalPrice && originalPrice > price ? originalPrice : undefined,
    discountPercent: discountPercent || undefined,
    inStock,
    freeDelivery: product.free_delivery ?? inStock,
  };
}

function Products() {
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

      const items = response.data || response || [];
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

  useEffect(() => {
    fetchProducts(1, true);
  }, [fetchProducts]);

  useEffect(() => {
    if (initialLoading || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMoreRef.current && !fetchingRef.current) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchProducts(nextPage, false);
            return nextPage;
          });
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(loaderRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [initialLoading, fetchProducts]);

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <main className="bg-gray-50 min-h-screen py-5">
      <div className="container mx-auto px-4 sm:px-4 ">
        {/* Header Section */}
        <div className="mb-4 text-center">
          <div className="flex items-center justify-center gap-2">
          
            <h1 className="text-2xl  font-bold text-gray-900">
             All Products
            </h1>
          </div>
          <p className="text-[16px] text-gray-500 max-w-2xl mx-auto">
            Our top most popular and ordered items
          </p>
        </div>

        {/* Initial skeleton */}
        {initialLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="group bg-white rounded-lg sm:rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between cursor-pointer"
                >
                  {/* Shared Image Component (Hover-Scrub, Badges & Wishlist Button) */}
                  <ProductCardImage
                    product={product}
                    discountPercent={cardProduct.discountPercent}
                  />

                  {/* Shared Card Content */}
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

        {/* Infinite Scroll Sentinel */}
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