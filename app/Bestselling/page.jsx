"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import Link from "next/link";
import { Flame } from "lucide-react";
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

function Bestselling() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBestProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/bestselling`);
        if (!res.ok) throw new Error("Failed to fetch Best Selling Products");
        const response = await res.json();
        setProducts(response.data || response || []);
      } catch (err) {
        console.error("Error fetching Best Selling Products:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBestProducts();
  }, []);

  return (
    <main className="w-full mx-auto container px-3 sm:px-4 sm:pt-4 mb-2 sm:mb-4 lg:mb-2 flex justify-between items-center">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8 container mx-auto items-center justify-center">
          <div className="flex items-center gap-2">
            <Flame className="w-7 h-7 text-pink-600" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight leading-none">
              Bestselling Products
            </h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

        {/* Loading — shimmer skeleton grid */}
        {loading && (
          <div className="container mx-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="relative bg-gray-200 aspect-square w-full animate-pulse">
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-4 sm:h-5 w-14 sm:w-20 bg-gray-300 rounded animate-pulse" />
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />
                </div>
                <div className="p-2 sm:p-3 flex flex-col gap-2">
                  <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / Empty state */}
        {!loading && (error || products.length === 0) && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            {error
              ? "Couldn't load bestselling products."
              : "No bestselling products available."}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="container mx-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                >
                  {/* Top Seller Badge */}
                  {product.product_type === "featured" && (
                    <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider ">
                      Top Seller
                    </span>
                  )}

                  {/* Shared Image Component (Hover-Scrub + WishlistButton) */}
                  <ProductCardImage
                    product={product}
                    discountPercent={cardProduct.discountPercent}
                    badgeType="top-seller"
                  />

                  {/* Shared Card Content */}
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

export default Bestselling;