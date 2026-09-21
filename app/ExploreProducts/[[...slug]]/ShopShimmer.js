'use client';

import React from 'react';

const SidebarShimmer = () => (
    <aside className="w-full lg:w-1/5 bg-white p-5 rounded-xl shadow h-fit hidden lg:block overflow-visible sticky top-18 animate-pulse shrink-0">
        {/* Categories Header */}
        <div className="flex items-center justify-between mb-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>

        {/* Categories Sibling List */}
        <div className="flex flex-col gap-1.5 pb-2">
            {[75, 55, 80, 60, 70, 50].map((widthPercent, i) => (
                <div key={i} className="py-1.5 px-3">
                    <div className="h-4 bg-gray-200 rounded" style={{ width: `${widthPercent}%` }} />
                </div>
            ))}
            <div className="w-full h-8 bg-gray-100 rounded-lg mt-1 border border-gray-200/60" />
        </div>

        {/* Price Filter */}
        <div className="h-4 w-12 bg-gray-200 rounded mt-4 mb-2" />
        <div className="space-y-2 my-2 pb-3 border-b border-gray-100">
            <div className="w-full h-2 bg-gray-200 rounded-lg" />
            <div className="flex justify-between items-center">
                <div className="h-3 w-8 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
        </div>

        {/* Color Filter */}
        <div className="h-4 w-16 bg-gray-200 rounded mt-4 mb-2" />
        <div className="flex flex-wrap gap-2.5 my-2 pb-3 border-b border-gray-100">
            {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gray-200" />
            ))}
        </div>

        {/* Size Filter */}
        <div className="h-4 w-12 bg-gray-200 rounded mt-4 mb-2" />
        <div className="flex flex-wrap gap-2 my-2 pb-3 border-b border-gray-100">
            {['w-7', 'w-8', 'w-7', 'w-9', 'w-8'].map((w, i) => (
                <div key={i} className={`h-6 ${w} bg-gray-200 rounded`} />
            ))}
        </div>

        {/* Brands Filter */}
        <div>
            <div className="h-4 w-16 bg-gray-200 rounded mt-4 mb-2" />
            <div className="flex flex-col gap-2 pb-1">
                {[65, 45, 75, 55].map((widthPercent, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-0.5">
                        <div className="w-4 h-4 rounded bg-gray-200 shrink-0" />
                        <div className="h-3.5 bg-gray-200 rounded" style={{ width: `${widthPercent}%` }} />
                    </div>
                ))}
            </div>
            <div className="w-full h-8 bg-gray-100 rounded-lg mt-3 border border-gray-200/60" />
        </div>
    </aside>
);

/* Matches the real ProductCard design line by line:
   Image -> Title -> [Price | In Stock] -> [Old Price | Free Delivery] -> Discount % -> Rating Stars */
const ProductCardShimmer = () => (
    <div className="bg-white rounded-sm sm:rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col animate-pulse">
        {/* Product Image */}
        <div className="relative bg-gray-200 h-32 xs:h-36 sm:h-44 md:h-48 w-full shrink-0" />

        {/* Product Content Details */}
        <div className="p-2 sm:p-2.5 flex flex-col gap-1.5 flex-1 justify-between">
            {/* Title Line */}
            <div className="h-4 w-4/5 bg-gray-200 rounded" />

            {/* Price section layout */}
            <div className="flex flex-col space-y-1 mt-0.5">
                {/* Row 1: Rs 5,500 (Price) & In Stock dot + label */}
                <div className="flex items-center justify-between gap-1">
                    <div className="h-5 w-20 sm:w-24 bg-gray-200 rounded" />
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-gray-200" />
                        <div className="h-3 w-12 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Row 2: Strikethrough Price & Free Delivery */}
                <div className="flex items-center justify-between gap-1">
                    <div className="h-3 w-12 bg-gray-200 rounded" />
                    <div className="flex items-center gap-1 shrink-0">
                        <div className="w-3 h-3 rounded bg-gray-200" />
                        <div className="h-3 w-14 bg-gray-200 rounded" />
                    </div>
                </div>

                {/* Row 3: Discount % */}
                <div className="h-3 w-8 bg-gray-200 rounded" />
            </div>

            {/* Row 4: Star Rating and Count */}
            <div className="flex items-center gap-1 pt-1 mt-auto">
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-3 h-3 bg-gray-200 rounded-[2px]" />
                    ))}
                </div>
                <div className="h-3 w-8 bg-gray-200 rounded ml-1" />
            </div>
        </div>
    </div>
);

const ShopShimmer = () => (
    <div className="bg-gray-50 min-h-screen py-8">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:pb-2">
            {/* Top Page Header */}
            <div className="text-center animate-pulse">
                <div className="w-64 h-8 bg-gray-200 mx-auto rounded-lg mb-2" />
                <div className="w-96 max-w-full h-4 bg-gray-200 mx-auto rounded" />
            </div>

            {/* Layout Body: Sidebar + Main Grid */}
            <div className="flex flex-col lg:flex-row gap-6 pb-6 pt-3 lg:mt-0">
                <SidebarShimmer />

                <div className="flex-1 min-w-0">
                    {/* Top Sort/Category Bar */}
                    <div className="mb-3 hidden bg-white lg:flex flex-row gap-4 items-center justify-between border border-gray-200 rounded-xl py-2 px-4 animate-pulse">
                        <div className="w-36 h-4 bg-gray-200 rounded" />
                        <div className="w-40 h-[34px] bg-gray-100 rounded-full border border-gray-200" />
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 lg:gap-2.5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ProductCardShimmer key={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default ShopShimmer;