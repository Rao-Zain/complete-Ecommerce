"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaHome, FaShoppingBag, FaShoppingCart, FaStore, FaHeart, FaUser } from "react-icons/fa";

const MobileTabBar = ({ mounted, cartCount, wishlistCount, isLoggedIn, onOpenAuthModal }) => {
  const router = useRouter();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-2">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-black">
          <FaHome className="text-base" />
          <span className="text-[10px] mt-0.5">Home</span>
        </Link>
        <Link href="/CategoriesPage" className="flex flex-col items-center text-gray-600 hover:text-black">
          <FaStore className="text-base" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </Link>
        <Link href="/CartProduct" className="relative flex flex-col items-center text-gray-600 hover:text-black">
          <FaShoppingCart className="text-base" />
          {mounted && cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Cart</span>
        </Link>
        <Link href="/Wishlist" className="relative flex flex-col items-center text-gray-600 hover:text-black">
          <FaHeart className="text-base" />
          {mounted && wishlistCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {wishlistCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">Wishlist</span>
        </Link>
        <button
          type="button"
          onClick={() => (isLoggedIn ? router.push("/Account") : onOpenAuthModal("login"))}
          className="flex flex-col items-center text-gray-600 hover:text-black"
        >
          <FaUser className="text-base" />
          <span className="text-[10px] mt-0.5">Account</span>
        </button>
      </div>
    </div>
  );
};

export default MobileTabBar;