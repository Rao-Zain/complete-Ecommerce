"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

const AVAILABLE_COLORS = [
    { name: 'black', hex: '#000000' },
    { name: 'blue', hex: '#2563eb' },
    { name: 'red', hex: '#dc2626' },
    { name: 'gray', hex: '#6b7280' },
    { name: 'maroon', hex: '#991b1b' },
    { name: 'yellow', hex: '#facc15' },
    { name: 'green', hex: '#16a34a' },
    { name: 'pink', hex: '#f472b6' },
    { name: 'white', hex: '#ffffff' },
    { name: 'navy', hex: '#1e3a8a' }
];

const AVAILABLE_SIZES = ['S', 'M', 'L', 'XS', 'XL'];

const AVAILABLE_BRANDS = [
    { name: 'Outfitter', slug: 'outfitter' },
    { name: 'Nike', slug: 'nike' },
    { name: 'Loremipsum', slug: 'loremipsum' },
    { name: 'Awasom', slug: 'awasom' },
    { name: 'Adidas', slug: 'adidas' },
    { name: 'Gucci', slug: 'gucci' }
];

// How far down the viewport the sidebar starts (matches header/nav height).
const SIDEBAR_TOP_OFFSET = "top-16";

/**
 * Self-contained filter sidebar.
 * Fetches its own category tree from API_BASE_URL.
 * Filter *values* (price/color/size/brand) are owned by the parent
 * so the parent can use them to fetch products — this component
 * only reads them for display and calls back on change.
 *
 * Color, size, and brand filters are all multi-select: `selectedColors`,
 * `selectedSizes`, and `selectedBrands` are arrays, and each `on*Toggle`
 * callback receives the single value clicked — the parent adds/removes
 * it from the array.
 *
 * Categories and Brands each truncate to a short list with their own
 * independent "See More" toggle. Price / Color / Size are always shown
 * in full — nothing in the panel is globally clipped.
 *
 * onCurrentCategoryChange (optional): called with the resolved category
 * node (or null) whenever the current selection changes — the parent's
 * ExploreProducts page uses this for the "Products in {name}" heading,
 * since this component now owns the category data itself.
 */
const CategorySidebar = ({
    pathSegments = [],       // array of slug segments, e.g. ['mens-fashion','t-shirts','graphic-tees']
    onCategoryClick,         // (categoryPath: string) => void
    priceRange,
    onPriceChange,
    selectedColors = [],
    onColorToggle,
    selectedSizes = [],
    onSizeToggle,
    selectedBrands = [],
    onBrandToggle,
    onClearFilters,
    onCurrentCategoryChange, // (node: object|null) => void
}) => {
    const [categoriesData, setCategoriesData] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const isFirstLoad = useRef(true);

    // Categories and Brands each truncate independently and expand on their own
    const [categoriesExpanded, setCategoriesExpanded] = useState(false);
    const [brandsExpanded, setBrandsExpanded] = useState(false);
    const VISIBLE_CATEGORY_COUNT = 6;
    const VISIBLE_BRAND_COUNT = 4;

    const fullPath = pathSegments.join('/');
    const currentSlug = pathSegments[pathSegments.length - 1] || '';
    const selectedCategory = currentSlug;

    useEffect(() => {
        if (isFirstLoad.current) setCategoriesLoading(true);

        const categoryPath = fullPath ? `/${fullPath}` : '';

        fetch(`${API_BASE_URL}/api/category-sidebar${categoryPath}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.categories) {
                    setCategoriesData(data.categories);
                }
                setCategoriesLoading(false);
                isFirstLoad.current = false;
            })
            .catch((err) => {
                console.error("Error fetching sidebar categories:", err);
                setCategoriesLoading(false);
                isFirstLoad.current = false;
            });
    }, [fullPath]);

    // Finds a category node anywhere in the tree along with its direct
    // parent — used to build the "Back to {parent}" link and the flat
    // sibling list, instead of rendering the whole tree.
    const findNodeWithParent = (categories, slug, parent = null) => {
        for (let cat of categories) {
            if (cat.slug === slug) return { node: cat, parent };
            const children = cat.all_children || cat.children || [];
            if (children.length > 0) {
                const result = findNodeWithParent(children, slug, cat);
                if (result) return result;
            }
        }
        return null;
    };

    const currentMatch = currentSlug ? findNodeWithParent(categoriesData, currentSlug) : null;
    const immediateParent = currentMatch?.parent || null;
    const siblingCategories = immediateParent
        ? (immediateParent.all_children || immediateParent.children || [])
        : categoriesData; // no parent found (shouldn't normally happen at sidebar depth) — fall back to top level

    // Path with the last segment (the currently selected leaf) removed —
    // used both for the "Back" link and for building sibling links.
    const parentPath = pathSegments.slice(0, -1).join('/');

    const visibleCategories = categoriesExpanded
        ? siblingCategories
        : siblingCategories.slice(0, VISIBLE_CATEGORY_COUNT);
    const hiddenCategoryCount = Math.max(siblingCategories.length - VISIBLE_CATEGORY_COUNT, 0);

    const visibleBrands = brandsExpanded
        ? AVAILABLE_BRANDS
        : AVAILABLE_BRANDS.slice(0, VISIBLE_BRAND_COUNT);
    const hiddenBrandCount = Math.max(AVAILABLE_BRANDS.length - VISIBLE_BRAND_COUNT, 0);

    const hasActiveFilters =
        selectedCategory ||
        priceRange < 100000 ||
        selectedColors.length > 0 ||
        selectedSizes.length > 0 ||
        selectedBrands.length > 0;

    // Let the parent know which category node is currently resolved, so
    // it can render a "Products in {name}" heading without needing its
    // own copy of the category tree.
    useEffect(() => {
        if (onCurrentCategoryChange) {
            onCurrentCategoryChange(currentMatch?.node || null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMatch?.node?.id]);

    if (categoriesLoading) {
        return (
            <aside className={`w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:block sticky ${SIDEBAR_TOP_OFFSET} animate-pulse`}>
                <div className="w-24 h-5 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </aside>
        );
    }

    return (
        <aside
            className={`w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:flex lg:flex-col sticky ${SIDEBAR_TOP_OFFSET}`}
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-sm tracking-tight text-gray-900">
                    <span>Categories</span>
                </h2>
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="text-[11px] font-semibold text-red-600 hover:text-red-800 transition underline cursor-pointer bg-transparent border-none p-0"
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-1.5 pb-2">
                {immediateParent && (
                    <button
                        type="button"
                        onClick={() => onCategoryClick(parentPath)}
                        className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1 hover:underline cursor-pointer text-left bg-transparent border-none p-0"
                    >
                        <FaArrowLeft /> Back to {immediateParent.name}
                    </button>
                )}

                {visibleCategories.map((sibling) => {
                    const isSelected = sibling.slug === currentSlug;
                    return (
                        <button
                            type="button"
                            key={sibling.id}
                            onClick={() => onCategoryClick(`${parentPath}/${sibling.slug}`)}
                            className={`text-sm text-left py-1.5 px-3 rounded transition cursor-pointer border-none font-semibold ${isSelected
                                ? 'bg-gray-100 text-black'
                                : 'text-gray-700 hover:bg-gray-50 bg-transparent'
                                }`}
                        >
                            {sibling.name}
                        </button>
                    );
                })}

                {hiddenCategoryCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setCategoriesExpanded((e) => !e)}
                        className="w-full mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg py-2 cursor-pointer border border-gray-200 transition"
                    >
                        {categoriesExpanded ? (
                            <>Show Less <FaChevronUp className="text-[10px]" /></>
                        ) : (
                            <>See More ({hiddenCategoryCount}) <FaChevronDown className="text-[10px]" /></>
                        )}
                    </button>
                )}
            </div>

            {/* PRICE RANGE — always fully visible */}
            <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">Price</h2>
            <div className="space-y-2 my-2 pb-3 border-b border-gray-100">
                <input
                    type="range"
                    min="0"
                    max="100000"
                    step="500"
                    value={priceRange}
                    onChange={(e) => onPriceChange(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Rs 0</span>
                    <span className="text-black font-bold">Max: Rs {priceRange.toLocaleString()}</span>
                </div>
            </div>

            {/* COLOR FILTER — multi-select, always fully visible */}
            <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">
                Color {selectedColors.length > 0 && <span className="text-emerald-600">({selectedColors.length})</span>}
            </h2>
            <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
                {AVAILABLE_COLORS.map((colorObj, index) => {
                    const isSelected = selectedColors.includes(colorObj.name);
                    const isLightColor = ['#ffffff', '#facc15', '#f472b6'].includes(colorObj.hex);
                    const inlineBg = colorObj.hex === '#ffffff'
                        ? { backgroundColor: '#ffffff', border: '1px solid #d1d5db' }
                        : { backgroundColor: colorObj.hex };

                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => onColorToggle(colorObj.name)}
                            title={colorObj.name}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 relative flex items-center justify-center border-none ${isSelected
                                ? 'scale-110 shadow-md ring-2 ring-inset ring-white/70'
                                : 'shadow-sm opacity-80 hover:opacity-100'
                                }`}
                            style={inlineBg}
                        >
                            {isSelected && <FaCheck className={`text-[10px] ${isLightColor ? 'text-black' : 'text-white'}`} />}
                        </button>
                    );
                })}
            </div>

            {/* SIZE FILTER — multi-select, always fully visible */}
            <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">
                Size {selectedSizes.length > 0 && <span className="text-emerald-600">({selectedSizes.length})</span>}
            </h2>
            <div className="flex flex-wrap gap-2 my-2 pb-3 border-b border-gray-100">
                {AVAILABLE_SIZES.map((sizeName, index) => {
                    const isSizeSelected = selectedSizes.includes(sizeName);
                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => onSizeToggle(sizeName)}
                            className={`px-2.5 py-1 cursor-pointer text-xs rounded border transition-all font-medium ${isSizeSelected ? 'bg-black text-white border-black shadow' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                        >
                            {sizeName}
                        </button>
                    );
                })}
            </div>

            {/* BRANDS FILTER — multi-select, own independent See More */}
            <div>
                <h2 className="font-bold text-sm mt-4 mb-2 tracking-tight text-gray-900">Brands</h2>
                <div className="flex flex-col gap-2 pb-1">
                    {visibleBrands.map((brand, index) => {
                        const isBrandSelected = selectedBrands.includes(brand.slug);
                        return (
                            <label key={index} className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={isBrandSelected}
                                    onChange={() => onBrandToggle(brand.slug)}
                                    className="w-4 h-4 text-black border-gray-300 rounded accent-black cursor-pointer"
                                />
                                <span className={isBrandSelected ? 'font-semibold text-black' : ''}>{brand.name}</span>
                            </label>
                        );
                    })}
                </div>

                {hiddenBrandCount > 0 && (
                    <button
                        type="button"
                        onClick={() => setBrandsExpanded((e) => !e)}
                        className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg py-2 cursor-pointer border border-gray-200 transition"
                    >
                        {brandsExpanded ? (
                            <>Show Less <FaChevronUp className="text-[10px]" /></>
                        ) : (
                            <>See More <FaChevronDown className="text-[10px]" /></>
                        )}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default CategorySidebar;