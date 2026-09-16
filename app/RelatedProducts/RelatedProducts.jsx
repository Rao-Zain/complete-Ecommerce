"use client";

import { useState, useEffect } from "react";
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
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!slug) return;

    const fetchRelatedProducts = async () => {
      setLoading(true);
      setFetchError("");
      try {
        // Use API_BASE_URL or fallback directly to stores.hexalogicx.com
        const baseUrl = API_BASE_URL || "https://stores.hexalogicx.com";
        const targetUrl = `${baseUrl}/api/products/related/${slug}`;
        
        console.log("Fetching related products from:", targetUrl);
        const res = await fetch(targetUrl);

        if (!res.ok) {
          throw new Error(`Server returned status: ${res.status}`);
        }
        
        const json = await res.json();
        console.log("Related Products Response:", json);

        // Accommodate multiple possible response structures
        const items =
          json?.related_products ||
          json?.products ||
          json?.data?.products ||
          json?.data ||
          (Array.isArray(json) ? json : []);

        setProducts(items);
      } catch (err) {
        console.error("Error loading related products:", err);
        setFetchError(err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [slug]);

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

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
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
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;