import React from 'react';
import Link from 'next/link';

 function OrderDetail({ params }) {
  // Aap yahan params.id ke zariye database se data fetch kar sakte hain
  const orderId = params.id;

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto space-y-6">
        
        {/* Back Link */}
        <div>
          <Link href="/my-orders" className="text-sm font-medium text-emerald-600 hover:underline">
            &larr; Back to Orders
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Order #{orderId}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <span>📅</span> Placed on 29 Jul 2026 04:15 PM
            </p>
          </div>
          <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            ● Pending
          </span>
        </div>

        {/* Order Items Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>📦</span> Order Items (1)
          </h2>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-100 pt-4 gap-4">
            
            {/* Product Image & Details */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 flex-shrink-0">
                {/* Replace with your image path or next/image */}
                <img 
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=200" 
                  alt="women dress" 
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-gray-800 text-base">women dress</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-md font-medium">
                    Color: White
                  </span>
                  <span className="bg-purple-50 text-purple-600 text-xs px-2.5 py-1 rounded-md font-medium">
                    Size: XS
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-medium">Quantity: 1</span>
                  <span>Rs 5,000 each</span>
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="text-right w-full sm:w-auto">
              <span className="text-lg font-bold text-emerald-600">Rs 5,000</span>
            </div>

          </div>
        </div>

        {/* Grand Total & Cancel Action */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-base">Grand Total</span>
            <span className="text-xl font-extrabold text-emerald-600">Rs 5,000</span>
          </div>

          <div className="flex justify-end">
            <button className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors shadow-sm">
              &times; Cancel Order
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default OrderDetail;