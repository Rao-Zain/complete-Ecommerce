"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FaCheck, FaSync, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaWallet, FaFileAlt } from "react-icons/fa";
import { Suspense } from "react";

// Maps the payment_method value from Checkout to the label/description
// shown in the payment info box, so this page adapts to whichever
// method the user actually picked (not just COD).
const PAYMENT_INFO = {
  cod: {
    icon: <FaMoneyBillWave />,
    title: "Cash on Delivery Selected",
    description: "Please keep the payment ready at the time of delivery.",
  },
  card: {
    icon: <FaCreditCard />,
    title: "Card Payment Selected",
    description: "Your card payment is being verified by our team.",
  },
  jazzcash: {
    icon: <FaMobileAlt />,
    title: "JazzCash Payment Selected",
    description: "We'll confirm your JazzCash payment shortly.",
  },
  easypaisa: {
    icon: <FaWallet />,
    title: "EasyPaisa Payment Selected",
    description: "We'll confirm your EasyPaisa payment shortly.",
  },
};

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentMethod = searchParams.get("payment") || "cod";
  const payment = PAYMENT_INFO[paymentMethod] || PAYMENT_INFO.cod;

  return (
    <div className="h-[400] bg-[#f4f5f7] flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl h-[300] shadow-xl p-8 max-w-md w-full text-center">

        {/* CHECKMARK */}
        <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl mb-5">
          <FaCheck />
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-900">
          Thank You!
        </h1>

        <p className="text-sm font-semibold text-gray-800 mt-2">
          Your order has been placed successfully.
        </p>

        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          We have received your order and our team will contact you soon regarding delivery details.
        </p>

        {/* ORDER STATUS */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mt-5 text-left">
          <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 text-sm">
            <FaSync />
          </div>
          <div>
            <p className="text-sm font-bold text-amber-700">
              Order Status: Processing
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              Your order is currently being processed by our team.
            </p>
          </div>
        </div>

        {/* PAYMENT METHOD */}
        <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4 mt-3 text-left">
          <div className="w-9 h-9 rounded-lg bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 text-sm">
            {payment.icon}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">
              {payment.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {payment.description}
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <Link
        href="/Products"
          onClick={() => router.push("/")}
          className="w-full flex flex-col w-[50%] mt-5 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl cursor-pointer font-semibold text-sm transition"
        >
          Continue Shopping
        </Link>

        <Link
          href="/Orders"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition"
        >
          <FaFileAlt className="text-xs" />
          View My Orders
        </Link>

      </div>
    </div>
  );
}

// useSearchParams() requires a Suspense boundary in App Router,
// otherwise Next.js throws a build/runtime error on this page.
export default function OrderSuccessPage() {
  return (
    <Suspense fallback={null}>
      <OrderSuccessContent />
    </Suspense>
  );
}