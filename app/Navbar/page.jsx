"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaShoppingBag,
  FaShoppingCart,
  FaBars,
  FaTimes,
  FaHeart,
  FaUser,
  FaBox,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronRight,
  FaSearch,
  FaQrcode,
  FaFolder,
} from "react-icons/fa";

// 👇 Apni API base yahan set karein
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const Navbar = () => {
  const router = useRouter();

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [user, setUser] = useState({ name: "Guest", email: "guest@example.com" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const json = await res.json();
        const categoryData = json?.data ? json.data : json;
        setCategoriesData(Array.isArray(categoryData) ? categoryData : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategoriesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const storedName =
        localStorage.getItem("userName") ||
        localStorage.getItem("name") ||
        localStorage.getItem("fullName") ||
        localStorage.getItem("username") ||
        "User";

      const storedEmail =
        localStorage.getItem("email") ||
        localStorage.getItem("userEmail") ||
        "user@example.com";

      setUser({ name: storedName, email: storedEmail });
      setIsLoggedIn(!!token);
    };

    loadUserData();
    window.addEventListener("storage", loadUserData);
    window.addEventListener("authUpdated", loadUserData);

    return () => {
      window.removeEventListener("storage", loadUserData);
      window.removeEventListener("authUpdated", loadUserData);
    };
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    updateCount();
    window.addEventListener("wishlistUpdated", updateCount);
    return () => window.removeEventListener("wishlistUpdated", updateCount);
  }, []);

  useEffect(() => {
    const updateCart = () => {
      const cart = JSON.parse(localStorage.getItem("cartItems")) || [];
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };
    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "Guest", email: "guest@example.com" });
    setIsLoggedIn(false);
    setShowDropdown(false);
    setMenuOpen(false);
    window.dispatchEvent(new Event("authUpdated"));
    alert("Logout Successfully");
    router.push("/sign");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const resetCategoryMenu = () => {
    setIsCategoryOpen(false);
    setActiveMain(null);
    setActiveSub(null);
  };

  const activeMainCat = categoriesData.find((c) => c.id === activeMain);
  const activeSubCat = activeMainCat?.children?.find((s) => s.id === activeSub);

  return (
    <nav className="sticky top-0 z-50 bg-black text-white relative shadow-md">
      <div className="container px-4 mx-auto sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div>
              <h2 className="font-extrabold text-2xl tracking-tight text-white">
                Shop<span className="text-blue-500">Nest</span>
              </h2>
            </div>
          </Link>

          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full bg-white text-gray-900 text-sm rounded-full pl-6 pr-24 py-3 focus:outline-none shadow-inner"
              />
              <div className="absolute right-2 flex items-center gap-2">
                <button type="button" className="text-gray-400 hover:text-gray-600 p-1">
                  <FaQrcode className="text-base" />
                </button>
                <button type="submit" className="bg-black text-white p-2.5 rounded-full hover:bg-gray-800 transition">
                  <FaSearch className="text-sm" />
                </button>
              </div>
            </form>
          </div>

          <div className="hidden md:flex items-center flex-shrink-0 ">
            <Link href="/wishlist" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
              <FaHeart className="text-xl hover:text-red-500 transition" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cartcom" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
              <FaShoppingCart className="text-xl hover:text-blue-500 transition" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="relative ml-2">
              <div
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push("/sign");
                  } else {
                    setShowDropdown(!showDropdown);
                  }
                }}
                className="flex items-center gap-2 cursor-pointer rounded-xl hover:bg-gray-800 border border-transparent transition p-1.5"
              >
                <div className="text-white flex items-center justify-center text-lg">
                  <FaUser />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">Welcome</span>
                  <span className="block text-xs font-bold text-white truncate max-w-[110px]">
                    {isLoggedIn ? user.name : "Sign in / Register"}
                  </span>
                </div>
                <FaChevronDown className="text-xs text-gray-400 ml-1" />
              </div>

              {isLoggedIn && showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 truncate text-sm">{user.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                      <FaUser className="text-gray-400 text-base" /> <span>My Profile</span>
                    </Link>
                    <Link href="/order" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                      <FaBox className="text-gray-400 text-base" /> <span>My Orders</span>
                    </Link>
                    <Link href="/wishlist" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                      <FaHeart className="text-gray-400 text-base" /> <span>Wishlist</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-100 pt-1">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer font-medium">
                      <FaSignOutAlt className="text-red-500 text-base" /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="md:hidden text-2xl cursor-pointer p-2 text-white hover:text-blue-400" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* --- BOTTOM NAVBAR --- */}
      <div className="hidden md:block border-t border-gray-800 bg-white text-gray-800 relative shadow-sm">
        <div className="container px-4 mx-auto sm:px-6 lg:px-10 flex items-center h-12 text-sm font-medium relative">
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={resetCategoryMenu}
          >
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2.5 font-bold text-gray-800 bg-gray-100 hover:bg-gray-200 px-5 h-12 transition cursor-pointer"
            >
              <FaBars className="text-sm" /> <span>All Categories</span>{" "}
              <FaChevronDown className="text-xs text-gray-500 ml-2" />
            </button>

            <div className={`${isCategoryOpen ? "flex" : "hidden"} absolute left-0 top-full z-50`}>
              {/* LEVEL 1: Main Categories */}
              <div className="w-64 bg-white h-[420px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 p-2 border border-gray-100 shadow-2xl ">
                {loading ? (
                  <div className="p-4 text-xs text-gray-500 text-center">Loading categories...</div>
                ) : categoriesData.length === 0 ? (
                  <div className="p-4 text-xs text-gray-500 text-center">No categories available</div>
                ) : (
                  <ul className="space-y-0.5 relative">
                    {categoriesData.map((mainCat) => {
                      const hasSub = mainCat.children && mainCat.children.length > 0;
                      return (
                        <li key={mainCat.id} className="relative">
                          <div
                            onMouseEnter={() => {
                              setActiveMain(mainCat.id);
                              setActiveSub(null);
                            }}
                            onClick={() => {
                              resetCategoryMenu();
                              router.push(`/FashionCategory/${mainCat.id}`);
                            }}
                            className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer transition
                              text-gray-700 hover:bg-gray-50 hover:text-black
                              ${activeMain === mainCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                          >
                            <span className="flex-1 text-sm font-semibold">
                              {mainCat.name}
                            </span>

                            {hasSub && (
                              <FaChevronRight
                                className={`text-xs ${activeMain === mainCat.id ? "text-blue-500" : "text-gray-400"}`}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* LEVEL 2: Sub Categories Panel */}
              {activeMainCat && activeMainCat.children && activeMainCat.children.length > 0 && (
                <div
                  onMouseEnter={() => setActiveMain(activeMainCat.id)}
                  className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 z-50 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 shadow-2xl"
                >
                  <ul className="space-y-0.5">
                    {activeMainCat.children.map((subCat) => {
                      const hasChild = subCat.children && subCat.children.length > 0;
                      return (
                        <li key={subCat.id} className="relative">
                          <div
                            onMouseEnter={() => setActiveSub(subCat.id)}
                            className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer transition
                              text-gray-700 hover:bg-gray-50 hover:text-black
                              ${activeSub === subCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                          >
                            <Link
                              href={`/ExploreProducts/${activeMainCat.slug}/${subCat.slug}`}
                              onClick={resetCategoryMenu}
                              className="flex-1 text-sm font-semibold"
                            >
                              {subCat.name}
                            </Link>

                            {hasChild && (
                              <FaChevronRight
                                className={`text-xs ${activeSub === subCat.id ? "text-blue-500" : "text-gray-400"}`}
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* LEVEL 3: Child Categories Panel */}
              {activeSubCat && activeSubCat.children && activeSubCat.children.length > 0 && (
                <div
                  onMouseEnter={() => {
                    setActiveMain(activeMainCat.id);
                    setActiveSub(activeSubCat.id);
                  }}
                  className="w-64 bg-white h-[420px] p-2 z-50 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-50 [&::-webkit-scrollbar-thumb]:bg-gray-200 border-l border-gray-100 shadow-2xl "
                >
                  <ul className="space-y-0.5">
                    {activeSubCat.children.map((childCat) => (
                      <li key={childCat.id}>
                        <Link
                          href={`/ExploreProducts/${activeMainCat.slug}/${activeSubCat.slug}/${childCat.slug}`}
                          onClick={resetCategoryMenu}
                          className="block py-2 px-3 text-sm font-semibold transition rounded-md text-gray-700 hover:bg-gray-50 hover:text-black"
                        >
                          {childCat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-8 text-xs font-semibold tracking-wide text-gray-700">
            <Link href="/" className="hover:text-blue-600 transition py-2">Home</Link>
            <Link href="/Products" className="hover:text-blue-600 transition py-2">Products</Link>
            <Link href="/Categories" className="hover:text-blue-600 transition py-2">Categories</Link>
            <Link href="/Contact" className="hover:text-blue-600 transition py-2">Contact Us</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t py-6 px-4 bg-white text-gray-800 shadow-xl max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="mb-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-gray-100 text-gray-900 text-xs rounded-full pl-4 pr-12 py-2.5 focus:outline-none"
              />
              <button type="submit" className="absolute right-2 bg-black text-white p-1.5 rounded-full">
                <FaSearch className="text-xs" />
              </button>
            </form>
          </div>

          <div className="flex items-center justify-around gap-4 mb-6 pb-4 border-b border-gray-100">
            <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold flex-1 justify-center">
              <FaHeart className="text-red-500 text-base" />
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cartcom" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold flex-1 justify-center">
              <FaShoppingCart className="text-blue-600 text-base" />
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Categories Accordion */}
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h4 className="text-xs font-bold uppercase text-gray-400 mb-2 px-3">Categories</h4>
            <div className="max-h-64 overflow-y-auto">
              {categoriesData.map((mainCat) => (
                <details key={mainCat.id} className="border-b border-gray-50">
                  <summary className="flex items-center justify-between py-2.5 px-3 text-sm font-semibold text-gray-700 cursor-pointer">
                    {mainCat.name}
                  </summary>

                  {/* ✅ Mobile mein bhi parent category ka link FashionCategory page pr */}
                  <Link
                    href={`/FashionCategory/${mainCat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block py-1.5 px-6 text-xs text-blue-600 font-semibold"
                  >
                    View All in {mainCat.name}
                  </Link>

                  {mainCat.children?.map((sub) => (
                    <details key={sub.id} className="pl-4 border-t border-gray-50">
                      <summary className="flex items-center justify-between py-2 px-3 text-xs font-semibold text-gray-600 cursor-pointer">
                        {sub.name}
                      </summary>
                      <ul className="pl-4">
                        {sub.children?.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/Categories/${mainCat.slug}/${sub.slug}/${child.slug}`}
                              onClick={() => setMenuOpen(false)}
                              className="block py-1.5 px-3 text-xs text-gray-500 hover:text-blue-600"
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ))}
                </details>
              ))}
            </div>
          </div>

          <ul className="flex flex-col gap-2 font-medium text-sm">
            <li><Link href="/" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-gray-50 transition">Home</Link></li>
            <li><Link href="/products" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-gray-50 transition">Products</Link></li>
            <li><Link href="/Categories" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-gray-50 transition">Categories</Link></li>
            <li><Link href="/contact" onClick={() => setMenuOpen(false)} className="block py-2.5 px-3 rounded-lg hover:bg-gray-50 transition">Contact Us</Link></li>
          </ul>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl shadow-xs mt-6 p-4">
            <div className="flex items-center gap-3">
              <div className="text-blue-600 flex items-center justify-center text-lg">
                <FaUser />
              </div>
              <div className="overflow-hidden">
                <span className="block text-[10px] uppercase font-semibold text-gray-400">Welcome</span>
                <h3 className="font-bold truncate text-sm text-gray-800">
                  {isLoggedIn ? user.name : "Sign in / Register"}
                </h3>
              </div>
            </div>

            <div className="grid gap-2 mt-4">
              {isLoggedIn && (
                <>
                  <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-xl text-xs font-semibold shadow-2xs">
                    <FaUser className="text-blue-500" /> My Profile
                  </Link>
                  <Link href="/order" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold shadow-2xs">
                    <FaBox className="text-blue-500" /> My Orders
                  </Link>
                </>
              )}

              {isLoggedIn ? (
                <button onClick={handleLogout} className="flex items-center gap-2.5 bg-red-50 text-red-600 py-2.5 px-4 rounded-xl text-xs font-semibold w-full cursor-pointer justify-center">
                  <FaSignOutAlt /> Logout
                </button>
              ) : (
                <Link href="/sign" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 bg-blue-600 text-white py-2.5 px-4 rounded-xl text-xs font-semibold justify-center shadow-md">
                  <FaUser /> Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;