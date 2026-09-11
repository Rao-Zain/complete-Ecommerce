"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Link from "next/link";
import { Flame } from "lucide-react";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";

// Map a raw API product (variants[], reviews[], etc.) into the flat
// shape ProductCardContent expects — same mapper pattern used on the
// Flash Sales page, just re-declared here since this endpoint's
// response shape differs slightly (no is_approved filter on reviews).
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

function Bestselling() {
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Wishlist state — synced with localStorage "wishlist" key (same key Navbar/Wishlist use)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Safely read + clean auth token from localStorage (handles trim + accidental quotes)
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    let rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    rawToken = rawToken.trim();
    // agar kabhi JSON.stringify ho kar quotes ke sath save ho gaya ho to hatayein
    if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
      rawToken = rawToken.slice(1, -1);
    }
    return rawToken;
  };

  useEffect(() => {
    const fetchBestProducts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/bestselling`);
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

    fetchBestProducts();
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

      // 3. Sirf ADD hone par wishlist page pe redirect karein
      
    } catch (err) {
      console.error("Wishlist toggle error:", err);
      // Rollback on failure
      setWishlistIds(wishlistIds);
      localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  return (
    <main className="w-full mx-auto container px-3 sm:px-4 sm:pt-4 mb-2 sm:mb-4 lg:mb-2 flex justify-between items-center">
      <div className="w-full mx-auto">
        {/* Header Section */}
        <div className="mb-8 container mx-auto items-center justify-center">
          <div className=" flex items-center gap-2">
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
          <div className="container mx-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm"
              >
                {/* Image Container */}
                <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse">

                  {/* Top Seller Skeleton */}
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-4 sm:h-5 w-14 sm:w-20 bg-gray-300 rounded animate-pulse" />

                  {/* Heart Skeleton */}
                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />
                </div>

                {/* Product Info */}
                <div className="p-2 sm:p-3 flex flex-col">

                  {/* Product Name */}
                  <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />

                  {/* Description */}
                  <div className="h-3 w-full bg-gray-200 rounded mt-1.5 animate-pulse" />

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-1.5 sm:mt-2">

                    {/* Stars */}
                    {Array.from({ length: 5 }).map((_, star) => (
                      <div
                        key={star}
                        className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-sm animate-pulse"
                      />
                    ))}

                    {/* Rating Number */}
                    <div className="h-3 w-7 bg-gray-200 rounded ml-1 animate-pulse" />
                  </div>

                  {/* Price & Stock */}
                  <div className="flex items-start justify-between gap-1 mt-2">

                    {/* Price */}
                    <div className="flex flex-col gap-1">

                      {/* Current Price */}
                      <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />

                      {/* Cut Price */}
                      <div className="h-3 w-12 sm:w-16 bg-gray-200 rounded animate-pulse" />

                    </div>

                    {/* Stock Badge */}
                    <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full animate-pulse" />

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error / empty state */}
        {!loading && (error || products.length === 0) && (
          <div className="h-[220px] w-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm rounded-xl">
            {error
              ? "Couldn't load bestselling products."
              : "No bestselling products available."}
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className=" container mx-auto grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
            {products.map((product) => {
              const cardProduct = mapToCardProduct(product);
              const imagePath = product.main_variant_image?.image_path;
              const isWishlisted = wishlistIds.includes(product.id);

              return (
                <Link
                  href={`/Productdetail/${product.slug}`}
                  key={product.id}
                  className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                >
                  {/* Image & Badges Container */}
                  <div className="relative bg-gray-100 h-34 xs:h-36 sm:h-44 md:h-48 lg:h-52 w-full overflow-hidden">
                    {product.product_type === "featured" && (
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider z-10">
                        Top Seller
                      </span>
                    )}

                    <button
                      onClick={(e) => toggleWishlist(e, product.id)}
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <svg
                        className={`w-4 h-4 ${isWishlisted
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
                        className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-110"
                      />
                    )}
                  </div>

                  {/* Shared, consistent content section — same component used on FlashSales */}
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