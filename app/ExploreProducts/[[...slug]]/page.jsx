'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import CategorySidebar from '../../CategorySidebar/page';

const SORT_OPTIONS = ['Latest Arrivals', 'Price: Low to High', 'Price: High to Low'];

const ExploreProducts = () => {
    const params = useParams();
    const router = useRouter();

    // Catch-all route slugs: ['men-s-fashion', 't-shirts-tanks'] => depth 2
    // ['men-s-fashion', 't-shirts-tanks', 'v-neck'] => depth 3
    const pathSegments = params?.slug || [];
    const fullPath = pathSegments.join('/');
    const currentSlug = pathSegments[pathSegments.length - 1] || '';
    
    // Level 3+ shows sidebar, Level 2 or less shows category/sub-category layout
    const isLeafLevel = pathSegments.length >= 3;

    const [products, setProducts] = useState([]);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    // Filter States (used on leaf level with sidebar)
    const [selectedCategory, setSelectedCategory] = useState(currentSlug);
    const [priceRange, setPriceRange] = useState(100000);
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [sortOption, setSortOption] = useState('Price: High to Low');

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

    useEffect(() => {
        setSelectedCategory(currentSlug);
    }, [currentSlug]);

    // Fetch Products & Category details
    useEffect(() => {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (isLeafLevel) {
            if (priceRange) queryParams.append('max_price', priceRange);
            if (selectedColor) queryParams.append('color', selectedColor);
            if (selectedSize) queryParams.append('size', selectedSize);
            if (selectedBrands.length > 0) queryParams.append('brands', selectedBrands.join(','));
            if (sortOption) queryParams.append('sort', sortOption);
        }

        const categoryPath = fullPath ? `/${fullPath}` : '';
        const queryString = queryParams.toString();
        const url = `${API_BASE_URL}/api/categories-products${categoryPath}${queryString ? `?${queryString}` : ''}`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.category) {
                    setCurrentCategory(data.category);
                }
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
    }, [fullPath, priceRange, selectedColor, selectedSize, selectedBrands, sortOption, isLeafLevel]);

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

    // Reusable Product Card
    const renderProductGrid = (gridColsClass) => {
        if (products.length === 0) {
            return (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-sm font-medium">No products found in this category.</p>
                </div>
            );
        }

        return (
            <div className={`grid ${gridColsClass} gap-3 sm:gap-4 lg:gap-2.5`}>
                {products.map((product) => {
                    const firstVariant = product.variants?.[0];
                    const price = firstVariant ? Number(firstVariant.price) : null;
                    const cutPrice = firstVariant ? Number(firstVariant.cut_price) : null;
                    const totalStock = product.variants?.reduce((sum, v) => sum + (Number(v.stock) || 0), 0) || 0;
                    const reviews = product.reviews || [];
                    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
                    const imagePath = product.main_variant_image?.image_path;

                    return (
                        <Link
                            href={`/Productdetail/${product.slug}`}
                            key={product.id}
                            className="bg-white rounded-sm sm:rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-300 relative flex flex-col h-full w-full"
                        >
                            <div className="bg-white rounded-lg sm:rounded-md border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between h-full">
                                <div className="relative bg-gray-100 h-34 xs:h-36 sm:h-44 md:h-48 lg:h-52 w-full">
                                    {product.product_type === "featured" && (
                                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-red-600 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider z-10">
                                            Top Seller
                                        </span>
                                    )}

                                    <button className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1 sm:p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10">
                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>

                                    {imagePath && (
                                        <Image
                                            src={`${IMAGE_BASE_URL}/${imagePath}`}
                                            alt={product.name}
                                            fill
                                            unoptimized
                                            sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, 20vw"
                                            className="object-cover object-center"
                                        />
                                    )}
                                </div>

                                <div className="p-2 sm:p-3 flex flex-col flex-grow justify-between">
                                    <div>
                                        <h4 className="font-medium xs:text-[14px] md:text-[16px] text-gray-800 truncate group-hover:text-black capitalize">
                                            {product.name}
                                        </h4>
                                        <p
                                            className="text-[11px] sm:text-xs text-gray-500 mt-0.5 line-clamp-1"
                                            dangerouslySetInnerHTML={{ __html: product.description || "" }}
                                        />

                                        <div className="flex items-center mt-1.5 sm:mt-1">
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(avgRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-200"}`}
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
                })}
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-3 sm:px-6 md:px-7 py-6 sm:pb-10 sm:pt-6">
                {isLeafLevel ? (
                    /* ---------------- 3RD SLUG VIEW: WITH SIDEBAR ---------------- */
                    <div className="flex flex-col lg:flex-row gap-8 items-start">
                        <CategorySidebar
                            pathSegments={pathSegments}
                            onCategoryClick={handleCategoryClick}
                            priceRange={priceRange}
                            onPriceChange={setPriceRange}
                            selectedColor={selectedColor}
                            onColorChange={setSelectedColor}
                            selectedSize={selectedSize}
                            onSizeChange={setSelectedSize}
                            selectedBrands={selectedBrands}
                            onBrandToggle={toggleBrandSelection}
                            onClearFilters={handleClearFilters}
                        />

                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center bg-white px-4 p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
                                <h2 className="font-bold text-gray-800">Products ({products.length})</h2>

                                <div className="relative inline-block" ref={sortRef}>
                                    <button
                                        type="button"
                                        onClick={() => setSortOpen((o) => !o)}
                                        className="flex items-center gap-2 border border-gray-100 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer min-w-[170px] justify-between"
                                    >
                                        {sortOption}
                                        {sortOpen ? <FaChevronUp className="text-[10px] text-gray-400" /> : <FaChevronDown className="text-[10px] text-gray-400" />}
                                    </button>

                                    {sortOpen && (
                                        <div className="absolute right-0 mt-2 w-full min-w-[170px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 overflow-hidden">
                                            {SORT_OPTIONS.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => handleSortSelect(option)}
                                                    className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${sortOption === option ? "bg-gray-50 text-gray-900 font-semibold" : "text-gray-600 hover:bg-gray-50"}`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {renderProductGrid("grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4")}
                        </div>
                    </div>
                ) : (
                    /* ---------------- 2ND SLUG VIEW: FASHION CATEGORY STYLE ---------------- */
                    <div className="flex flex-col gap-6">
                        {currentCategory && (
                            <>
                                {/* Large Category Banner */}
                                <div
                                    className="relative w-full bg-cover bg-center rounded-2xl p-8 sm:p-12 mb-6 text-white shadow-lg overflow-hidden flex flex-col justify-center"
                                    style={{
                                        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('http://192.168.1.19:8000/storage/${currentCategory.image}')`,
                                        minHeight: "200px",
                                    }}
                                >
                                    <div className="relative z-10">
                                        <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 tracking-wide">
                                            {currentCategory.name}
                                        </h1>
                                        <p className="text-sm sm:text-base text-gray-200 max-w-xl">
                                            Explore our exclusive items and latest trends in {currentCategory.name}. Shop now for the best deals!
                                        </p>
                                    </div>
                                </div>

                                {/* Sub-Categories Grid */}
                                {currentCategory.children && currentCategory.children.length > 0 && (
                                    <div className="mb-8">
                                        <div className="flex items-center justify-between mb-4 pb-2">
                                            <h3 className="text-base sm:text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
                                                <span className="w-2 h-5 bg-pink-600 rounded-full inline-block"></span>
                                                Explore Sub-Categories
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
                                            {currentCategory.children.map((subCat) => (
                                                <Link
                                                    key={subCat.id}
                                                    href={`/ExploreProducts/${fullPath}/${subCat.slug}`}
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
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Full Width Products Grid */}
                        <div className="mb-6">
                            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 tracking-tight flex items-center gap-2">
                                <span className="w-2 h-5 bg-pink-600 rounded-full inline-block flex-shrink-0"></span>
                                <span>{currentCategory ? `Products in ${currentCategory.name}` : "All Products"}</span>
                            </h3>

                            {renderProductGrid("grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6")}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExploreProducts;