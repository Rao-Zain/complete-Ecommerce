"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaBox,
  FaHeart,
  FaShoppingCart, 
  FaHeadset,
  FaSignOutAlt,   
} from "react-icons/fa";

const Account = () => {
  const router = useRouter();

  const [user, setUser] = useState({ name: "Guest", email: "guest@example.com" });
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  // Load user info + counts from localStorage, same pattern as the Navbar
  useEffect(() => {
    const loadUserData = () => {
      const storedName = localStorage.getItem("userName") || localStorage.getItem("name") || "Guest";
      const storedEmail = localStorage.getItem("email") || "guest@example.com";
      setUser({ name: storedName, email: storedEmail });
    };

    const updateWishlistCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };

    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length); // distinct items, not summed quantity
    };

    loadUserData();
    updateWishlistCount();
    updateCartCount();

    window.addEventListener("authUpdated", loadUserData);
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    window.addEventListener("cartUpdated", updateCartCount);
    window.addEventListener("storage", () => {
      loadUserData();
      updateWishlistCount();
      updateCartCount();
    });

    return () => {
      window.removeEventListener("authUpdated", loadUserData);
      window.removeEventListener("wishlistUpdated", updateWishlistCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  const initial = (user.name || "G").trim().charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "Guest", email: "guest@example.com" });
    setWishlistCount(0);
    setCartCount(0);
    window.dispatchEvent(new Event("authUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    router.push("/");
  };

  return (
    // pb-24 keeps the last card clear of the fixed bottom tab bar from Navbar
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Back + Title header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-1 text-gray-800 cursor-pointer"
            aria-label="Go back"
          >
            <FaChevronLeft className="text-lg" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">My Account</h1>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6 max-w-lg mx-auto">
        {/* User card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 truncate">{user.name}</p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* ACCOUNT section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Account</h2>
          <div className="space-y-3">
            <Link
              href="/Profile"
              className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <FaUser className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">My Profile</p>
                <p className="text-xs text-gray-400">Manage personal info</p>
              </div>
              <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
            </Link>

            <Link
              href="/Orders"
              className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <FaBox className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">My Orders</p>
                <p className="text-xs text-gray-400">View order history</p>
              </div>
              <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* SHOPPING section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Shopping</h2>
          <div className="space-y-3">
            <Link
              href="/Wishlist"
              className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
                <FaHeart className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">My Wishlist</p>
                <p className="text-xs text-gray-400">Saved items</p>
              </div>
              {wishlistCount > 0 && (
                <span className="bg-red-100 text-red-500 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {wishlistCount}
                </span>
              )}
              <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
            </Link>

            <Link
              href="/CartProduct"
              className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FaShoppingCart className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">My Cart</p>
                <p className="text-xs text-gray-400">Items in cart</p>
              </div>
              {cartCount > 0 && (
                <span className="bg-amber-100 text-amber-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {cartCount}
                </span>
              )}
              <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* SUPPORT section */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">Support</h2>
          <div className="space-y-3">
            <Link
              href="/Contact"
              className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-gray-50 transition"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                <FaHeadset className="text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Contact Us</p>
                <p className="text-xs text-gray-400">We're here to help.</p>
              </div>
              <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:bg-red-50 transition cursor-pointer"
        >
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center flex-shrink-0">
            <FaSignOutAlt className="text-base" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-bold text-red-600 text-sm">Logout</p>
            <p className="text-xs text-gray-400">Sign out of your account</p>
          </div>
          <FaChevronRight className="text-gray-300 text-sm flex-shrink-0" />
        </button>
      </div>
    </div>
  );
};

export default Account;