"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { FaArrowLeft, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

/* Global cache outside component lifecycle: categories are fetched once per
   session, so the sidebar never shows its skeleton again. */
let cachedCategoriesData = null;
let isFetchingCategories = false;
const categoryListeners = new Set();

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

const MAX_PRICE = 100000;

const CategorySidebar = ({
  pathSegments = [],
  onCategoryClick,
  priceRange,
  onPriceChange,
  selectedColors = [],
  onColorToggle,
  selectedSizes = [],
  onSizeToggle,
  selectedBrands = [],
  onBrandToggle,
  onClearFilters,
  onCurrentCategoryChange,
}) => {
  const searchParams = useSearchParams();
  const hasSearchKeyword = Boolean(searchParams?.get('search'));

  const [categoriesData, setCategoriesData] = useState(() => cachedCategoriesData || []);
  const [categoriesLoading, setCategoriesLoading] = useState(() => !cachedCategoriesData);

  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [brandsExpanded, setBrandsExpanded] = useState(false);
  const VISIBLE_CATEGORY_COUNT = 6;
  const VISIBLE_BRAND_COUNT = 4;

  /* Local price value so dragging the slider is smooth and does not
     fire a fetch on every single pixel of movement. */
  const [localPrice, setLocalPrice] = useState(priceRange);
  useEffect(() => { setLocalPrice(priceRange); }, [priceRange]);

  const fullPath = pathSegments.join('/');
  const currentSlug = pathSegments[pathSegments.length - 1] || '';
  const selectedCategory = currentSlug;

  useEffect(() => {
    if (cachedCategoriesData) {
      setCategoriesData(cachedCategoriesData);
      setCategoriesLoading(false);
      return;
    }

    const listener = (data) => {
      setCategoriesData(data);
      setCategoriesLoading(false);
    };
    categoryListeners.add(listener);

    if (!isFetchingCategories) {
      isFetchingCategories = true;
      fetch(`${API_BASE_URL}/api/category-sidebar`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.categories) {
            cachedCategoriesData = data.categories;
            categoryListeners.forEach((fn) => fn(data.categories));
          }
        })
        .catch((err) => {
          console.error("Error fetching sidebar categories:", err);
          categoryListeners.forEach((fn) => fn([]));
        })
        .finally(() => {
          isFetchingCategories = false;
        });
    }

    return () => {
      categoryListeners.delete(listener);
    };
  }, []);

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

  const { currentNode, currentChildren, displayedCategories, backPath, backLabel } = useMemo(() => {
    const match = currentSlug ? findNodeWithParent(categoriesData, currentSlug) : null;
    const node = match?.node || null;
    const children = node?.all_children || node?.children || [];

    const hasKids = children.length > 0;
    const displayed = hasKids
      ? children
      : (match?.parent
          ? (match.parent.all_children || match.parent.children || [])
          : categoriesData);

    const prevPath = hasKids
      ? pathSegments.slice(0, -1).join('/')
      : pathSegments.slice(0, -2).join('/');

    const label = match?.parent?.name || "All Categories";

    return {
      currentNode: node,
      currentChildren: children,
      displayedCategories: displayed,
      backPath: prevPath,
      backLabel: label
    };
  }, [categoriesData, currentSlug, pathSegments]);

  const hasChildren = currentChildren.length > 0;

  const visibleCategories = categoriesExpanded
    ? displayedCategories
    : displayedCategories.slice(0, VISIBLE_CATEGORY_COUNT);
  const hiddenCategoryCount = Math.max(displayedCategories.length - VISIBLE_CATEGORY_COUNT, 0);

  const visibleBrands = brandsExpanded
    ? AVAILABLE_BRANDS
    : AVAILABLE_BRANDS.slice(0, VISIBLE_BRAND_COUNT);
  const hiddenBrandCount = Math.max(AVAILABLE_BRANDS.length - VISIBLE_BRAND_COUNT, 0);

  const hasActiveFilters =
    Boolean(selectedCategory) ||
    priceRange < MAX_PRICE ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    selectedBrands.length > 0 ||
    hasSearchKeyword;

  /* Report the resolved node upward without looping. */
  const lastReportedIdRef = useRef(undefined);
  useEffect(() => {
    const id = currentNode?.id ?? null;
    if (lastReportedIdRef.current === id) return;
    lastReportedIdRef.current = id;
    if (onCurrentCategoryChange) onCurrentCategoryChange(currentNode);
  }, [currentNode, onCurrentCategoryChange]);

  if (categoriesLoading) {
    return (
      <aside className="w-full lg:w-1/5 bg-white p-5 rounded-xl shadow h-fit hidden lg:block overflow-visible sticky top-18 animate-pulse">
        <div className="flex items-center justify-between mb-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>

        <div className="flex flex-col gap-1.5 pb-2">
          {[75, 55, 80, 60, 70, 50].map((widthPercent, i) => (
            <div key={i} className="py-1.5 px-3">
              <div className="h-4 bg-gray-200 rounded" style={{ width: `${widthPercent}%` }}></div>
            </div>
          ))}
          <div className="w-full h-8 bg-gray-100 rounded-lg mt-1 border border-gray-200/60"></div>
        </div>

        <div className="h-4 w-12 bg-gray-200 rounded mt-4 mb-2"></div>
        <div className="space-y-2 my-2 pb-3 border-b border-gray-100">
          <div className="w-full h-2 bg-gray-200 rounded-lg"></div>
          <div className="flex justify-between items-center">
            <div className="h-3 w-8 bg-gray-200 rounded"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="h-4 w-16 bg-gray-200 rounded mt-4 mb-2"></div>
        <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200"></div>
          ))}
        </div>

        <div className="h-4 w-12 bg-gray-200 rounded mt-4 mb-2"></div>
        <div className="flex flex-wrap gap-2 my-2 pb-3 border-b border-gray-100">
          {['w-7', 'w-8', 'w-7', 'w-9', 'w-8'].map((w, i) => (
            <div key={i} className={`h-6 ${w} bg-gray-200 rounded`}></div>
          ))}
        </div>

        <div>
          <div className="h-4 w-16 bg-gray-200 rounded mt-4 mb-2"></div>
          <div className="flex flex-col gap-2 pb-1">
            {[65, 45, 75, 55].map((widthPercent, i) => (
              <div key={i} className="flex items-center gap-2.5 py-0.5">
                <div className="w-4 h-4 rounded bg-gray-200 shrink-0"></div>
                <div className="h-3.5 bg-gray-200 rounded" style={{ width: `${widthPercent}%` }}></div>
              </div>
            ))}
          </div>
          <div className="w-full h-8 bg-gray-100 rounded-lg mt-3 border border-gray-200/60"></div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-1/5 bg-white p-5 rounded-xl shadow h-fit hidden lg:block overflow-visible sticky top-18">
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

      <div className="flex flex-col gap-1 pb-2">
        {pathSegments.length > 0 && (
          <button
            type="button"
            onClick={() => onCategoryClick(backPath)}
            className="text-xs text-emerald-600 font-semibold mb-1 flex items-center gap-1 hover:underline cursor-pointer text-left bg-transparent border-none p-0"
          >
            <FaArrowLeft className="text-[10px]" /> Back to {backLabel}
          </button>
        )}

        {visibleCategories.map((category) => {
          const isSelected = category.slug === currentSlug;
          const targetPath = hasChildren
            ? (fullPath ? `${fullPath}/${category.slug}` : category.slug)
            : (pathSegments.slice(0, -1).concat(category.slug).join('/'));

          return (
            <button
              type="button"
              key={category.id || category.slug}
              onClick={() => onCategoryClick(targetPath)}
              className={`text-sm text-left py-1.5 px-3 rounded transition cursor-pointer border-none font-medium ${
                isSelected
                  ? 'bg-gray-100 text-black font-semibold'
                  : 'text-gray-700 hover:text-black hover:bg-gray-50 bg-transparent'
              }`}
            >
              {category.name}
            </button>
          );
        })}

        {hiddenCategoryCount > 0 && (
          <button
            type="button"
            onClick={() => setCategoriesExpanded((e) => !e)}
            className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-black bg-gray-50 hover:bg-gray-100 rounded-lg py-2 cursor-pointer border border-gray-200 transition"
          >
            {categoriesExpanded ? (
              <>Show Less <FaChevronUp className="text-[10px]" /></>
            ) : (
              <>See More ({hiddenCategoryCount}) <FaChevronDown className="text-[10px]" /></>
            )}
          </button>
        )}
      </div>

      {/* PRICE RANGE */}
      <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">Price</h2>
      <div className="space-y-2 my-2 pb-3 border-b border-gray-100">
        <input
          type="range"
          min="0"
          max={MAX_PRICE}
          step="500"
          value={localPrice}
          onChange={(e) => setLocalPrice(Number(e.target.value))}
          onMouseUp={(e) => onPriceChange(Number(e.target.value))}
          onTouchEnd={(e) => onPriceChange(Number(e.target.value))}
          onKeyUp={(e) => onPriceChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-500 font-medium">
          <span>Rs 0</span>
          <span className="text-black font-bold">Max: Rs {localPrice.toLocaleString()}</span>
        </div>
      </div>

      {/* COLOR FILTER */}
      <h2 className="font-bold text-sm mt-4 tracking-tight text-gray-900">
        Color {selectedColors.length > 0 && <span className="text-emerald-600">({selectedColors.length})</span>}
      </h2>
      <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
        {AVAILABLE_COLORS.map((colorObj, index) => {
          const isSelected = selectedColors.some(
            (c) => c.toLowerCase() === colorObj.name.toLowerCase()
          );
          const isLightColor = ['#ffffff', '#facc15', '#f472b6'].includes(colorObj.hex);
          const inlineBg = colorObj.hex === '#ffffff'
            ? { backgroundColor: '#ffffff', border: '1px solid #d1d5db' }
            : { backgroundColor: colorObj.hex };

          return (
            <button
              type="button"
              key={index}
              onClick={() => onColorToggle(colorObj.name.toLowerCase())}
              title={colorObj.name}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full cursor-pointer transition-all duration-200 transform hover:scale-110 relative flex items-center justify-center border-none ${
                isSelected
                  ? 'scale-110 shadow-md ring-2 ring-inset ring-white/70'
                  : 'shadow-sm opacity-80 hover:opacity-100'
              }`}
              style={inlineBg}
            >
              {isSelected && (
                <FaCheck className={`text-[10px] ${isLightColor ? 'text-black' : 'text-white'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* SIZE FILTER */}
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
              className={`px-2.5 py-1 cursor-pointer text-xs rounded border transition-all font-medium ${
                isSizeSelected
                  ? 'bg-black text-white border-black shadow'
                  : 'bg-gray-50 text-gray-700 border-gray-300'
              }`}
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
              <>See More ({hiddenBrandCount}) <FaChevronDown className="text-[10px]" /></>
            )}
          </button>
        )}
      </div>
    </aside>
  );
};

export default React.memo(CategorySidebar);