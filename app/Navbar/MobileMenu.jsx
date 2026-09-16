"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/app/Navbar/SearchBar";
import { FaTimes, FaUser, FaSignOutAlt, FaSignInAlt, FaHeart, FaShoppingCart, FaBox, FaChevronDown } from "react-icons/fa";

const MobileMenu = ({
  isOpen,
  onClose,
  mounted,
  isLoggedIn,
  user,
  wishlistCount,
  cartCount,
  categoriesData,
  loading,
  onOpenAuthModal,
  onLogout,
  onOpenImageSearch,
}) => {
  const router = useRouter();
  const [openCategoryId, setOpenCategoryId] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 left-0 h-full w-[82%] max-w-sm bg-white text-gray-800 shadow-2xl overflow-y-auto">
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <h2 className="font-extrabold text-lg tracking-tight text-gray-900">
            Shop<span className="text-blue-600">Nest</span>
          </h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100">
          <SearchBar
            onOpenImageSearch={() => { onClose(); onOpenImageSearch(); }}
            onSelectResult={onClose}
          />
        </div>

        {/* Profile / Sign In */}
        <div className="p-4 border-b border-gray-100">
          {mounted && isLoggedIn ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 flex-shrink-0">
                  <FaUser />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button onClick={onLogout} className="text-xs font-semibold text-red-600 flex items-center gap-1">
                <FaSignOutAlt /> Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => { onClose(); onOpenAuthModal("login"); }}
              className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-white text-sm font-semibold py-2.5 rounded-xl"
            >
              <FaSignInAlt /> Sign in / Register
            </button>
          )}
        </div>

        {/* Links */}
        <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-2">
          <Link href="/Wishlist" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 py-2">
            <FaHeart className="text-gray-400" /> Wishlist
            {mounted && wishlistCount > 0 && <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5">{wishlistCount}</span>}
          </Link>
          <Link href="/CartProduct" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 py-2">
            <FaShoppingCart className="text-gray-400" /> Cart
            {mounted && cartCount > 0 && <span className="text-[10px] bg-blue-600 text-white rounded-full px-1.5">{cartCount}</span>}
          </Link>
          {mounted && isLoggedIn && (
            <>
              <Link href="/Profile" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 py-2"><FaUser className="text-gray-400" /> Profile</Link>
              <Link href="/Orders" onClick={onClose} className="flex items-center gap-2 text-sm text-gray-700 py-2"><FaBox className="text-gray-400" /> Orders</Link>
            </>
          )}
        </div>

        {/* Categories Accordion */}
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Shop by Category</h3>
          {loading && categoriesData.length === 0 ? (
            <p className="text-xs text-gray-500">Loading...</p>
          ) : (
            <ul className="space-y-0.5">
              {categoriesData.map((mainCat) => (
                <li key={mainCat.id}>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { onClose(); router.push(`/Categories/${mainCat.slug}`); }}
                      className="flex-1 text-left py-2 text-sm font-semibold text-gray-700"
                    >
                      {mainCat.name}
                    </button>
                    {mainCat.children?.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setOpenCategoryId(openCategoryId === mainCat.id ? null : mainCat.id)}
                        className="p-2 text-gray-400"
                      >
                        <FaChevronDown className={`text-xs transition-transform ${openCategoryId === mainCat.id ? "rotate-180" : ""}`} />
                      </button>
                    )}
                  </div>
                  {openCategoryId === mainCat.id && mainCat.children?.length > 0 && (
                    <ul className="pl-3 border-l-2 border-gray-100 ml-1 mb-1">
                      {mainCat.children.map((subCat) => (
                        <li key={subCat.id}>
                          <Link href={`/Categories/${mainCat.slug}/${subCat.slug}`} onClick={onClose} className="block py-1.5 text-xs text-gray-600">
                            {subCat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;