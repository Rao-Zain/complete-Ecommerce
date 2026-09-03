'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";
import ProductCard from "../../ProductCard/page";
import CategorySidebar from '../../CategorySidebar/page';
import ShopShimmer from "./ShopShimmer";

const PAGE_SIZE = 10;

// !! VERIFY against your Laravel controller — see chat for how to check.
const SORT_OPTIONS = [
    { label: 'Latest Arrivals', value: 'latest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
];
const DEFAULT_SORT_VALUE = 'price_desc';

const ExploreProductsContent = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const pathSegments = params?.slug || [];

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);       // filter-change fetch (page 1)
    const [loadingMore, setLoadingMore] = useState(false); // scroll-triggered fetch
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const hasLoadedOnce = useRef(false); // gates the full-page shimmer to the true first load
    const fetchedPages = useRef(new Set()); // dedupe guard, cleared on every filter change
    const fetchingRef = useRef(false);   // blocks overlapping fetches (fast scroll / StrictMode)
    const hasMoreRef = useRef(true);     // observer callback reads this, never a stale closure
    const pageRef = useRef(1);           // observer callback reads this to compute "next page"
    const loadMoreRef = useRef(null);

    const [selectedCategoryPath, setSelectedCategoryPath] = useState(pathSegments.join('/'));
    const [currentCategoryName, setCurrentCategoryName] = useState(null);

    const [priceRange, setPriceRange] = useState(Number(searchParams.get('max_price')) || 100000);
    const [selectedColors, setSelectedColors] = useState(searchParams.getAll('color[]'));
    const [selectedSizes, setSelectedSizes] = useState(searchParams.getAll('size[]'));
    const [selectedBrands, setSelectedBrands] = useState(searchParams.getAll('brand[]'));
    const [sortOption, setSortOption] = useState(() => {
        const fromUrl = searchParams.get('sort');
        return SORT_OPTIONS.some((o) => o.value === fromUrl) ? fromUrl : DEFAULT_SORT_VALUE;
    });
    const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortOption)?.label || SORT_OPTIONS[0].label;

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

    useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
    useEffect(() => { pageRef.current = page; }, [page]);

    // Fetches one page for the CURRENT filter state (closes over
    // selectedCategoryPath/priceRange/etc. — that's why it's rebuilt via
    // useCallback whenever those change, same as the working all-products
    // page's fetchProducts).
    const fetchProducts = useCallback(async (pageToFetch, isFilterChange) => {
        if (fetchedPages.current.has(pageToFetch) || fetchingRef.current) return;
        fetchedPages.current.add(pageToFetch);
        fetchingRef.current = true;

        if (isFilterChange) setLoading(true);
        else setLoadingMore(true);

        const categorySegment = selectedCategoryPath ? `/${selectedCategoryPath}` : '';
        const qp = new URLSearchParams();
        if (priceRange) qp.set('max_price', priceRange);
        selectedColors.forEach((c) => qp.append('color[]', c));
        selectedSizes.forEach((s) => qp.append('size[]', s));
        selectedBrands.forEach((b) => qp.append('brand[]', b));
        if (sortOption) qp.set('sort', sortOption);
        qp.set('page', pageToFetch);
        qp.set('per_page', PAGE_SIZE);

        try {
            const res = await fetch(`${API_BASE_URL}/api/categories-products${categorySegment}?${qp.toString()}`);
            const data = await res.json();

            // Matches the shape confirmed working on /api/all-products:
            // { data: [...], meta: { has_more | current_page/last_page } }.
            // Falls back to a couple of older shapes in case
            // categories-products differs from all-products.
            const items = data?.data || data?.products || (Array.isArray(data) ? data : []);
            const meta = data?.meta || data || {};
            const more = typeof meta.has_more === 'boolean'
                ? meta.has_more
                : typeof meta.hasMore === 'boolean'
                    ? meta.hasMore
                    : (meta.current_page && meta.last_page)
                        ? meta.current_page < meta.last_page
                        : items.length === PAGE_SIZE;

            if (isFilterChange) {
                setProducts(items);
            } else {
                setProducts((prev) => {
                    const existingIds = new Set(prev.map((p) => p.id));
                    return [...prev, ...items.filter((p) => !existingIds.has(p.id))];
                });
            }

            setHasMore(more);
            hasMoreRef.current = more;
            setPage(pageToFetch);
            pageRef.current = pageToFetch;
        } catch (err) {
            console.error("Error fetching products:", err);
            if (isFilterChange) setProducts([]);
            setHasMore(false);
            hasMoreRef.current = false;
        } finally {
            setLoading(false);
            setLoadingMore(false);
            fetchingRef.current = false;
            hasLoadedOnce.current = true;
        }
    }, [selectedCategoryPath, priceRange, selectedColors, selectedSizes, selectedBrands, sortOption]);

    // Filter/sort/category changed: sync the URL, wipe the page-dedupe
    // guard, and fetch a fresh page 1.
    useEffect(() => {
        const categorySegment = selectedCategoryPath ? `/${selectedCategoryPath}` : '';
        const visibleQp = new URLSearchParams();
        if (priceRange) visibleQp.set('max_price', priceRange);
        selectedColors.forEach((c) => visibleQp.append('color[]', c));
        selectedSizes.forEach((s) => visibleQp.append('size[]', s));
        selectedBrands.forEach((b) => visibleQp.append('brand[]', b));
        if (sortOption) visibleQp.set('sort', sortOption);
        const visibleQueryString = visibleQp.toString();
        router.replace(`/ExploreProducts${categorySegment}${visibleQueryString ? `?${visibleQueryString}` : ''}`, { scroll: false });

        fetchedPages.current.clear();
        setHasMore(true);
        fetchProducts(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCategoryPath, priceRange, selectedColors, selectedSizes, selectedBrands, sortOption]);

    // Sets up the IntersectionObserver once content exists, and re-attaches
    // whenever fetchProducts changes identity (i.e. whenever filters
    // change) so load-more always fetches with the CURRENT filters, not
    // whatever was active when the observer was first created.
    useEffect(() => {
        if (!hasLoadedOnce.current || !loadMoreRef.current) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreRef.current && !fetchingRef.current) {
                    fetchProducts(pageRef.current + 1, false);
                }
            },
            { rootMargin: '400px' }
        );
        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [fetchProducts, products.length]); // products.length: re-observe once the sentinel div actually mounts after the first render

    const handleClearFilters = () => {
        setSelectedCategoryPath('');
        setPriceRange(100000);
        setSelectedColors([]);
        setSelectedSizes([]);
        setSelectedBrands([]);
    };

    const toggleInArray = (setter) => (value) => {
        setter((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
    };

    const toggleColorSelection = toggleInArray(setSelectedColors);
    const toggleSizeSelection = toggleInArray(setSelectedSizes);
    const toggleBrandSelection = toggleInArray(setSelectedBrands);

    const handleSortSelect = (value) => {
        setSortOption(value);
        setSortOpen(false);
    };

    if (!hasLoadedOnce.current && loading) {
        return <ShopShimmer />;
    }

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4">
                <div className="text-center mb-5">
                    <h1 className="text-2xl sm:text-2xl font-extrabold text-gray-900 flex items-center justify-center gap-2">
                        <span>🛍️</span> Explore Our Products
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 max-w-xl mx-auto">
                        Discover the best products from multiple categories. Use filters to find exactly what you want.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <CategorySidebar
                        pathSegments={selectedCategoryPath ? selectedCategoryPath.split('/') : []}
                        onCategoryClick={setSelectedCategoryPath}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        selectedColors={selectedColors}
                        onColorToggle={toggleColorSelection}
                        selectedSizes={selectedSizes}
                        onSizeToggle={toggleSizeSelection}
                        selectedBrands={selectedBrands}
                        onBrandToggle={toggleBrandSelection}
                        onClearFilters={handleClearFilters}
                        onCurrentCategoryChange={(node) => setCurrentCategoryName(node?.name || null)}
                    />

                    <div className="container mx-auto">
                        <div className="flex justify-between items-center bg-white px-4 p-2 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <h2 className="font-bold text-gray-800">
                                {currentCategoryName ? `Products in ${currentCategoryName}` : "Products"} ({products.length})
                            </h2>

                            <div className="relative inline-block " ref={sortRef}>
                                <button
                                    type="button"
                                    onClick={() => setSortOpen((o) => !o)}
                                    className="flex items-center gap-2 border border-gray-100 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer min-w-[170px] justify-between"
                                >
                                    {currentSortLabel}
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
                                                key={option.value}
                                                type="button"
                                                onClick={() => handleSortSelect(option.value)}
                                                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${sortOption === option.value
                                                    ? "bg-gray-50 text-gray-900 font-semibold"
                                                    : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                                    <div key={i} className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
                                        <div className="p-2 sm:p-3 flex flex-col gap-1.5">
                                            <div className="h-3.5 sm:h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <p className="text-gray-500 text-sm font-medium">No products found matching your filters.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                                    {products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}

                                    {loadingMore &&
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <div key={`skeleton-${i}`} className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                                                <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
                                                <div className="p-2 sm:p-3 flex flex-col gap-1.5">
                                                    <div className="h-3.5 sm:h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
                                                    <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
                                                </div>
                                            </div>
                                        ))}
                                </div>

                                {hasMore && <div ref={loadMoreRef} className="w-full h-4" />}

                                {!hasMore && !loadingMore && (
                                    <p className="text-center text-xs text-gray-400 mt-6">
                                        You've reached the end of the results.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExploreProductsPage = () => (
    <Suspense fallback={<ShopShimmer />}>
        <ExploreProductsContent />
    </Suspense>
);

export default ExploreProductsPage;