"use client";

import React, { useState, useEffect } from "react";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import Link from "next/link";
import toast from "react-hot-toast";

import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";


export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');

        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    };

    // Reads the same way Checkout.jsx does, with a fallback to a direct
    // "userId" key in case some part of the app still sets it that way.
    const getUserId = () => {
        const direct = localStorage.getItem('userId');
        if (direct && direct !== 'undefined' && direct !== 'null') return direct;

        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                return parsed?.id || parsed?._id || null;
            }
        } catch (e) {
            console.error('Error parsing stored user', e);
        }
        return null;
    };

    useEffect(() => {
        const fetchCartData = async () => {
            try {
                const userId = getUserId();
                const token = localStorage.getItem('token');

                console.log('CartPage auth check:', { userId, hasToken: !!token });

                if (!userId || !token) {
                    toast.error('Please login first to view your cart.');
                    setLoading(false);
                    return;
                }

                const response = await fetch(`${API_BASE_URL}/api/cart?user_id=${userId}`, {
                    method: 'GET',
                    headers: getAuthHeaders(),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch cart data');
                }

                const data = await response.json();
                console.log('CART API response:', data);

                const items = Array.isArray(data) ? data : data.data || [];
                setCartItems(items);
                localStorage.setItem("cart", JSON.stringify(items));

            } catch (error) {
                console.error(error);
                toast.error('Failed to load cart data from server');
            } finally {
                setLoading(false);
            }
        };

        fetchCartData();
    }, []);

    const updateQuantityInDB = (cartId, userId, newQty) => {
        if (!userId) return;
        fetch(`${API_BASE_URL}/api/cart-update-quantity/${cartId}`, {
            method: "PUT",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: userId,
                quantity: newQty
            })
        })
            .then((res) => res.json())
            .then((data) => console.log("Database updated:", data))
            .catch((err) => console.error("Database update error:", err));
    };

    const removeItem = (cartId) => {
        const userId = getUserId();

        const updatedItems = cartItems.filter(
            (item) => String(item.id) !== String(cartId)
        );
        setCartItems(updatedItems);
        localStorage.setItem("cart", JSON.stringify(updatedItems));
        window.dispatchEvent(new Event("cartUpdated"));

        fetch(`${API_BASE_URL}/api/cart-remove-item/${cartId}`, {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                user_id: userId
            })
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`Remove failed with status ${res.status}`);
                }
                return res.json();
            })
            .then((data) => console.log("Item removed:", data))
            .catch((err) => console.error("Remove API error:", err));
    };

    const increaseQty = (id) => {
        let newQty = 1;
        const updated = cartItems.map((item) => {
            if (item.id === id) {
                newQty = (item.quantity || 1) + 1;
                return { ...item, quantity: newQty };
            }
            return item;
        });

        setCartItems(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
        window.dispatchEvent(new Event("cartUpdated"));
        updateQuantityInDB(id, getUserId(), newQty);
    };

    const decreaseQty = (id) => {
        let newQty = 1;
        let shouldUpdate = false;

        const updated = cartItems.map((item) => {
            if (item.id === id && item.quantity > 1) {
                newQty = item.quantity - 1;
                shouldUpdate = true;
                return { ...item, quantity: newQty };
            }
            return item;
        });

        if (shouldUpdate) {
            setCartItems(updated);
            localStorage.setItem("cart", JSON.stringify(updated));
            window.dispatchEvent(new Event("cartUpdated"));
            updateQuantityInDB(id, getUserId(), newQty);
        }
    };

    const getProductImage = (item) => {
        const variant = item?.variant;

        let path =
            variant?.variant_image?.image_path ||
            item?.variants?.[0]?.image ||
            variant?.variant_images?.[0]?.image_path ||
            variant?.variant_images?.[0]?.image ||
            variant?.variants?.[0]?.image_path ||
            variant?.variants?.[0]?.image ||
            variant?.main_variant_image?.image_path ||
            variant?.image_path ||
            variant?.image;

        if (!path) return "/placeholder.png";

        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }

        const cleanPath = path.startsWith("/") ? path.slice(1) : path;

        if (cleanPath.startsWith("storage/")) {
            return `${API_BASE_URL}/${cleanPath}`;
        }

        return `${API_BASE_URL}/storage/${cleanPath}`;
    };

    const totalQty = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
    const totalAmount = cartItems.reduce((total, item) => total + Number(item.variant?.price || 0) * (item.quantity || 1), 0);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-lg font-bold text-gray-700">Loading Cart...</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 py-10 ">
            <div className="container px-4 mx-auto sm:px-6 lg:px-10 max-w-7xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-800">My Cart</h1>
                    <p className="text-gray-500 text-sm mt-1">Review your items before checkout</p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
                            alt="Empty Cart"
                            className="w-28 mx-auto opacity-80"
                        />
                        <h2 className="text-xl font-bold mt-4 text-gray-800">Your Cart is Empty</h2>
                        <p className="text-gray-500 mt-2 text-xs">
                            Looks like you haven't added any products to your cart yet.
                        </p>
                        <Link href="/Products">
                            <button className="mt-6 px-6 py-2.5 bg-[#00A651] hover:bg-green-700 text-white rounded-xl font-semibold text-xs duration-300 cursor-pointer shadow-sm">
                                Continue Shopping
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8 items-start">

                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => {
                                const variant = item.variant;
                                const product = variant?.product;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all"
                                    >
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <img
                                                src={getProductImage(item)}
                                                alt={product?.name || "Product"}
                                                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover flex-shrink-0 border border-gray-100"
                                            />
                                            <div>
                                                <h2 className="text-base font-bold text-gray-800">
                                                    {product?.name || "N/A"}
                                                </h2>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    Color : <span className="font-medium text-gray-700">{variant?.color_name || "N/A"}</span> &bull; Size : <span className="font-medium text-gray-700">{variant?.size || "N/A"}</span>
                                                </p>
                                                <div className="flex items-center gap-3 mt-1.5 text-xs">
                                                    <span className="text-gray-500">Price: <strong className="text-gray-800">Rs {variant?.price || 0}</strong></span>
                                                    <span className="text-gray-300">|</span>
                                                    <span className="text-[#00A651] font-semibold">
                                                        Subtotal: Rs {Number(variant?.price || 0) * (item.quantity || 1)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-gray-100">
                                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                                                <button
                                                    type="button"
                                                    onClick={() => decreaseQty(item.id)}
                                                    className="px-3 py-1.5 text-sm hover:bg-gray-200 cursor-pointer font-bold text-gray-600 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="text"
                                                    value={item.quantity}
                                                    readOnly
                                                    className="w-10 text-center text-xs font-semibold outline-none bg-transparent text-gray-800"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => increaseQty(item.id)}
                                                    className="px-3 py-1.5 text-sm hover:bg-gray-200 cursor-pointer font-bold text-gray-600 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex justify-center items-center cursor-pointer transition-colors"
                                                title="Delete Item"
                                            >
                                                <FaTimes size={13} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#00A651]"></span>
                                Cart Summary
                            </h2>
                            <div className="flex justify-between text-xs text-gray-500 mb-3">
                                <span>Total Items</span>
                                <span className="font-bold text-gray-800">{cartItems.length}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mb-4">
                                <span>Total Quantity</span>
                                <span className="font-bold text-gray-800">{totalQty}</span>
                            </div>
                            <div className="flex justify-between items-center text-base font-bold text-gray-800 border-t border-gray-100 pt-4 mb-6">
                                <span>Total Amount</span>
                                <span className="text-[#00A651] text-xl">Rs {totalAmount}</span>
                            </div>
                            <Link href="/Checkout">
                                <button className="w-full bg-[#00A651] hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-xs flex justify-center items-center gap-2 cursor-pointer transition-all shadow-sm">
                                    Proceed to Checkout
                                    <FaArrowRight size={12} />
                                </button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}