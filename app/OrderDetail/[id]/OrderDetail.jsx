"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Package, CheckCircle2, RotateCcw } from "lucide-react";
import Swal from "sweetalert2";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const defaultPic = "/default.jpg";
const RESTORE_TIME_LIMIT_SECONDS = 60; // 1 minute window for testing

function OrderDetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="container mx-auto space-y-6">
        <div className="h-5 w-32 bg-gray-200 rounded-md" />

        {/* Header Card Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2.5">
            <div className="h-6 w-52 bg-gray-200 rounded-md" />
            <div className="h-4 w-40 bg-gray-200 rounded-md" />
          </div>
          <div className="h-8 w-24 bg-gray-200 rounded-full" />
        </div>

        {/* Items Container Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="h-5 w-36 bg-gray-200 rounded-md mb-4" />
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-gray-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-200 shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 w-44 bg-gray-200 rounded-md" />
                  <div className="flex gap-2">
                    <div className="h-5 w-16 bg-gray-200 rounded-md" />
                    <div className="h-5 w-14 bg-gray-200 rounded-md" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 rounded-md" />
                </div>
              </div>
              <div className="w-24 h-6 bg-gray-200 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelling, setCancelling] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  const getAuthToken = () => {
    if (typeof window === "undefined") return null;
    const rawToken = localStorage.getItem("token");
    return rawToken ? rawToken.trim() : null;
  };

  const getStoredUserId = () => {
    if (typeof window === "undefined") return null;
    const uid = localStorage.getItem("userId");
    return uid ? uid.trim() : null;
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const getProductImage = (item) => {
    const mainImage =
      item?.product?.images?.find((img) => img.is_main === 1) ||
      item?.product?.images?.[0];

    let path =
      item?.image_path ||
      item?.image ||
      mainImage?.image_path ||
      item?.product?.image_path ||
      item?.product?.image ||
      item?.product?.thumbnail;

    if (!path) return defaultPic;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;

    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  const getItemColor = (item) =>
    item.variant?.color_name ||
    item.color ||
    item.color_name ||
    "Standard";

  const getItemSize = (item) =>
    item.variant?.size ||
    item.size ||
    item.size_name ||
    "N/A";

  const formatOrderNumber = (num) => {
    if (!num) return "";
    const str = String(num);
    return str.startsWith("ORD-") ? str : `ORD-${str}`;
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          container: "bg-amber-50/70 text-amber-700 border border-amber-200/90",
          dot: "bg-amber-500",
        };
      case "delivered":
        return {
          container: "bg-emerald-50/70 text-emerald-700 border border-emerald-200/90",
          dot: "bg-emerald-500",
        };
      case "cancelled":
        return {
          container: "bg-rose-50/70 text-rose-600 border border-rose-200/90",
          dot: "bg-rose-500",
        };
      default:
        return {
          container: "bg-blue-50/70 text-blue-700 border border-blue-200/90",
          dot: "bg-blue-500",
        };
    }
  };

  // Timer countdown controller
  const startRestoreCountdown = (cancelledTimestamp) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const calculateRemaining = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - cancelledTimestamp) / 1000);
      const remaining = RESTORE_TIME_LIMIT_SECONDS - elapsedSeconds;

      if (remaining <= 0) {
        setTimeLeft(0);
        if (typeof window !== "undefined") {
          localStorage.removeItem(`order_cancel_time_${id}`);
        }
        clearInterval(timerRef.current);
      } else {
        setTimeLeft(remaining);
      }
    };

    calculateRemaining();
    timerRef.current = setInterval(calculateRemaining, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!id) return;

    const uid = getStoredUserId();

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!uid) {
          throw new Error("Please login first to view this order.");
        }

        const url = `${API_BASE_URL}/api/orders-detail/${id}?user_id=${uid}`;

        const response = await fetch(url, {
          method: "GET",
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const result = await response.json();
        const matchedOrder = result.data || result.order || result;

        if (!matchedOrder) {
          throw new Error("Order data not found in response");
        }

        const isCancelled = matchedOrder.status?.toLowerCase() === "cancelled";

        if (isCancelled) {
          const storedTime = localStorage.getItem(`order_cancel_time_${id}`);
          const cancelledAt = storedTime
            ? parseInt(storedTime, 10)
            : new Date(matchedOrder.updated_at || matchedOrder.created_at).getTime();

          const elapsed = (Date.now() - cancelledAt) / 1000;
          if (elapsed < RESTORE_TIME_LIMIT_SECONDS) {
            startRestoreCountdown(cancelledAt);
          } else {
            setTimeLeft(0);
          }
        }

        const formattedOrder = {
          orderId: formatOrderNumber(matchedOrder.order_number || matchedOrder.id || id),
          placedDate: matchedOrder.created_at
            ? `Placed on ${new Date(matchedOrder.created_at).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}`
            : "Recent",
          status: matchedOrder.status
            ? matchedOrder.status.charAt(0).toUpperCase() + matchedOrder.status.slice(1)
            : "Pending",
          items: (matchedOrder.items || []).map((item) => ({
            id: item.id,
            slug: item.product?.slug || item.slug || item.product_id || item.id,
            name: item.product?.name || item.product_name || item.name || "Product Item",
            color: getItemColor(item),
            size: getItemSize(item),
            quantity: item.quantity || 1,
            priceEach: `Rs ${Number(item.price || 0).toLocaleString()}`,
            totalPrice: `Rs ${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}`,
            image: getProductImage(item),
            reviewed: item.reviewed || false,
          })),
          grandTotal: `Rs ${Number(matchedOrder.total || matchedOrder.grand_total || 0).toLocaleString()}`,
        };

        setOrderData(formattedOrder);
      } catch (err) {
        console.error("Error fetching order detail:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [id]);

  const handleCancelOrder = async () => {
    const token = getAuthToken();
    const userId = getStoredUserId();

    if (!token || !userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to cancel this order.",
        icon: "warning",
        confirmButtonColor: "#f43f5e",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#64748b",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setCancelling(true);
      setCancelError(null);

      const url = `${API_BASE_URL}/api/cancel-order/${id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: Number(userId) }),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Server gave an invalid response (status ${response.status})`);
      }

      if (!response.ok || result?.success === false || result?.status === false) {
        throw new Error(result?.message || `Server returned status ${response.status}`);
      }

      // Record cancel timestamp and start countdown
      const cancelTime = Date.now();
      localStorage.setItem(`order_cancel_time_${id}`, cancelTime.toString());
      startRestoreCountdown(cancelTime);

      setOrderData((prev) => ({
        ...prev,
        status: "Cancelled",
      }));

      Swal.fire({
        title: "Cancelled!",
        text: `Order cancelled. You can restore it within ${RESTORE_TIME_LIMIT_SECONDS} seconds.`,
        icon: "success",
        confirmButtonColor: "#00a651",
      });
    } catch (err) {
      console.error("Error cancelling order:", err);
      const friendlyMsg =
        err.message === "Failed to fetch"
          ? "Could not connect to the server. Please check your network connection."
          : err.message;

      setCancelError(friendlyMsg);

      Swal.fire({
        title: "Error!",
        text: friendlyMsg,
        icon: "error",
        confirmButtonColor: "#f43f5e",
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleRestoreOrder = async () => {
    const token = getAuthToken();
    const userId = getStoredUserId();

    if (!token || !userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to restore this order.",
        icon: "warning",
        confirmButtonColor: "#4f46e5",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Restore Order?",
      text: "Do you want to restore this order back to active state?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, restore it!",
      cancelButtonText: "No",
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#64748b",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      setRestoring(true);
      setCancelError(null);

      const url = `${API_BASE_URL}/api/orders/restore/${id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ user_id: Number(userId) }),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Server gave an invalid response (status ${response.status})`);
      }

      if (!response.ok || result?.success === false || result?.status === false) {
        throw new Error(result?.message || `Server returned status ${response.status}`);
      }

      if (timerRef.current) clearInterval(timerRef.current);
      localStorage.removeItem(`order_cancel_time_${id}`);
      setTimeLeft(null);

      setOrderData((prev) => ({
        ...prev,
        status: "Pending",
      }));

      Swal.fire({
        title: "Restored!",
        text: "Order restored successfully.",
        icon: "success",
        confirmButtonColor: "#4f46e5",
      });
    } catch (err) {
      console.error("Error restoring order:", err);
      const friendlyMsg =
        err.message === "Failed to fetch"
          ? "Could not connect to the server. Please check your network connection."
          : err.message;

      setCancelError(friendlyMsg);

      Swal.fire({
        title: "Error!",
        text: friendlyMsg,
        icon: "error",
        confirmButtonColor: "#f43f5e",
      });
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 flex flex-col justify-center items-center space-y-4">
        <p className="text-rose-600 font-medium">Error: {error || "Order not found"}</p>
        <button
          onClick={() => router.push("/Orders")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>
      </div>
    );
  }

  const badgeStyle = getStatusBadge(orderData.status);
  const isCancelled = orderData.status?.toLowerCase() === "cancelled";
  const canRestore = isCancelled && timeLeft !== null && timeLeft > 0;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="container mx-auto space-y-5">
        
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-semibold text-xs sm:text-sm transition cursor-pointer"
        >
          <ArrowLeft size={18} /> Back to Orders
        </button>

        {/* 1. Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Order #{orderData.orderId}
            </h1>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mt-2">
              <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 shrink-0">
                <Calendar size={13} />
              </span>
              <span>{orderData.placedDate}</span>
            </div>
          </div>

          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold ${badgeStyle.container}`}
            >
              <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`}></span>
              {orderData.status}
            </span>
          </div>
        </div>

        {/* 2. Order Items Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <Package size={18} className="text-gray-600" />
            Order Items ({orderData.items.length})
          </h2>

          <div className="space-y-3.5">
            {orderData.items.map((item, index) => (
              <div
                key={item.id || index}
                className="bg-white border border-gray-100/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-2xs hover:border-gray-200 transition"
              >
                {/* Left Side Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <Link href={`/Productdetail/${item.slug}`} className="shrink-0 group">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultPic;
                      }}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-gray-100 group-hover:opacity-90 transition"
                    />
                  </Link>

                  <div className="min-w-0">
                    <Link
                      href={`/Productdetail/${item.slug}`}
                      className="text-sm sm:text-base font-bold text-gray-900 hover:text-emerald-600 transition truncate block"
                    >
                      {item.name}
                    </Link>

                    {/* Color & Size Badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="bg-[#eff6ff] text-[#2563eb] text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-blue-100">
                        Color: {item.color}
                      </span>
                      <span className="bg-[#faf5ff] text-[#9333ea] text-[11px] font-semibold px-2.5 py-0.5 rounded-md border border-purple-100">
                        Size: {item.size}
                      </span>
                    </div>

                    {/* Quantity Container */}
                    <div className="flex items-center gap-2 mt-2.5 text-xs text-gray-500 font-medium">
                      <span className="bg-gray-50 border border-gray-200/80 px-2 py-0.5 rounded text-gray-700 font-semibold text-[11px]">
                        Quantity: {item.quantity}
                      </span>
                      <span className="text-gray-300">|</span>
                      <span className="text-gray-400 text-xs">{item.priceEach} each</span>
                    </div>

                    {item.reviewed && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium">
                        <CheckCircle2 size={13} /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Side Price with Divider */}
                <div className="w-full sm:w-auto flex sm:flex-col justify-end items-end sm:pl-6 sm:border-l sm:border-gray-100 shrink-0">
                  <h4 className="text-lg sm:text-xl font-extrabold text-[#00a651] tracking-tight">
                    {item.totalPrice}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Grand Total & Actions Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.03)] space-y-4">
          <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-4 sm:px-6 flex justify-between items-center">
            <span className="font-bold text-gray-900 text-sm sm:text-base">Grand Total</span>
            <span className="text-xl sm:text-2xl font-black text-[#00a651]">
              {orderData.grandTotal}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pt-2">
            {canRestore && (
              <p className="text-xs text-amber-600 font-semibold">
                You can restore this order within <span className="font-bold underline">{timeLeft}s</span>.
              </p>
            )}

            <div className="flex gap-3 ml-auto">
              {orderData.status?.toLowerCase() === "pending" && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  {cancelling ? "Cancelling..." : "Cancel Order"}
                </button>
              )}

              {canRestore && (
                <button
                  onClick={handleRestoreOrder}
                  disabled={restoring}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
                >
                  <RotateCcw size={14} className={restoring ? "animate-spin" : ""} />
                  {restoring ? "Restoring..." : `Restore Order (${timeLeft}s)`}
                </button>
              )}
            </div>
          </div>

          {cancelError && (
            <p className="text-xs text-rose-600 text-right">{cancelError}</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrderDetail;