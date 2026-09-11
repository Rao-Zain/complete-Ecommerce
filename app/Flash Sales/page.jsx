"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Heart } from "lucide-react";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import ProductCardContent from "@/app/ProductCardContent/ProductCardContent";
import HoverImageScroll from "@/app/HoverImageScroll/HoverImageScroll";

// Shimmer / skeleton card
function SkeletonCard() {
    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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

// Map a raw API product (variants[], reviews[], etc.) into the flat
// shape ProductCardContent expects. Keeping this in one place means
// every page using ProductCardContent can normalize its own API
// response the same way, even if the raw shapes differ.
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

    const reviews = (product.reviews || []).filter((r) => r.is_approved === 1);
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

// Build the list of image URLs for the hover-scrub gallery.
// TODO: confirm this against your actual API response shape — check
// your network tab for a flash-sale product and see where the second
// image really lives (e.g. product.images[], or per-variant images
// like variant.images[]). Adjust the field names below to match.
// Falls back to just the single main_variant_image if nothing else
// is found, so the card still renders one static image safely.
function getProductImages(product) {
    const fromVariants =
        product.variants
            ?.flatMap((v) => v.images?.map((img) => img.image_path) || [])
            .filter(Boolean) || [];

    const fromGallery =
        product.images?.map((img) => img.image_path || img).filter(Boolean) || [];

    const paths = [...new Set([...fromGallery, ...fromVariants])];

    if (paths.length === 0 && product.main_variant_image?.image_path) {
        paths.push(product.main_variant_image.image_path);
    }

    return paths.map((path) => `${IMAGE_BASE_URL}/${path}`);
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                        {products.map((product) => {
                            const cardProduct = mapToCardProduct(product);
                            const images = getProductImages(product);
                            const isWishlisted = wishlistIds.includes(product.id);

                            return (
                                <Link
                                    href={`/Productdetail/${product.slug}`}
                                    key={product.id}
                                    className="group bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full"
                                >
                                    {/* Discount ribbon */}
                                    {cardProduct.discountPercent && (
                                        <div className="absolute top-2 -left-1 z-10 bg-gradient-to-r from-orange-600 to-amber-500 text-white pl-3 pr-3.5 py-1 rounded-r-full text-[10px] sm:text-[11px] font-extrabold shadow-md flex items-center gap-1 tracking-wide">
                                            <Zap className="w-3 h-3 text-yellow-200 fill-yellow-200" />
                                            <span>{cardProduct.discountPercent}% OFF</span>
                                        </div>
                                    )}

                                    {/* Image with hover-scrub gallery */}
                                    <div className="relative">
                                        <button
                                            onClick={(e) => toggleWishlist(e, product.id)}
                                            className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white rounded-full shadow z-10 hover:bg-gray-50 transition p-1.5"
                                            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                                        >
                                            <Heart
                                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition duration-200 ${
                                                    isWishlisted ? "fill-red-500 stroke-red-500" : "fill-none stroke-gray-600"
                                                }`}
                                            />
                                        </button>

                                        <HoverImageScroll
                                            images={images}
                                            alt={product.name}
                                            className="bg-gray-100 aspect-square w-full"
                                        />
                                    </div>

                                    {/* Shared, consistent content section — same component used on every page */}
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