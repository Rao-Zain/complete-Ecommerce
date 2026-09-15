"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, Eye, LogIn, ShoppingBag } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/* Shimmer — mirrors the actual wishlist row layout so the loading      */
/* state doesn't jump/reflow once real data arrives.                    */
/* ------------------------------------------------------------------ */
function WishlistItemSkeleton() {
  return (
    <div className="bg-white/50 rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-row items-center justify-between p-4 gap-4">
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg bg-gray-200 animate-pulse" />

      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-3 w-2/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2" />
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
        <div className="w-9 h-9 rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}

function WishlistShimmer() {
  return (
    <div className="container px-4 mx-auto sm:px-6 lg:px-10 py-10 min-h-screen ">
      <div className="text-center mb-10">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mx-auto mb-2.5" />
        <div className="h-3.5 w-72 bg-gray-200 rounded animate-pulse mx-auto" />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WishlistItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

const Wishlist = () => {
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  // Distinguishes "haven't checked auth yet" (null) from "checked, and
  // there's no logged-in user" (false) — needed so we don't briefly flash
  // the sign-in prompt before the initial auth check even runs.
  const [isAuthed, setIsAuthed] = useState(null);

  // Helper function to safely read and clean token from localStorage
  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    let rawToken = localStorage.getItem("token");
    if (!rawToken) return null;
    return rawToken.trim();
  };

  // Component mount hone par localStorage se userId check karna.
  // IMPORTANT: previously, if there was no storedUserId, `userId` just
  // stayed at its initial `null` value forever, so the fetch effect below
  // (which only runs `if (userId !== null)`) never fired — `loading` was
  // stuck at `true` forever, which is why guests saw an endless spinner.
  // Now we explicitly resolve the guest case and stop loading.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedUserId = localStorage.getItem("userId");
    const token = getAuthToken();

    if (storedUserId && token) {
      setIsAuthed(true);
      setUserId(storedUserId);
    } else {
      setIsAuthed(false);
      setLoading(false);
    }
  }, []);

  const fetchWishlist = async (uid) => {
    const token = getAuthToken();
    if (!uid) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/wish-list?user_id=${uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const result = await response.json();

      let items = [];
      if (Array.isArray(result)) items = result;
      else if (result && Array.isArray(result.data)) items = result.data;
      else if (result && Array.isArray(result.wishlist)) items = result.wishlist;

      setWishlist(items);

      if (typeof window !== "undefined") {
        const itemIds = items.map((item) => item.product_id || item.product?.id || item.id);
        localStorage.setItem("wishlist", JSON.stringify(itemIds));
        window.dispatchEvent(new Event("wishlistUpdated"));
      }
    } catch (error) {
      console.error("Wishlist fetch error:", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId !== null) {
      fetchWishlist(userId);
    }
  }, [userId]);

  // Remove Item Function
  const removeItem = async (item) => {
    const targetId = item.id;
    const productId = item.product_id || item.product?.id || item.id;

    const numericUserId = Number(userId);
    const numericProductId = Number(productId);

    // 1. UI se instantly hata do (Optimistic Update)
    setWishlist((prev) => prev.filter((i) => i.id !== targetId));

    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("wishlist")) || [];
      const updated = existing.filter((i) => Number(i.id || i) !== numericProductId);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      window.dispatchEvent(new Event("wishlistUpdated"));
    }

    // 2. Database se remove karne ke liye API Call
    try {
      const token = getAuthToken();

      const response = await fetch(`${API_BASE_URL}/api/wish-list-add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          user_id: numericUserId,
          product_id: numericProductId,
        }),
      });

      const resData = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(resData.message || "Failed to remove item from server");
      }
    } catch (error) {
      console.error("Database remove error:", error);
      fetchWishlist(userId); // Rollback if network fails
    }
  };

  const getProductImage = (product) => {
    if (!product) return "https://via.placeholder.com/300";
    const imagePath =
      product.main_variant_image?.image_path ||
      product.variants?.[0]?.variant_image?.image_path ||
      product.variants?.[0]?.image_path;

    if (!imagePath) return "https://via.placeholder.com/300";
    return imagePath.startsWith("http")
      ? imagePath
      : `${API_BASE_URL}/storage/${imagePath}`;
  };

  const getProductPrice = (product) => {
    const firstVariant = product?.variants?.[0];
    return firstVariant ? `Rs. ${Number(firstVariant.price).toLocaleString()}` : "N/A";
  };

  const getStockStatus = (product) => {
    const totalStock =
      product?.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
    return totalStock > 0 ? `In Stock (${totalStock})` : "Out of Stock";
  };

  // Opens the same login modal the rest of the app uses (Navbar listens
  // for this event), so "Sign In" here behaves identically to every other
  // sign-in trigger in the app instead of navigating somewhere separate.
  const openSignIn = () => {
    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }));
  };

  if (loading) {
    return <WishlistShimmer />;
  }

  // ---------------------------------------------------------------
  // GUEST STATE — not logged in. Replaces the old infinite spinner.
  // ---------------------------------------------------------------
  if (isAuthed === false) {
    return (
      <div className="bg-gray-100">
      <div className="container px-4 mx-auto sm:px-6 lg:px-10 py-8 flex items-center justify-center min-h-[60vh] ">
        <div className="max-w-md w-full mx-auto text-center bg-white/50 border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-pink-50 flex items-center justify-center mb-3">
            <Heart size={26} className="text-pink-500" fill="currentColor" />
          </div>

          <h1 className="text-lg font-bold text-gray-900">Your Wishlist Is Waiting</h1>
          <p className="text-gray-500 text-xs mt-1.5 leading-relaxed">
            Sign in to save your favorite products and pick up right where you left off.
          </p>

          <button
            onClick={openSignIn}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-600/20"
          >
            <LogIn size={16} />
            Sign In / Register
          </button>

          <button
            onClick={() => router.push("/Products")}
            className="mt-2 w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 font-medium text-xs py-2 rounded-xl transition cursor-pointer"
          >
            <ShoppingBag size={14} />
            Continue Browsing Instead
          </button>
        </div>
      </div>
      </div>
    );
  }

  return (
    <div className="container px-4 mx-auto sm:px-6 lg:px-10 py-10 min-h-screen">
      {/* Agar wishlist empty hai toh heading hide ho jayegi, sirf items hone par dikhegi */}
      {wishlist.length > 0 && (
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-500 text-sm">Save your favorite products and purchase them later anytime</p>
        </div>
      )}

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={70} className="mx-auto text-gray-300" />
          <h2 className="text-2xl font-semibold mt-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-gray-500 mt-2">
            Add your favourite products to see them here.
          </p>
          <button
            onClick={() => router.push("/Products")}
            className="mt-6 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition cursor-pointer"
          >
            <ShoppingBag size={16} />
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {wishlist.map((item) => {
            const product = item.product || item;

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden flex flex-row items-center justify-between p-4 gap-4 transition hover:shadow-lg"
              >
                {/* Left Side: Product Image */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={getProductImage(product)}
                    alt={product?.name || "Product Image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300";
                    }}
                  />
                </div>

                {/* Middle Side: Product Info */}
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="font-bold text-base sm:text-lg capitalize text-gray-800 line-clamp-1">
                    {product?.name}
                  </h2>

                  <p
                    className="text-gray-500 text-xs sm:text-sm mt-0.5 line-clamp-1"
                    dangerouslySetInnerHTML={{
                      __html: product?.description || getStockStatus(product),
                    }}
                  />

                  <p className="text-emerald-600 font-bold mt-2 text-base">
                    {getProductPrice(product)}
                  </p>
                </div>

                {/* Right Side: Actions / Buttons */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/Productdetail/${product?.slug}`);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 cursor-pointer rounded-lg transition"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(item);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2.5  cursor-pointer rounded-lg transition"
                    title="Remove Item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;