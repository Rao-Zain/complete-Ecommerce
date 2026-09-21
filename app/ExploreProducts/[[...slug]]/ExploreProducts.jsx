'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";
import ProductCard from "../../ProductCard/page";
import CategorySidebar from '../../CategorySidebar/page';
import ShopShimmer from "./ShopShimmer";

/* Base route of this page. */
const BASE_PATH = '/ExploreProducts';

/* Aligned values with Laravel Controller:
   $request->sort === 'price_low_high'$request->sort === 'price_high_low'
   fallback -> latest
*/
const SORT_OPTIONS = [
  { label: 'Latest Arrivals', value: 'latest' },
  { label: 'Price: Low to High', value: 'price_low_high' },
  { label: 'Price: High to Low', value: 'price_high_low' },
];
const DEFAULT_SORT_VALUE = 'latest';
const MAX_PRICE = 100000;

let hasRenderedOnce = false;

const ExploreProductsContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const initialPath = useMemo(
    () => (Array.isArray(params?.slug) ? params.slug.join('/') : params?.slug || ''),
    []
  );

  /* ---------------- state ---------------- */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [selectedCategoryPath, setSelectedCategoryPath] = useState(initialPath);
  const [currentCategoryName, setCurrentCategoryName] = useState(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [priceRange, setPriceRange] = useState(Number(searchParams.get('max_price')) || MAX_PRICE);
  const [selectedColors, setSelectedColors] = useState(() =>
    searchParams.getAll('color[]').map((c) => c.toLowerCase())
  );
  const [selectedSizes, setSelectedSizes] = useState(() => searchParams.getAll('size[]'));
  const [selectedBrands, setSelectedBrands] = useState(() => searchParams.getAll('brand[]'));
  
  const [sortOption, setSortOption] = useState(() => {
    const fromUrl = searchParams.get('sort');
    return SORT_OPTIONS.some((o) => o.value === fromUrl) ? fromUrl : DEFAULT_SORT_VALUE;
  });

  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  /* ---------------- refs ---------------- */
  const hasLoadedOnce = useRef(false);
  const fetchedPages = useRef(new Set());
  const fetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const pageRef = useRef(1);
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);

  const filtersRef = useRef(null);
  filtersRef.current = {
    selectedCategoryPath,
    priceRange,
    selectedColors,
    selectedSizes,
    selectedBrands,
    sortOption,
    searchQuery,
  };

  useEffect(() => { hasMoreRef.current = hasMore; }, [hasMore]);
  useEffect(() => { pageRef.current = page; }, [page]);

  /* ---------------- URL writing ---------------- */
  const spString = searchParams.toString();
  const lastSyncedRef = useRef(spString);

  const buildQuery = (f) => {
    const qp = new URLSearchParams();
    if (f.searchQuery && f.searchQuery.trim()) qp.set('search', f.searchQuery.trim());
    if (f.priceRange && f.priceRange < MAX_PRICE) qp.set('max_price', String(f.priceRange));
    f.selectedColors.forEach((c) => qp.append('color[]', c.toLowerCase()));
    f.selectedSizes.forEach((s) => qp.append('size[]', s));
    f.selectedBrands.forEach((b) => qp.append('brand[]', b));
    if (f.sortOption && f.sortOption !== DEFAULT_SORT_VALUE) qp.set('sort', f.sortOption);
    return qp;
  };

  const syncUrl = useCallback((overrides = {}) => {
    if (typeof window === 'undefined') return;
    const f = { ...filtersRef.current, ...overrides };
    const segment = f.selectedCategoryPath ? `/${f.selectedCategoryPath}` : '';
    const qs = buildQuery(f).toString();

    lastSyncedRef.current = qs;
    const url = `${BASE_PATH}${segment}${qs ? `?${qs}` : ''}`;
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    if (lastSyncedRef.current === spString) return;
    lastSyncedRef.current = spString;

    const sp = new URLSearchParams(spString);
    setSearchQuery(sp.get('search') || '');
    setSelectedColors(sp.getAll('color[]').map((c) => c.toLowerCase()));
    setSelectedSizes(sp.getAll('size[]'));
    setSelectedBrands(sp.getAll('brand[]'));
    setPriceRange(sp.get('max_price') ? Number(sp.get('max_price')) : MAX_PRICE);

    const s = sp.get('sort');
    setSortOption(SORT_OPTIONS.some((o) => o.value === s) ? s : DEFAULT_SORT_VALUE);
  }, [spString]);

  /* ---------------- fetching ---------------- */
  const fetchProducts = useCallback(async (pageToFetch, isFilterChange) => {
    if (!isFilterChange && (fetchedPages.current.has(pageToFetch) || fetchingRef.current)) return;

    const reqId = ++requestIdRef.current;
    fetchedPages.current.add(pageToFetch);
    fetchingRef.current = true;

    if (isFilterChange) setLoading(true);
    else setLoadingMore(true);

    const f = filtersRef.current;
    const categorySegment = f.selectedCategoryPath ? `/${f.selectedCategoryPath}` : '';
    const qp = buildQuery(f);
    
    // Backend custom pagination: page 1 delivers 15 items, page 2+ delivers 10
    const expectedBatchSize = pageToFetch === 1 ? 15 : 10;
    qp.set('sort', f.sortOption);
    qp.set('page', String(pageToFetch));

    try {
      const res = await fetch(`${API_BASE_URL}/api/categories-products${categorySegment}?${qp.toString()}`);
      const data = await res.json();

      if (reqId !== requestIdRef.current) return;

      const items = data?.products || data?.data || (Array.isArray(data) ? data : []);
      
      const more = (data.current_page && data.last_page)
        ? data.current_page < data.last_page
        : items.length >= expectedBatchSize;

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
      if (reqId !== requestIdRef.current) return;
      console.error("Error fetching products:", err);
      if (isFilterChange) setProducts([]);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      if (reqId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        fetchingRef.current = false;
        hasLoadedOnce.current = true;
        hasRenderedOnce = true;
      }
    }
  }, []);

  const filterKey = useMemo(() => JSON.stringify([
    selectedCategoryPath,
    priceRange,
    [...selectedColors].sort(),
    [...selectedSizes].sort(),
    [...selectedBrands].sort(),
    sortOption,
    searchQuery,
  ]), [selectedCategoryPath, priceRange, selectedColors, selectedSizes, selectedBrands, sortOption, searchQuery]);

  useEffect(() => {
    fetchedPages.current.clear();
    fetchingRef.current = false;
    setHasMore(true);
    hasMoreRef.current = true;
    setPage(1);
    pageRef.current = 1;
    fetchProducts(1, true);
  }, [filterKey, fetchProducts]);

  /* ---------------- infinite scroll ---------------- */
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !fetchingRef.current && !loading) {
          fetchProducts(pageRef.current + 1, false);
        }
      },
      { rootMargin: '400px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [fetchProducts, products.length, hasMore, loading]);

  /* ---------------- dropdown listener ---------------- */
  useEffect(() => {
    function handleClickOutside(e) {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------------- stable handlers ---------------- */
  const handleClearFilters = useCallback(() => {
    setSelectedCategoryPath('');
    setPriceRange(MAX_PRICE);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSortOption(DEFAULT_SORT_VALUE);
    setSearchQuery('');
    syncUrl({
      selectedCategoryPath: '',
      priceRange: MAX_PRICE,
      selectedColors: [],
      selectedSizes: [],
      selectedBrands: [],
      sortOption: DEFAULT_SORT_VALUE,
      searchQuery: '',
    });
  }, [syncUrl]);

  const handleCategoryClick = useCallback((path) => {
    setSelectedCategoryPath(path);
    syncUrl({ selectedCategoryPath: path });
  }, [syncUrl]);

  const handlePriceChange = useCallback((price) => {
    setPriceRange(price);
    syncUrl({ priceRange: price });
  }, [syncUrl]);

  const toggleColorSelection = useCallback((color) => {
    const c = color.toLowerCase();
    const current = filtersRef.current.selectedColors;
    const updated = current.includes(c) ? current.filter((x) => x !== c) : [...current, c];
    setSelectedColors(updated);
    syncUrl({ selectedColors: updated });
  }, [syncUrl]);

  const toggleSizeSelection = useCallback((size) => {
    const current = filtersRef.current.selectedSizes;
    const updated = current.includes(size) ? current.filter((s) => s !== size) : [...current, size];
    setSelectedSizes(updated);
    syncUrl({ selectedSizes: updated });
  }, [syncUrl]);

  const toggleBrandSelection = useCallback((brand) => {
    const current = filtersRef.current.selectedBrands;
    const updated = current.includes(brand) ? current.filter((b) => b !== brand) : [...current, brand];
    setSelectedBrands(updated);
    syncUrl({ selectedBrands: updated });
  }, [syncUrl]);

  const handleSortSelect = useCallback((value) => {
    setSortOption(value);
    setSortOpen(false);
    syncUrl({ sortOption: value });
  }, [syncUrl]);

  const handleCurrentCategoryChange = useCallback((node) => {
    setCurrentCategoryName(node?.name || null);
  }, []);

  const sidebarPathSegments = useMemo(
    () => (selectedCategoryPath ? selectedCategoryPath.split('/') : []),
    [selectedCategoryPath]
  );

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortOption)?.label || SORT_OPTIONS[0].label;

  if (!hasRenderedOnce && !hasLoadedOnce.current && loading) {
    return <ShopShimmer />;
  }

  const gridSkeleton = (count, prefix) =>
    Array.from({ length: count }).map((_, i) => (
      <div key={`${prefix}-${i}`} className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
        <div className="p-2 sm:p-3 flex flex-col gap-1.5">
          <div className="h-3.5 sm:h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    ));

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:pb-2">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Explore Our Products"}
          </h1>
          <p className="text-[16px] text-gray-500 mt-0.5 max-w-md mx-auto">
            {searchQuery
              ? `Showing matching products for your search query`
              : "Shop top products by category, price, color, and size."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 pb-6 pt-3 lg:mt-0">
          <CategorySidebar
            pathSegments={sidebarPathSegments}
            onCategoryClick={handleCategoryClick}
            priceRange={priceRange}
            onPriceChange={handlePriceChange}
            selectedColors={selectedColors}
            onColorToggle={toggleColorSelection}
            selectedSizes={selectedSizes}
            onSizeToggle={toggleSizeSelection}
            selectedBrands={selectedBrands}
            onBrandToggle={toggleBrandSelection}
            onClearFilters={handleClearFilters}
            onCurrentCategoryChange={handleCurrentCategoryChange}
          />

          <div className="flex-1 min-w-0">
            <div className="mb-3 flex flex-row gap-4 items-center justify-between border border-gray-200 rounded-xl py-2 px-4 bg-white">
              <h2 className="text-base sm:text-lg font-semibold text-gray-700">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : currentCategoryName
                    ? `Products in ${currentCategoryName}`
                    : "Products"}{" "}
                {!loading && `(${products.length})`}
              </h2>

              <div className="w-44 relative h-[34px]" ref={sortRef}>
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="w-full h-full bg-white border border-gray-200 rounded-full px-3 focus:outline-none text-xs cursor-pointer font-medium text-gray-700 flex items-center justify-between"
                >
                  <span className="truncate">{currentSortLabel}</span>
                  {sortOpen ? (
                    <FaChevronUp className="text-[10px] text-gray-400 ml-1 shrink-0" />
                  ) : (
                    <FaChevronDown className="text-[10px] text-gray-400 ml-1 shrink-0" />
                  )}
                </button>

                {sortOpen && (
                  <div className="absolute right-0 mt-2 w-full min-w-[170px] bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-20 overflow-hidden">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleSortSelect(option.value)}
                        className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          sortOption === option.value
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
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                {gridSkeleton(15, 'load')}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <p className="text-gray-500 text-sm font-medium">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try different keywords or clearing filters.`
                    : "No products found matching your filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                  {loadingMore && gridSkeleton(5, 'more')}
                </div>

                {hasMore && <div ref={loadMoreRef} className="w-full h-4" />}

                {!hasMore && !loadingMore && (
                  <p className="text-center text-xs text-gray-400 mt-6">
                    You&apos;ve reached the end of the results.
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