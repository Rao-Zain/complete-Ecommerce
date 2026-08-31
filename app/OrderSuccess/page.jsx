"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FaCheck,
  FaSync,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileAlt,
  FaWallet,
  FaFileAlt,
} from "react-icons/fa";
import { Suspense } from "react";

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
  const searchParams = useSearchParams();

  const paymentMethod = searchParams.get("payment") || "cod";
  const orderId = searchParams.get("order") || "";

  const payment = PAYMENT_INFO[paymentMethod] || PAYMENT_INFO.cod;

  return (
    <div
      className="
        w-full
        h-[calc(100dvh-130px)]
        min-h-0
        overflow-hidden
        bg-[#f4f5f7]
        flex
        items-center
        justify-center
        px-3
        sm:px-4
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-xl
          border border-gray-100

          w-full
          max-w-md

          h-[calc(100%-16px)]
          max-h-[465px]
          min-h-[400px]

          px-4
          sm:px-6
          py-3
          sm:py-4

          text-center
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* CHECKMARK */}

        <div
          className="
            w-11
            h-11
            sm:w-12
            sm:h-12
            mx-auto
            rounded-full
            bg-green-100
            text-green-600
            flex
            items-center
            justify-center
            text-xl
            sm:text-2xl
            mb-2
            sm:mb-3
            flex-shrink-0
          "
        >
          <FaCheck />
        </div>

        {/* TITLE */}

        <h1
          className="
            text-xl
            sm:text-2xl
            font-bold
            text-gray-900
            flex-shrink-0
          "
        >
          Thank You!
        </h1>

        <p
          className="
            text-xs
            sm:text-sm
            font-semibold
            text-gray-800
            mt-1
            flex-shrink-0
          "
        >
          Your order has been placed successfully.
        </p>

        <p
          className="
            text-[11px]
            sm:text-xs
            text-gray-500
            mt-1
            leading-relaxed
            flex-shrink-0
            max-w-sm
            mx-auto
          "
        >
          We have received your order and our team will contact you soon
          regarding delivery details.
        </p>

        {/* ORDER ID */}

        {orderId && (
          <div className="mt-1.5 sm:mt-2 flex justify-center flex-shrink-0">
            <div
              className="
                bg-gray-50
                border
                border-gray-200
                rounded-full
                px-3
                py-1
                text-[10px]
                sm:text-[11px]
                text-gray-500
              "
            >
              Order{" "}
              <span className="font-semibold text-gray-800">
                #{orderId}
              </span>
            </div>
          </div>
        )}

        {/* ORDER STATUS */}

        <div
          className="
            flex
            items-start
            gap-2.5
            sm:gap-3
            bg-amber-50
            border
            border-amber-200
            rounded-xl
            p-2.5
            sm:p-3
            mt-2
            sm:mt-3
            text-left
            flex-shrink-0
          "
        >
          <div
            className="
              w-8
              h-8
              sm:w-9
              sm:h-9
              rounded-lg
              bg-amber-100
              text-amber-600
              flex
              items-center
              justify-center
              flex-shrink-0
              text-xs
              sm:text-sm
            "
          >
            <FaSync />
          </div>

          <div className="min-w-0">
            <p
              className="
                text-xs
                sm:text-sm
                font-bold
                text-amber-700
              "
            >
              Order Status: Processing
            </p>

            <p
              className="
                text-[10px]
                sm:text-xs
                text-amber-600
                mt-0.5
                leading-relaxed
              "
            >
              Your order is currently being processed by our team.
            </p>
          </div>
        </div>

        {/* PAYMENT METHOD */}

        <div
          className="
            flex
            items-start
            gap-2.5
            sm:gap-3
            bg-gray-50
            border
            border-gray-200
            rounded-xl
            p-2.5
            sm:p-3
            mt-2
            sm:mt-3
            text-left
            flex-shrink-0
          "
        >
          <div
            className="
              w-8
              h-8
              sm:w-9
              sm:h-9
              rounded-lg
              bg-green-100
              text-green-600
              flex
              items-center
              justify-center
              flex-shrink-0
              text-xs
              sm:text-sm
            "
          >
            {payment.icon}
          </div>

          <div className="min-w-0">
            <p
              className="
                text-xs
                sm:text-sm
                font-bold
                text-gray-800
              "
            >
              {payment.title}
            </p>

            <p
              className="
                text-[10px]
                sm:text-xs
                text-gray-500
                mt-0.5
                leading-relaxed
              "
            >
              {payment.description}
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div className="mt-auto flex-shrink-0">

          <Link
            href="/Products"
            className="
              flex
              items-center
              justify-center
              mx-auto

              w-[65%]
              sm:w-[55%]

              bg-gray-900
              hover:bg-gray-800
              text-white

              py-2.5
              sm:py-3

              mt-2
              sm:mt-3

              rounded-xl
              font-semibold

              text-xs
              sm:text-sm

              transition
            "
          >
            Continue Shopping
          </Link>

          <Link
            href="/Orders"
            className="
              mt-1.5
              sm:mt-2
              inline-flex
              items-center
              gap-1.5
              text-xs
              sm:text-sm
              font-semibold
              text-green-600
              hover:text-green-700
              transition
            "
          >
            <FaFileAlt className="text-[10px] sm:text-xs" />
            View My Orders
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