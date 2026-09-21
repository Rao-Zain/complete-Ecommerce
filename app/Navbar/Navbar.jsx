"use client";

import { useState, useEffect } from "react";
import ImageSearchModal from "@/app/ImageSearchModal/ImageSearchModal";
import TopNavbar from "./TopNavbar";
import BottomNavbar from "./BottomNavbar";
import MobileMenu from "./MobileMenu";
import MobileTabBar from "./MobileTabBar";
import AuthModal from "./AuthModal";
import { API_BASE_URL } from "@/lib/config";

const Navbar = () => {
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState({ name: "Guest", email: "guest@example.com" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [imageSearchOpen, setImageSearchOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Read LocalStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const cachedSettings = localStorage.getItem("storeSettings");
      if (cachedSettings) setStoreSettings(JSON.parse(cachedSettings));

      const cachedCats = localStorage.getItem("navbarCategories");
      if (cachedCats) setCategoriesData(JSON.parse(cachedCats));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch Settings & Categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (categoriesData.length === 0) setLoading(true);
        const [catRes, setRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/categories`),
          fetch("https://stores.hexalogicx.com/api/store-settings"),
        ]);

        if (catRes.ok) {
          const json = await catRes.json();
          const normalized = Array.isArray(json?.data ? json.data : json) ? (json.data || json) : [];
          setCategoriesData(normalized);
          localStorage.setItem("navbarCategories", JSON.stringify(normalized));
        }

        if (setRes.ok) {
          const json = await setRes.json();
          const settings = json?.data ?? json;
          setStoreSettings(settings);
          localStorage.setItem("storeSettings", JSON.stringify(settings));
        }
      } catch (err) {
        console.error("Navbar data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Sync Auth, Cart, & Wishlist Events
  useEffect(() => {
    const syncState = async () => {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setUser({
        name: localStorage.getItem("userName") || "Guest",
        email: localStorage.getItem("email") || "guest@example.com",
      });
      setIsLoggedIn(!!token);

      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
      setWishlistCount(wishlist.length);

      if (token && userId && userId !== "undefined" && userId !== "null") {
        try {
          const res = await fetch(`${API_BASE_URL}/api/cart?user_id=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const items = Array.isArray(data) ? data : data.data || [];
            setCartCount(items.length);
            localStorage.setItem("cart", JSON.stringify(items));
            return;
          }
        } catch (err) {
          console.error(err);
        }
      }
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    syncState();
    window.addEventListener("storage", syncState);
    window.addEventListener("authUpdated", syncState);
    window.addEventListener("wishlistUpdated", syncState);
    window.addEventListener("cartUpdated", syncState);

    const handleOpenAuth = (e) => setActiveModal(e?.detail?.mode || "login");
    window.addEventListener("open-auth-modal", handleOpenAuth);

    return () => {
      window.removeEventListener("storage", syncState);
      window.removeEventListener("authUpdated", syncState);
      window.removeEventListener("wishlistUpdated", syncState);
      window.removeEventListener("cartUpdated", syncState);
      window.removeEventListener("open-auth-modal", handleOpenAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser({ name: "Guest", email: "guest@example.com" });
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("authUpdated"));
    window.dispatchEvent(new Event("wishlistUpdated"));
    setActiveModal("login");
  };

  return (
    <>
      <TopNavbar
        mounted={mounted}
        storeSettings={storeSettings}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        user={user}
        isLoggedIn={isLoggedIn}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onOpenImageSearch={() => setImageSearchOpen(true)}
        onOpenAuthModal={(mode) => setActiveModal(mode)}
        onLogout={handleLogout}
      />

      <BottomNavbar categoriesData={categoriesData} loading={loading} />

      <MobileMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        mounted={mounted}
        isLoggedIn={isLoggedIn}
        user={user}
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        categoriesData={categoriesData}
        loading={loading}
        storeSettings={storeSettings}
        onOpenAuthModal={(mode) => setActiveModal(mode)}
        onLogout={handleLogout}
        onOpenImageSearch={() => setImageSearchOpen(true)}
      />

      <MobileTabBar
        mounted={mounted}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        isLoggedIn={isLoggedIn}
        onOpenAuthModal={(mode) => setActiveModal(mode)}
      />

      <ImageSearchModal isOpen={imageSearchOpen} onClose={() => setImageSearchOpen(false)} />
      <AuthModal activeModal={activeModal} onClose={() => setActiveModal(null)} />
    </>
  );
};

export default Navbar;