"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/Navbar/SearchBar";
import {
  FaTimes,
  FaChevronDown,
} from "react-icons/fa";

const MobileMenu = ({
  isOpen,
  onClose,
  mounted,
  isLoggedIn,
  user,
  wishlistCount,
  cartCount,
  categoriesData,
  storeSettings,
  loading,
  onOpenAuthModal,
  onLogout,
  onOpenImageSearch,
}) => {
  const router = useRouter();
  const [openCategoryId, setOpenCategoryId] = useState(null);
  const [openSubCategoryId, setOpenSubCategoryId] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container: Flex layout with locked height */}
      <div className="absolute top-0 left-0 h-full w-[82%] max-w-sm bg-white text-gray-800 shadow-2xl flex flex-col">
        {/* Fixed Header */}
        <div className="relative flex items-center justify-between px-4 h-14 bg-black border-b border-gray-800 shrink-0">
          <div className="w-8" />

          {/* Centered Dynamic Logo / Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Link
              href="/"
              onClick={onClose}
              className="pointer-events-auto flex items-center justify-center gap-2"
            >
              {Boolean(storeSettings?.is_logo) && storeSettings?.logo && (
                <img
                  src={storeSettings.logo}
                  alt={storeSettings?.store_name || storeSettings?.title || storeSettings?.name || "Logo"}
                  className="h-7 max-w-[130px] object-contain"
                />
              )}
              {Boolean(storeSettings?.is_title) && (storeSettings?.store_name || storeSettings?.title || storeSettings?.name) && (
                <span className="font-bold text-lg tracking-tight text-white">
                  {storeSettings.store_name || storeSettings.title || storeSettings.name}
                </span>
              )}
            </Link>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-300 hover:text-white z-10"
            aria-label="Close menu"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Scrollable Content: Handles search bar and category list scrolling */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-24">
        
        

          {/* Categories Accordion */}
          <div className="p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Shop by Category
            </h3>
            {loading && categoriesData.length === 0 ? (
              <p className="text-xs text-gray-500">Loading...</p>
            ) : (
              <ul className="space-y-0.5">
                {categoriesData.map((mainCat) => {
                  const subcategories = mainCat.children || mainCat.subcategories || [];
                  const isMainOpen = openCategoryId === mainCat.id;

                  return (
                    <li key={mainCat.id}>
                      {/* Level 1: Main Category */}
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/Categories/${mainCat.slug}`);
                          }}
                          className="flex-1 text-left py-2 text-sm font-semibold text-gray-700 hover:text-gray-950"
                        >
                          {mainCat.name}
                        </button>
                        {subcategories.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setOpenCategoryId(isMainOpen ? null : mainCat.id);
                              setOpenSubCategoryId(null);
                            }}
                            className="p-2 text-gray-400"
                            aria-label="Toggle Subcategories"
                          >
                            <FaChevronDown
                              className={`text-xs transition-transform duration-200 ${
                                isMainOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Level 2: Subcategories */}
                      {isMainOpen && subcategories.length > 0 && (
                        <ul className="pl-3 border-l-2 border-gray-100 ml-1 mb-1 space-y-0.5">
                          {subcategories.map((subCat) => {
                            const childItems = subCat.children || subCat.subcategories || [];
                            const isSubOpen = openSubCategoryId === subCat.id;

                            return (
                              <li key={subCat.id}>
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onClose();
                                      router.push(`/Categories/${mainCat.slug}/${subCat.slug}`);
                                    }}
                                    className="flex-1 text-left py-1.5 text-xs text-gray-600 hover:text-gray-900"
                                  >
                                    {subCat.name}
                                  </button>
                                  {childItems.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setOpenSubCategoryId(isSubOpen ? null : subCat.id)
                                      }
                                      className="p-1 text-gray-400"
                                      aria-label="Toggle Child Categories"
                                    >
                                      <FaChevronDown
                                        className={`text-[10px] transition-transform duration-200 ${
                                          isSubOpen ? "rotate-180" : ""
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>

                                {/* Level 3: Child Categories with Bullet Points */}
                                {isSubOpen && childItems.length > 0 && (
                                  <ul className="pl-3 border-l-2 border-gray-100 ml-1 my-1 space-y-1">
                                    {childItems.map((item) => (
                                      <li key={item.id}>
                                        <Link
                                          href={`/Categories/${mainCat.slug}/${subCat.slug}/${item.slug}`}
                                          onClick={onClose}
                                          className="flex items-center gap-2 py-1 text-xs text-gray-500 hover:text-gray-800"
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 flex-shrink-0" />
                                          {item.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;