"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileAlt,
  FaWallet,
  FaSync,
  FaReceipt,
} from "react-icons/fa";

const PAYMENT_INFO = {
  cod: {
    icon: <FaMoneyBillWave className="w-5 h-5" />,
    title: "Cash on Delivery Selected",
    description: "Please keep the payment ready at the time of delivery.",
  },
  card: {
    icon: <FaCreditCard className="w-5 h-5" />,
    title: "Card Payment Selected",
    description: "Your card payment is being verified by our team.",
  },
  jazzcash: {
    icon: <FaMobileAlt className="w-5 h-5" />,
    title: "JazzCash Payment Selected",
    description: "We'll confirm your JazzCash payment shortly.",
  },
  easypaisa: {
    icon: <FaWallet className="w-5 h-5" />,
    title: "EasyPaisa Payment Selected",
    description: "We'll confirm your EasyPaisa payment shortly.",
  },
};

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const paymentMethod = searchParams.get("payment") || "cod";
  const orderId = searchParams.get("order") || "";

  const payment = PAYMENT_INFO[paymentMethod] || PAYMENT_INFO.cod;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 text-center transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        
        {/* Success Icon with Pulse Effect */}
        <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-50 animate-ping opacity-75"></div>
          <div className="relative w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-10 h-10 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Typography Enhancements */}
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
          Thank You!
        </h1>

        <p className="text-base font-medium text-gray-800 mb-2">
          Your order has been placed successfully.
        </p>

        <p className="text-sm leading-relaxed text-gray-500 max-w-sm mx-auto mb-6">
          We have received your order and our team will contact you soon regarding delivery details.
        </p>

        {/* Optional Order ID Pill */}
        {orderId && (
          <div className="mb-5 flex justify-center">
            <span className="bg-gray-50 border border-gray-200/80 rounded-full px-3.5 py-1 text-xs text-gray-600 font-medium">
              Order <span className="font-semibold text-gray-900">#{orderId}</span>
            </span>
          </div>
        )}

        {/* Blinking Order Processing Alert Box */}
        <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-200/60 mb-4 flex items-start gap-3 text-left">
          <div className="relative flex items-center justify-center shrink-0 mt-0.5">
            {/* Blinking / Pulse outer ring */}
            <span className="animate-ping absolute inline-flex h-full w-full rounded-lg bg-amber-400 opacity-75"></span>
            {/* Main Icon Box */}
            <div className="relative p-2 bg-amber-100 text-amber-700 rounded-lg">
              <FaSync className="text-sm animate-spin" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-amber-900">
                Order Status: Processing
              </p>
            </div>
            <p className="text-xs text-amber-700/90 mt-0.5 leading-normal">
              Your order is currently being processed by our team.
            </p>
          </div>
        </div>

        {/* Dynamic Payment Selection Badge */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mb-8 flex items-start gap-3 text-left">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg shrink-0 mt-0.5">
            {payment.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {payment.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 leading-normal">
              {payment.description}
            </p>
          </div>
        </div>

        {/* Primary Action Button */}
        <Link
          href="/Products"
          className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-200 tracking-wide"
        >
          Continue Shopping
        </Link>

        {/* Secondary Action Link */}
        <div>
          <Link
            href="/Orders"
            className="inline-flex items-center mt-3 gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition-colors duration-200"
          >
            <FaReceipt className="text-xs" />
            <span>View My Orders</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}