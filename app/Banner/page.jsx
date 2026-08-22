import Image from 'next/image';

function Banners() {
  return (
    <section className="container mx-auto  
      py-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Big Banner (Summer Collection) */}
        <div className="lg:col-span-7 relative rounded-2xl overflow-hidden shadow-md h-[300px] sm:h-[415px] flex flex-col justify-end p-6 sm:p-8 bg-stone-300">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/img7.jfif" // Apni image ka path dein
              alt="Summer Collection"
              fill
              className="object-cover object-center"
            />
            {/* Dark Gradient Overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          </div>

          {/* Large Background Typography Effect ("SALE") */}
          <div className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none select-none overflow-hidden opacity-25">
            <span className="text-[140px] sm:text-[180px] font-serif font-black tracking-tighter text-white">
              Sale
            </span>
          </div>

          {/* Banner Content */}
          <div className="relative z-10">
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              Summer Collection
            </h2>
            <p className="text-gray-200 text-sm mt-1">
              Up to 50% OFF
            </p>
            <button className="mt-4 bg-white text-gray-900 font-medium text-sm px-5 py-2.5 rounded-full shadow hover:bg-gray-100 transition">
              Shop Now
            </button>
          </div>

          {/* Badge (Up to 70%) */}
          <div className="absolute bottom-6 right-6 z-10 bg-stone-200/80 backdrop-blur-sm px-3 py-1.5 rounded-xl text-center">
            <span className="block text-[10px] uppercase font-bold text-gray-600">Up to</span>
            <span className="block text-lg font-black text-gray-900">70%</span>
          </div>
        </div>

        {/* Right Side Stacked Banners */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* Top Small Banner (New Arrival - 40%) */}
          <div className="relative rounded-2xl overflow-hidden shadow-md h-[200px] sm:h-[200px] flex flex-col justify-between p-6 bg-stone-800">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/stylo.jfif" // Apni image ka path dein
                alt="New Arrival"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* Content Top */}
            <div className="relative z-10">
              <span className="text-[11px] uppercase tracking-widest text-gray-200 font-medium block">
                Dress, Pouch, Hat
              </span>
              <span className="text-[11px] uppercase tracking-widest text-gray-200 font-medium">
                Sandals
              </span>
            </div>

            {/* Content Bottom / Center Typography */}
            <div className="relative z-10 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                New Arrival
              </h3>
              <span className="text-white font-black text-4xl sm:text-5xl tracking-tighter">
                40%<span className="text-xl">%</span>
              </span>
            </div>
          </div>

          {/* Bottom Small Banner (Exclusive Deals - SALE) */}
          <div className="relative rounded-2xl overflow-hidden shadow-md h-[200px] sm:h-[200px] flex flex-col justify-between p-6 bg-indigo-950">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <Image 
                src="/watch.jpg" // Apni image ka path dein
                alt="Exclusive Deals"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-indigo-950/60"></div>
            </div>

            {/* Large Typography Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-20">
              <span className="text-[100px] sm:text-[120px] font-black tracking-widest text-white">
                SALE
              </span>
            </div>

            {/* Content Bottom */}
            <div className="relative z-10 mt-auto">
              <h3 className="text-white font-bold text-lg">
                Exclusive Deals
              </h3>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Banners;