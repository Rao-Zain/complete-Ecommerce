"use client";

import {
  FaTruck,
  FaBolt,
  FaClock,
  FaMoneyBillWave,
  FaUndoAlt,
  FaShieldAlt,
  FaLock,
  FaHeadset,
} from "react-icons/fa";

function PulseDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
    </span>
  );
}

export default function ProductDeliverySidebar({ brandName = "Loremipsum" }) {
  return (
    <aside className="w-full bg-gray-100 border border-gray-200/80 rounded-2xl p-4 sm:p-5 text-gray-800 space-y-5 shadow-sm">
      {/* 1. Delivery Options */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase">
            Delivery Options
          </h4>
          <PulseDot />
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <FaTruck className="text-emerald-600 text-sm mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Standard Delivery</p>
                <p className="text-[11px] text-gray-500">Delivered in 5-7 business days</p>
              </div>
            </div>
            <span className="font-bold text-emerald-700 text-xs">FREE</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <FaBolt className="text-emerald-600 text-sm mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Express Delivery (3 Days)</p>
                <p className="text-[11px] text-gray-500">Fast delivery within 3 working days</p>
              </div>
            </div>
            <span className="font-semibold text-gray-800 text-xs">Rs. 250</span>
          </div>

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <FaClock className="text-emerald-600 text-sm mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">Same Day Delivery</p>
                <p className="text-[11px] text-gray-500">Get your parcel delivered today</p>
              </div>
            </div>
            <span className="font-semibold text-gray-800 text-xs">Rs. 500</span>
          </div>

          <div className="flex items-center gap-2.5 pt-1 text-gray-700">
            <FaMoneyBillWave className="text-emerald-600 text-sm shrink-0" />
            <span className="font-medium text-xs">Cash on Delivery Available</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 2. Return & Warranty */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase">
            Return & Warranty
          </h4>
          <PulseDot />
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <FaUndoAlt className="text-emerald-600 text-xs shrink-0" />
            <span className="text-gray-700 font-medium">14 days easy local return</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FaShieldAlt className="text-emerald-600 text-xs shrink-0" />
            <span className="text-gray-700 font-medium">100% Authentic & Verified</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 3. Service Protection */}
      <div>
        <h4 className="text-xs font-bold text-gray-900 tracking-wider uppercase mb-3">
          Service Protection
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2.5">
            <FaLock className="text-emerald-600 text-xs shrink-0" />
            <span className="text-gray-700 font-medium">Secure Payments</span>
          </div>
          <div className="flex items-center gap-2.5">
            <FaHeadset className="text-emerald-600 text-xs shrink-0" />
            <span className="text-gray-700 font-medium">24/7 Dedicated Support</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* 4. Seller Metrics */}
      <div>
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="text-gray-500">Sold by</span>
          <span className="font-bold text-gray-900">{brandName}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center bg-white border border-gray-200 rounded-xl p-2.5 shadow-2xs">
          <div>
            <p className="text-[10px] text-gray-400">Positive Seller</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">88%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Ship on Time</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">95%</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400">Chat Response</p>
            <p className="text-xs font-bold text-gray-800 mt-0.5">92%</p>
          </div>
        </div>
      </div>
    </aside>
  );
}