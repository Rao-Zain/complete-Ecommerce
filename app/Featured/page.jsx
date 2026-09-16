"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import ProductCardImage from "@/app/ProductCardImage/ProductCardImage";

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

  const reviews = product.reviews || [];
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

function Featured() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/featured`);
        if (!res.ok) throw new Error("Failed to fetch Featured Products");
        const response = await res.json();
        setProducts(response.data || response || []);
      } catch (err) {
        console.error("Error fetching Featured Products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <main className="container px-3 sm:px-4 mx-auto bg-gray-50 min-h-screen pb-4">
      <div className="mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: "#fe9900" }}>⭐</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Collections
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

        {/* Skeleton Grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
              >
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
            ))}
          </div>
        )}

        {/* Error / Empty State */}
        {!loading && (error || products.length === 0) && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            {error
              ? "Couldn't load featured products."
              : "No featured products available."}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                >
                  {/* Shared Image Component (Hover-Scrub + Badges + WishlistButton) */}
                  <ProductCardImage
                    product={product}
                    discountPercent={cardProduct.discountPercent}
                    badgeType="featured"
                  />

                  {/* Shared Card Content Section */}
                  <ProductCardContent product={cardProduct} />
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