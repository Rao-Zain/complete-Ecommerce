"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

// Shimmer / skeleton card
function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="h-48 sm:h-56 w-full animate-pulse bg-gray-200" />
            <div className="p-3 sm:p-4 space-y-2">
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

const FlashSales = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const [wishlistIds, setWishlistIds] = useState([]);

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
        e.preventDefault();
        e.stopPropagation();

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

        setWishlistIds(updated);
        localStorage.setItem("wishlist", JSON.stringify(updated));
        window.dispatchEvent(new Event("wishlistUpdated"));

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
            setWishlistIds(wishlistIds);
            localStorage.setItem("wishlist", JSON.stringify(wishlistIds));
            window.dispatchEvent(new Event("wishlistUpdated"));
        }
    };

    useEffect(() => {
        setLoading(true);
        fetch(`https://stores.hexalogicx.com/api/flash-sale-products`)
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
        <section className="bg-gray-50 py-6">
            <div className="container mx-auto px-3 sm:px-6 md:px-7">
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
                        className="hidden sm:flex items-center gap-1 text-emerald-700 text-sm font-medium hover:underline whitespace-nowrap"
                    >
                        More Products <span aria-hidden>→</span>
                    </Link>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                        {products.map((product) => {
                            const firstVariant = product.variants?.[0];
                            const price = firstVariant ? Number(firstVariant.price) : null;
                            const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

                            const discountPercent =
                                price !== null && cutPrice !== null && cutPrice > price
                                    ? Math.round(((cutPrice - price) / cutPrice) * 100)
                                    : product.discount_percent || null;

                            const totalStock =
                                product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

                            const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);
                            const avgRating =
                                reviews.length > 0
                                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                                    : 0;

                            const imagePath = product.main_variant_image?.image_path;
                            const isWishlisted = wishlistIds.includes(product.id);

                            return (
                                <Link
                                    href={`/Productdetail/${product.slug}`}
                                    key={product.id}
                                    className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
                                >
                                    {/* Image */}
                                    <div className="relative bg-gray-100 h-48 sm:h-56 w-full overflow-hidden">
                                        {discountPercent !== null && (
                                            <span className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded z-10">
                                                <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                                    <path d="M13 2L3 14h7l-1 8 11-14h-8l1-6z" />
                                                </svg>
                                                {discountPercent}% OFF
                                            </span>
                                        )}

                                        <button
                                            onClick={(e) => toggleWishlist(e, product.id)}
                                            className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                        >
                                            <svg
                                                className={`w-4 h-4 ${
                                                    isWishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-current"
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
                                                sizes="(max-width: 480px) 50vw, (max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                                                className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-110"
                                            />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-3 sm:p-4 flex flex-col flex-grow">
                                        <h4 className="font-semibold text-sm sm:text-base text-gray-900 truncate group-hover:text-black capitalize">
                                            {product.name}
                                        </h4>
                                        <p
                                            className="text-xs sm:text-sm text-gray-500 mt-0.5 line-clamp-1"
                                            dangerouslySetInnerHTML={{ __html: product.description || "" }}
                                        />

                                        {/* Rating */}
                                        <div className="flex items-center mt-1.5">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                                        i < Math.floor(avgRating)
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-gray-300 fill-gray-200"
                                                    }`}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                                </svg>
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({avgRating.toFixed(1)})
                                            </span>
                                        </div>

                                        {/* Price + Stock */}
                                        <div className="mt-2 flex items-center justify-between gap-1">
                                            <div className="flex flex-col">
                                                {price !== null && (
                                                    <span className="text-emerald-600 font-bold text-base sm:text-lg leading-tight">
                                                        Rs {price.toLocaleString()}
                                                    </span>
                                                )}
                                                {cutPrice !== null && cutPrice > price && (
                                                    <span className="text-gray-400 text-xs line-through leading-tight">
                                                        Rs {cutPrice.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="bg-emerald-100 rounded-full text-emerald-700 text-[10px] sm:text-xs font-medium px-2 py-0.5 border border-emerald-100 whitespace-nowrap">
                                                <span className="text-emerald-800 font-bold">{totalStock}</span> In Stock
                                            </span>
                                        </div>
                                    </div>
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