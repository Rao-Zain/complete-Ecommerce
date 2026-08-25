import React from 'react';
import Link from 'next/link';

const orders = [
  {
    id: 'ORD-1785327303',
    date: '29 Jul 2026',
    items: '1 Items in this order',
    amount: 'Rs 5,000',
    status: 'Pending',
    statusBg: 'bg-amber-50 text-amber-600',
  },
  {
    id: 'ORD-1784975574',
    date: '25 Jul 2026',
    items: '1 Items in this order',
    amount: 'Rs 2,500',
    status: 'Cancelled',
    statusBg: 'bg-rose-50 text-rose-600',
  },
];

function Orders() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-950">My Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Track your purchases and order status in real-time</p>
        </div>

        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href='/OrderDetail'
              className="group relative block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md overflow-hidden"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 transition-colors duration-200 group-hover:text-emerald-500">
                    Order #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Placed on {order.date}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.items}</p>
                </div>

                <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.statusBg}`}>
                    {order.status}
                  </span>
                  <div className="text-right">
                    <span className="text-xl font-bold text-emerald-600">{order.amount}</span>
                    <p className="text-[11px] text-gray-400 font-medium">Total Amount</p>
                  </div>
                </div>
              </div>

              {/* Green Bottom Line on Hover */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Orders;