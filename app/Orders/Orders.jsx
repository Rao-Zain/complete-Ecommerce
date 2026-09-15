"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { API_BASE_URL } from "@/lib/config";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  useEffect(() => {
    const id = localStorage.getItem("userId") || "";
    setUserId(id);
    setCheckedAuth(true);
  }, []);

  useEffect(() => {
    if (!checkedAuth) return;

    if (userId) {
      fetchOrders(userId);
    } else {
      setLoading(false);
    }
  }, [userId, checkedAuth]);

  const fetchOrders = async (uid) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!uid || !token) {
        setError("Please login first to view your orders.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/user-orders?user_id=${uid}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const result = await response.json();

      if (result.status && result.data) {
        setOrders(result.data);
      } else {
        setError("There was a problem loading the orders!");
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Network error! Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // Badges matching the outline pill design from the screenshot
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-500 border border-rose-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatOrderNumber = (num) => {
    if (!num) return "";
    const str = String(num);
    return str.startsWith("ORD-") ? str : `ORD-${str}`;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans w-full overflow-x-hidden">
      <main className="container mx-auto px-3 sm:px-4 py-6">
        {/* Page Heading */}
        <div className="text-center mb-2 ">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1.5">
            Track your purchases and order status in real-time
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl p-10 text-center shadow-xs border border-gray-100">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
            <p className="mt-3 text-gray-500 text-xs font-medium">
              Fetching your orders, please wait...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-gray-100">
            <p className="font-semibold text-sm text-rose-600">{error}</p>
            <button
              onClick={() => fetchOrders(userId)}
              className="mt-4 px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4 sm:space-y-5">
            {orders.map((order) => (
  <Link
    key={order.id}
    href={`/OrderDetail/${order.id}`}
    className="block group"
  >
    <div className="relative overflow-hidden bg-white rounded-2xl px-6 py-5 sm:px-8 sm:py-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      
      {/* Left Side: Order Number, Date, Items */}
      <div className="space-y-1 w-full sm:w-auto">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#00a651] transition-colors tracking-tight">
          Order #{formatOrderNumber(order.order_number)}
        </h2>
        <p className="text-xs sm:text-sm text-gray-500">
          Placed on {formatDate(order.created_at)}
        </p>
        <p className="text-xs text-gray-400">
          {order.items_count || (Array.isArray(order.items) ? order.items.length : 1)} Items in this order
        </p>
      </div>

      {/* Right Side: Status Badge & Total Amount */}
      <div className="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-2 sm:gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
        <span
          className={`px-3.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusBadge(
            order.status
          )}`}
        >
          {order.status}
        </span>

        <div className="text-right">
          <div className="text-xl sm:text-2xl font-extrabold text-[#00a651] tracking-tight">
            Rs {Number(order.total || 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 font-normal">
            Total Amount
          </div>
        </div>
      </div>

      {/* Animated Green Bottom Underline */}
      <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#00a651] transition-all duration-300 ease-out group-hover:w-full" />
    </div>
  </Link>
))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xs border border-gray-100 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
              <HiOutlineShoppingBag className="text-3xl stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              No Orders Yet!
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm max-w-xs mb-6">
              You haven&apos;t placed any orders yet. Explore our products and start shopping today.
            </p>
            <Link
              href="/Products"
              className="bg-[#00a651] hover:bg-[#008f45] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md transition cursor-pointer"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;