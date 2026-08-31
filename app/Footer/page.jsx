"use client";

import Link from 'next/link';

import { usePathname } from "next/navigation";

export default function Footer() {

    const pathname = usePathname();

  const hiddenOn = ["/OrderSuccess"];

  if (hiddenOn.includes(pathname)) {
    return null;
  }


  return (
    <footer className="  bg-black text-gray-400 text-sm">
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Column 1: Logo & Description (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
              <h2 className="font-extrabold text-2xl tracking-tight text-white">Shop<span className="text-blue-500 italic">Nest</span></h2>
            </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            Discover premium products at the best prices. Shop with confidence and enjoy fast delivery, secure payments, and excellent customer support.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-base">Quick Links</h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
            </li>
            <li>
              <Link href="/Products" className="hover:text-white transition-colors">Products</Link>
            </li>
            <li>
              <Link href="/ExploreProducts" className="hover:text-white transition-colors">Categories</Link>
            </li>
            {/* <li>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            </li> */}
            <li>
              <Link href="/Contact" className="hover:text-white transition-colors">Contact Us</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-base">Categories</h3>
          <ul className="space-y-2.5">
            <li>
              <Link href="/products?category=all" className="hover:text-white transition-colors">All Products</Link>
            </li>
            <li>
              <Link href="/products?category=fashion" className="hover:text-white transition-colors">Fashion</Link>
            </li>
            <li>
              <Link href="/products?category=home-living" className="hover:text-white transition-colors">Home & Living</Link>
            </li>
            <li>
              <Link href="/products?category=beauty" className="hover:text-white transition-colors">Beauty</Link>
            </li>
            <li>
              <Link href="/products?category=accessories" className="hover:text-white transition-colors">Accessories</Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Us */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-base">Contact Us</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2.5">
              {/* <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" /> */}
              <span>Lodhran</span>
            </li>
            <li className="flex items-center gap-2.5">
              {/* <Phone className="w-4 h-4 text-gray-400 shrink-0" /> */}
              <span>03027233244</span>
            </li>
            <li className="flex items-center gap-2.5">
              {/* <Mail className="w-4 h-4 text-gray-400 shrink-0" /> */}
              <span className="break-all">saniarao@gmail.com</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar with Divider Line */}
      <div className="border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© 2026 ShopNest. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}















//  {/* --- CUSTOMER REVIEWS SECTION --- */}
//       <div className="mt-16 border-t pt-8">
//         <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
        
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center bg-gray-50 p-6 rounded-lg border">
//           {/* Overall Rating Display */}
//           <div className="flex flex-col items-center md:items-start border-b md:border-b-0 md:border-r pb-6 md:pb-0 pr-0 md:pr-6">
//             <span className="text-4xl font-extrabold text-gray-800">5.0</span>
//             <div className="flex text-yellow-400 text-lg my-1">★★★★★</div>
//             <span className="text-xs text-gray-500">Based on 1 Review</span>
//           </div>

//           {/* Rating Bars */}
//           <div className="col-span-2 flex flex-col gap-2 w-full">
//             {[
//               { star: '5 Star', width: 'w-full', count: 1 },
//               { star: '4 Star', width: 'w-0', count: 0 },
//               { star: '3 Star', width: 'w-0', count: 0 },
//               { star: '2 Star', width: 'w-0', count: 0 },
//               { star: '1 Star', width: 'w-0', count: 0 },
//             ].map((row, idx) => (
//               <div key={idx} className="flex items-center gap-3 text-xs text-gray-600">
//                 <span className="w-12">{row.star}</span>
//                 <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
//                   <div className={`h-full bg-yellow-400 ${row.width}`}></div>
//                 </div>
//                 <span className="w-4 text-right">{row.count}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Recent Reviews List */}
//         <div className="mt-8">
//           <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reviews</h3>
//           <div className="bg-white border rounded-lg p-6 shadow-sm">
//             <div className="flex items-center justify-between mb-2">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">
//                   s
//                 </div>
//                 <div>
//                   <h4 className="font-semibold text-sm text-gray-800">sikandar</h4>
//                   <div className="flex text-yellow-400 text-xs">★★★★★ <span className="text-gray-400 ml-2">~ 4 weeks ago</span></div>
//                 </div>
//               </div>
//               <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium flex items-center gap-1">
//                 ✓ Verified
//               </span>
//             </div>
//             <p className="text-sm text-gray-600 mt-3 leading-relaxed">
//               I am very satisfied with this purchase. The product quality exceeded my expectations, and the item looks exactly as shown in the images. Packaging was secure, and delivery was fast. Highly recommended for anyone looking for good quality at a fair price.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>




