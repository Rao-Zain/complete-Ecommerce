'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";


// Shimmer Loader for the Shop Page
const ShopShimmer = () => {
    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-10">
                    <div className="w-64 h-8 bg-gray-200 mx-auto rounded mb-3"></div>
                    <div className="w-96 h-4 bg-gray-200 mx-auto rounded"></div>
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/5 bg-white p-5 rounded-xl shadow h-96"></div>
                    <div className="w-full lg:w-4/5">
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 ">
                            <div className="w-24 h-5 bg-gray-200 rounded"></div>
                            <div className="w-36 h-9 bg-gray-200 rounded-lg"></div>
                        </div>
                        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-2.5">
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                                >
                                    <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse">
                                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-4 sm:h-5 w-14 sm:w-20 bg-gray-300 rounded animate-pulse" />
                                        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />
                                    </div>

                                    <div className="p-2 sm:p-3 flex flex-col">
                                        <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-full bg-gray-200 rounded mt-1.5 animate-pulse" />

                                        <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                                            {Array.from({ length: 5 }).map((_, star) => (
                                                <div
                                                    key={star}
                                                    className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-sm animate-pulse"
                                                />
                                            ))}
                                            <div className="h-3 w-7 bg-gray-200 rounded ml-1 animate-pulse" />
                                        </div>

                                        <div className="flex items-start justify-between gap-1 mt-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
                                                <div className="h-3 w-12 sm:w-16 bg-gray-200 rounded animate-pulse" />
                                            </div>
                                            <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SORT_OPTIONS = ['Latest Arrivals', 'Price: Low to High', 'Price: High to Low'];

const ExploreProducts = () => {
    const params = useParams();
    const router = useRouter();

    // Next.js catch-all route returns an array for slug e.g. ['men-s-fashion', 't-shirts-tanks']
    const pathSegments = params?.slug || [];
    const fullPath = pathSegments.join('/');
    const currentSlug = pathSegments[pathSegments.length - 1] || '';

    const [products, setProducts] = useState([]);
    const [categoriesData, setCategoriesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const isFirstCategoryLoad = useRef(true);

    // Filter States
    const [selectedCategory, setSelectedCategory] = useState(currentSlug);
    const [priceRange, setPriceRange] = useState(100000);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showAllBrands] = useState(false);
    const [sortOption, setSortOption] = useState('Price: High to Low');

    // Sort dropdown open/close state
    const [sortOpen, setSortOpen] = useState(false);
    const sortRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (sortRef.current && !sortRef.current.contains(e.target)) {
                setSortOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const availableColors = [
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

    const availableSizes = ['S', 'M', 'L', 'XS', 'XL'];

    const availableBrands = [
        { name: 'Outfitter', slug: 'outfitter' },
        { name: 'Nike', slug: 'nike' },
        { name: 'Loremipsum', slug: 'loremipsum' },
        { name: 'Awasom', slug: 'awasom' },
        { name: 'Adidas', slug: 'adidas' },
        { name: 'Gucci', slug: 'gucci' }
    ];

    useEffect(() => {
        setSelectedCategory(currentSlug);
    }, [currentSlug]);

    useEffect(() => {
        if (isFirstCategoryLoad.current) {
            setCategoriesLoading(true);
        }

        const categoryPath = fullPath ? `/${fullPath}` : '';

        fetch(`${API_BASE_URL}/api/category-sidebar${categoryPath}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.categories) {
                    setCategoriesData(data.categories);
                }
                setCategoriesLoading(false);
                isFirstCategoryLoad.current = false;
            })
            .catch((err) => {
                console.error("Error fetching sidebar categories:", err);
                setCategoriesLoading(false);
                isFirstCategoryLoad.current = false;
            });
    }, [fullPath]);

    useEffect(() => {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (priceRange) queryParams.append('max_price', priceRange);
        if (selectedColor) queryParams.append('color', selectedColor);
        if (selectedSize) queryParams.append('size', selectedSize);
        if (selectedBrands.length > 0) queryParams.append('brands', selectedBrands.join(','));
        if (sortOption) queryParams.append('sort', sortOption);

        const categoryPath = fullPath ? `/${fullPath}` : '';
        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/categories-products${categoryPath}${queryString ? `?${queryString}` : ''}`;

        fetch(url)
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
                console.error("Error fetching category products:", err);
                setLoading(false);
            });
    }, [fullPath, priceRange, selectedColor, selectedSize, selectedBrands, sortOption]);

    const handleCategoryClick = (categoryPath) => {
        if (categoryPath) {
            router.push(`/ExploreProducts/${categoryPath}`);
        } else {
            router.push(`/ExploreProducts`);
        }
    };

    const handleClearFilters = () => {
        handleCategoryClick('');
        setPriceRange(100000);
        setSelectedColor('');
        setSelectedSize('');
        setSelectedBrands([]);
    };

    const toggleBrandSelection = (slug) => {
        if (selectedBrands.includes(slug)) {
            setSelectedBrands(selectedBrands.filter(b => b !== slug));
        } else {
            setSelectedBrands([...selectedBrands, slug]);
        }
    };

    const handleSortSelect = (option) => {
        setSortOption(option);
        setSortOpen(false);
    };

    const hasActiveFilters = selectedCategory || priceRange < 100000 || selectedColor || selectedSize || selectedBrands.length > 0;

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

    if (categoriesLoading) {
        return <ShopShimmer />;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* HEADER SECTION */}
                <div className="text-center mb-5">
                    <h1 className="text-2xl sm:text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                        <span>🛍️</span> Explore Our Products
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
                        Discover the best products from multiple categories. Use filters to find exactly what you want.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* LEFT SIDEBAR */}
                    <aside className="w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:block sticky top-12 max-h-[calc(100vh-4rem)] overflow-y-auto space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="font-bold text-sm tracking-tight text-gray-900">
                                <span>Categories</span>
                            </h2>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
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
                                    onClick={() => handleCategoryClick('')}
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
                                            onClick={() => handleCategoryClick(parentCat.slug)}
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
                                                                    onClick={() => handleCategoryClick(`${parentCat.slug}/${subCat.slug}`)}
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
                                                                                    onClick={() => handleCategoryClick(`${parentCat.slug}/${subCat.slug}/${childCat.slug}`)}

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
                                onChange={(e) => setPriceRange(Number(e.target.value))}
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
                            {availableColors.map((colorObj, index) => {
                                const isSelected = selectedColor === colorObj.hex;
                                const isLightColor = ['#ffffff', '#facc15', '#f472b6'].includes(colorObj.hex);
                                const inlineBg = colorObj.hex === '#ffffff'
                                    ? { backgroundColor: '#ffffff', border: '1px solid #d1d5db' }
                                    : { backgroundColor: colorObj.hex };

                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setSelectedColor(isSelected ? '' : colorObj.hex)}
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
                            {availableSizes.map((sizeName, index) => {
                                const isSizeSelected = selectedSize === sizeName;
                                return (
                                    <button
                                        type="button"
                                        key={index}
                                        onClick={() => setSelectedSize(isSizeSelected ? '' : sizeName)}
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
                                {availableBrands.slice(0, showAllBrands ? availableBrands.length : 6).map((brand, index) => {
                                    const isBrandSelected = selectedBrands.includes(brand.slug);
                                    return (
                                        <label key={index} className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm text-gray-700">
                                            <input
                                                type="checkbox"
                                                checked={isBrandSelected}
                                                onChange={() => toggleBrandSelection(brand.slug)}
                                                className="w-4 h-4 text-black border-gray-300 rounded accent-black cursor-pointer"
                                            />
                                            <span className={isBrandSelected ? 'font-semibold text-black' : ''}>{brand.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </aside>

                    {/* RIGHT SIDE PRODUCTS CONTAINER */}
                    <div className="container mx-auto">
                        <div className="flex justify-between items-center bg-white px-4 p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <h2 className="font-bold text-gray-800">Products ({products.length})</h2>

                            {/* Custom styled sort dropdown (replaces native <select>) */}
                            <div className="relative inline-block " ref={sortRef}>
                                <button
                                    type="button"
                                    onClick={() => setSortOpen((o) => !o)}
                                    className="flex items-center gap-2 border border-gray-100 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer min-w-[170px] justify-between"
                                >
                                    {sortOption}
                                    {sortOpen ? (
                                        <FaChevronUp className="text-[10px] text-gray-400" />
                                    ) : (
                                        <FaChevronDown className="text-[10px] text-gray-400" />
                                    )}
                                </button>

                                {sortOpen && (
                                    <div className="absolute right-0 mt-2 w-full min-w-[170px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 overflow-hidden">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => handleSortSelect(option)}
                                                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${sortOption === option
                                                    ? "bg-gray-50 text-gray-900 font-semibold"
                                                    : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-2.5">
                                {Array.from({ length: 10 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                                    >
                                        <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse">
                                            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-4 sm:h-5 w-14 sm:w-20 bg-gray-300 rounded animate-pulse" />
                                            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full animate-pulse" />
                                        </div>

                                        <div className="p-2 sm:p-3 flex flex-col">
                                            <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-full bg-gray-200 rounded mt-1.5 animate-pulse" />

                                            <div className="flex items-center gap-1 mt-1.5 sm:mt-2">
                                                {Array.from({ length: 5 }).map((_, star) => (
                                                    <div
                                                        key={star}
                                                        className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-200 rounded-sm animate-pulse"
                                                    />
                                                ))}
                                                <div className="h-3 w-7 bg-gray-200 rounded ml-1 animate-pulse" />
                                            </div>

                                            <div className="flex items-start justify-between gap-1 mt-2">
                                                <div className="flex flex-col gap-1">
                                                    <div className="h-4 sm:h-5 w-16 sm:w-20 bg-gray-200 rounded animate-pulse" />
                                                    <div className="h-3 w-12 sm:w-16 bg-gray-200 rounded animate-pulse" />
                                                </div>
                                                <div className="h-5 sm:h-6 w-16 sm:w-20 bg-gray-200 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-sm font-medium">No products found matching your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-2.5">
                                {products.map((product) => {
                                    const firstVariant = product.variants?.[0];
                                    const price = firstVariant ? Number(firstVariant.price) : null;
                                    const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;

                                    const totalStock =
                                        product.variants?.reduce(
                                            (sum, v) => sum + (Number(v.stock) || 0),
                                            0
                                        ) || 0;

                                    const reviews = product.reviews || [];
                                    const avgRating =
                                        reviews.length > 0
                                            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                                            : 0;

                                    const imagePath = product.main_variant_image?.image_path;

                                    return (
                                        <Link
                                            href={`/Productdetail/${product.slug}`}
                                            key={product.id}
                                            className="bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                                        >
                                            <div className="bg-white rounded-lg sm:rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
                                                {/* Image & Badges Container */}
                                                <div className="relative bg-gray-100 h-34 xs:h-36 sm:h-44 md:h-48 lg:h-52 w-full">
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
                                                        />
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between">
                                                    <div>
                                                        <h4 className="font-medium xs:text-[14px] md:text-[16px] text-gray-800 truncate group-hover:text-black capitalize">
                                                            {product.name}
                                                        </h4>
                                                        <p
                                                            className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1 sm:line-clamp-1"
                                                            dangerouslySetInnerHTML={{
                                                                __html: product.description || "",
                                                            }}
                                                        />

                                                        {/* Rating */}
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

                                                    {/* Pricing & Stock */}
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
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExploreProducts;