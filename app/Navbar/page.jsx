"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  FaUserPlus
} from "react-icons/fa";

import { API_BASE_URL } from "@/lib/config";

const Navbar = () => {
  const router = useRouter();

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

  // Dropdown & Modal States
  const [showDropdown, setShowDropdown] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔥 Modal States (Login & Register Popups)
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

  // Wishlist & Cart Counters
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
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const total = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(total);
    };
    updateCart();
    window.addEventListener("cartUpdated", updateCart);
    return () => window.removeEventListener("cartUpdated", updateCart);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "Guest", email: "guest@example.com" });
    setIsLoggedIn(false);
    setShowDropdown(false);
    window.dispatchEvent(new Event("authUpdated"));

    // 🔥 Alert ki jagah ab seedha login modal show hoga
    setActiveModal("login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Handle Login API (Fixed for 401 & flexible data response extraction)
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
      console.log("Login Response Data:", data);

      if (res.ok) {
        const userToken = data.data.token || data.data.access_token || data.data.data?.token;
        const userName = data.data.user?.name || data.data.name || data.data.data?.name || loginEmail.split("@")[0];
        const userEmail = data.data.user?.email || data.data.email || data.data.data?.email || loginEmail;
        const userId = data.data.user?.id;
        console.log(data.data.user?.id);
        if (!userToken) {
          setLoginError("Login succeeded, but no token was returned by the server.");
          return;
        }

        localStorage.setItem("userId", userId);
        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);

        window.dispatchEvent(new Event("authUpdated"));
        setActiveModal(null);
        setLoginEmail("");
        setLoginPassword("");
      } else {
        const errorMessage = data.message || data.error || "Invalid email or password (401 Unauthorized)";
        setLoginError(errorMessage);
      }
    } catch (err) {
      console.error("Login catch error:", err);
      setLoginError("Something went wrong. Please check your network connection.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Register API
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    setRegLoading(true);
    setRegError("");

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
        const userToken = data.token || data.access_token || data.data?.token;
        const userName = data.user?.name || data.name || data.data?.name || regName;
        const userEmail = data.user?.email || data.email || data.data?.email || regEmail;
        const userId = data.user?.id || data.id || data.data?.id;

        localStorage.setItem("token", userToken);
        localStorage.setItem("userName", userName);
        localStorage.setItem("email", userEmail);
        localStorage.setItem("userId", userId);

        window.dispatchEvent(new Event("authUpdated"));
        setActiveModal(null);
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
      } else {
        const errorMessage = data.message ||
          (data.errors ? Object.values(data.errors)[0][0] : "Registration failed.");
        setRegError(errorMessage);
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

  return (
    <>
      <nav className="sticky top-0 z-40 bg-black text-white relative shadow-md">
        <div className="container  mx-auto ">
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

            <div className="hidden md:flex items-center flex-shrink-0">
              <Link href="/wishlist" className="relative p-2 hover:bg-gray-800 rounded-full transition text-white">
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

              {/* User Profile / Sign In Dropdown */}
              <div
                className="relative ml-2 py-2"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <div
                  onClick={() => {
                    if (!isLoggedIn) {
                      setActiveModal("login");
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
                </div>

                {showDropdown && (
                  <div className="absolute right-0 top-full mt-0 w-52 bg-white text-gray-800 rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-50">
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
                      <Link href="/order" onClick={() => setShowDropdown(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition">
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

            <button className="md:hidden text-2xl cursor-pointer p-2 text-white hover:text-blue-400" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* --- BOTTOM NAVBAR --- */}
        <div className="hidden md:block border-t border-gray-800 bg-white text-gray-800 relative shadow-sm">
          <div className="container  mx-auto flex items-center h-12 text-sm font-medium relative">
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

              {/* Categories Dropdown Panels */}
              <div className={`${isCategoryOpen ? "flex" : "hidden"} absolute left-0 top-full z-50`}>
                <div className="w-64 bg-white h-[420px] overflow-y-auto p-2 border border-gray-100 shadow-2xl">
                  {loading ? (
                    <div className="p-4 text-xs text-gray-500 text-center">Loading...</div>
                  ) : (
                    <ul className="space-y-0.5">
                      {categoriesData.map((mainCat) => (
                        <li key={mainCat.id}>
                          <div
                            onMouseEnter={() => { setActiveMain(mainCat.id); setActiveSub(null); }}
                            onClick={() => { resetCategoryMenu(); router.push(`/FashionCategory/${mainCat.id}`); }}
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

                {activeMainCat?.children?.length > 0 && (
                  <div className="w-64 bg-white h-[420px] border-l border-gray-200 p-2 shadow-2xl overflow-y-auto">
                    <ul className="space-y-0.5">
                      {activeMainCat.children.map((subCat) => (
                        <li key={subCat.id}>
                          <div
                            onMouseEnter={() => setActiveSub(subCat.id)}
                            className={`flex items-center justify-between py-2 px-3 rounded-md cursor-pointer text-gray-700 hover:bg-gray-50 ${activeSub === subCat.id ? "bg-blue-50 text-blue-600" : ""}`}
                          >
                            <Link href={`/ExploreProducts/${activeMainCat.slug}/${subCat.slug}`} onClick={resetCategoryMenu} className="text-sm font-semibold flex-1">
                              {subCat.name}
                            </Link>
                            {subCat.children?.length > 0 && <FaChevronRight className="text-xs text-gray-400" />}
                          </div>
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
      </nav>

      {/* ==================================================== */}
      {/* 🌟 BLURRED BACKGROUND MODAL POPUP (LOGIN & REGISTER) */}
      {/* ==================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">

          {/* LOGIN MODAL */}
          {activeModal === "login" && (
            <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">

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
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
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

          {/* REGISTER MODAL */}
          {activeModal === "register" && (
            <div className="bg-white text-gray-800 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200">

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
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 focus:bg-white transition"
                  />
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
                    onClick={() => { setRegError(""); setActiveModal("login"); }}
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
    </>
  );
};

export default Navbar;