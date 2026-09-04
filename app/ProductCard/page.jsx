"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { IMAGE_BASE_URL } from "@/lib/config";

/**
 * Shared product card. Used by both /Categories/[[...slug]] and
 * /ExploreProducts so both pages render identical product tiles.
 */
const ProductCard = ({ product }) => {
    const [isHovered, setIsHovered] = useState(false);

    const firstVariant = product.variants?.[0];
    const price = firstVariant ? Number(firstVariant.price) : null;
    const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

    const totalStock =
        product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;

    const reviews = product.reviews || [];
    const avgRating =
        reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

    const imagePath = product.main_variant_image?.image_path;

    return (
        <Link
            href={`/Productdetail/${product.slug}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
        >
            <div className="bg-white rounded-lg sm:rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                <div className="relative bg-gray-100 h-34 xs:h-36 sm:h-44 md:h-48 lg:h-52 w-full overflow-hidden">
                    {product.product_type === "featured" && (
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider z-10">
                            Top Seller
                        </span>
                    )}

                    <button className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1 sm:p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10">
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            className="object-cover object-center"
                            style={{
                                transform: isHovered ? "scale(1.08)" : "scale(1)",
                                transition: "transform 300ms ease-out",
                            }}
                        />
                    )}
                </div>

                <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between">
                    <div>
                        <h4 className="font-medium xs:text-[14px] md:text-[16px] text-gray-800 truncate capitalize">
                            {product.name}
                        </h4>
                        <p
                            className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-1"
                            dangerouslySetInnerHTML={{ __html: product.description || "" }}
                        />

                        <div className="flex items-center mt-1.5 sm:mt-1">
                            {[...Array(5)].map((_, i) => (
                                <svg
                                    key={i}
                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(avgRating)
                                        ? "text-yellow-400 fill-yellow-400"
                                        : "text-gray-300 fill-gray-200"
                                        }`}
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                            <span className="text-[11px] sm:text-[12px] text-gray-500 ml-1">
                                ({avgRating.toFixed(1)})
                            </span>
                        </div>
                    </div>

                    <div className="mt-1.5 border-gray-100">
                        <div className="flex items-center justify-between gap-1">
                            <div className="flex flex-col">
                                {price !== null && (
                                    <span className="text-emerald-600 font-bold text-sm sm:text-lg md:text-md lg:text-sm leading-tight">
                                        Rs {price.toLocaleString()}
                                    </span>
                                )}
                                {cutPrice !== null && cutPrice > price && (
                                    <span className="text-gray-500 text-[9px] sm:text-[12px] line-through leading-tight">
                                        Rs {cutPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>

                            <span className="bg-emerald-100 mt-1.5 rounded-full text-emerald-700 text-[10px] sm:text-[11px] font-medium px-1 sm:px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap self-start">
                                <span className="text-emerald-800 font-bold text-[10px]">{totalStock}</span> In Stock
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;