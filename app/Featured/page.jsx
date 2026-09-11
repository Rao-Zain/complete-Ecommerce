"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import Link from "next/link";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";

// Map a raw API product (variants[], reviews[], etc.) into the flat
// shape ProductCardContent expects. Kept local to this page so the
// "featured" endpoint's shape can be normalized independently of any
// other page's mapper.
function mapToCardProduct(product) {
  const firstVariant = product.variants?.[0];
  const price = firstVariant ? Number(firstVariant.price) : 0;
  const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

  const discountPercent =
    cutPrice !== null && cutPrice > price
      ? Math.round(((cutPrice - price) / cutPrice) * 100)
      : product.discount_percent || null;

  const totalStock =
    product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
  const inStock = totalStock > 0;

  const reviews = product.reviews || [];
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    title: product.name,
    rating: avgRating,
    ratingCount: reviews.length,
    sold: product.sold_count || 0,
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

  // Wishlist state — synced with localStorage "wishlist" key (same key Navbar/Wishlist use)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Safely read + clean auth token from localStorage
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    let rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    rawToken = rawToken.trim();
    if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
      rawToken = rawToken.slice(1, -1);
    }
    return rawToken;
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

  const toggleWishlist = async (e, productId) => {
    e.preventDefault();   // parent <Link> ko product detail page pe navigate hone se roke
    e.stopPropagation();  // click event upar Link tak bubble na ho

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

    // 1. UI + localStorage turant update (heart fill + navbar counter dono automatically sync ho jate hain is event se)
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
        console.error("Wishlist API error:", res.status, resData);
        throw new Error(resData.message || `Wishlist update failed (${res.status})`);
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
    <main className=" container px-3 sm:px-4 mx-auto bg-gray-50 min-hx-screen pb-4 ">
      <div className=" mx-auto">

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
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 ">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);
              const imagePath = product.main_variant_image?.image_path;
              const isWishlisted = wishlistIds.includes(product.id);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  // ⬇️ "group" class add ki — is se andar wale image pe group-hover kaam karega
                  className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                >
                  {/* Image & Badges Container */}
                  {/* ⬇️ overflow-hidden add kiya taake zoomed image apni box se bahar na nikle */}
                  <div className="relative bg-gray-100 lg:h-52 xs:h-36 sm:h-44 md:h-48 w-full overflow-hidden">
                    {product.product_type === "featured" && (
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-yellow-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider z-10">
                        Featured
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1 sm:p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <svg
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
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
                        sizes="(max-width: 480px) 50vw, (max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        // ⬇️ zoom transition yahan lagi hai
                        className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    )}
                  </div>

                  {/* Shared, consistent content section — same component used on every page */}
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