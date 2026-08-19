import Image from 'next/image';

const products = [
  {
    id: 1,
    title: "Sweater",
    description: "Beat the chilly weather with our ultra-...",
    price: "Rs 4,500",
    oldPrice: "Rs 5,500",
    rating: 5.0,
    stock: "537 In Stock",
    image: "/img1.jfif",
    badge: "Featured",
  },
  {
    id: 2,
    title: "Women Dress",
    description: "Look sharp and professional with this...",
    price: "Rs 5,000",
    oldPrice: "Rs 6,000",
    rating: 0.0,
    stock: "641 In Stock",
    image: "/img2.jfif",
    badge: "Featured",
  },
  {
    id: 3,
    title: "Woolen Sweaters",
    description: "Experience luxury and warmth with thi...",
    price: "Rs 4,200",
    oldPrice: "Rs 4,700",
    rating: 5.0,
    stock: "303 In Stock",
    image: "/img3.jfif",
    badge: "Featured",
  },
  {
    id: 4,
    title: "Boys - Soft & Comfortable",
    description: "Behadd narm, breathable aur high-...",
    price: "Rs 3,000",
    oldPrice: "Rs 3,300",
    rating: 4.5,
    stock: "216 In Stock",
    image: "/img4.jfif",
    badge: "Featured",
  },
  {
    id: 5,
    title: "Tracksuits",
    description: "Embrace hot summer days with the...",
    price: "Rs 3,800",
    oldPrice: "Rs 4,500",
    rating: 0.0,
    stock: "216 In Stock",
    image: "/rewaj.jfif",
    badge: "Featured",
  },
  {
    id: 6,
    title: "Jeans",
    description: "Crafted from high-quality, durable...",
    price: "Rs 6,000",
    oldPrice: "Rs 8,000",
    rating: 0.0,
    stock: "216 In Stock",
    image: "/shrt.jpg",
    badge: "Featured",
  },
  {
    id: 7,
    title: "Formal Shirt",
    description: "Embrace hot summer days with the...",
    price: "Rs 3,200",
    oldPrice: "Rs 3,700",
    rating: 0.0,
    stock: "195 In Stock",
    image: "/img6.jfif",
    badge: "Featured",
  },
  {
    id: 8,
    title: "Classic Shirts",
    description: "Upgrade your everyday style with our...",
    price: "Rs 2,000",
    oldPrice: "Rs 2,500",
    rating: 0.0,
    stock: "324 In Stock",
    image: "/hat.jpg",
    badge: "Featured",
  },
  {
    id: 9,
    title: "Casual Polo",
    description: "Premium quality casual wear for daily...",
    price: "Rs 2,800",
    oldPrice: "Rs 3,400",
    rating: 4.0,
    stock: "410 In Stock",
    image: "/img1.jfif",
    badge: "Featured",
  },
  {
    id: 10,
    title: "Winter Jacket",
    description: "Stay warm and stylish all winter long...",
    price: "Rs 7,500",
    oldPrice: "Rs 9,000",
    rating: 4.8,
    stock: "150 In Stock",
    image: "/img2.jfif",
    badge: "Featured",
  },
];

function Featured() {
  return (
    <main className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl" style={{ color: '#fe9900' }}>⭐</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Featured Collections
            </h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Our top 10 most popular and ordered items
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between"
            >
              {/* Image & Badges Container */}
              <div className="relative bg-gray-100 h-48 w-full">
                {/* Featured Badge with custom HEX color */}
                <span 
                  className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider z-10"
                  style={{ backgroundColor: '#fe9900' }}
                >
                  {product.badge}
                </span>

                {/* Wishlist Button */}
                <button className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow hover:bg-gray-100 text-gray-500 hover:text-red-500 transition z-10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>

                {/* Product Image */}
                <div className="w-full h-full relative">
                  <Image 
                    src={product.image} 
                    alt={product.title}
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {product.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {product.description}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300 fill-gray-200'}`} 
                        style={i < Math.floor(product.rating) ? { color: '#fe9900' } : {}}
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                    <span className="text-[10px] text-gray-500 ml-1">({product.rating.valueOf().toFixed(1)})</span>
                  </div>
                </div>

                {/* Pricing & Stock in a Single Line */}
                <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between gap-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-lg text-emerald-600">
                      {product.price}
                    </span>
                    <span className="text-gray-400 text-[10px] line-through">
                      {product.oldPrice}
                    </span>
                  </div>

                  <span className="bg-emerald-50 text-emerald-600 text-[9px] font-medium px-1.5 py-0.5 rounded border border-green-100 whitespace-nowrap">
                    {product.stock}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

export default Featured;