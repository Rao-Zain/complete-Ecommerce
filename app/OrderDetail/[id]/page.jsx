"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";
import Swal from "sweetalert2"; // ⬅️ naya import

const defaultPic = "/default.jpg";

function OrderDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

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

  useEffect(() => {
    if (!id) return;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const fetchOrderDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `${API_BASE_URL}/api/orders-detail/${id}?user_id=${userId}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Server returned status ${response.status}`);
        }

        const result = await response.json();
        const matchedOrder = result.data || result.order || result;

        if (!matchedOrder) {
          throw new Error("Order data not found in response");
        }

        const formattedOrder = {
          orderId: matchedOrder.order_number || matchedOrder.id || id,
          placedDate: matchedOrder.created_at
            ? `Placed on ${new Date(matchedOrder.created_at).toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Recent",
          status: matchedOrder.status
            ? matchedOrder.status.charAt(0).toUpperCase() + matchedOrder.status.slice(1)
            : "Pending",
          items: (matchedOrder.items || []).map((item) => ({
            id: item.id,
            name: item.product?.name || item.product_name || item.name || "Product Item",
            color: item.color || item.variant?.color || "Standard",
            size: item.size || item.variant?.size || "N/A",
            quantity: item.quantity || 1,
            priceEach: `Rs ${item.price || 0}`,
            totalPrice: `Rs ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`,
            image: getProductImage(item),
            reviewed: item.reviewed || false,
          })),
          grandTotal: `Rs ${matchedOrder.total || matchedOrder.grand_total || 0}`,
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

  // ⬇️ Cancel Order Handler — ab SweetAlert2 ke sath
  const handleCancelOrder = async () => {
    const confirmResult = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order? This action can be reversed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f43f5e",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      reverseButtons: true,
    });

    if (!confirmResult.isConfirmed) return;

    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    try {
      setCancelling(true);
      setCancelError(null);

      const url = `${API_BASE_URL}/api/cancel-order/${id}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ user_id: userId }),
      });

      const text = await response.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(`Server ne invalid response diya (status ${response.status})`);
      }

      if (!response.ok) {
        throw new Error(result?.message || `Server returned status ${response.status}`);
      }

      if (result?.success === false) {
        throw new Error(result?.message || "Order cancel nahi ho saka");
      }

      setOrderData((prev) => ({
        ...prev,
        status: "Cancelled",
      }));

      Swal.fire({
        title: "Cancelled!",
        text: "Order successfully cancel ho gaya.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (err) {
      console.error("Error cancelling order:", err);
      const friendlyMsg =
        err.message === "Failed to fetch"
          ? "Server tak connection nahi ho saka. URL ya CORS setting check karein."
          : err.message;

      setCancelError(friendlyMsg);

      Swal.fire({
        title: "Error!",
        text: `Order cancel karte waqt error aayi: ${friendlyMsg}`,
        icon: "error",
        confirmButtonColor: "#f43f5e",
      });
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <p className="text-gray-500 font-medium">Loading order details...</p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center space-y-4">
        <p className="text-rose-600 font-medium">Error: {error || "Order not found"}</p>
        <button
          onClick={() => router.push('/order')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="container px-4 mx-auto sm:px-6 lg:px-10 space-y-6">

        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Orders
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Order #{orderData.orderId}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              📦 {orderData.placedDate}
            </p>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-amber-50 text-amber-600 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {orderData.status}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-4">
            📦 Order Items ({orderData.items.length})
          </h2>

          <div className="space-y-6">
            {orderData.items.map((item, index) => (
              <div
                key={item.id || index}
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  index !== orderData.items.length - 1 ? "border-b border-gray-200 pb-6" : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = defaultPic;
                    }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-gray-100"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {item.name}
                    </h3>

                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        Color: {item.color}
                      </span>
                      <span className="bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        Size: {item.size}
                      </span>
                    </div>

                    <div className="text-xs text-gray-500 mt-2 flex items-center gap-2 flex-wrap">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">
                        Quantity: {item.quantity}
                      </span>
                      <span>{item.priceEach} each</span>
                    </div>

                    {item.reviewed && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1 mt-2 font-medium">
                        <CheckCircle2 size={14} /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left sm:text-right w-full sm:w-auto">
                  <h4 className="text-xl font-bold text-emerald-600">
                    {item.totalPrice}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-base">Grand Total</span>
            <span className="text-xl font-extrabold text-emerald-600">
              {orderData.grandTotal}
            </span>
          </div>

          {orderData.status?.toLowerCase() === "pending" && (
            <div className="flex justify-end">
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 disabled:cursor-not-allowed text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {cancelling ? (
                  "Cancelling..."
                ) : (
                  <>
                    &times; Cancel Order
                  </>
                )}
              </button>
            </div>
          )}

          {cancelError && (
            <p className="text-xs text-rose-600 text-right">{cancelError}</p>
          )}
        </div>

      </div>
    </div>
  );
}

export default OrderDetail;