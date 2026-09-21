"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import SearchBar from "@/app/Navbar/SearchBar";
import { FaShoppingCart, FaBars, FaTimes, FaHeart, FaUser, FaBox, FaSignOutAlt, FaSearch } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

const TopNavbar = ({
  mounted,
  storeSettings,
  wishlistCount,
  cartCount,
  user,
  isLoggedIn,
  menuOpen,
  setMenuOpen,
  onOpenImageSearch,
  onOpenAuthModal,
  onLogout,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getStoreLogoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${API_BASE_URL}/storage/${path.startsWith("/") ? path.slice(1) : path}`;
  };

  const isLogoEnabled = Boolean(storeSettings?.is_logo === true || storeSettings?.is_logo === 1 || storeSettings?.is_logo === "1");
  const isTitleEnabled = Boolean(storeSettings?.is_title === true || storeSettings?.is_title === 1 || storeSettings?.is_title === "1");

  return (
    <div className="bg-black sticky top-0 lg:static z-[100] relative w-full">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Top Fixed Row (Strictly h-14 on mobile, h-18 on desktop) */}
        <div className="relative flex justify-between items-center h-15 w-full text-white">
          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-2xl p-2 hover:text-blue-400 z-10 -ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

          {/* Centered Brand on Mobile / Left-aligned on Desktop */}
          <div className="absolute inset-0 flex items-center justify-center md:static md:inset-auto md:justify-start md:flex-1 md:basis-0 pointer-events-none md:pointer-events-auto min-w-0">
            <Link href="/" className="pointer-events-auto flex items-center gap-2 hover:opacity-90 min-w-0">
              {mounted && storeSettings ? (
                <>
                  {isLogoEnabled && getStoreLogoUrl(storeSettings.logo) && (
                    <img
                      src={getStoreLogoUrl(storeSettings.logo)}
                      alt={storeSettings?.title || "Store Logo"}
                      className="h-7 sm:h-9 w-auto max-w-[120px] sm:max-w-[150px] object-contain rounded-md"
                    />
                  )}
                  {isTitleEnabled && storeSettings?.title && (
                    <span className="text-base sm:text-xl font-bold tracking-tight text-white whitespace-nowrap truncate">
                      {storeSettings.title}
                    </span>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2.5 animate-pulse py-1">
                  <div className="h-6 sm:h-8 w-8 sm:w-10 bg-neutral-800 rounded-md" />
                  <div className="h-4 sm:h-5 w-24 sm:w-28 bg-neutral-800 rounded" />
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-shrink-0 w-full max-w-xl mx-4 relative">
            <SearchBar onOpenImageSearch={onOpenImageSearch} onSelectResult={() => {}} />
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center justify-end md:flex-1 md:basis-0 flex-shrink-0">
            <Link href="/Wishlist" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
              <FaHeart className="text-xl hover:text-red-500 transition" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/CartProduct" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
              <FaShoppingCart className="text-xl hover:text-[#00c65e] transition" />
              {mounted && cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#00c65e] text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:block h-8 border-l border-gray-700 mx-3" />

            {/* Profile Dropdown */}
            <div className="relative py-1 " ref={dropdownRef}>
              <button
                type="button"
                onClick={() => (!isLoggedIn ? onOpenAuthModal("login") : setShowDropdown((prev) => !prev))}
                className="group flex items-center gap-2 text-left"
              >
                <div className="text-white text-lg group-hover:text-[#00c65e]"><FaUser /></div>
                <div className="leading-tight">
                  <span className="block text-[10px] uppercase text-gray-400">Welcome</span>
                  <span className="block text-xs font-bold text-white truncate max-w-[110px] group-hover:text-[#00c65e]">
                    {mounted && isLoggedIn ? user.name : "Sign in / Register"}
                  </span>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 truncate text-sm">{isLoggedIn ? user.name : "Hello, Guest"}</h3>
                    <p className="text-xs text-gray-500 truncate">{isLoggedIn ? user.email : "Welcome to our store!"}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/Profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                      <FaUser className="text-gray-400 text-sm" /> <span>My Profile</span>
                    </Link>
                    <Link href="/Orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">
                      <FaBox className="text-gray-400 text-sm" /> <span>My Orders</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={() => { setShowDropdown(false); onLogout(); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">
                      <FaSignOutAlt className="text-red-500 text-sm" /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Right Icons */}
          <div className="flex md:hidden items-center gap-1 z-10">
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="p-2 text-white hover:text-gray-300"
              aria-label="Toggle Search"
            >
              {mobileSearchOpen ? <FaTimes className="text-base" /> : <FaSearch className="text-base" />}
            </button>
           
          </div>
        </div>

        {/* Mobile Expandable Search Tray */}
        <div
          className={`md:hidden -mx-3 sm:-mx-4 grid transition-all duration-300 ease-in-out bg-[#e5e7eb] overflow-hidden ${
            mobileSearchOpen
              ? "grid-rows-[1fr] opacity-100 py-2.5 px-3 border-b border-gray-300"
              : "grid-rows-[0fr] opacity-0 py-0 px-3 border-none"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <SearchBar
              onOpenImageSearch={() => {
                setMobileSearchOpen(false);
                onOpenImageSearch();
              }}
              onSelectResult={() => setMobileSearchOpen(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;