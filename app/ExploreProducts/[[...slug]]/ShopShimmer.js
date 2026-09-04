'use client';

import React from 'react';

/* Category tree shimmer: mimics 2 top-level rows, one expanded with 3
   indented children, so the shimmer's shape roughly matches a typical
   tree instead of just flat bars. */
const CategoryTreeShimmer = () => (
    <div className="flex flex-col gap-1 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2 py-1.5">
            <div className="w-3 h-3 bg-gray-200 rounded-sm flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded flex-1 max-w-[70%]" />
        </div>
        <div className="ml-4 border-l border-gray-100 pl-3 flex flex-col gap-2 py-1">
            {[85, 60, 75].map((w, i) => (
                <div key={i} className="h-3.5 bg-gray-100 rounded" style={{ width: `${w}%` }} />
            ))}
        </div>
        <div className="flex items-center gap-2 py-1.5">
            <div className="w-3 h-3 bg-gray-200 rounded-sm flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded flex-1 max-w-[55%]" />
        </div>
        <div className="flex items-center gap-2 py-1.5">
            <span className="w-5 flex-shrink-0" />
            <div className="h-4 bg-gray-200 rounded flex-1 max-w-[65%]" />
        </div>
    </div>
);

const SidebarShimmer = () => (
    <aside className="w-full lg:w-1/4 bg-white p-5 rounded-xl shadow hidden lg:flex lg:flex-col animate-pulse">
        <div className="flex items-center justify-between mb-2">
            <div className="w-14 h-4 bg-gray-200 rounded" />
        </div>

        {/* Categories */}
        <div className="w-20 h-4 bg-gray-200 rounded mt-2 mb-2" />
        <CategoryTreeShimmer />

        {/* Price */}
        <div className="w-12 h-4 bg-gray-200 rounded mt-4 mb-2" />
        <div className="space-y-2 my-2 pb-3 border-b border-gray-100">
            <div className="w-full h-2 bg-gray-200 rounded-lg" />
            <div className="flex justify-between">
                <div className="w-10 h-3 bg-gray-100 rounded" />
                <div className="w-20 h-3 bg-gray-100 rounded" />
            </div>
        </div>

        {/* Color */}
        <div className="w-14 h-4 bg-gray-200 rounded mt-4 mb-2" />
        <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200" />
            ))}
        </div>

        {/* Size */}
        <div className="w-12 h-4 bg-gray-200 rounded mt-4 mb-2" />
        <div className="flex flex-wrap gap-2 my-2 pb-3 border-b border-gray-100">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="w-8 h-6 bg-gray-200 rounded" />
            ))}
        </div>

        {/* Brands */}
        <div className="w-16 h-4 bg-gray-200 rounded mt-4 mb-2" />
        <div className="flex flex-col gap-2.5 pb-1">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-3.5 bg-gray-100 rounded" style={{ width: `${50 + (i % 3) * 15}%` }} />
                </div>
            ))}
        </div>

        <div className="w-full h-8 bg-gray-100 rounded-lg mt-3" />
    </aside>
);

/* Matches ProductCard's real proportions: image block + title line +
   a shorter price line beneath it. */
const ProductCardShimmer = () => (
    <div className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full animate-pulse" />
        <div className="p-2 sm:p-3 flex flex-col gap-1.5">
            <div className="h-3.5 sm:h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-2/5 bg-gray-200 rounded animate-pulse" />
        </div>
    </div>
);

/* Matches the exact grid the real product list uses once loaded/loading
   (grid-cols-2 xs:2 sm:2 md:3 lg:5) so the shimmer's card count and
   sizing lines up with what replaces it. */
const ShopShimmer = () => (
    <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-5 animate-pulse">
                <div className="w-64 h-7 bg-gray-200 mx-auto rounded mb-3" />
                <div className="w-96 max-w-full h-4 bg-gray-200 mx-auto rounded" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">
                <SidebarShimmer />

                <div className="container mx-auto">
                    <div className="flex justify-between items-center bg-white px-4 p-2 rounded-2xl shadow-sm border border-gray-100 mb-6 animate-pulse">
                        <div className="w-32 h-4 bg-gray-200 rounded" />
                        <div className="w-[170px] h-10 bg-gray-100 rounded-lg" />
                    </div>

                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                        {[...Array(10)].map((_, i) => (
                            <ProductCardShimmer key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ShopShimmer;