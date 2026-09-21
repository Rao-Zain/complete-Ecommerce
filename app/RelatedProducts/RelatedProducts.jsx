"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";
import { API_BASE_URL } from "@/lib/config";

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      <div className="aspect-square w-full animate-pulse bg-gray-200" />
      <div className="p-2 sm:p-3 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-14 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function mapToCardProduct(product) {
  const firstVariant = product.variants?.[0];
  const price = firstVariant ? Number(firstVariant.price) : Number(product.price || 0);
  const cutPrice = firstVariant?.cut_price
    ? Number(firstVariant.cut_price)
    : product.cut_price
    ? Number(product.cut_price)
    : null;

  const discountPercent =
    cutPrice !== null && cutPrice > price
      ? Math.round(((cutPrice - price) / cutPrice) * 100)
      : product.discount_percent
      ? Number(product.discount_percent)
      : null;

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

const RelatedProducts = ({ slug }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const fetchingRef = useRef(false);

  // Reset state on slug change
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setFetchError("");
  }, [slug]);

  // Fetch paginated products
  useEffect(() => {
    if (!slug) return;

    let isCancelled = false;
    const isFirstPage = page === 1;

    const fetchRelatedProducts = async () => {
      if (isFirstPage) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      fetchingRef.current = true;

      try {
        const baseUrl = API_BASE_URL || "https://stores.hexalogicx.com";
        const targetUrl = `${baseUrl}/api/products/related/${slug}?page=${page}`;

        const res = await fetch(targetUrl);
        if (!res.ok) {
          throw new Error(`Server returned status: ${res.status}`);
        }

        const json = await res.json();
        if (isCancelled) return;

        const items =
          json?.related_products?.data ||
          json?.related_products ||
          json?.products?.data ||
          json?.products ||
          json?.data?.products ||
          json?.data ||
          (Array.isArray(json) ? json : []);

        setProducts((prev) => {
          if (isFirstPage) return items;
          const existingIds = new Set(prev.map((p) => p.id));
          return [...prev, ...items.filter((p) => !existingIds.has(p.id))];
        });

        const meta = json?.related_products || json?.products || json || {};
        const isEnd =
          (meta.current_page && meta.last_page && meta.current_page >= meta.last_page) ||
          items.length === 0;

        setHasMore(!isEnd);
      } catch (err) {
        if (!isCancelled) {
          console.error("Error loading related products:", err);
          setFetchError(err.message || "Failed to load");
          setHasMore(false);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
          setLoadingMore(false);
          fetchingRef.current = false;
        }
      }
    };

    fetchRelatedProducts();

    return () => {
      isCancelled = true;
    };
  }, [slug, page]);

  // Intersection observer trigger
  const loadMoreRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  return (
    <section className="w-full mt-10">
      {/* Header */}
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <span className="text-emerald-600 flex items-center">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </span>
          Related Products
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Explore more products from this category
        </p>
      </div>

      {/* Initial Load Shimmer */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={`initial-skel-${i}`} />
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && fetchError && (
        <div className="p-4 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
          Error loading related products: {fetchError}
        </div>
      )}

      {/* Empty State */}
      {!loading && !fetchError && products.length === 0 && (
        <div className="p-4 bg-gray-50 text-gray-500 text-sm text-center rounded-lg border border-gray-200">
          No related products found in this category.
        </div>
      )}

      {/* Products Grid */}
      {!loading && products.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  key={product.id}
                  href={`/Productdetail/${product.slug}`}
                  className="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition duration-200 flex flex-col h-full"
                >
                  <ProductCardImage
                    product={product}
                    discountPercent={cardProduct.discountPercent}
                  />
                  <ProductCardContent product={cardProduct} />
                </Link>
              );
            })}

            {/* Pagination Load More Shimmer Cards */}
            {loadingMore &&
              Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={`more-skel-${i}`} />
              ))}
          </div>

          {/* Sentinel element to trigger next page fetch */}
          {hasMore && <div ref={loadMoreRef} className="w-full h-8" />}
        </>
      )}
    </section>
  );
};

export default RelatedProducts;