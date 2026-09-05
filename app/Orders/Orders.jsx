"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineShoppingBag, HiOutlineSearch } from "react-icons/hi";
import {
    HiOutlineHeart,
    HiOutlineShoppingCart,
    HiOutlineUser,
} from "react-icons/hi2";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userId, setUserId] = useState(null);
    const [checkedAuth, setCheckedAuth] = useState(false); // login check complete hui ya nahi

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');

        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    // localStorage is only available on the client side, so read it inside useEffect
    // FIX: key "userId" hai (jaisa baaki pages me use ho raha hai), "userID" nahi
    useEffect(() => {
        const id = localStorage.getItem("userId") || '';
        setUserId(id);
        setCheckedAuth(true);
    }, []);

    useEffect(() => {
        if (!checkedAuth) return; // pehle localStorage check complete hone do

        if (userId) {
            fetchOrders(userId);
        } else {
            // login hi nahi hai, spinner ko hamesha ghumny mat do
            setLoading(false);
        }
    }, [userId, checkedAuth]);

    const fetchOrders = async (uid) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            if (!uid || !token) {
                setError("Please login first to view your orders.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/user-orders?user_id=${uid}`, {
                method: 'GET',
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

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "pending":
                return "bg-[#fef3c7] text-[#d97706]";
            case "delivered":
                return "bg-[#d1fae5] text-[#059669]";
            case "cancelled":
                return "bg-[#fee2e2] text-[#dc2626]";
            case "processing":
                return "bg-blue-100 text-blue-600";
            default:
                return "bg-gray-200 text-gray-700";
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

    return (
        <div className="min-h-screen bg-gray-100 font-sans w-full overflow-x-hidden">
            <main className="container mx-auto px-4 sm:px-6 lg:px-10 py-10 max-w-4xl">

                {/* Page Heading */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                        My Orders
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        Track your purchases and order status in real-time
                    </p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="bg-white rounded-2xl p-8 text-center shadow-xs border border-gray-200">
                        <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-pink-500 border-t-transparent"></div>

                        <p className="mt-3 text-gray-500 text-xs font-semibold">
                            Fetching your orders, please wait...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-white rounded-2xl p-6 text-center text-red-500 shadow-xs border border-gray-200">
                        <p className="font-semibold text-sm">
                            {error}
                        </p>

                        <button
                            onClick={() => fetchOrders(userId)}
                            className="mt-3 px-4 py-2 bg-pink-500 text-white rounded-xl text-xs font-bold hover:bg-pink-600 transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Orders List */}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/OrderDetail/${order.id}`}
                                className="block group"
                            >
                                <div className="bg-white group-hover:bg-white rounded-2xl p-5 sm:px-6 sm:py-4 transition-all duration-200 border-b-3 border-transparent group-hover:border-b-green-500 shadow-xs border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                                    {/* Left Side Info */}
                                    <div className="space-y-1 w-full sm:w-auto">
                                        <h2 className="text-base font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                                            Order #{order.order_number}
                                        </h2>

                                        <p className="text-xs text-gray-500 font-medium">
                                            Placed on {formatDate(order.created_at)}
                                        </p>

                                        <p className="text-[11px] text-gray-400">
                                            {order.items_count || 1} Items in this order
                                        </p>
                                    </div>

                                    {/* Right Side Info */}
                                    <div className="w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">

                                        <span
                                            className={`px-3 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getStatusBadge(
                                                order.status
                                            )}`}
                                        >
                                            {order.status}
                                        </span>

                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                                Rs {Number(order.total).toLocaleString()}
                                            </div>

                                            <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider text-right">
                                                Total Amount
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Empty Orders State */}
                {!loading && !error && orders.length === 0 && (
                    <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all duration-300">

                        <div className="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-600 mb-4 shadow-inner">
                            <HiOutlineShoppingBag className="text-3xl stroke-[1.5]" />
                        </div>

                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                            No Orders Yet!
                        </h3>

                        <p className="text-gray-400 text-xs sm:text-sm max-w-xs mb-6">
                            You haven&apos;t placed any orders yet. Explore our products and start shopping today.
                        </p>

                        <Link
                            href="/products"
                            className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-pink-500/25 transition-all cursor-pointer inline-block text-center"
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