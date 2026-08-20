"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import products from "../../data/product";

export default function ProductDetail() {
  const params = useParams();
  const productId = parseInt(params.id);
  const product = products.find((p) => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("S");
  const [selectedColor, setSelectedColor] = useState("Black");

  // Thumbnail images array
  const productImages = product?.images || [product?.image, product?.image, product?.image];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Product nahi mila!</h1>
        <Link href="/" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          Go Back to Products
        </Link>
      </div>
    );
  }

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };

  // Slider Navigation Handlers
  const handlePrevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Home</Link> / Products /{" "}
        <span className="text-gray-800 font-medium">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left Side: Image Section with Slider & Thumbnails */}
        <div className="flex flex-col gap-4">
          {/* Main Image with Smaller Slider Arrows */}
          <div className="relative w-full h-[350px] bg-gray-100 rounded-lg overflow-hidden border  border-gray-200 group">
            <Image
              src={productImages[currentIndex]}
              alt={product.title}
              fill
              priority
              className="object-cover"
            />
            {/* Slider Left Arrow (Smaller Size) */}
            <button 
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 flex items-center justify-center text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              ❮
            </button>
            {/* Slider Right Arrow (Smaller Size) */}
            <button 
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white w-7 h-7 flex items-center justify-center text-xs rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
            >
              ❯
            </button>
          </div>

          {/* Thumbnail Slider / Row */}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {productImages.map((img, index) => (
              <div
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative w-20 h-20 rounded-md overflow-hidden border cursor-pointer flex-shrink-0 transition-all ${
                  currentIndex === index
                    ? "border-orange-600 ring-2 ring-orange-600"
                    : "border-gray-300 hover:opacity-80"
                }`}
              >
                <Image src={img} alt={`Thumbnail ${index + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Product Details & Actions */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-800 mt-1">{product.title}</h1>

          <div className="flex items-center gap-2 mt-2">
            <span className="text-yellow-500 text-sm">★★★★★</span>
            <span className="text-sm text-gray-500">({product.rating})</span>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <span className="text-2xl font-bold text-green-600">{product.price}</span>
            <span className="text-lg text-gray-400 line-through">{product.oldPrice}</span>
          </div>

          <span className="text-sm text-green-600 font-medium mt-1">{product.stock}</span>

          <div className="mt-4">
            <h3 className="font-semibold text-gray-700">Description</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">{product.description}</p>
          </div>

          {/* Color Selection with Small Images */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Color: <span className="font-normal text-gray-600">{selectedColor}</span>
            </label>
            <div className="flex gap-3">
              {[
                { name: "Black", img: productImages[0] },
                { name: "Red", img: productImages[1] || productImages[0] },
                { name: "Gray", img: productImages[2] || productImages[0] },
              ].map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`flex items-center gap-2 px-2.5 py-1 rounded-md border border-gray-200 text-xs font-medium transition-all ${
                    selectedColor === c.name
                      ? "border-orange-600 bg-orange-50 ring-1 ring-orange-600"
                      : "border-gray-300 bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="relative w-5 h-5 rounded overflow-hidden flex-shrink-0 border">
                    <Image src={c.img} alt={c.name} fill className="object-cover" />
                  </div>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection (S, M, L) */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Size</label>
            <div className="flex gap-3">
              {["S", "M", "L"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-10 flex items-center justify-center rounded-md border text-sm font-semibold transition-all ${
                    selectedSize === size
                      ? "border-orange-600 bg-orange-600 text-white shadow-sm"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Counter */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center border border-gray-300 rounded-md w-32 h-10">
              <button onClick={handleDecrement} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100">-</button>
              <span className="flex-1 text-center font-medium text-gray-800">{quantity}</span>
              <button onClick={handleIncrement} className="w-10 h-full flex items-center justify-center text-gray-600 hover:bg-gray-100">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button className="flex bg-gray-900 text-white py-2 px-6 rounded-md font-medium hover:bg-black transition-colors shadow-sm">
              Add To Cart
            </button>
            <button className="flex bg-orange-600 text-white py-2 px-6 rounded-md font-medium hover:bg-orange-700 transition-colors shadow-sm">
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* --- CUSTOMER REVIEWS SECTION --- */}
      <div className="mt-16 border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50 p-6 rounded-lg border border-gray-200">
          {/* Overall Rating Display */}
          <div className="flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 pr-0 md:pr-6">
            <span className="text-4xl font-extrabold text-gray-800">5.0</span>
            <div className="flex text-yellow-400 text-lg my-1">★★★★★</div>
            <span className="text-xs text-gray-500">Based on 1 Review</span>
          </div>

          {/* Rating Bars Breakdown */}
          <div className="col-span-2 flex flex-col gap-2 w-full">
            {[
              { star: '5 Star', width: 'w-full', count: 1 },
              { star: '4 Star', width: 'w-0', count: 0 },
              { star: '3 Star', width: 'w-0', count: 0 },
              { star: '2 Star', width: 'w-0', count: 0 },
              { star: '1 Star', width: 'w-0', count: 0 },
            ].map((row, idx) => (
              <div key={idx} className="flex items-center gap-3 text-xs text-gray-600">
                <span className="w-12">{row.star}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full bg-yellow-400 ${row.width}`}></div>
                </div>
                <span className="w-4 text-right">{row.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h3>
          <div className="bg-white border  border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
                  s
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-800">sikandar</h4>
                  <div className="flex text-yellow-400 text-xs">★★★★★ <span className="text-gray-400 ml-2">~ 4 weeks ago</span></div>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium flex items-center gap-1">
                ✓ Verified
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-3 leading-relaxed">
              I am very satisfied with this purchase. The product quality exceeded my expectations, and the item looks exactly as shown in the images. Packaging was secure, and delivery was fast. Highly recommended for anyone looking for good quality at a fair price.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}