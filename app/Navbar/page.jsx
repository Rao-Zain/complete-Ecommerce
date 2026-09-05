"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
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
  FaSignInAlt,
  FaUserPlus,
  FaHome,
  FaShoppingBag
} from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { API_BASE_URL } from "@/lib/config";

const Navbar = () => {
  const router = useRouter();
  const [storeSettings, setStoreSettings] = useState(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [user, setUser] = useState({ name: "Guest", email: "guest@example.com" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Categories states
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [activeMain, setActiveMain] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  // Mobile drawer's own category accordion state (independent of desktop hover menu)
  const [mobileOpenCategoryId, setMobileOpenCategoryId] = useState(null);

  // Dropdown & Modal States
  const [showDropdown, setShowDropdown] = useState(false); // now CLICK-based, not hover
  const dropdownRef = useRef(null); // for click-outside detection, matches reference's @click.outside
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobile expandable search bar (separate from the hamburger drawer — matches reference)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Modal States (Login & Register Popups)
  const [activeModal, setActiveModal] = useState(null); // 'login' | 'register' | null

  // Login Form States
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Field-level validation errors (from backend `errors` object)
  const [regFieldErrors, setRegFieldErrors] = useState({});

  // Fetch Categories
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
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin-store`);
        const json = await res.json();
        if (json?.success && json?.data) {
          setStoreSettings(json.data);
        }
      } catch (err) {
        console.error("Failed to load store settings:", err);
      }
    };
    fetchStoreSettings();
  }, []);

  const getStoreLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://")) return logoPath;
    const cleanPath = logoPath.startsWith("/") ? logoPath.slice(1) : logoPath;
    return `${API_BASE_URL}/storage/${cleanPath}`;
  };

  // Load User & Auth state
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("userName") || localStorage.getItem("name") || "User";
      const storedEmail = localStorage.getItem("email") || "user@example.com";

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

  // Wishlist Counter
  useEffect(() => {
    const updateCount = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);
    };
    updateCount();
    window.addEventListener("wishlistUpdated", updateCount);
    window.addEventListener("storage", updateCount);
    return () => {
      window.removeEventListener("wishlistUpdated", updateCount);
      window.removeEventListener("storage", updateCount);
    };
  }, []);

  // Cart Counter — counts DISTINCT items (line items), not total quantity.
  useEffect(() => {
    const updateCart = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");

      if (token && userId && userId !== "undefined" && userId !== "null") {
        try {
          const res = await fetch(`${API_BASE_URL}/api/cart?user_id=${userId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || [];
            setCartCount(items.length);
            localStorage.setItem("cart", JSON.stringify(items));
            return;
          }
        } catch (err) {
          console.error("Cart count fetch error:", err);
        }
      }

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    window.addEventListener("authUpdated", updateCart);
    return () => {
      window.removeEventListener("cartUpdated", updateCart);
      window.removeEventListener("authUpdated", updateCart);
    };
  }, []);

  // Opens the login/register modal when another component dispatches "open-auth-modal"
  useEffect(() => {
    const handleOpenAuthModal = (e) => {
      setActiveModal(e?.detail?.mode || "login");
    };
    window.addEventListener("open-auth-modal", handleOpenAuthModal);
    return () => window.removeEventListener("open-auth-modal", handleOpenAuthModal);
  }, []);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Click-outside-to-close for the profile dropdown — mirrors the reference's
  // `@click.outside="mobileDropdownOpen = false"` behavior. Hover was removed.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMobileMenu = () => {
    setMenuOpen(false);
    setMobileOpenCategoryId(null);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "Guest", email: "guest@example.com" });
    setIsLoggedIn(false);
    setShowDropdown(false);
    closeMobileMenu();
    window.dispatchEvent(new Event("authUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    setActiveModal("login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      closeMobileMenu();
      setMobileSearchOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        const userToken = data.data.token || data.data.access_token || data.data.data?.token;
        const userName = data.data.user?.name || data.data.name || data.data.data?.name || loginEmail.split("@")[0];
        const userEmail = data.data.user?.email || data.data.email || data.data.data?.email || loginEmail;
        const userId =
          data.data.user?.id ??
          data.data.id ??
          data.data.data?.user?.id ??
          data.data.data?.id;

        if (!userToken) {
          setLoginError("Login succeeded, but no token was returned by the server.");
          return;
        }

        if (!userId) {
          setLoginError("Login succeeded, but no user ID was returned by the server.");
          return;
        }

        localStorage.setItem("userId", String(userId));
        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);

        window.dispatchEvent(new Event("authUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
        setActiveModal(null);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        const errorMessage = data.message || data.error || "Invalid email or password (401 Unauthorized)";
        setLoginError(errorMessage);
      }
    } catch (err) {
      setLoginError("Something went wrong. Please check your network connection.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegFieldErrors({});
    setRegError("");

    if (regPassword !== regConfirmPassword) {
      setRegFieldErrors({ password_confirmation: "Passwords do not match" });
      return;
    }

    setRegLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          password_confirmation: regConfirmPassword
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const userToken = data.data?.token || data.data?.access_token || data.token || data.access_token;
        const userName = data.data?.user?.name || data.data?.name || data.user?.name || data.name || regName;
        const userEmail = data.data?.user?.email || data.data?.email || data.user?.email || data.email || regEmail;
        const userId = data.data?.user?.id || data.user?.id || data.id;

        if (!userToken || !userId) {
          setRegError("Account created, but no valid session was returned by the server.");
          return;
        }

        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("userId", userId);

        window.dispatchEvent(new Event("authUpdated"));
        window.dispatchEvent(new Event("wishlistUpdated"));
        setActiveModal(null);
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
        setRegFieldErrors({});
      } else {
        if (data.errors && typeof data.errors === "object") {
          const mappedErrors = {};
          Object.keys(data.errors).forEach((field) => {
            const fieldMessages = data.errors[field];
            mappedErrors[field] = Array.isArray(fieldMessages) ? fieldMessages[0] : fieldMessages;
          });
          setRegFieldErrors(mappedErrors);
        } else {
          setRegError(data.message || "Registration failed.");
        }
      }
    } catch (err) {
      setRegError("Something went wrong. Please try again.");
    } finally {
      setRegLoading(false);
    }
  };

  const resetCategoryMenu = () => {
    setIsCategoryOpen(false);
    setActiveMain(null);
    setActiveSub(null);
  };

  const activeMainCat = categoriesData.find((c) => c.id === activeMain);
  const activeSubCat = activeMainCat?.children?.find((s) => s.id === activeSub);

  // Reference's secondary-bar center links: "All Products", "Categories",
  // then the first 4 real top-level categories (Men's Fashion, Women's
  // Fashion, Mother & Baby, Home & Lifestyle) — not generic Home/Contact links.
  const quickLinkCategories = categoriesData.slice(0, 4);

  return (
    <>
      {/* 1. TOP NAVBAR (Black) - Scrolls naturally */}
      <nav className="bg-black  text-white relative shadow-md">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center h-16 md:h-20 px-3 md:px-0">
            {/* Mobile hamburger */}
            <button
              className="md:hidden text-2xl cursor-pointer p-2 text-white hover:text-blue-400"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 hover:opacity-90 transition-opacity flex-shrink-0"
              onClick={closeMobileMenu}
            >
              {storeSettings?.is_logo && getStoreLogoUrl(storeSettings.logo) ? (
                <img
                  src={getStoreLogoUrl(storeSettings.logo)}
                  alt={storeSettings.title || "Store Logo"}
                  className="h-6 sm:h-9 w-auto max-w-[110px] sm:max-w-[150px] object-contain rounded-md"
                />
              ) : (
                <Image
                  src="/logo (9).png"
                  alt="ShopNest Logo"
                  width={280}
                  height={180}
                  className="h-6 sm:h-9 w-auto max-w-[110px] sm:max-w-[150px] object-contain rounded-md"
                  priority
                />
              )}

              {storeSettings?.is_title && storeSettings?.title && (
                <span className="text-base sm:text-xl font-bold tracking-tight text-white">
                  {storeSettings.title}
                </span>
              )}
            </Link>
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands and more..."
                  className="w-full bg-white text-gray-900 text-sm rounded-full pl-6 pr-24 py-3 focus:outline-none shadow-inner border border-gray-300"
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

            <div className="hidden md:flex items-center flex-shrink-0">
              <Link href="/Wishlist" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
                <FaHeart className="text-xl hover:text-red-500 transition" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link href="/CartProduct" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
                <FaShoppingCart className="text-xl hover:text-blue-500 transition" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow">
                    {cartCount}
                  </span>
                )}
              </Link>


              <div className="hidden sm:block h-8 border-l border-gray-700 mx-3" />

              {/* User Profile / Sign In */}
              <div className="relative py-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      setActiveModal("login");
                    } else {
                      setShowDropdown((prev) => !prev);
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer rounded-xl  border border-transparent transition "
                >
                  <div className="text-white flex items-center justify-center text-lg hover:text-green-500">
                    <FaUser />
                  </div>
                  <div className="text-left leading-tight ">
                    <span className="block text-[10px] font-medium uppercase tracking-wider text-gray-400">Welcome</span>
                    <span className="block text-xs font-bold text-white truncate max-w-[110px] hover:text-green-500">
                      {isLoggedIn ? user.name : "Sign in / Register"}
                    </span>
                  </div>
                </button>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-1 w-52 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 truncate text-sm">
                        {isLoggedIn ? user.name : "Hello, Guest"}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {isLoggedIn ? user.email : "Welcome to our store!"}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link href="/Profile" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        <FaUser className="text-gray-400 text-sm" /> <span>My Profile</span>
                      </Link>
                      <Link href="/Orders" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
                        <FaBox className="text-gray-400 text-sm" /> <span>My Orders</span>
                      </Link>
                    </div>

                    {!isLoggedIn ? (
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={() => { setShowDropdown(false); setActiveModal("login"); }}
                          className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition font-medium cursor-pointer"
                        >
                          <FaSignOutAlt className="text-blue-500 text-sm rotate-180" /> <span>Sign in / Register</span>
                        </button>
                      </div>
                    ) : (
                      <div className="border-t border-gray-100 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer font-medium">
                          <FaSignOutAlt className="text-red-500 text-sm" /> <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile: search toggle + cart icon */}
            <div className="flex md:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileSearchOpen((prev) => !prev)}
                className="p-2 text-white"
                aria-label="Toggle search"
              >
                <FaSearch className="text-base" />
              </button>

              <Link href="/CartProduct" className="relative p-2 text-white">
                <FaShoppingCart className="text-lg" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shadow">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile expandable search bar */}
        {mobileSearchOpen && (
          <div className="md:hidden w-full bg-gray-200 border-t border-gray-300 shadow-inner px-3 py-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands and more..."
                className="w-full bg-white text-gray-900 text-sm rounded-full pl-4 pr-12 py-2.5 focus:outline-none border border-gray-300"
              />
              <button type="submit" className="absolute right-1.5 bg-black text-white p-2 rounded-full">
                <FaSearch className="text-xs" />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* 2. BOTTOM NAVBAR (White) - Sticks to top when scrolling on lg screens */}
      <div className="hidden lg:block sticky top-0 bg-white text-gray-800 shadow-md z-40">
        <div className="container mx-auto flex items-center h-12 text-sm font-medium px-2 md:px-0">
          <div
            className="relative"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={resetCategoryMenu}
          >
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-2.5 w-64 h-9 bg-gray-100 text-gray-800 hover:bg-gray-100 px-5 transition cursor-pointer"
            >
              <FaBars className="text-sm" />
              <span className="font-semibold text-sm text-gray-900">All Categories</span>
              <FaChevronDown className="text-xs text-gray-500 ml-auto" />
            </button>

            {/* Categories Dropdown Panels */}
            <div className={`${isCategoryOpen ? "flex" : "hidden"} absolute left-0 top-full z-50`}>
              {/* LEVEL 1: Main Categories */}
              <div className="w-64 bg-white h-[420px] overflow-y-auto p-2 border border-gray-100 shadow-2xl scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                {loading ? (
                  <div className="p-4 text-xs text-gray-500 text-center">Loading...</div>
                ) : (
                  <ul className="space-y-0.5">
                    {categoriesData.map((mainCat) => (
                      <li key={mainCat.id}>
                        <div
                          onMouseEnter={() => { setActiveMain(mainCat.id); setActiveSub(null); }}
                          onClick={() => { resetCategoryMenu(); router.push(`/Categories/${mainCat.slug}`); }}
                          className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50 ${activeMain === mainCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                        >
                          <span className="text-sm font-semibold">{mainCat.name}</span>
                          {mainCat.children?.length > 0 && <FaChevronRight className="text-xs text-gray-400" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* LEVEL 2: Sub Categories */}
              {activeMainCat?.children?.length > 0 && (
                <div className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                  <ul className="space-y-0.5">
                    {activeMainCat.children.map((subCat) => (
                      <li key={subCat.id}>
                        <div
                          onMouseEnter={() => setActiveSub(subCat.id)}
                          className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50 ${activeSub === subCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                        >
                          <Link href={`/Categories/${activeMainCat.slug}/${subCat.slug}`} onClick={resetCategoryMenu} className="text-sm font-semibold flex-1">
                            {subCat.name}
                          </Link>
                          {subCat.children?.length > 0 && <FaChevronRight className="text-xs text-gray-400" />}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* LEVEL 3: Child Categories */}
              {activeSubCat?.children?.length > 0 && (
                <div className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 shadow-2xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100">
                  <ul className="space-y-0.5">
                    {activeSubCat.children.map((childCat) => {
                      const childSlugPath = `${activeMainCat.slug}/${activeSubCat.slug}/${childCat.slug}`;
                      return (
                        <li key={childCat.id}>
                          <Link
                            href={`/ExploreProducts/${childSlugPath}`}
                            onClick={resetCategoryMenu}
                            className="block py-2 px-3 text-sm font-semibold transition rounded-md text-gray-700 hover:bg-gray-50 hover:text-black"
                          >
                            {childCat.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Center links */}
          <div className="flex items-center gap-8 text-sm font-semibold text-gray-800 mx-auto">
            <Link href="/Products" className="hover:text-blue-600 transition whitespace-nowrap ms-6">
              All Products
            </Link>
            <Link href="/ExploreProducts" className="hover:text-blue-600 transition whitespace-nowrap">
              Categories
            </Link>
            {quickLinkCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/Categories/${cat.slug}`}
                className="hover:text-blue-600 transition whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="w-64 shrink-0" />
        </div>
      </div>

      {/* MOBILE SLIDE-OUT MENU */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeMobileMenu}
          />

          <div className="absolute top-0 left-0 h-full w-[82%] max-w-sm bg-white text-gray-800 shadow-2xl overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
              <h2 className="font-extrabold text-lg tracking-tight text-gray-900">
                Shop<span className="text-blue-600">Nest</span>
              </h2>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-500 hover:text-gray-800 cursor-pointer"
                aria-label="Close menu"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="p-4 border-b border-gray-100">
              <div className="relative w-full flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-full pl-4 pr-12 py-2.5 focus:outline-none focus:border-blue-500"
                />
                <button type="submit" className="absolute right-1.5 bg-black text-white p-2 rounded-full">
                  <FaSearch className="text-xs" />
                </button>
              </div>
            </form>

            <div className="p-4 border-b border-gray-100">
              {isLoggedIn ? (
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
                  <button
                    onClick={handleLogout}
                    className="text-xs font-semibold text-red-600 flex items-center gap-1 cursor-pointer flex-shrink-0"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { closeMobileMenu(); setActiveModal("login"); }}
                  className="w-full flex items-center justify-center gap-2 bg-[#10b981] text-white text-sm font-semibold py-2.5 rounded-xl cursor-pointer"
                >
                  <FaSignInAlt /> Sign in / Register
                </button>
              )}
            </div>

            <div className="p-4 border-b border-gray-100 grid grid-cols-2 gap-2">
              <Link href="/wishlist" onClick={closeMobileMenu} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
                <FaHeart className="text-gray-400" /> Wishlist
                {wishlistCount > 0 && <span className="text-[10px] bg-red-500 text-white rounded-full px-1.5">{wishlistCount}</span>}
              </Link>
              <Link href="/CartProduct" onClick={closeMobileMenu} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
                <FaShoppingCart className="text-gray-400" /> Cart
                {cartCount > 0 && <span className="text-[10px] bg-blue-600 text-white rounded-full px-1.5">{cartCount}</span>}
              </Link>
              {isLoggedIn && (
                <>
                  <Link href="/Profile" onClick={closeMobileMenu} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
                    <FaUser className="text-gray-400" /> Profile
                  </Link>
                  <Link href="/Orders" onClick={closeMobileMenu} className="flex items-center gap-2 text-sm font-medium text-gray-700 py-2">
                    <FaBox className="text-gray-400" /> Orders
                  </Link>
                </>
              )}
            </div>

            <div className="p-4 border-b border-gray-100 flex flex-col gap-1">
              <Link href="/Products" onClick={closeMobileMenu} className="py-2 text-sm font-semibold text-gray-800">All Products</Link>
              <Link href="/ExploreProducts" onClick={closeMobileMenu} className="py-2 text-sm font-semibold text-gray-800">Categories</Link>
            </div>

            <div className="p-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Shop by Category</h3>
              {loading ? (
                <p className="text-xs text-gray-500">Loading...</p>
              ) : (
                <ul className="space-y-0.5">
                  {categoriesData.map((mainCat) => (
                    <li key={mainCat.id}>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => { closeMobileMenu(); router.push(`/Categories/${mainCat.slug}`); }}
                          className="flex-1 text-left py-2 text-sm font-semibold text-gray-700 cursor-pointer"
                        >
                          {mainCat.name}
                        </button>
                        {mainCat.children?.length > 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              setMobileOpenCategoryId(mobileOpenCategoryId === mainCat.id ? null : mainCat.id)
                            }
                            className="p-2 text-gray-400 cursor-pointer"
                            aria-label="Toggle subcategories"
                          >
                            <FaChevronDown
                              className={`text-xs transition-transform ${mobileOpenCategoryId === mainCat.id ? "rotate-180" : ""}`}
                            />
                          </button>
                        )}
                      </div>

                      {mobileOpenCategoryId === mainCat.id && mainCat.children?.length > 0 && (
                        <ul className="pl-3 border-l-2 border-gray-100 ml-1 mb-1">
                          {mainCat.children.map((subCat) => (
                            <li key={subCat.id}>
                              <Link
                                href={`/Categories/${mainCat.slug}/${subCat.slug}`}
                                onClick={closeMobileMenu}
                                className="block py-1.5 text-xs font-medium text-gray-600"
                              >
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
      )}

      {/* LOGIN & REGISTER MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">

          {activeModal === "login" && (
            <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-5 relative animate-in zoom-in-95 duration-200">

              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                <p className="text-xs text-gray-500 mt-1">Please enter your credentials to log in to your account.</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 pr-11 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showLoginPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-sm py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <FaSignInAlt className="text-base" />
                  <span>{loginLoading ? "Logging in..." : "Login"}</span>
                </button>
              </form>

              <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                  Don't have an account?{" "}
                  <button
                    onClick={() => { setLoginError(""); setActiveModal("register"); }}
                    className="text-[#10b981] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {activeModal === "register" && (
            <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-5 relative animate-in zoom-in-95 duration-200">

              <button
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 transition p-1 cursor-pointer"
              >
                <FaTimes className="text-lg" />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                <p className="text-xs text-gray-500 mt-1">Please fill in the details below to create your new account.</p>
              </div>

              {regError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl text-center font-medium">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter your full name"
                    className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white transition ${regFieldErrors.name
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                      }`}
                  />
                  {regFieldErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{regFieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:bg-white transition ${regFieldErrors.email
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-200 focus:border-blue-500"
                      }`}
                  />
                  {regFieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{regFieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:bg-white transition ${regFieldErrors.password
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                  {regFieldErrors.password && (
                    <p className="text-red-500 text-xs mt-1">{regFieldErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? "text" : "password"}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full bg-gray-50 border text-gray-900 text-sm rounded-xl px-4 py-2.5 pr-11 focus:outline-none focus:bg-white transition ${regFieldErrors.password_confirmation
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 focus:border-blue-500"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition cursor-pointer"
                      tabIndex={-1}
                    >
                      {showRegConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                    </button>
                  </div>
                  {regFieldErrors.password_confirmation && (
                    <p className="text-red-500 text-xs mt-1">{regFieldErrors.password_confirmation}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold text-sm py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <FaUserPlus className="text-base" />
                  <span>{regLoading ? "Creating..." : "Create Account"}</span>
                </button>
              </form>

              <div className="text-center mt-5">
                <p className="text-xs text-gray-500">
                  Already have an account?{" "}
                  <button
                    onClick={() => { setRegError(""); setRegFieldErrors({}); setActiveModal("login"); }}
                    className="text-[#10b981] font-semibold hover:underline ml-1 cursor-pointer"
                  >
                    Login here
                  </button>
                </p>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MOBILE BOTTOM TAB BAR — fixed, icons only, matches reference. Hidden on md+ */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg z-50 px-4 py-2"
        style={{ marginBottom: "-2px" }}
      >
        <div className="flex items-center justify-between">
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-black transition"
          >
            <FaHome className="text-base" />
            <span className="text-[10px] mt-0.5">Home</span>
          </Link>

          {/* Shop */}
          <Link
            href="/Products"
            className="flex flex-col items-center justify-center text-gray-600 hover:text-black transition"
          >
            <FaShoppingBag className="text-base" />
            <span className="text-[10px] mt-0.5">Shop</span>
          </Link>

          {/* Cart — badge only shows when count > 0, reusing the same cartCount state as the header */}
          <Link
            href="/CartProduct"
            className="relative flex flex-col items-center justify-center text-gray-600 hover:text-black transition"
          >
            <div className="relative">
              <FaShoppingCart className="text-base" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            href="/Wishlist"
            className="relative flex flex-col items-center justify-center text-gray-600 hover:text-black transition"
          >
            <div className="relative">
              <FaHeart className="text-base" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5">Wishlist</span>
          </Link>

          {/* Account — logged in goes straight to /Profile, guests get the login modal
              (same behavior as the desktop profile trigger) */}
          <button
            type="button"
            onClick={() => (isLoggedIn ? router.push("/Account") : setActiveModal("login"))}
            className="flex flex-col items-center justify-center text-gray-600 hover:text-black transition"
          >
            <FaUser className="text-base" />
            <span className="text-[10px] mt-0.5">Account</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;