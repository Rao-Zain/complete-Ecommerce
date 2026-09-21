"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaArrowLeft, FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const CategoriesPageScreen = () => {
  const router = useRouter();

  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  // Accordion open states
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [openSubCategoryId, setOpenSubCategoryId] = useState(null);

  // Load cached data & cart count on mount
  useEffect(() => {
    try {
      const cachedCats = localStorage.getItem("navbarCategories");
      if (cachedCats) setCategoriesData(JSON.parse(cachedCats));

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch full category tree
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        if (res.ok) {
          const json = await res.json();
          const normalized = Array.isArray(json?.data ? json.data : json)
            ? json.data || json
            : [];
          setCategoriesData(normalized);
          localStorage.setItem("navbarCategories", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryImage = (img) => {
    if (!img) return null;
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    return `${IMAGE_BASE_URL}/cat_image/${img}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-24">
      {/* Top Fixed Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Back"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <h1 className="text-base font-bold text-gray-900 tracking-tight">
            Shop by Category
          </h1>
        </div>

        <Link
          href="/CartProduct"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="View Cart"
        >
          <FaShoppingCart className="text-sm" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      {/* Category List Container */}
      <main className="max-w-md mx-auto p-4 space-y-3">
        {loading && categoriesData.length === 0 ? (
          // Skeleton Loader
          <div className="space-y-3">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between animate-pulse"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-gray-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-2/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/4" />
                  </div>
                </div>
                <div className="w-4 h-4 bg-gray-200 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          categoriesData.map((mainCat) => {
            const subcategories = mainCat.children || mainCat.subcategories || [];
            const isMainOpen = openCategoryId === mainCat.id;

            return (
              <div
                key={mainCat.id}
                className="bg-white rounded-2xl border border-gray-100/90 shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-200"
              >
                {/* Level 1: Main Category Card */}
                <div
                  onClick={() => {
                    setOpenCategoryId(isMainOpen ? null : mainCat.id);
                    setOpenSubCategoryId(null);
                  }}
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none hover:bg-gray-50/60 active:bg-gray-50"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Category Image / Icon */}
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                      {mainCat.image || mainCat.icon ? (
                        <img
                          src={getCategoryImage(mainCat.image || mainCat.icon)}
                          alt={mainCat.name}
                          className="w-full h-full object-contain p-1.5"
                        />
                      ) : (
                        <span className="text-sm font-bold text-gray-400">
                          {mainCat.name?.charAt(0)}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-gray-900 truncate">
                        {mainCat.name}
                      </h2>
                      <p className="text-[11px] text-gray-400 font-medium">
                        {subcategories.length} Subcategories
                      </p>
                    </div>
                  </div>

                  {/* Main Category Accordion / Direct Link Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/Categories/${mainCat.slug}`);
                      }}
                      className="text-[11px] font-semibold text-emerald-600 hover:underline px-2 py-1"
                    >
                      View All
                    </button>

                    {subcategories.length > 0 && (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform duration-200 ${
                          isMainOpen ? "rotate-180 text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        <FaChevronDown className="text-xs" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Level 2: Subcategories */}
                {isMainOpen && subcategories.length > 0 && (
                  <div className="border-t border-gray-100 bg-gray-50/30 divide-y divide-gray-100">
                    {subcategories.map((subCat) => {
                      const childItems = subCat.children || subCat.subcategories || [];
                      const isSubOpen = openSubCategoryId === subCat.id;

                      return (
                        <div key={subCat.id} className="bg-white">
                          <div className="flex items-center justify-between px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/Categories/${mainCat.slug}/${subCat.slug}`)
                              }
                              className={`text-xs font-semibold text-left flex-1 hover:text-emerald-600 transition-colors ${
                                isSubOpen ? "text-emerald-600" : "text-gray-700"
                              }`}
                            >
                              {subCat.name}
                            </button>

                            {childItems.length > 0 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenSubCategoryId(isSubOpen ? null : subCat.id);
                                }}
                                className={`p-1.5 rounded-full transition-transform duration-200 ${
                                  isSubOpen
                                    ? "rotate-180 text-emerald-600"
                                    : "text-gray-400"
                                }`}
                                aria-label="Toggle subcategory items"
                              >
                                <FaChevronDown className="text-[10px]" />
                              </button>
                            )}
                          </div>

                          {/* Level 3: Child Categories with Bullet Points */}
                          {isSubOpen && childItems.length > 0 && (
                            <div className="pb-3 pt-1 px-4 space-y-2 bg-[#fcfcfd] border-t border-gray-50">
                              {childItems.map((item) => (
                                <Link
                                  key={item.id}
                                  href={`/Categories/${mainCat.slug}/${subCat.slug}/${item.slug}`}
                                  className="flex items-center gap-2.5 text-xs text-gray-500 hover:text-emerald-600 transition-colors pl-2 py-1"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                  <span className="font-medium">{item.name}</span>
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};

export default CategoriesPageScreen;