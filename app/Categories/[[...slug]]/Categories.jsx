'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import ProductCard from "../../ProductCard/page";

/* ------------------------------------------------------------------ */
/* Shimmer for the banner (category landing) view                     */
/* ------------------------------------------------------------------ */
const BannerShimmer = () => (
    <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6 sm:pb-10 sm:pt-6">
            <div className="w-full bg-gray-300 rounded-2xl p-8 sm:p-12 mb-6 h-48 sm:h-64 animate-pulse"></div>
            <div className="mb-8">
                <div className="w-48 h-6 bg-gray-300 rounded mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl p-3 flex flex-col items-center">
                            <div className="w-full h-32 sm:h-40 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                            <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="mb-6">
                <div className="w-56 h-6 bg-gray-300 rounded mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                            <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
                            <div className="p-2 sm:p-3 flex flex-col">
                                <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-full bg-gray-200 rounded mt-1.5 animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/**
 * /Categories/[[...slug]]
 *
 * ONE component now handles category browsing at every depth:
 *   /Categories                          -> all top-level categories + all products
 *   /Categories/men-s-fashion            -> banner + its children + its products
 *   /Categories/men-s-fashion/t-shirts   -> banner + its children + its products
 *   /Categories/men-s-fashion/t-shirts/v-neck -> same pattern, any depth
 *
 * NOTE: the route folder must be named `[[...slug]]` (double brackets —
 * an OPTIONAL catch-all), not `[...slug]`, or `/Categories` with no
 * segments will 404.
 */
const CategoriesPage = () => {
    const params = useParams();
    const pathSegments = params?.slug || [];
    const fullPath = pathSegments.join('/');
    const currentSlug = pathSegments[pathSegments.length - 1] || '';

    const [products, setProducts] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Category tree for the current path (used to find the current node's
    // own name/image/children).
    useEffect(() => {
        setCategoriesLoading(true);
        const categoryPath = fullPath ? `/${fullPath}` : '';

        fetch(`${API_BASE_URL}/api/category-sidebar${categoryPath}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.categories) {
                    setCategoriesData(data.categories);
                }
                setCategoriesLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching categories:", err);
                setCategoriesLoading(false);
            });
    }, [fullPath]);

    // Products belonging to the current category (or all products at root).
    useEffect(() => {
        setLoading(true);
        const categoryPath = fullPath ? `/${fullPath}` : '';

        fetch(`${API_BASE_URL}/api/categories-products${categoryPath}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.products) {
                    setProducts(data.products);
                } else if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    setProducts([]);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching products:", err);
                setLoading(false);
            });
    }, [fullPath]);

    // Finds the exact node (at any depth) matching the current slug, so we
    // can read ITS OWN name/image/children — not a top-level parent's.
    const findCategoryNode = (categories, slug) => {
        for (let cat of categories) {
            if (cat.slug === slug) return cat;
            const children = cat.all_children || cat.children || [];
            if (children.length > 0) {
                const found = findCategoryNode(children, slug);
                if (found) return found;
            }
        }
        return null;
    };

    const currentCategoryNode = currentSlug ? findCategoryNode(categoriesData, currentSlug) : null;

    // At the root (`/Categories`), the "sub-category" grid is simply the
    // full top-level list. At any deeper level, it's the matched node's
    // own children.
    const subCategories = currentCategoryNode
        ? (currentCategoryNode.all_children || currentCategoryNode.children || [])
        : categoriesData;

    if (categoriesLoading) {
        return <BannerShimmer />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6 sm:pb-10 sm:pt-6">
                <div className="flex flex-col gap-6">
                    <div className="flex-1">
                        {currentCategoryNode ? (
                            <>
                                {/* BANNER */}
                                <div
                                    className="relative w-full bg-cover bg-center rounded-2xl p-8 sm:p-12 mb-6 text-white shadow-lg overflow-hidden flex flex-col justify-center"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${IMAGE_BASE_URL}/cat_image/${currentCategoryNode.image}')`,
                                        minHeight: "200px",
                                    }}
                                >
                                    <div className="relative z-10">
                                        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-wide">
                                            {currentCategoryNode.name}
                                        </h1>
                                        <p className="text-sm sm:text-base text-gray-200 max-w-xl mb-4">
                                            Explore our exclusive items and latest trends in {currentCategoryNode.name}. Shop now for the best deals!
                                        </p>
                                        <Link
                                            href={`/ExploreProducts/${fullPath}`}
                                            className="inline-block bg-white text-gray-900 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            Shop with Filters
                                        </Link>
                                    </div>
                                </div>

                                {/* SUB-CATEGORIES */}
                                {subCategories.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4 pb-2">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                                <span className="w-2 h-5 bg-pink-600 rounded-full inline-block"></span>
                                                Explore Sub-Categories
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                                            {subCategories.map((subCat) => {
                                                const subCatChildren = subCat.all_children || subCat.children || [];
                                                const isLeaf = subCatChildren.length === 0;
                                                // Leaf categories (no further children) skip straight to the
                                                // filterable ExploreProducts page; only non-leaf categories
                                                // keep drilling deeper into the Categories browser.
                                                const href = isLeaf
                                                    ? `/ExploreProducts/${fullPath}/${subCat.slug}`
                                                    : `/Categories/${fullPath}/${subCat.slug}`;

                                                return (
                                                    <Link
                                                        key={subCat.id}
                                                        href={href}
                                                        className="group bg-white rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                                                    >
                                                        <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                            <img
                                                                src={`${IMAGE_BASE_URL}/cat_image/${subCat.image}`}
                                                                alt={subCat.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                                            />
                                                        </div>
                                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-800 transition-colors line-clamp-1">
                                                            {subCat.name}
                                                        </h4>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                {/* ROOT VIEW — /Categories with no slug at all */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">All Categories</h2>
                                    <Link
                                        href="/ExploreProducts"
                                        className="inline-block mt-3 bg-black text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-800 transition"
                                    >
                                        Shop with Filters
                                    </Link>
                                </div>

                                {subCategories.length > 0 && (
                                    <div className="mb-8">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                                            {subCategories.map((topCat) => {
                                                const topCatChildren = topCat.all_children || topCat.children || [];
                                                const isLeaf = topCatChildren.length === 0;
                                                const href = isLeaf
                                                    ? `/ExploreProducts/${topCat.slug}`
                                                    : `/Categories/${topCat.slug}`;

                                                return (
                                                    <Link
                                                        key={topCat.id}
                                                        href={href}
                                                        className="category-card bg-white rounded-xl p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
                                                    >
                                                        <div className="w-40 h-40 bg-gray-100 rounded-lg overflow-hidden mb-2">
                                                            <img
                                                                src={`${IMAGE_BASE_URL}/cat_image/${topCat.image}`}
                                                                alt={topCat.name}
                                                                className="category-card-img w-full h-full object-cover transition-transform duration-300"
                                                            />
                                                        </div>
                                                        <h4 className="font-semibold text-xs sm:text-sm text-gray-800 transition-colors line-clamp-1">
                                                            {topCat.name}
                                                        </h4>
                                                    </Link>


                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* PRODUCTS */}
                        <div className="mb-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 tracking-tight flex items-center gap-2">
                                <span className="w-2 h-5 bg-pink-600 rounded-full inline-block flex-shrink-0"></span>
                                <span>{currentCategoryNode ? `Products in ${currentCategoryNode.name}` : "All Products"}</span>
                            </h3>

                            {loading ? (
                                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                            <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
                                            <div className="p-2 sm:p-3 flex flex-col">
                                                <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3 w-full bg-gray-200 rounded mt-1.5 animate-pulse" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : products.length === 0 ? (
                                <p className="text-gray-500 text-sm">No products found in this category.</p>
                            ) : (
                                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2.5">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CategoriesPage;