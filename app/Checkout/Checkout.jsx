"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaMap,
  FaGlobe,
  FaCity,
  FaMailBulk,
  FaCreditCard,
  FaMobileAlt,
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaShoppingBag,
  FaTruck,
} from "react-icons/fa";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/lib/config";

import toast from "react-hot-toast";

const defaultImage =
  "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200";

export default function CheckoutPage() {
  const router = useRouter();

  // -----------------------------
  // CART
  // -----------------------------
  const [cartItems, setCartItems] = useState([]);

  // -----------------------------
  // API DATA
  // -----------------------------
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);

  // -----------------------------
  // LOADING
  // -----------------------------
  const [checkoutLoading, setCheckoutLoading] = useState(true);
  const [cityLoading, setCityLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  // -----------------------------
  // ORDER SUCCESS
  // -----------------------------
  // const [orderNumber, setOrderNumber] = useState("");

  // -----------------------------
  // FORM
  // -----------------------------
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    country: "Pakistan",
    country_id: 167,
    province: "",
    state_id: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  // -----------------------------
  // SHIPPING
  // -----------------------------
  const [shippingMethod, setShippingMethod] = useState("standard");

  const shippingOptions = {
    standard: {
      name: "Standard Delivery",
      description: "Delivered in 5-7 business days",
      price: 0,
    },

    express: {
      name: "Express Delivery (3 Days)",
      description: "Fast delivery within 3 working days",
      price: 250,
    },

    sameDay: {
      name: "Same Day Delivery",
      description: "Get your parcel delivered today",
      price: 500,
    },
  };

  // -----------------------------
  // PAYMENT
  // -----------------------------
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [paymentData, setPaymentData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    mobileNumber: "",
  });

  // -----------------------------
  // ERRORS
  // -----------------------------
  const [errors, setErrors] = useState({});

  // ============================================================
  // LOAD CART
  // ============================================================
  // ============================================================
  // LOAD CART — now fetches the live server cart (source of truth)
  // when logged in, matching CartPage.jsx, instead of trusting
  // whatever happens to be cached in localStorage at mount time.
  // Falls back to localStorage for guests or if the fetch fails.
  // ============================================================

  useEffect(() => {
    const loadCart = async () => {
      const token = localStorage.getItem("token") || "";
      const userId = localStorage.getItem("userId");

      if (token && userId && userId !== "undefined" && userId !== "null") {
        try {
          const response = await fetch(`${API_BASE_URL}/api/cart?user_id=${userId}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            const items = Array.isArray(data) ? data : data.data || [];
            setCartItems(items);
            localStorage.setItem("cart", JSON.stringify(items));
            return;
          }
        } catch (error) {
          console.error("Checkout cart fetch error:", error);
        }
      }

      // Guest / no token / server fetch failed — fall back to localStorage
      try {
        const savedCart = localStorage.getItem("cart");
        const parsed = savedCart ? JSON.parse(savedCart) : [];
        setCartItems(Array.isArray(parsed) ? parsed : [parsed]);
      } catch (error) {
        console.error("Cart loading error:", error);
        setCartItems([]);
      }
    };

    loadCart();
  }, []);
  // ============================================================
  // CHECKOUT API
  // GET /api/checkout
  // ============================================================
  useEffect(() => {
    const fetchCheckout = async () => {
      try {
        setCheckoutLoading(true);

        const token = localStorage.getItem("token") || "";

        const response = await fetch(`${API_BASE_URL}/api/checkout`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        });

        const result = await response.json();

        console.log("CHECKOUT API:", result);

        const data = result?.data || result;

        // STATES
        if (Array.isArray(data?.states)) {
          setStates(data.states);
        }

        // COUNTRIES
        // Agar backend /checkout mein countries bhej raha hai
        if (Array.isArray(data?.countries)) {
          setCountries(data.countries);
        }

        // USER DATA
        setForm((prev) => ({
          ...prev,

          firstName:
            data?.firstName ||
            data?.first_name ||
            prev.firstName,

          lastName:
            data?.lastName ||
            data?.last_name ||
            prev.lastName,

          email:
            data?.email ||
            prev.email,

          phone:
            data?.phone ||
            data?.mobile ||
            prev.phone,

          address:
            data?.address ||
            data?.street_address ||
            prev.address,

          country:
            data?.country ||
            "Pakistan",

          country_id:
            data?.country_id ||
            167,
        }));
      } catch (error) {
        console.error("Checkout API Error:", error);
      } finally {
        setCheckoutLoading(false);
      }
    };

    fetchCheckout();
  }, []);

  // ============================================================
  // STATE CHANGE
  // GET /api/cities/{stateId}
  // ============================================================
  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    const selectedState = states.find(
      (state) => String(state.id) === String(stateId)
    );

    setForm((prev) => ({
      ...prev,
      province: selectedState?.name || "",
      state_id: stateId,
      city: "",
    }));

    setCities([]);

    if (!stateId) {
      return;
    }

    try {
      setCityLoading(true);

      const token = localStorage.getItem("token") || "";

      const response = await fetch(
        `${API_BASE_URL}/api/cities/${stateId}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...(token && {
              Authorization: `Bearer ${token}`,
            }),
          },
        }
      );

      const result = await response.json();

      console.log("CITY API:", result);

      let cityData =
        result?.data ||
        result?.cities ||
        result;

      if (
        Array.isArray(cityData) &&
        Array.isArray(cityData[0])
      ) {
        cityData = cityData[0];
      }

      setCities(
        Array.isArray(cityData)
          ? cityData
          : []
      );
    } catch (error) {
      console.error("City API Error:", error);
      setCities([]);
    } finally {
      setCityLoading(false);
    }
  };

  // ============================================================
  // NORMAL INPUT CHANGE
  // ============================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  };

  // ============================================================
  // PAYMENT CHANGE
  // ============================================================
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;

    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // PRICE
  // ============================================================
  const getPrice = (item) => {
    return Number(
      item?.variant?.price ??
      item?.price ??
      item?.sale_price ??
      0
    );
  };

  const getQuantity = (item) => {
    return Number(
      item?.quantity ??
      item?.qty ??
      1
    );
  };

  const getProductName = (item) => {
    return (
      item?.variant?.product?.name ||
      item?.name ||
      item?.title ||
      "Product"
    );
  };

  const getProductImage = (item) => {
    const image =
      item?.variant?.variant_image?.image_path ||
      item?.variant?.image ||
      item?.image ||
      "";

    if (!image) return defaultImage;

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const cleanImage = image.startsWith("/")
      ? image.substring(1)
      : image;

    if (cleanImage.startsWith("storage/")) {
      return `${API_BASE_URL}/${cleanImage}`;
    }

    return `${API_BASE_URL}/storage/${cleanImage}`;
  };

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      getPrice(item) *
      getQuantity(item),
    0
  );

  const currentShipping =
    shippingOptions[shippingMethod];

  const total =
    subtotal + currentShipping.price;

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateForm = () => {
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = true;
    }

    if (!form.email.trim()) {
      newErrors.email = true;
    }

    if (!form.phone.trim()) {
      newErrors.phone = true;
    }

    if (!form.address.trim()) {
      newErrors.address = true;
    }

    if (!form.province) {
      newErrors.province = true;
    }

    if (!form.city) {
      newErrors.city = true;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // PLACE ORDER
  // POST /api/place-order
  // ============================================================
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {

      toast.error("Your cart is empty.");
      return;
    }

    try {
      setOrderLoading(true);

      const token = localStorage.getItem("token") || "";

      // Fixed: your app stores this as a plain "userId" key
      // (see Navbar login/register), never as a "user" object.
      const storedUserId = localStorage.getItem("userId");
      const userId =
        storedUserId && storedUserId !== "undefined" && storedUserId !== "null"
          ? storedUserId
          : null;

      const fullName = `${form.firstName} ${form.lastName}`.trim();

      const payload = {
        user_id: userId,
        userId: userId,

        name: fullName,

        first_name: form.firstName,
        last_name: form.lastName,

        email: form.email,
        phone: form.phone,

        address: form.address,

        city: form.city,

        province: form.province,

        state_id: form.state_id
          ? Number(form.state_id)
          : null,

        postal_code:
          form.postalCode || "",

        postalCode:
          form.postalCode || "",

        country:
          form.country || "Pakistan",

        country_id:
          form.country_id || 167,

        shipping_address:
          `${form.address}, ${form.city}, ${form.province}, ${form.country}`,

        shipping_method:
          shippingMethod,

        payment_method:
          paymentMethod,

        items: cartItems.map((item) => ({
          id:
            item?.id ||
            item?._id,

          name:
            item?.variant?.product?.name ||
            item?.name ||
            "Product",

          price:
            getPrice(item),

          quantity:
            getQuantity(item),

          color:
            item?.variant?.color_name ||
            item?.color ||
            "",

          size:
            item?.variant?.size ||
            item?.size ||
            "",
        })),

        subtotal:
          Number(subtotal),

        shipping_fee:
          Number(currentShipping.price),

        shippingFee:
          Number(currentShipping.price),

        total_amount:
          Number(total),

        totalAmount:
          Number(total),

        notes:
          form.notes || "",

        // Payment information
        card_name:
          paymentData.cardName,

        card_number:
          paymentData.cardNumber,

        expiry:
          paymentData.expiry,

        cvv:
          paymentData.cvv,

        mobile_number:
          paymentData.mobileNumber,
      };

      console.log(
        "ORDER PAYLOAD:",
        payload
      );

      const response = await fetch(
        `${API_BASE_URL}/api/place-order`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            ...(token && {
              Authorization:
                `Bearer ${token}`,
            }),
          },

          body:
            JSON.stringify(payload),
        }
      );

      const result =
        await response.json();

      console.log(
        "ORDER RESPONSE:",
        result
      );

      if (response.ok) {
        const receivedOrderNumber =
          result?.order_number ||
          result?.order?.order_number ||
          result?.data?.order_number ||
          "ORD-SUCCESS";

        localStorage.removeItem("cart");
        window.dispatchEvent(new Event("cartUpdated"));

        router.push(`/OrderSuccess?order=${encodeURIComponent(receivedOrderNumber)}`);


      } else {
        if (result?.errors) {
          const firstKey =
            Object.keys(
              result.errors
            )[0];

          toast.error(
            result.errors[firstKey]?.[0] || "Validation error"
          );
        } else {
          toast.error(
            result?.message || "Order place nahi ho saka."
          );
        }
      }
    } catch (error) {
      console.error(
        "Place Order Error:",
        error
      );


      toast.error("Network error! Server check karein.");
      return;
    } finally {
      setOrderLoading(false);
    }
  };


  // ============================================================
  // MAIN UI
  // ============================================================
  return (
    <div className="min-h-screen bg-[#f4f5f7] py-8">

      {/* HEADER */}
      <div className="text-center mb-7">

        <h1 className="text-3xl font-bold text-gray-800">
          Checkout
        </h1>

        <p className="text-sm text-gray-500 mt-2">
          Please provide your details, choose shipping & payment options to complete your order.
        </p>

      </div>

      {/* MAIN */}
      <div className="container mx-auto px-4">

        <div className="grid lg:grid-cols-3 gap-5 items-start">

          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}
          <div className="lg:col-span-2 space-y-5">

            {/* PERSONAL INFORMATION */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

              <div className="px-5 py-4 flex items-center gap-3 ">

                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <FaUser />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Personal Information
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Enter your contact details for updates
                  </p>
                </div>

              </div>

              <div className="p-5 grid md:grid-cols-2 gap-4">

                {/* FIRST NAME */}
                <div>
                  <div className="relative">

                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className={`w-full border text-gray-800 rounded-xl pl-10 pr-3 py-3 text-sm outline-none ${errors.firstName
                        ? "border-red-500"
                        : "border-gray-200 focus:border-green-500"
                        }`}
                    />

                  </div>

                  {errors.firstName && (
                    <p className="text-red-500 text-[11px] mt-1">
                      Full name required
                    </p>
                  )}
                </div>

                {/* LAST NAME */}
                <div className="relative">

                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last Name"
                    className="w-full text-gray-800 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-green-500"
                  />

                </div>

                {/* EMAIL */}
                <div>
                  <div className="relative">

                    <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      className={`w-full text-gray-800 border rounded-xl pl-10 pr-3 py-3 text-sm outline-none ${errors.email
                        ? "border-red-500"
                        : "border-gray-200 focus:border-green-500"
                        }`}
                    />

                  </div>

                  {errors.email && (
                    <p className="text-red-500 text-[11px] mt-1">
                      Email required
                    </p>
                  )}
                </div>

                {/* PHONE */}
                <div>
                  <div className="relative">

                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Phone Number"
                      className={`w-full text-gray-800 border rounded-xl pl-10 pr-3 py-3 text-sm outline-none ${errors.phone
                        ? "border-red-500"
                        : "border-gray-200 focus:border-green-500"
                        }`}
                    />

                  </div>

                  {errors.phone && (
                    <p className="text-red-500 text-[11px] mt-1">
                      Phone required
                    </p>
                  )}
                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* SHIPPING ADDRESS */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

              <div className="px-5 py-4 border-b border-gray-200  flex items-center gap-3">

                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Shipping Address
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>

              </div>

              <div className="p-5 space-y-4">

                {/* ADDRESS */}
                <div>

                  <div className="relative">

                    <FaMapMarkerAlt className="absolute left-3 top-3.5 text-gray-400 text-sm" />

                    <textarea
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street Address, House/Apartment No, Landmark"
                      rows={3}
                      className={`w-full text-gray-800 border rounded-xl pl-10 pr-3 py-3 text-sm outline-none resize-none ${errors.address
                        ? "border-red-500"
                        : "border-gray-200 focus:border-green-500"
                        }`}
                    />

                  </div>

                  {errors.address && (
                    <p className="text-red-500 text-[11px] mt-1">
                      Street address required
                    </p>
                  )}

                </div>

                {/* COUNTRY + STATE */}
                <div className="grid md:grid-cols-2 gap-4">

                  {/* COUNTRY */}
                  <div className="relative">

                    <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />

                    <select
                      value={form.country}
                      onChange={(e) => {
                        const selected =
                          countries.find(
                            (c) =>
                              String(c.id) ===
                              String(e.target.value)
                          );

                        setForm((prev) => ({
                          ...prev,
                          country:
                            selected?.name ||
                            e.target.value,
                          country_id:
                            selected?.id ||
                            prev.country_id,
                        }));
                      }}
                      className="w-full text-gray-800 appearance-none border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none bg-white focus:border-green-500"
                    >

                      {countries.length > 0 ? (
                        countries.map((country) => (
                          <option
                            key={country.id}
                            value={country.id}
                          >
                            {country.name}
                          </option>
                        ))
                      ) : (
                        <option value="Pakistan">
                          Pakistan
                        </option>
                      )}

                    </select>

                  </div>

                  {/* STATE */}
                  <div>

                    <div className="relative">

                      <FaMap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />

                      <select
                        value={form.state_id}
                        onChange={handleStateChange}
                        className={`w-full text-gray-800 appearance-none border rounded-xl pl-10 pr-3 py-3 text-sm outline-none bg-white ${errors.province
                          ? "border-red-500"
                          : "border-gray-200 focus:border-green-500"
                          }`}
                      >

                        <option value="">
                          Select State / Province
                        </option>

                        {states.map((state) => (
                          <option
                            key={state.id}
                            value={state.id}
                          >
                            {state.name}
                          </option>
                        ))}

                      </select>

                    </div>

                    {errors.province && (
                      <p className="text-red-500 text-[11px] mt-1">
                        Province required
                      </p>
                    )}

                  </div>

                </div>

                {/* CITY + POSTAL */}
                <div className="grid md:grid-cols-2 gap-4">

                  {/* CITY */}
                  <div>

                    <div className="relative">

                      <FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm z-10" />

                      <select
                        value={form.city}
                        disabled={!form.state_id || cityLoading}
                        onChange={(e) =>
                          handleChange({
                            target: {
                              name: "city",
                              value: e.target.value,
                            },
                          })
                        }
                        className={`w-full text-gray-800 appearance-none border rounded-xl pl-10 pr-3 py-3 text-sm outline-none ${!form.state_id
                          ? "bg-gray-100 cursor-not-allowed"
                          : "bg-white focus:border-green-500"
                          } ${errors.city
                            ? "border-red-500"
                            : "border-gray-200"
                          }`}
                      >

                        <option value="">
                          {cityLoading
                            ? "Loading Cities..."
                            : form.state_id
                              ? "Select City"
                              : "Select State First"}
                        </option>

                        {cities.map((city) => (
                          <option
                            key={city.id || city.name}
                            value={city.name}
                          >
                            {city.name}
                          </option>
                        ))}

                      </select>

                    </div>

                    {errors.city && (
                      <p className="text-red-500 text-[11px] mt-1">
                        City required
                      </p>
                    )}

                  </div>

                  {/* POSTAL */}
                  <div className="relative">

                    <FaMailBulk className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />

                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="Postal / ZIP Code"
                      className="w-full text-gray-800 border border-gray-200 rounded-xl pl-10 pr-3 py-3 text-sm outline-none focus:border-green-500"
                    />

                  </div>

                </div>

              </div>
            </div>

            {/* ================================================= */}
            {/* SHIPPING OPTIONS */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

              <div className="px-5 py-4 border-b border-gray-200   flex items-center gap-3">

                <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                  <FaTruck />
                </div>

                <div>
                  <h2 className="font-bold text-gray-800">
                    Shipping Options
                  </h2>

                  <p className="text-[11px] text-gray-500">
                    Select your preferred delivery speed
                  </p>
                </div>

              </div>

              <div className="p-5 space-y-3">

                {Object.entries(
                  shippingOptions
                ).map(([key, option]) => (

                  <label
                    key={key}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer ${shippingMethod === key
                      ? "border-green-500 bg-green-50/30"
                      : "border-gray-200"
                      }`}
                  >

                    <div className="flex items-center gap-3">

                      <input
                        type="radio"
                        name="shipping"
                        checked={
                          shippingMethod === key
                        }
                        onChange={() =>
                          setShippingMethod(key)
                        }
                        className="accent-green-600"
                      />

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {option.name}
                        </p>

                        <p className="text-[11px] text-gray-500">
                          {option.description}
                        </p>
                      </div>

                    </div>

                    <strong className="text-sm text-green-600">
                      {option.price === 0
                        ? "FREE"
                        : `Rs ${option.price}`}
                    </strong>

                  </label>

                ))}

              </div>
            </div>

            {/* ================================================= */}
            {/* PAYMENT */}
            {/* ================================================= */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

              <div className="px-5 py-4 border-b border-gray-200 ">

                <h2 className="font-bold text-gray-800">
                  Payment Options
                </h2>

                <p className="text-[11px] text-gray-500">
                  Click on a payment option to view details
                </p>

              </div>

              <div className="p-5">

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-1 rounded-xl">

                  {[
                    {
                      id: "cod",
                      name: "COD",
                      icon: <FaMoneyBillWave />,
                    },
                    {
                      id: "jazzcash",
                      name: "JazzCash",
                      icon: <FaMobileAlt />,
                    },
                    {
                      id: "easypaisa",
                      name: "EasyPaisa",
                      icon: <FaWallet />,
                    },
                    {
                      id: "card",
                      name: "Card",
                      icon: <FaCreditCard />,
                    },
                  ].map((payment) => (

                    <button
                      key={payment.id}
                      type="button"
                      onClick={() =>
                        setPaymentMethod(
                          payment.id
                        )
                      }
                      className={`py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold ${paymentMethod ===
                        payment.id
                        ? "bg-white shadow border text-green-600"
                        : "text-gray-500"
                        }`}
                    >
                      {payment.icon}
                      {payment.name}
                    </button>

                  ))}

                </div>

                {/* CARD */}
                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-3">

                    <input
                      name="cardName"
                      value={
                        paymentData.cardName
                      }
                      onChange={
                        handlePaymentChange
                      }
                      placeholder="Cardholder Name"
                      className="w-full border rounded-xl p-3 text-sm outline-none text-gray-800"
                    />

                    <input
                      name="cardNumber"
                      value={
                        paymentData.cardNumber
                      }
                      onChange={
                        handlePaymentChange
                      }
                      placeholder="Card Number"
                      className="w-full border rounded-xl p-3 text-sm outline-none text-gray-800"
                    />

                    <div className="grid grid-cols-2 gap-3">

                      <input
                        name="expiry"
                        value={
                          paymentData.expiry
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="MM/YY"
                        className="border rounded-xl p-3 text-sm text-gray-800"
                      />

                      <input
                        name="cvv"
                        type="password"
                        value={
                          paymentData.cvv
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="CVV"
                        className="border rounded-xl p-3 text-sm text-gray-800"
                      />

                    </div>

                  </div>
                )}

                {/* MOBILE PAYMENTS */}
                {(paymentMethod ===
                  "jazzcash" ||
                  paymentMethod ===
                  "easypaisa") && (

                    <div className="mt-4 text-gray-800">

                      <input
                        name="mobileNumber"
                        value={
                          paymentData.mobileNumber
                        }
                        onChange={
                          handlePaymentChange
                        }
                        placeholder="03XX XXXXXXX"
                        className="w-full border rounded-xl p-3 text-sm"
                      />

                    </div>
                  )}

                {/* COD */}
                {paymentMethod === "cod" && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-4">

                    <p className="font-semibold text-sm text-gray-800">
                      Cash on Delivery Selected
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Pay with cash directly to the courier agent when your parcel arrives.
                    </p>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* ================================================= */}
          {/* RIGHT - ORDER SUMMARY */}
          {/* ================================================= */}

          <div className="lg:sticky lg:top-36">

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

              <div className="flex items-center gap-3 pb-4 border-b border-gray-200 ">

                <div className="w-9 h-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <FaShoppingBag />
                </div>

                <h2 className="text-xl font-bold text-gray-800">
                  Order Summary
                </h2>

              </div>

              {/* PRODUCTS */}
              <div className="mt-4 max-h-80 overflow-y-auto">

                {cartItems.length === 0 ? (

                  <p className="text-sm text-gray-500 text-center py-5">
                    Your cart is empty.
                  </p>

                ) : (

                  cartItems.map((item, index) => {

                    const price =
                      getPrice(item);

                    const qty =
                      getQuantity(item);

                    const name =
                      getProductName(item);

                    const image =
                      getProductImage(item);

                    const color =
                      item?.variant?.color_name ||
                      item?.color;

                    const size =
                      item?.variant?.size ||
                      item?.size;

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between gap-3 py-4 border-b border-gray-100"
                      >

                        <div className="flex items-center gap-3 min-w-0">

                          <img
                            src={image}
                            alt={name}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.src =
                                defaultImage;
                            }}
                          />

                          <div className="min-w-0">

                            <h3 className="text-xs font-semibold text-gray-800 truncate">
                              {name}
                            </h3>

                            <p className="text-[10px] text-gray-500 mt-1">
                              {color &&
                                `Color: ${color}`}
                              {color &&
                                size &&
                                " | "}
                              {size &&
                                `Size: ${size}`}
                            </p>

                            <p className="text-[10px] text-gray-500">
                              Qty:{" "}
                              <span className="font-semibold">
                                {qty}
                              </span>
                            </p>

                          </div>

                        </div>

                        <strong className="text-xs whitespace-nowrap text-gray-800">
                          Rs{" "}
                          {(
                            price * qty
                          ).toLocaleString()}
                        </strong>

                      </div>
                    );
                  })

                )}

              </div>

              {/* TOTALS */}
              <div className="pt-4 space-y-3">

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>

                  <strong className="text-gray-800">
                    Rs{" "}
                    {subtotal.toLocaleString()}
                  </strong>
                </div>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping Cost</span>

                  <strong className="text-green-600">
                    {currentShipping.price ===
                      0
                      ? "FREE"
                      : `Rs ${currentShipping.price.toLocaleString()}`}
                  </strong>
                </div>

                <div className="border-t border-gray-200  pt-4 flex justify-between">

                  <span className="font-bold text-gray-800">
                    Total Amount
                  </span>

                  <strong className="text-green-600 text-lg">
                    Rs{" "}
                    {total.toLocaleString()}
                  </strong>

                </div>

              </div>

              {/* PLACE ORDER */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  orderLoading ||
                  cartItems.length === 0
                }
                className="w-full mt-5 bg-green-600 hover:bg-green-700 cursor-pointer disabled:bg-gray-400 text-white py-3.5 rounded-xl font-bold text-sm transition"
              >

                {orderLoading
                  ? "Processing..."
                  : "Place Order Now"}

              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}