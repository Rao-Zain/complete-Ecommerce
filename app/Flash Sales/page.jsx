"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";

function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm ${className}`}>
      <div className="aspect-square w-full animate-pulse bg-gray-200" />
      <div className="p-1.5 sm:p-2.5 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
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

// Breakpoint visibility helper
function getVisibilityClass(index) {
  if (index < 4) return "flex"; // First 4 cards visible everywhere
  if (index === 4) return "flex lg:hidden xl:flex"; // 5th card: visible on <lg, hidden on lg (4 cards), visible on xl+
  if (index === 5) return "flex lg:hidden 2xl:flex"; // 6th card: visible on <lg, hidden on lg (4 cards) and xl (5 cards), visible on 2xl+
  return "hidden";
}

function getSkeletonVisibilityClass(index) {
  if (index < 4) return "block";
  if (index === 4) return "block lg:hidden xl:block";
  if (index === 5) return "block lg:hidden 2xl:block";
  return "hidden";
}

const FlashSales = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/flash-sale-products`)
      .then((res) => res.json())
      .then((data) => {
        const items = data.products || data.data || (Array.isArray(data) ? data : []);
        setProducts(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching Flash Sales products:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <section className="bg-gray-50 pt-4">
      <div className="container mx-auto px-3 sm:px-4 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-gray-900">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13 2L3 14h7l-1 8 11-14h-8l1-6z" />
              </svg>
              Flash Sales
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Hurry up! Limited time offers on top products
            </p>
          </div>

          <Link
            href="/FlashSales"
            className="hidden sm:flex items-center gap-1 text-emerald-700 text-sm font-medium hover:text-emerald-900 whitespace-nowrap"
          >
            More Products <span aria-hidden>→</span>
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard
                key={i}
                className={getSkeletonVisibilityClass(i)}
              />
            ))}
          </div>
        )}

        {!loading && error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            Couldn't load Flash Sales products.
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            No Flash Sales products available.
          </div>
        )}

        {/* Products Grid */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
            {products.slice(0, 6).map((product, index) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className={`group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex-col h-full ${getVisibilityClass(
                    index
                  )}`}
                >
                  <ProductCardImage
                    product={product}
                    discountPercent={cardProduct.discountPercent}
                  />
                  <ProductCardContent product={cardProduct} />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default FlashSales;