"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE_URL } from "@/lib/config";

export default function WishlistButton({ productId, className = "" }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    let rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    rawToken = rawToken.trim();
    if (rawToken.startsWith('"') && rawToken.endsWith('"')) {
      rawToken = rawToken.slice(1, -1);
    }
    return rawToken;
  };

  useEffect(() => {
    const syncStatus = () => {
      const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
      setIsWishlisted(stored.includes(Number(productId)));
    };

    syncStatus();
    window.addEventListener("wishlistUpdated", syncStatus);
    window.addEventListener("storage", syncStatus);
    return () => {
      window.removeEventListener("wishlistUpdated", syncStatus);
      window.removeEventListener("storage", syncStatus);
    };
  }, [productId]);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userId = localStorage.getItem("userId");
    const token = getAuthToken();

    if (!userId || !token) {
      toast.error("Please login first to manage your wishlist");
      return;
    }

    const numericUserId = Number(userId);
    const numericProductId = Number(productId);

    const stored = JSON.parse(localStorage.getItem("wishlist")) || [];
    const nextState = !isWishlisted;
    const updated = nextState
      ? [...stored, numericProductId]
      : stored.filter((id) => id !== numericProductId);

    // Optimistic UI update
    setIsWishlisted(nextState);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    window.dispatchEvent(new Event("wishlistUpdated"));

    try {
      const res = await fetch(`${API_BASE_URL}/api/wish-list-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: numericUserId,
          product_id: numericProductId,
        }),
      });

      if (!res.ok) throw new Error("Failed to update wishlist on server");
    } catch (err) {
      console.error(err);
      // Rollback on failure
      setIsWishlisted(!nextState);
      localStorage.setItem("wishlist", JSON.stringify(stored));
      window.dispatchEvent(new Event("wishlistUpdated"));
      toast.error("Could not sync wishlist");
    }
  };

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10 ${className}`}
      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
    >
      <Heart
        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition duration-200 ${
          isWishlisted
            ? "fill-red-500 stroke-red-500"
            : "fill-none stroke-gray-600"
        }`}
      />
    </button>
  );
}