import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Column 1: Logo & Description (Takes 2 columns on large screens) */}
        <div className="lg:col-span-2 space-y-4">
          <div>
              <h2 className="font-extrabold text-2xl tracking-tight text-white">Shop<span className="text-blue-500">Nest</span></h2>
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
              <Link href="/products" className="hover:text-white transition-colors">Products</Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-white transition-colors">Categories</Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">About Us</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
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