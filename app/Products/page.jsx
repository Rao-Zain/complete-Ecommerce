"use client";

import Image from 'next/image';
import Link from 'next/link';
import products from "../data/product";

function Products() {
  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <span className="text-red-500 text-2xl">🛒</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Products
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product) => (
            <Link 
              href={`/Productdetail/${product.id}`}
              key={product.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Image & Badges Container */}
                <div className="relative bg-gray-100 h-48 w-full">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                    className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>

                  <div className="w-full h-full relative">
                    <Image 
                      src={product.image} 
                      alt={product.title}
                      fill
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-200'}`} 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="text-[10px] text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="p-3 pt-0">
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-emerald-600 font-bold text-lg">
                      {product.price}
                    </span>
                    <span className="text-gray-400 text-[10px] line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <span className="bg-emerald-50 text-emerald-700 text-[9px] font-medium px-1.5 py-0.5 rounded border border-emerald-100 whitespace-nowrap">
                    {product.stock}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </main>
  );
}

export default Products;