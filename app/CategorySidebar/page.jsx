"use client";

import React, { useState, useEffect, useRef } from "react";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
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

/**
 * Self-contained filter sidebar.
 * Fetches its own category tree from API_BASE_URL.
 * Filter *values* (price/color/size/brand) are owned by the parent
 * so the parent can use them to fetch products — this component
 * only reads them for display and calls back on change.
 */
const CategorySidebar = ({
    pathSegments = [],       // array of slug segments, e.g. ['mens-fashion','t-shirts','graphic-tees']
    onCategoryClick,         // (categoryPath: string) => void
    priceRange,
    onPriceChange,
    selectedColor,
    onColorChange,
    selectedSize,
    onSizeChange,
    selectedBrands,
    onBrandToggle,
    onClearFilters,
}) => {
    const [categoriesData, setCategoriesData] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const isFirstLoad = useRef(true);

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

    const containsSlug = (categories, slug) => {
        for (let cat of categories) {
            if (cat.slug === slug) return true;
            const children = cat.all_children || cat.children || [];
            if (children.length > 0 && containsSlug(children, slug)) return true;
        }
        return false;
    };

    const findTopLevelParent = (categories, slug) => {
        for (let cat of categories) {
            if (cat.slug === slug) return cat;
            const children = cat.all_children || cat.children || [];
            if (children.length > 0 && containsSlug(children, slug)) return cat;
        }
        return null;
    };

    const activeCategory = currentSlug ? findTopLevelParent(categoriesData, currentSlug) : null;
    const sidebarDisplayCategories = activeCategory ? [activeCategory] : categoriesData;

    const hasActiveFilters =
        selectedCategory || priceRange < 100000 || selectedColor || selectedSize || selectedBrands.length > 0;

    if (categoriesLoading) {
        return (
            <aside className="w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:block sticky top-12 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4 animate-pulse">
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
        <aside className="w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:block sticky top-12 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
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

            <div className="flex flex-col gap-2 pb-2">
                {selectedCategory && (
                    <button
                        type="button"
                        onClick={() => onCategoryClick('')}
                        className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1 hover:underline cursor-pointer text-left bg-transparent border-none p-0"
                    >
                        <FaArrowLeft /> All Categories
                    </button>
                )}

                {sidebarDisplayCategories.map((parentCat) => {
                    const isParentSelected = selectedCategory === parentCat.slug;
                    const subCategories = parentCat.all_children || parentCat.children || [];

                    return (
                        <div key={parentCat.id} className="flex flex-col gap-1">
                            <button
                                type="button"
                                onClick={() => onCategoryClick(parentCat.slug)}
                                className={`text-xs sm:text-sm text-left py-1.5 px-2 rounded transition cursor-pointer border-none font-bold ${isParentSelected ? 'bg-black text-white' : 'text-gray-900 hover:bg-gray-100 bg-transparent'}`}
                            >
                                {parentCat.name}
                            </button>

                            {subCategories.length > 0 && pathSegments.includes(parentCat.slug) && (
                                <div className="pl-3 flex flex-col gap-2 border-l-2 border-gray-100 ml-2 mt-1">
                                    {subCategories
                                        .filter((subCat) => pathSegments.length <= 1 || pathSegments.includes(subCat.slug))
                                        .map((subCat) => {
                                            const isSubSelected = selectedCategory === subCat.slug;
                                            const childCategories = subCat.all_children || subCat.children || [];

                                            return (
                                                <div key={subCat.id} className="flex flex-col gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => onCategoryClick(`${parentCat.slug}/${subCat.slug}`)}
                                                        className={`text-xs text-left py-1 px-2 rounded transition cursor-pointer border-none font-semibold ${isSubSelected ? 'bg-gray-200 font-bold text-black' : 'text-gray-700 hover:text-black bg-transparent'}`}
                                                    >
                                                        • {subCat.name}
                                                    </button>

                                                    {childCategories.length > 0 && pathSegments.includes(subCat.slug) && (
                                                        <div className="pl-3 flex flex-col gap-1 border-l border-gray-200 ml-2 mt-1">
                                                            {childCategories.map((childCat) => {
                                                                const isChildSelected = selectedCategory === childCat.slug;
                                                                return (
                                                                    <button
                                                                        key={childCat.id}
                                                                        type="button"
                                                                        onClick={() => onCategoryClick(`${parentCat.slug}/${subCat.slug}/${childCat.slug}`)}
                                                                        className={`text-[11px] text-left py-1 px-2 rounded transition cursor-pointer border-none ${isChildSelected ? 'bg-black text-white font-bold' : 'text-gray-500 hover:text-black bg-transparent'}`}
                                                                    >
                                                                        - {childCat.name}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* PRICE RANGE */}
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

            {/* COLOR FILTER */}
            <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">Color</h2>
            <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
                {AVAILABLE_COLORS.map((colorObj, index) => {
                    const isSelected = selectedColor === colorObj.hex;
                    const isLightColor = ['#ffffff', '#facc15', '#f472b6'].includes(colorObj.hex);
                    const inlineBg = colorObj.hex === '#ffffff'
                        ? { backgroundColor: '#ffffff', border: '1px solid #d1d5db' }
                        : { backgroundColor: colorObj.hex };

                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => onColorChange(isSelected ? '' : colorObj.hex)}
                            title={colorObj.name}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 relative flex items-center justify-center shadow-sm border-none ${isSelected ? 'ring-2 ring-offset-2 ring-black scale-110' : 'opacity-80 hover:opacity-100'}`}
                            style={inlineBg}
                        >
                            {isSelected && <FaCheck className={`text-[10px] ${isLightColor ? 'text-black' : 'text-white'}`} />}
                        </button>
                    );
                })}
            </div>

            {/* SIZE FILTER */}
            <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">Size</h2>
            <div className="flex flex-wrap gap-2 my-2 pb-3 border-b border-gray-100">
                {AVAILABLE_SIZES.map((sizeName, index) => {
                    const isSizeSelected = selectedSize === sizeName;
                    return (
                        <button
                            type="button"
                            key={index}
                            onClick={() => onSizeChange(isSizeSelected ? '' : sizeName)}
                            className={`px-2.5 py-1 cursor-pointer text-xs rounded border transition-all font-medium ${isSizeSelected ? 'bg-black text-white border-black shadow' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                        >
                            {sizeName}
                        </button>
                    );
                })}
            </div>

            {/* BRANDS FILTER */}
            <div>
                <h2 className="font-bold text-sm mt-4 mb-2 tracking-tight text-gray-900">Brands</h2>
                <div className="flex flex-col gap-2 pb-1">
                    {AVAILABLE_BRANDS.map((brand, index) => {
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
            </div>
        </aside>
    );
};

export default CategorySidebar;