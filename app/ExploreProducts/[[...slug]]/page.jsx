'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { FaShoppingCart, FaStar, FaArrowLeft, FaCheck, FaHeart, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL } from '@/lib/config';

const BASE_URL = API_BASE_URL;

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {[...Array(10)].map((_, i) => (
                                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm h-72 animate-pulse bg-gray-100"></div>
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

        fetch(`${BASE_URL}/api/category-sidebar${categoryPath}`)
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
        const url = `${BASE_URL}/api/categories-products${categoryPath}${queryString ? `?${queryString}` : ''}`;

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
                        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <h2 className="font-bold text-gray-800">Products ({products.length})</h2>

                            {/* Custom styled sort dropdown (replaces native <select>) */}
                            <div className="relative inline-block" ref={sortRef}>
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
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-3">
                                {[...Array(10)].map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm h-72 bg-gray-100"></div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-sm font-medium">No products found matching your filters.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                                {products.map((product) => {
                                    const variant = product.main_variant || product.variants?.[0];
                                    const imagePath = product.main_variant_image?.image_path
                                        ? `${BASE_URL}/storage/${product.main_variant_image.image_path}`
                                        : product.image
                                            ? `${BASE_URL}/${product.image}`
                                            : "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500";

                                    return (
                                        <div
                                            key={product.id}
                                            className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group w-full flex flex-col justify-between relative"
                                        >
                                            {/* Top Seller Badge & Heart Icon Over Image */}
                                            <div className="relative bg-gray-100 overflow-hidden">
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 z-10 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-600 shadow hover:text-red-500 transition cursor-pointer border-none"
                                                >
                                                    <FaHeart className="text-xs" />
                                                </button>

                                                <Link href={`/product/${product.slug}`}>
                                                    <img
                                                        src={imagePath}
                                                        alt={product.name}
                                                        className="w-full h-48 lg:h-48 object-cover group-hover:scale-105 transition duration-300"
                                                    />
                                                </Link>
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-2 flex flex-col justify-between flex-grow">
                                                <div>
                                                    <Link href={`/product/${product.slug}`}>
                                                        <h2 className="text-xs font-bold text-gray-800 line-clamp-1 hover:text-black">
                                                            {product.name}
                                                        </h2>
                                                    </Link>
                                                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                                                        {product.short_description || "Explore high quality and comfortable material..."}
                                                    </p>

                                                    {/* Rating Stars */}
                                                    <div className="flex items-center gap-1 text-yellow-400 text-[10px] mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} />
                                                        ))}
                                                        <span className="text-gray-400 ml-1">(5.0)</span>
                                                    </div>
                                                </div>

                                                {/* Price and Stock Section */}
                                                <div className=" flex items-center justify-between gap-2 mt-1">
                                                    {/* Price & Cut Price (Stacked Vertically) */}
                                                    <div className="flex flex-col">
                                                        <h3 className="text-sm font-extrabold text-emerald-600 whitespace-nowrap">
                                                            Rs {Math.floor(Number(variant?.price || product.price)) || "N/A"}
                                                        </h3>
                                                        {variant?.cut_price && (
                                                            <span className="text-[10px] text-gray-400 line-through whitespace-nowrap">
                                                                Rs {Math.floor(Number(variant.cut_price))}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Stock Badge - Compact */}
                                                    <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
                                                        {variant?.stock || product.stock || "216"} In Stock
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
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
